import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import Scope from "../../../constants/role/Scope.ts";
import {handleScopes} from "./hasScopesMiddleware.ts";

const hasBlackListReadScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Blacklist.READ], req, res, next)
};

const hasBlackListWriteScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Blacklist.WRITE], req, res, next)
};

export {
    hasBlackListReadScope,
    hasBlackListWriteScope,
}


