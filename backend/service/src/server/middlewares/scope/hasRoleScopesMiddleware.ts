import {NextFunction, Request, Response} from "express";
import Scope from "../../../constants/role/Scope.ts";
import {handleScopes} from "./hasScopesMiddleware.ts";


const hasReadRoleScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Role.READ], req, res, next)
};

const hasWriteRoleScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Role.WRITE], req, res, next)
};

export {
    hasReadRoleScope,
    hasWriteRoleScope,
}


