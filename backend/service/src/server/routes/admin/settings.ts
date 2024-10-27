import express from "express";
import {Settings} from "../../../models/db/Settings.ts";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {EmailCredentialsModel} from "../../../models/db/credentials/EMailCredentials.ts";
import {TimeUtil} from "../../../util/TimeUtil.ts";

const router = express.Router();

router.get(
    '/',
    async (req, res, next) => {
        try {
            //@ts-ignore
            const settings = await Settings.load();
            return res.json(settings);
        } catch (e) {
            next(e);
        }
    }
);

router.put(
    '/',
    async (req, res, next) => {
        try {
            const settings = req.body.settings
            //@ts-ignore
            const updatedSettings = await Settings.updateSettings(settings);
            return res.json(settings);
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/encrypt/emails',
    async (req, res, next) => {
        req.setTimeout(TimeUtil.minutesToMillis(5));

        try {
            const encryptEmails = req.body.encryptEmails as boolean;
            if (encryptEmails === undefined || encryptEmails === null) {
                throw new BadRequestError();
            }

            if (encryptEmails === true) {
                await Settings.encryptAllEmails();
            } else {
                await Settings.decryptAllEmails();
            }

            const settings = await Settings.load();
            return res.json(settings);
        } catch (e) {
            next(e);
        }
    }
);


export {
    router
}