import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {TokenType} from "../../constants/TokenType.ts";

/**
 * Validates if the request header contains the xsfr-token, that was created by /system/xsfr
 */
const hasXsrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (res.locals.tokenType === TokenType.ACCESS_TOKEN) {
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
