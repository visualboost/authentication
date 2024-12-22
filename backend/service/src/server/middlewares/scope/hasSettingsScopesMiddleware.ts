import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../../errors/ForbiddenError.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import Scope from "../../../constants/role/Scope.ts";
import {handleScopes} from "./hasScopesMiddleware.ts";

const hasSettingsReadRoleScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Settings.READ], req, res, next)
};

const hasSettingsWriteRoleScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Settings.WRITE], req, res, next)
};

export {
    hasSettingsReadRoleScope,
    hasSettingsWriteRoleScope,
}


