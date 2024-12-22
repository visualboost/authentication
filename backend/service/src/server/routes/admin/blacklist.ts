import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {User} from "../../../models/db/User.ts";
import {Blacklist} from "../../../models/db/Blacklist.ts";
import {Success} from "../../../models/api/Success.ts";
import {BlackListItem} from "../../../models/api/BlackListItem.ts";
import {Settings} from "../../../models/db/Settings.ts";
import {decrypt, encrypt} from "../../../util/EncryptionUtil.ts";
import {hasBlackListReadScope, hasBlackListWriteScope} from "../../middlewares/scope/hasBlacklistScopesMiddleware.ts";

const router = express.Router();

router.get(
    '/',
    hasBlackListReadScope,
    async (req, res, next) => {
        try {
            const emailSearchQuery = req.query.email as string;
            const emailsAreEncrypted = await Settings.getEmailEncryptionEnabled();

            let blackListEntries: Array<BlackListItem> = [];
            if (emailSearchQuery) {

                if (emailsAreEncrypted) {
                    blackListEntries = await Blacklist.find({email: encrypt(emailSearchQuery)}).lean() as Array<BlackListItem>;
                } else {
                    blackListEntries = await Blacklist.find({email: new RegExp(emailSearchQuery, 'i')}).lean() as Array<BlackListItem>;
                }
            } else {
                blackListEntries = await Blacklist.find().lean() as Array<BlackListItem>;
            }

            const blacklistItems = blackListEntries.map(entry => {
                let email = entry.email
                if (emailsAreEncrypted) {
                    email = decrypt(email);
                }
                return new BlackListItem(entry.ip, email, entry.createdAt)
            });

            return res.json(blacklistItems);
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/email',
    hasBlackListWriteScope,
    async (req, res, next) => {
        try {
            const email = req.body.email;
            if (!email) {
                throw new BadRequestError();
            }

            //Can't set ADMIN to blacklist
            const user = await User.getByEmail(email);
            if (user && user.isAdmin()) {
                throw new BadRequestError();
            }

            await Blacklist.addEmail(email);
            return res.json(new Success())
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/email',
    hasBlackListWriteScope,
    async (req, res, next) => {
        try {
            const email = req.query.email as string;
            if (!email) {
                throw new BadRequestError();
            }

            await Blacklist.deleteEmail(email);
            return res.json(new Success())
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/ip',
    hasBlackListWriteScope,
    async (req, res, next) => {
        try {
            const ip = req.body.ip;
            if (!ip) {
                throw new BadRequestError();
            }

            const user = await User.getByIP(ip, false);

            //Can't set ADMIN to blacklist
            if (user && user.isAdmin()) {
                throw new BadRequestError();
            }

            await Blacklist.addIP(ip);
            return res.json(new Success())
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/ip',
    hasBlackListWriteScope,
    async (req, res, next) => {
        try {
            const ip = req.query.ip as string;
            if (!ip) {
                throw new BadRequestError();
            }

            await Blacklist.deleteIP(ip);
            return res.json(new Success())
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}