import express from "express";
import {User} from "../../models/db/User.ts";
import {SystemStateResponse} from "../../models/api/SystemState.ts";
import NotFoundError from "../../errors/NotFoundError.ts";
import {Settings} from "../../models/db/Settings.ts";
import crypto from "node:crypto";
import {hasXsrfTokenMiddleware} from "../middlewares/hasXsrfTokenMiddleware.ts";
import {ServerConfig} from "../../models/util/ServerConfig.ts";
import {CookieOptions} from "express-serve-static-core";
import {isDevEnvironment} from "../../util/ConfigUtil.ts";
import {getApiDocumentation} from "../../util/FileHandler.ts";

const router = express.Router();

/**
 * Set a xsfr token as cookie.
 *
 * Important:
 * sameSite needs to be true to ensure the cookie is only send to applications running on the same domain
 * httpOnly: false: The frontend needs to read the cookie so it can be send as header to the backend
 * domain: make the cookie only available for the predefined domain
 * secure: works only with https in production mode
 */
router.get(
    '/xsfr',
    async (req, res, next) => {
        const xsrfToken = crypto.randomBytes(32).toString('hex');
        const serverConfig = ServerConfig.init();

        const cookieOptions: CookieOptions = {
                httpOnly: false,
                sameSite: true,
                secure: !isDevEnvironment(),
        }

        //localhost is not allowed for domain
        if(serverConfig.domain !== "localhost"){
            cookieOptions.domain = serverConfig.domain;
        }

        res.cookie('XSRF-TOKEN', xsrfToken, cookieOptions);

        return res.end();
    }
);

router.get(
    '/state',
    async (req, res, next) => {
        try {
            //@ts-ignore
            const adminAlreadyExist = await User.adminExists();
            if (adminAlreadyExist == true) {
                return res.json(SystemStateResponse.InitializedState())
            } else {
                return res.json(SystemStateResponse.NotInitializedState())
            }
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/enableRegistrationView',
    async (req, res, next) => {
        try {
            //@ts-ignore
            const settings = await Settings.load();
            return res.json({
                enableRegistrationView: settings.enableRegistrationView
            })
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/privacypolicy',
    async (req, res, next) => {
        try {
            const settings = await Settings.load();

            if (settings.showPrivacyPolicy) {
                if (!settings.privacyPolicyUrl || settings.privacyPolicyUrl === "") {
                    throw new NotFoundError();
                }
            }

            return res.json({
                showPrivacyPolicy: settings.showPrivacyPolicy,
                privacyPolicyUrl: settings.privacyPolicyUrl
            })
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/hooks',
    hasXsrfTokenMiddleware,
    async (req, res, next) => {
        const settings = await Settings.load();
        const result: any = {};

        settings.hooks.forEach(hook => {
            result[hook.type] = hook.url;
        });
        return res.json(result);
    }
);

router.get(
    '/documentation',
    async (req, res, next) => {
        const documentation = await getApiDocumentation();
        return res.send(documentation);
    }
);


export {
    router
}