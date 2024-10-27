export class SigninResponseBody{

    token: string;
    twoFactorAuthId: string | null;

    constructor(token: string,twoFactorAuthId: string | null) {
        this.token = token;
        this.twoFactorAuthId = twoFactorAuthId;
    }

    isValid () {
        return (this.token !== undefined && this.token !== null) || ((this.token === undefined || this.token === null) && (this.twoFactorAuthId !== undefined && this.twoFactorAuthId !== null))
    }

    twoFactorAuthIdNotNull () {
        return this.twoFactorAuthId !== undefined && this.twoFactorAuthId !== null
    }
}