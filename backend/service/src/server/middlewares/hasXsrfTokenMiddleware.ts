import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {TokenType} from "../../constants/TokenType.ts";
import {JwtHandler} from "../../util/JwtHandler.ts";

/**
 * Validates if the request header contains the xsfr-token, that was created by /system/xsfr
 */
const hasXsrfTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Ignore xsfr because we can trust the access token
        const personalAccessTokenId = JwtHandler.getPersonalAccessTokenIdFromRequest(req);
        if (personalAccessTokenId) {
            next();
            return;
        }

        const cookies = req.cookies;
        const xsfrCookie = cookies['XSRF-TOKEN'];
        const xsfrTokenFromHeader = req.headers['x-xsrf-token'];

        if (!xsfrCookie || !xsfrTokenFromHeader) {
            throw new ForbiddenError();
        }

        if (xsfrCookie !== xsfrTokenFromHeader) {
            throw new ForbiddenError();
        }

        next();
    } catch (e) {
        next(e);
    }

};

export {
    hasXsrfTokenMiddleware
}
