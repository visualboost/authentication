import express from "express";
import {User} from "../../../models/db/User.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {MailHandler} from "../../../util/MailHandler.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import {hasJwtMiddleware} from "../../middlewares/hasJwt.ts";
import {Success} from "../../../models/api/Success.ts";
import {isBlacklistedMiddleware} from "../../middlewares/isBlacklisted.ts";
import {Settings} from "../../../models/db/Settings.ts";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {SigninResponseBody} from "../../../models/api/SigninResponseBody.ts";
import {UserModification} from "../../../models/db/UserModification.ts";
import {JwtHandler} from "../../../util/JwtHandler.ts";
import {FailedLoginAttemptsModel} from "../../../models/db/settings/LoginStatistic.ts";
import {TwoFactorAuthCodeModel} from "../../../models/db/FactorAuthCode.ts";
import {logDebug} from "../../middlewares/log/Logger.ts";
import {CookieNames} from "../../../constants/CookieNames.ts";
import {decryptEmailIfAllowedBySystem} from "../../../util/EncryptionUtil.ts";

const router = express.Router();

router.post(
    '/registration/admin',
    //@ts-ignore
    isBlacklistedMiddleware,
    async (req, res, next) => {
        try {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;

            if (!username || !email || !password) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const adminAlreadyExist = await User.adminExists();
            if (adminAlreadyExist == true) {
                throw new ConflictError();
            }

            //@ts-ignore
            const admin = await User.createAdmin(username, email, password);
            await admin.updateLastLogin(res.locals.ip);
            await MailHandler.sendRegistrationMail(email, admin._id.toString(), admin.userName);

            JwtHandler.setRefreshTokenCookie(admin.getRefreshToken(), res)
            res.status(201).json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/registration',
    //@ts-ignore
    isBlacklistedMiddleware,
    async (req, res, next) => {
        try {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;

            if (!username || !email || !password) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const adminAlreadyExist = await User.adminExists();
            if (adminAlreadyExist === false) {
                throw new ForbiddenError();
            }

            const userAlreadyExist = await User.userExists(email);
            if (userAlreadyExist) {
                throw new ConflictError();
            }

            const defaultRole = await Settings.getDefaultRole()
            const user = await User.createNewUser(username, email, password, defaultRole);
            await user.updateLastLogin(res.locals.ip);
            await MailHandler.sendRegistrationMail(email, user._id.toString(), user.userName)

            JwtHandler.setRefreshTokenCookie(user.getRefreshToken(), res)
            res.status(201).json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/signin',
    isBlacklistedMiddleware,
    async (req, res, next) => {
        try {
            const email = req.body.email;
            const password = req.body.password;

            if (!email || !password) {
                throw new BadRequestError();
            }

            const user = await User.getByCredentials(email, password);

            if (!user) {
                //Log login failure
                //@ts-ignore
                await FailedLoginAttemptsModel.logFailedLoginAttempt(res.locals.ip, email);
                throw new NotFoundError();
            }

            //@ts-ignore
            const settings = await Settings.load();
            await user.updateLastLogin(res.locals.ip);

            let twoFactorEnabled = (user.isAdmin() && settings.twoFactorAuthorization.admin === true) || (!user.isAdmin() && settings.twoFactorAuthorization.clients === true);
            let twoFactorAuthId = null;

            let response: SigninResponseBody;

            /**
             * Return two factor auth id if 2 Factor Authentication is enabled.
             * Otherwhise, return authentication token and, if exist, the authentication hook.
             */
            if (twoFactorEnabled === true) {
                //@ts-ignore
                const twoFactorAuthDoc = await TwoFactorAuthCodeModel.createNewAuthCode(user._id);
                twoFactorAuthId = twoFactorAuthDoc._id.toString();
                const code = twoFactorAuthDoc.code;

                await MailHandler.send2FactorAuthMail(email, user.userName, code);
                response = new SigninResponseBody(null, null, twoFactorAuthId)
            } else {
                const hook = await Settings.getAuthenticationHook();
                const authTokenBody = await user.getAuthToken();
                const authToken = authTokenBody.token;

                //Set refreshToken as cookie
                JwtHandler.setRefreshTokenCookie(user.getRefreshToken(), res);
                response = new SigninResponseBody(authToken, hook?.url || null, null)
            }

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
);


router.post(
    '/registration/resend',
    hasJwtMiddleware,
    async (req, res, next) => {
        try {
            const jwt = res.locals.authToken as JwtContent;
            const userId = jwt.getUserId();

            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError();
            }

            const credentials = await user.getCredentials();
            const email = await decryptEmailIfAllowedBySystem(credentials.email);

            await MailHandler.sendRegistrationMail(email, user._id.toString(), user.userName)

            res.json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

/**
 * Creates a new auth token and sets a new refresh token as httponly cookie.
 * This route expects the refresh token.
 *
 * The refresh token needs to be sent with a cookie that is created during registration and signin.
 * If the refresh token is expired, an { @class UnauthorizedError }.
 */
router.put(
    '/token',
    async (req, res, next) => {
        try {
            const cookies = req.cookies;
            const refreshToken = cookies[CookieNames.REFRESH_TOKEN];

            if (!refreshToken) {
                throw new ForbiddenError();
            }

            const userId = JwtHandler.decodeRefreshToken(refreshToken);

            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError();
            }

            const jwtBody = await user.getAuthToken();
            JwtHandler.setRefreshTokenCookie(user.getRefreshToken(), res)
            res.json(jwtBody);
        } catch (e) {
            next(e);
        }
    }
);


router.post(
    '/reset/password',
    async (req, res, next) => {
        try {
            const email = req.body.email;

            if (!email) {
                throw new BadRequestError();
            }

            const user = await User.getByEmail(email);
            if (!user) {
                logDebug(`POST /reset/password: No user with email ${email} exist.`)
                return res.json(new Success())
            }

            const credentials = await user.getCredentials();
            if (!credentials) {
                logDebug(`POST /reset/password: No credentials for user email ${email} exist.`)
                return res.json(new Success())
            }

            const passwordResetModification = await UserModification.createPasswordResetModificationObject(user._id.toString());
            const token = await passwordResetModification.createToken();
            const mailResponse = await MailHandler.sendResetPasswordMail(credentials.email, user.userName, token)
            return res.json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/logout',
    async (req, res, next) => {
        try {
            JwtHandler.clearAuthenticationCookies(res);
            return res.end();
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}