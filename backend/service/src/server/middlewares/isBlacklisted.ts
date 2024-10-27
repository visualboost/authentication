import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {Blacklist} from "../../models/db/Blacklist.ts";

/**
 * Validate if a user is blacklisted. Blacklisted can't login again.
 * This middleware needs an email address in the request body.
 */
const isBlacklistedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = res.locals.ip
    const email = req.body.email;
    //@ts-ignore
    const isBlocked = await Blacklist.isBlocked(ip, email)

    if (isBlocked) {
        next(new ForbiddenError())
    }

    next();
};

export {
    isBlacklistedMiddleware
}
