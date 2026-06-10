import {JwtBody} from "./JwtBody.ts";

export class SigninResponseBody extends JwtBody {

    refresh_token: string | null;
    hook: string | null;
    twoFactorAuthId: string | null;

    constructor(token: string, refreshToken: string | null, hook: string | null, twoFactorAuthId: string | null = null) {
        super(token);
        this.refresh_token = refreshToken;
        this.hook = hook;
        this.twoFactorAuthId = twoFactorAuthId;
    }
}