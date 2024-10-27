import {NextFunction, Response, Request} from "express";
import {JwtContent} from "../../models/api/JwtContent.ts";
import NotAcceptableError from "../../errors/NotAcceptableError.ts";

const isActiveMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const jwtContent = res.locals.authToken as JwtContent;

    if(!jwtContent.userIsActive()) {
        throw new NotAcceptableError();
    }

    next();
};

export {
    isActiveMiddleware
}
