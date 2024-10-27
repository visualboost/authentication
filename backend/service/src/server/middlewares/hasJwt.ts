import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {JwtHandler} from "../../util/JwtHandler.ts";

const hasJwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const jwtContent = JwtHandler.fromRequest(req)
    if(!jwtContent) {
        throw new ForbiddenError()
    }

    res.locals.authToken = jwtContent

    next();
};

export {
    hasJwtMiddleware
}
