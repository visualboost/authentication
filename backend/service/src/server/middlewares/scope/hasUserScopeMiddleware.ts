import {NextFunction, Request, Response} from "express";
import Scope from "../../../constants/role/Scope.ts";
import {handleScopes} from "./hasScopesMiddleware.ts";

const hasReadMultipleUserScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.User.READ_MULTIPLE], req, res, next)
};

const hasWriteUserScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.User.WRITE], req, res, next)
};

const hasInviteUserScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.User.INVITE], req, res, next)
};

const hasChangeUserRoleScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.User.CHANGE_ROLE], req, res, next)
};

export {
    hasReadMultipleUserScope,
    hasWriteUserScope,
    hasInviteUserScope,
    hasChangeUserRoleScope
}


