/**
 * This router contains all route that will be called to execute the user modifications (reset password, change password, change email)
 */

import express from "express";
import {
    IEmailModification,
    IPasswordChangeModification,
    IUserModification, UserModification
} from "../../../models/db/UserModification.ts";
import {User} from "../../../models/db/User.ts";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {ServerUtil} from "../../../util/ServerUtil.ts";
import {Settings} from "../../../models/db/Settings.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {CookieNames} from "../../../constants/CookieNames.ts";
import {Success} from "../../../models/api/Success.ts";
import {decrypt, decryptEmailIfAllowedBySystem} from "../../../util/EncryptionUtil.ts";

const router = express.Router();

/**
 * This route is called when the user clicks on the link in the "Confirm change email" email.
 * It'll change the email address of the user and forward the user to a custom hook or to "CHANGED_EMAIL_PATH".
 */
router.get(
    '/email',
    async (req, res, next) => {
        try {
            const userModification = res.locals.modificationDoc as IEmailModification

            if (!userModification.isEmail()) {
                throw new ForbiddenError();
            }

            const user = await User.findById(userModification.userId)
            if (!user) {
                throw new NotFoundError();
            }

            const newEmail = await decryptEmailIfAllowedBySystem(userModification.metadata.newEmail);
            await user.setEmail(newEmail);

            let redirectUrl;

            const hook = await Settings.getEmailChangeHook();
            if (hook?.url) {
                redirectUrl = hook.url;
            } else {
                redirectUrl = ServerUtil.getChangedEmailUrl();
            }

            await UserModification.clearEmailModifications(userModification.userId)
            return res.redirect(redirectUrl);
        } catch (e) {
            next(e);
        }
    }
);

/**
 * This route is called when the user clicks on the link in the "Confirm change password" email.
 * It'll change the password of the user and forward him to a custom hook or to "CHANGED_EMAIL_PATH".
 */
router.get(
    '/password',
    async (req, res, next) => {
        try {
            const userModification = res.locals.modificationDoc as IPasswordChangeModification

            if (!userModification.isPasswordChange()) {
                throw new ForbiddenError();
            }

            const user = await User.findById(userModification.userId)
            if (!user) {
                throw new NotFoundError();
            }

            /**
             * Set new password but do not encrypt it because newPassword is already encrypted
             */
            const newPassword = userModification.metadata.newPassword;
            const credentials = await user.getCredentials();
            credentials.password = newPassword;
            await credentials.save();

            let redirectUrl;

            const hook = await Settings.getPasswordChangeHook();
            if (hook?.url) {
                redirectUrl = hook.url;
            } else {
                redirectUrl = ServerUtil.getConfirmChangedPasswordUrl()
            }

            await UserModification.clearPasswordModifications(userModification.userId);
            return res.redirect(redirectUrl);
        } catch (e) {
            next(e);
        }
    }
);

/**
 * This route can be called with a user reset modification token to set a new password.
 */
router.patch(
    '/password',
    async (req, res, next) => {
        try {
            const userModification = res.locals.modificationDoc as IUserModification
            const password = req.body.password;

            if (!userModification.isPasswordReset() || !password) {
                throw new BadRequestError();
            }

            const user = await User.findById(userModification.userId)
            if (!user) {
                throw new NotFoundError();
            }

            await user.setPassword(password);

            //Delete the authorization cookie
            res.clearCookie(CookieNames.AUTH_TOKEN);
            return res.json(new Success());
        } catch (e) {
            next(e);
        }
    }
);


export {
    router
}