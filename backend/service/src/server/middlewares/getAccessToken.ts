import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {JwtHandler} from "../../util/JwtHandler.ts";
import {JwtContent} from "../../models/api/JwtContent.ts";
import {TokenType} from "../../constants/TokenType.ts";

const getAccessTokenFromRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const personalAccessToken = await JwtHandler.getPersonalAccessTokenFromRequest(req);

        if (personalAccessToken) {
            res.locals.authToken = new JwtContent(personalAccessToken.userId.toString(), personalAccessToken.userRole, personalAccessToken.scopes, personalAccessToken.userState);
            res.locals.tokenType = TokenType.ACCESS_TOKEN;
        }

        next();
    } catch (e) {
        next(e);
    }

};

export {
    getAccessTokenFromRequest
}
