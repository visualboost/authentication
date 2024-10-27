import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {User} from "../../../models/db/User.ts";
import {ServerUtil} from "../../../util/ServerUtil.ts";
import {hasModificationToken} from "../../middlewares/hasModificationToken.ts";
import {IUserModification} from "../../../models/db/UserModification.ts";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {Settings} from "../../../models/db/Settings.ts";
import {TwoFactorAuthCodeModel} from "../../../models/db/FactorAuthCode.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import GoneError from "../../../errors/GoneError.ts";
import {SigninResponseBody} from "../../../models/api/SigninResponseBody.ts";
import {JwtHandler} from "../../../util/JwtHandler.ts";
import {UserInvitation} from "../../../models/db/UserInvitation.ts";
import {Success} from "../../../models/api/Success.ts";

const router = express.Router();

/**
 * Will be triggered when the registration confirmation email button is clicked.
 * The user will be redirected to a "confirmed" view, that shows the user that he is successfully registered.
 *
 * The user will be redirected to the authentication hook or to a default path if no hook is defined.
 */
router.get(
    '/registration',
    async (req, res, next) => {
        try {
            const userId = req.query.userId as string;

            if (!userId) {
                throw new BadRequestError();
            }

            const user = await User.activate(userId);

            const hook = await Settings.getAuthenticationHook();
            let url : string;

            if (hook?.url) {
                url = hook.url;
            } else {
                url = ServerUtil.getConfirmedRegistrationUrl()
            }

            res.redirect(url);
        } catch (e) {
            next(e);
        }
    }
);

/**
 * Will be triggered if the reset password link in the "Confirm reset password" email is clicked.
 * This route will only validate if a valid password reset modification object exist and redirect the user to either a custom hook or to the "RESET_PASSWORD_PATH".
 */
router.get(
    '/password/reset',
    hasModificationToken,
    async (req, res, next) => {
        try {
            const userModification = res.locals.modificationDoc as IUserModification

            if (!userModification.isPasswordReset()) {
                throw new ForbiddenError();
            }

            let urlAsString;

            const hook = await Settings.getResetPasswordHook();
            if (hook?.url) {
                urlAsString = hook.url;
            } else {
                urlAsString = ServerUtil.getResetPasswordUrl(userModification._id.toString());
            }

            const url = new URL(urlAsString);
            url.searchParams.append("token", res.locals.modificationToken)
            return res.redirect(url.toString());

        } catch (e) {
            next(e);
        }
    }
);

/**
 * Validate authentication
 */
router.post(
    '/two-factor/:twoFactorDocId',
    async (req, res, next) => {
        try {
            const twoFactorDocId = req.params.twoFactorDocId;
            const authCode = req.body.code;

            if (!twoFactorDocId) {
                throw new BadRequestError();
            }

            const twoFactorAuthDoc = await TwoFactorAuthCodeModel.findById(twoFactorDocId);
            if (!twoFactorAuthDoc) {
                throw new NotFoundError();
            }

            if (twoFactorAuthDoc.code !== authCode) {
                throw new ConflictError();
            }

            if (twoFactorAuthDoc.isExpired()) {
                throw new GoneError();
            }

            const user = await User.findById(twoFactorAuthDoc.userId);
            if (!user) {
                throw new NotFoundError();
            }

            await user.updateLastLogin(res.locals.ip);

            await TwoFactorAuthCodeModel.deleteOne({_id: twoFactorDocId});

            const hook = await Settings.getAuthenticationHook();
            const authTokenBody = await user.getAuthToken();
            const authToken = authTokenBody.token;

            //Set refreshToken as cookie
            JwtHandler.setRefreshTokenCookie(user.getRefreshToken(), res);

            const response = new SigninResponseBody(authToken, hook?.url, null)
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
);

/**
 * Creates a new user if the user clicked an invitation link, added username and password and registered.
 * The user state can be ACTIVATE as he/she already received an email.
 */
router.post(
    '/invitation',
    async (req, res, next) => {
        try {
            const invitationToken = req.query.token as string;
            const username = req.body.username;
            const password = req.body.password;

            if (!invitationToken || !username || !password) {
                throw new BadRequestError();
            }

            const invitationTokenContent = JwtHandler.decodeInvitationToken(invitationToken);
            const userInvitation = await UserInvitation.findById(invitationTokenContent.getUserInvitationId())

            if (!userInvitation) {
                throw new NotFoundError();
            }

            const user = await userInvitation.toUser(username, password);
            await user.activate();

            return res.json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}