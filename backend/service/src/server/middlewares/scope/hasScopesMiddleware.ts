import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";

function handleScopes(scopes: string[], req: Request, res: Response, next: NextFunction) {
    const jwtContent = res.locals.authToken as JwtContent;

    if (!jwtContent) {
        throw new ForbiddenError()
    }

    const authTokenContainScopes = jwtContent.containsScopes(...scopes)

    if (!authTokenContainScopes) {
        throw new ForbiddenError()
    }

    next();
}

export {
    handleScopes
}


