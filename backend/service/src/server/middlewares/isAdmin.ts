import {NextFunction, Response, Request} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {JwtContent} from "../../models/api/JwtContent.ts";
import {SystemRoles} from "../../constants/SystemRoles.ts";

const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const jwtContent = res.locals.authToken as JwtContent;

    if(!jwtContent || jwtContent.getRole() !== SystemRoles.ADMIN) {
        throw new ForbiddenError()
    }

    next();
};

export {
    isAdminMiddleware
}
