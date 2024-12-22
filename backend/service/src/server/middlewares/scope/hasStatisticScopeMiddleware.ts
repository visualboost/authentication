import {NextFunction, Request, Response} from "express";
import Scope from "../../../constants/role/Scope.ts";
import {handleScopes} from "./hasScopesMiddleware.ts";

const hasStatisticsReadRoleScope = (req: Request, res: Response, next: NextFunction) => {
    handleScopes([Scope.Statistics.READ], req, res, next)
};

export {
    hasStatisticsReadRoleScope
}


