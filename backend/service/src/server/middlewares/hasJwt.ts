import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {JwtHandler} from "../../util/JwtHandler.ts";
import {JwtContent} from "../../models/api/JwtContent.ts";
import {AccessToken} from "../../models/db/AccessToken.ts";
import UnauthorizedError from "../../errors/UnauthorizedError.ts";
import {TokenType} from "../../constants/TokenType.ts";

const hasJwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = JwtHandler.getBearerTokenFromRequest(req)
        if(!token) {
            throw new ForbiddenError()
        }

        if(token.tid){
            const tokenId = token.tid;

            const accessToken = await AccessToken.findById(tokenId).lean();
            if(!accessToken) {
                throw new UnauthorizedError();
            }

            res.locals.authToken = new JwtContent(accessToken.userId.toString(), accessToken.userRole, accessToken.scopes, accessToken.userState);
            res.locals.tokenType = TokenType.ACCESS_TOKEN;
        }else{
            res.locals.authToken = JwtHandler.decodeAuthToken(token);
            res.locals.tokenType = TokenType.SIGNIN;
        }

        next();
    }catch (e) {
        next(e);
    }

};

export {
    hasJwtMiddleware
}
