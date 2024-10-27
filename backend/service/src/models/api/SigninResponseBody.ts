import {JwtBody} from "./JwtBody.ts";

export class SigninResponseBody extends JwtBody{

    hook: string | null;
    twoFactorAuthId: string | null;

    constructor(token: string, hook: string | null, twoFactorAuthId: string | null = null) {
        super(token);
        this.hook = hook;
        this.twoFactorAuthId = twoFactorAuthId;
    }
}