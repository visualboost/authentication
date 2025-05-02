import {JwtContent} from "../models/api/JwtContent.ts";
import jwt, {JwtPayload, TokenExpiredError} from "jsonwebtoken";
import {JwtBody} from "../models/api/JwtBody.ts";
import {UserState} from "../constants/UserState.ts";
import {InvitationToken} from "../models/api/InvitationToken.ts";
import ForbiddenError from "../errors/ForbiddenError.ts";
import {Response, Request} from "express";
import {TimeUtil} from "./TimeUtil.ts";
import UnauthorizedError from "../errors/UnauthorizedError.ts";
import {CookieNames} from "../constants/CookieNames.ts";
import {getAuthenticationTokenSecret, getRefreshTokenSecret} from "./EncryptionUtil.ts";
import {isDevEnvironment} from "./ConfigUtil.ts";
import {Settings} from "../models/db/Settings.ts";
import {TokenType} from "../constants/TokenType.ts";

export class JwtHandler {

    //The expiration time of the authentication token. This parameter will be overridden by the token expiration time defined in the settings
    private static authenticationTokenExpirationTime: number = 30;
    //The expiration time of the authentication token. This parameter will be overridden by the token expiration time defined in the settings
    private static refreshTokenExpirationTime: number = 480;

    static createJwt(jwtContent: any, expiresIn: string): string {
        return jwt.sign({...jwtContent}, getAuthenticationTokenSecret(), {expiresIn: expiresIn});
    }

    /**
     * Create a personal access token.
     */
    static createPersonalAccessToken(tokenId: string, expiresIn: string): string {
        return JwtHandler.createJwt({
            tid: tokenId
        }, expiresIn);
    }

    /**
     * Create an authentication token.
     */
    static createAuthenticationToken(_id: string, role: string, scopes: string[], userstate: UserState): string {
        const jwtContent = new JwtContent(_id.toString(), role, scopes, userstate);
        return JwtHandler.createJwt(jwtContent, `${this.authenticationTokenExpirationTime}m`);
    }

    /**
     * Creates a refresh token.
     * This token expires in 4 hours.
     */
    static createRefreshToken(_id: string): string {
        return jwt.sign({id: _id}, getRefreshTokenSecret(), {expiresIn: `${this.refreshTokenExpirationTime}m`});
    }

    static setRefreshTokenCookie(refreshToken: string, res: Response) {
        res.cookie(CookieNames.REFRESH_TOKEN, refreshToken, {
            secure: !isDevEnvironment(),
            httpOnly: true,
            expires: (new Date(Date.now() + TimeUtil.hoursToMillis(8)))
        })
    }

    /**
     * Return the userId of the refreshtoken.
     */
    static decodeRefreshToken(refreshToken: string): string | null {
        try {
            const decodedToken = jwt.verify(refreshToken, getRefreshTokenSecret()) as JwtPayload;
            if (!decodedToken.id) return null;

            return decodedToken.id;
        } catch (e) {
            if (e instanceof TokenExpiredError) {
                throw new UnauthorizedError();
            }

            throw e;
        }
    }

    static getBearerTokenFromRequest(req: Request): JwtPayload | null {
        try {
            //@ts-ignore
            const authHeader = req.headers["authorization"];
            if (!authHeader) return null;

            const authHeaderWithoutPrefix = authHeader.replace("Bearer ", "")
            if (!authHeaderWithoutPrefix) return null;

            const decodedToken = jwt.verify(authHeaderWithoutPrefix, getAuthenticationTokenSecret()) as JwtPayload;
            return decodedToken;
        } catch (e) {
            if (e instanceof TokenExpiredError) {
                throw new UnauthorizedError();
            }

            throw new ForbiddenError()
        }
    }

    static fromRequest(req: Request): JwtContent {
        const authHeaderWithoutPrefix = JwtHandler.getBearerTokenFromRequest(req);
        return this.decodeAuthToken(authHeaderWithoutPrefix)
    }

    static decodeAuthToken(decodedToken: JwtPayload): JwtContent | null {
        const jwtContent = new JwtContent(decodedToken.userId, decodedToken.role, decodedToken.scopes, decodedToken.state);

        if (jwtContent.isValid() !== true) return null;
        return jwtContent;
    }

    static createAuthTokenBody(_id: string, role: string, scopes: string[], userstate: UserState): JwtBody {
        return new JwtBody(this.createAuthenticationToken(_id, role, scopes, userstate));
    }

    /**
     * A jwt that is used to create an invitation link
     */
    static createInvitationToken(userInviationId: string): JwtBody {
        const tokenContent = new InvitationToken(userInviationId);
        return new JwtBody(jwt.sign({...tokenContent}, getAuthenticationTokenSecret()));
    }

    static decodeInvitationToken(token: string): InvitationToken | null {
        const decodedToken = jwt.verify(token, getAuthenticationTokenSecret()) as JwtPayload;
        const invitationTokenContent = new InvitationToken(decodedToken.userInvitationId)

        if (!invitationTokenContent.getUserInvitationId()) return null;
        return invitationTokenContent;
    }

    /**
     * Creates a modification token.
     * This token is used to verify if the user data can be modified or not
     */
    static createModificationToken(modificationId: string, credentialsId: string): string {
        return jwt.sign({modificationId: modificationId}, credentialsId);
    }

    static decodeModificationToken(token: string, credentialsId: string): string | null {
        const decodedToken = jwt.verify(token, credentialsId) as JwtPayload;
        if (!decodedToken.modificationId) return null;

        return decodedToken.modificationId;
    }

    /**
     * Decode the json web token without verification.
     */
    static decodeWithoutVerification(token: string): unknown {
        return jwt.decode(token)
    }

    static verify(token: string, key: string): unknown {
        return jwt.verify(token, key)
    }

    static clearAuthenticationCookies(res: Response) {
        res.clearCookie(CookieNames.AUTH_TOKEN);
        res.clearCookie(CookieNames.REFRESH_TOKEN);
    }

    static updateAuthenticationTokenExpiration(timeInMinutes: number) {
        this.authenticationTokenExpirationTime = timeInMinutes
    }

    static updateRefreshTokenExpiration(timeInMinutes: number) {
        this.refreshTokenExpirationTime = timeInMinutes
    }

    static async initializeTokenExpirationDates() {
        const settings = await Settings.load();
        this.authenticationTokenExpirationTime = settings.tokenExpiration.authenticationToken;
        this.refreshTokenExpirationTime = settings.tokenExpiration.refreshToken;
    }

}