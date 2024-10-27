import Cookies from "universal-cookie";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {JwtContent} from "../models/auth/JwtContent.ts";
import {CookieNames} from "../constants/CookieNames.ts";

export interface JwtMetaData {
    hook: string | null
}

export interface IJwtContent extends JwtPayload {
    userId: string,
    role: string,
    state: string;
    metaData: JwtMetaData;
}

export class CookieHandler {

    static setCookie(key: string, value: unknown): unknown {
        const cookies = new Cookies();
        return cookies.set(key, value, {
            sameSite: 'strict',
            secure: import.meta.env.PROD,
            path: '/'
        });
    }

    static getCookie(key: string): unknown {
        const cookies = new Cookies();
        return cookies.get(key)
    }

    static setAuthToken(jwt: string): void {
        this.removeAuthToken();
        this.setCookie(CookieNames.AUTH_TOKEN, jwt)
    }

    static getAuthToken(): string | null {
        const cookies = new Cookies();
        return cookies.get(CookieNames.AUTH_TOKEN);
    }

    static getUserModificationToken(): string | null {
        const userModificationToken = this.getCookie("userModificationToken") as string;
        if (!userModificationToken) return null;

        return userModificationToken;
    }

    static removeAuthToken(): void {
        const cookies = new Cookies();
        cookies.remove(CookieNames.AUTH_TOKEN);
    }

    static removeRefreshToken(): void {
        const cookies = new Cookies();
        cookies.remove(CookieNames.REFRESH_TOKEN);
    }

    static getAuthTokenDecoded(): JwtContent | null {
        const jwt = this.getAuthToken();
        if (!jwt) return null

        const decodedJwt = jwtDecode<IJwtContent>(jwt);
        return new JwtContent(decodedJwt.userId, decodedJwt.role, parseInt(decodedJwt.state as string))
    }

    static authTokenExists(): boolean {
        const jwt = this.getAuthToken();

        if (!jwt) return false;
        return true;
    }

    static getXsfrToken(): string | null {
        const cookies = new Cookies();
        return cookies.get('XSRF-TOKEN');
    }


}