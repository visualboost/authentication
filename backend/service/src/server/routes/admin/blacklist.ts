import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {IUser, User} from "../../../models/db/User.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import {Role} from "../../../models/db/Roles.ts";
import {Blacklist} from "../../../models/db/Blacklist.ts";
import {Success} from "../../../models/api/Success.ts";
import {UserListItem} from "../../../models/api/UserListItem.ts";
import {UserState} from "../../../constants/UserState.ts";
import {BlackListItem} from "../../../models/api/BlackListItem.ts";
import {Settings} from "../../../models/db/Settings.ts";
import {UserSearchCriterias} from "../../../constants/UserSearchCriterias.ts";
import {EmailCredentialsModel} from "../../../models/db/credentials/EMailCredentials.ts";
import {decrypt, encrypt} from "../../../util/EncryptionUtil.ts";

const router = express.Router();

router.get(
    '/',
    async (req, res, next) => {
        try {
            const emailSearchQuery = req.query.email as string;
            const emailsAreEncrypted = await Settings.getEmailEncryptionEnabled();

            let blackListEntries: Array<BlackListItem> = [];
            if(emailSearchQuery){

                if(emailsAreEncrypted){
                    blackListEntries = await Blacklist.find({email: encrypt(emailSearchQuery)}).lean() as Array<BlackListItem>;
                }else{
                    blackListEntries = await Blacklist.find({email: new RegExp(emailSearchQuery, 'i')}).lean() as Array<BlackListItem>;
                }
            }else{
                blackListEntries = await Blacklist.find().lean() as Array<BlackListItem>;
            }

            const blacklistItems = blackListEntries.map(entry => {
                let email = entry.email
                if(emailsAreEncrypted){
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
    async (req, res, next) => {
        try {
            const email = req.body.email;
            if (!email) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const user = await User.getByEmail(email);
            if(user && user.isAdmin()){
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
    async (req, res, next) => {
        try {
            const email = req.query.email;
            if (!email) {
                throw new BadRequestError();
            }

            //@ts-ignore
            await Blacklist.deleteEmail(email);
            return res.json(new Success())
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/ip',
    async (req, res, next) => {
        try {
            const ip = req.body.ip;
            if (!ip) {
                throw new BadRequestError();
            }

            const user = await User.getByIP(ip, false);
            if(user && user.isAdmin()){
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

router.delete(
    '/block/ip',
    async (req, res, next) => {
        try {
            const ip = req.body.ip;
            if (!ip) {
                throw new BadRequestError();
            }

            //@ts-ignore
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