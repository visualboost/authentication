import express from "express";
import {Settings} from "../../../models/db/Settings.ts";
import BadRequestError from "../../../errors/BadRequestError.ts";
import {TimeUtil} from "../../../util/TimeUtil.ts";
import {JwtHandler} from "../../../util/JwtHandler.ts";
import {hasSettingsReadRoleScope, hasSettingsWriteRoleScope} from "../../middlewares/scope/hasSettingsScopesMiddleware.ts";

const router = express.Router();

router.get(
    '/',
    hasSettingsReadRoleScope,
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
    hasSettingsWriteRoleScope,
    async (req, res, next) => {
        try {
            const settings = req.body.settings
            const updatedSettings = await Settings.updateSettings(settings);

            JwtHandler.updateAuthenticationTokenExpiration(updatedSettings.tokenExpiration.authenticationToken)
            JwtHandler.updateRefreshTokenExpiration(updatedSettings.tokenExpiration.refreshToken)
            return res.json(settings);
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    '/encrypt/emails',
    hasSettingsWriteRoleScope,
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