import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";

/**
 * Validates if the request header contains the xsfr-token, that was created by /system/xsfr
 */
const hasXsrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;
    const xsfrCookie = cookies['XSRF-TOKEN'];
    const xsfrTokenFromHeader = req.headers['x-xsrf-token'];

    if(!xsfrCookie || !xsfrTokenFromHeader){
        throw new ForbiddenError();
    }

    if(xsfrCookie !== xsfrTokenFromHeader){
        throw new ForbiddenError();
    }

    next();
};

export {
    hasXsrfTokenMiddleware
}
