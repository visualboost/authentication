import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import Scope from "../../../constants/role/Scope.ts";
import {handleScopes} from "./hasScopesMiddleware.ts";

const hasWriteAccessTokenScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Api.WRITE], req, res, next)
};

const hasReadAccessTokenScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Api.READ], req, res, next)
};

export {
    hasWriteAccessTokenScope,
    hasReadAccessTokenScope
}


