import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import Scope from "../../../constants/role/Scope.ts";

function handleScopes(scopes: string[], req: Request, res: Response, next: NextFunction) {
    const jwtContent = res.locals.authToken as JwtContent;

    if (!jwtContent) {
        throw new ForbiddenError()
    }

    const authTokenContainScope = scopes.some(scope => jwtContent.getScopes().includes(scope));

    if (!authTokenContainScope) {
        throw new ForbiddenError()
    }

    next();
}

export {
    handleScopes
}


