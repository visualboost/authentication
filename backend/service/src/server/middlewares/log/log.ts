//@ts-nocheck

import {logDebug} from "./Logger.ts";
import {getEnv} from "../../../env/config.ts";

const logRequest = (req, res, next) => {
    //@ts-ignore
    const ip = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    res.locals.ip = ip

    const DEBUG = getEnv("DEBUG");
    if(DEBUG === true) {
        logDebug({
            ip: ip,
            message: `Request from ${req.originalUrl}`,
            hostname: req.hostname,
            protocol: req.protocol,
            url: req.originalUrl,
            headers: JSON.stringify(req.headers),
            body: req.body
        })
    }

    next();
};

export {
    logRequest
}
