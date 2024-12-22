import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {User} from "../../../models/db/User.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import {UserModification} from "../../../models/db/UserModification.ts";
import {MailHandler} from "../../../util/MailHandler.ts";
import {Success} from "../../../models/api/Success.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import {validatePassword} from "../../../util/PasswordUtil.ts";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {EmailCredentialsModel} from "../../../models/db/credentials/EMailCredentials.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import {decryptEmailIfAllowedBySystem} from "../../../util/EncryptionUtil.ts";

const router = express.Router();

/**
 *
 */
router.get(
    '/:userId',
    async (req, res, next) => {
        try {
            const paramId = req.params.userId;
            const jwt = res.locals.authToken as JwtContent;
            const userId = jwt.getUserId()

            if (!paramId) {
                throw new BadRequestError();
            }

            //Only the admin can request user details of other users
            if (!jwt.isAdmin() && paramId !== userId) {
                throw new ForbiddenError();
            }

            const userDetails = await User.getDetails(paramId);
            if (!userDetails) {
                throw new NotFoundError();
            }

            return res.json(userDetails)
        } catch (e) {
            next(e);
        }
    }
);

/**
 * Creates an email modification object that allows the user to change the email address.
 */
router.patch(
    '/modify/email',
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;
            const userId = authToken.getUserId()
            const newMail = req.body.email;

            if (!userId || !newMail) {
                throw new BadRequestError();
            }

            const emailAlreadyExist = await EmailCredentialsModel.emailExists(newMail);
            if (emailAlreadyExist) {
                throw new ConflictError();
            }

            const emailModification = await UserModification.createEMailModification(userId, newMail)
            const currentUserMail = await decryptEmailIfAllowedBySystem(emailModification.metadata.originMail);

            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError();
            }

            const token = await emailModification.createToken();
            const mailResponse = await MailHandler.sendEmailModificationMail(currentUserMail, token, user.userName)
            res.json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

/**
 * Creates a password modification object that allows the user to change the password address.
 */
router.patch(
    '/modify/password',
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;
            const userId = authToken.getUserId();

            const currentPassword = req.body.currentPassword;
            const newPassword = req.body.newPassword;

            if (!userId || !newPassword || !currentPassword) {
                throw new BadRequestError();
            }

            //Check if new password is valid
            const violations = validatePassword(newPassword) as Array<any>;
            if (violations.length > 0) {
                throw new BadRequestError();
            }

            const user = await User.findById(userId);
            if(!user){
                throw new NotFoundError();
            }

            const credentials = await user.getCredentials();

            //Check if current password is the right one
            const passwordIsValid = await credentials.validatePassword(currentPassword);
            if (!passwordIsValid) {
                throw new ForbiddenError();
            }

            const passwordModification = await UserModification.createPasswordModification(userId, newPassword)
            const currentUserMail = await decryptEmailIfAllowedBySystem(credentials.email);
            const token = await passwordModification.createToken();

            const mailResponse = await MailHandler.sendPasswordModificationMail(currentUserMail, token, user.userName)
            res.json(new Success());
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}