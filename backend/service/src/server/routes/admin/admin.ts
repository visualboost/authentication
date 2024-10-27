import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {IUser, User} from "../../../models/db/User.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import {Role} from "../../../models/db/Roles.ts";
import {Success} from "../../../models/api/Success.ts";
import {UserListItem} from "../../../models/api/UserListItem.ts";
import {UserState} from "../../../constants/UserState.ts";
import {router as roleRouter} from "./role.ts";
import {router as blacklistRouter} from "./blacklist.ts";
import {router as settingsRouter} from "./settings.ts";
import {router as statisticsRouter} from "./statistics.ts";

import {UserSearchCriterias} from "../../../constants/UserSearchCriterias.ts";
import {EmailCredentialsModel, IEmailCredentials} from "../../../models/db/credentials/EMailCredentials.ts";
import {SystemRoles} from "../../../constants/SystemRoles.ts";
import {JwtHandler} from "../../../util/JwtHandler.ts";
import {MailHandler} from "../../../util/MailHandler.ts";
import {UserInvitation} from "../../../models/db/UserInvitation.ts";
import FailedDependencyError from "../../../errors/FailedDependencyError.ts";
import {Settings} from "../../../models/db/Settings.ts";
import {decrypt} from "../../../util/EncryptionUtil.ts";

const router = express.Router();

//Add roles
router.use("/", roleRouter)
router.use("/blacklist", blacklistRouter)
router.use("/settings", settingsRouter)
router.use("/statistics", statisticsRouter)

/**
 * Return all non-blocked user.
 * Result can be restricted by UserSearchCriterias.
 */
router.get(
    '/user',
    async (req, res, next) => {
        try {
            const value = req.query.value as string;
            const type = req.query.type as string;

            const emailsAreEncrypted = await Settings.getEmailEncryptionEnabled();

            let user: Array<IUser> = [];
            if (value && type) {
                if (type === UserSearchCriterias.USERNAME) {
                    user = await User.findAllByUsername(value);
                } else if (type === UserSearchCriterias.EMAIL) {
                    user = await User.findAllByEmail(value);
                }
            } else {
                user = await User.find({"confirmation.state": {$ne: UserState.BLOCKED}}).populate("credentials").lean() as Array<IUser>;
            }

            const userListItems = user.map(u => {
                let email = (u.credentials as IEmailCredentials).email;
                if (emailsAreEncrypted && !email.includes("@")) {
                    email = decrypt(email)
                }
                return new UserListItem(u._id.toString(), u.userName, email, u.confirmation.state, u.role, u.createdAt, u.lastLogin)
            })
            return res.json(userListItems);
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/user/add',
    async (req, res, next) => {
        try {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;
            const role = req.body.role;

            if (!username || !email || !password) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const userAlreadyExist = await User.userExists(username, email);
            if (userAlreadyExist) {
                throw new ConflictError();
            }

            //@ts-ignore
            const user = await User.createNewUser(username, email, password, role);
            const result = await MailHandler.sendRegistrationMail(email, user._id.toString(), user.userName)
            const emailRejected = result.rejected.includes(email);
            if (emailRejected === true) {
                throw new FailedDependencyError();
            }

            //@ts-ignore
            const newUser = await User.getDetails(user._id);
            return res.json(newUser)
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/user/invite',
    async (req, res, next) => {
        try {
            const name = req.body.name;
            const email = req.body.email;
            const role = req.body.role;

            if (!name) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const emailExists = await EmailCredentialsModel.emailExists(email)

            if (emailExists === true) {
                throw new ConflictError();
            }

            //@ts-ignore
            const roleExists = await Role.roleExists(role);
            if (roleExists !== true || role === SystemRoles.ADMIN) {
                throw new ConflictError();
            }


            // @ts-ignore
            const newUserInvitation = await UserInvitation.newUserInvitation(email, role);
            const invitationToken = JwtHandler.createInvitationToken(newUserInvitation._id.toString());
            const result = await MailHandler.sendUserInvitationMail(email, name, invitationToken.token);

            const emailRejected = result.rejected.includes(email);
            if (emailRejected === true) {
                throw new FailedDependencyError();
            }

            return res.json(new Success())
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/user/:userId',
    async (req, res, next) => {
        try {
            const userId = req.params.userId;

            if (!userId) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const userToDelete = await User.getDetails(userId);
            //@ts-ignore
            const user = await User.delete(userId);
            return res.json(userToDelete)
        } catch (e) {
            next(e);
        }
    }
);

router.patch(
    '/user/:userId/role',
    async (req, res, next) => {
        try {
            const userId = req.params.userId;
            const role = req.body.role;

            if (!userId || !role) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError();
            }

            //@ts-ignore
            const roleExists = await Role.roleExists(role);
            if (roleExists !== true) {
                throw new BadRequestError();
            }

            user.role = role;
            await user.save();

            //@ts-ignore
            const patchedUser = await User.getDetails(user._id);
            return res.json(patchedUser)
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}