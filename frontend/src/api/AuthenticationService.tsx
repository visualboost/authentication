import {RegistrationFormInput} from "../models/auth/RegistrationFormInput.tsx";
import {APIHandler} from "./APIHandler.tsx";
import {LoginFormInput} from "../models/auth/LoginFormInput.tsx";
import {SigninResponseBody} from "../models/auth/SigninResponseBody.ts";
import {UserDetails} from "../models/user/UserDetails.ts";

export class AuthenticationService extends APIHandler {

    static PREFIX = "/authentication"
    static instance: AuthenticationService = new AuthenticationService();
    static REFRESH_TOKEN_PATH = "/authentication/token"

    constructor() {
        super();
    }

    static async createAdmin(input: RegistrationFormInput): Promise<string> {
        //@ts-ignore
        return AuthenticationService.instance.post<string>(this.PREFIX + "/registration/admin", input, jsonResponse => jsonResponse.token, {}, true)
    }

    static async createUser(input: RegistrationFormInput): Promise<string> {
        //@ts-ignore
        return AuthenticationService.instance.post<string>(this.PREFIX + "/registration", input, jsonResponse => jsonResponse.token, {}, true)
    }

    static async signin(body: LoginFormInput): Promise<SigninResponseBody> {
        return AuthenticationService.instance.post<SigninResponseBody>(this.PREFIX + "/signin", body, function (jsonResponse) {
            //@ts-ignore
            return new SigninResponseBody(jsonResponse.token, jsonResponse.twoFactorAuthId)
        }, {})
    }

    static async confirm2FactorCode(twoFactorId: string, code: string): Promise<SigninResponseBody> {
        //@ts-ignore
        return await AuthenticationService.instance.post<SigninResponseBody>("/confirm/two-factor/" + twoFactorId, {code: code}, function (jsonResponse) {
            //@ts-ignore
            const response = new SigninResponseBody(jsonResponse.token, jsonResponse.twoFactorAuthId)
            if (!response.isValid()) return null;

            return response;
        })
    }

    static async confirmInvitation(token: string, username: string, password: string): Promise<void> {
        //@ts-ignore
        await AuthenticationService.instance.post<string>( "/confirm/invitation?token=" + token, {
            username: username,
            password: password
        },
                jsonResponse => jsonResponse as string)
    }

    static async resendConfirmRegistrationMail(): Promise<void> {
        //@ts-ignore
        await AuthenticationService.instance.post<void>(this.PREFIX + "/registration/resend", {}, jsonResponse => jsonResponse)
    }

    static async refreshToken(): Promise<string> {
        //@ts-ignore
        return AuthenticationService.instance.put<string>(this.REFRESH_TOKEN_PATH, {}, jsonResponse => jsonResponse.token, {}, true)
    }

    static async resetPassword(email: string): Promise<void> {
        //@ts-ignore
        await AuthenticationService.instance.post<UserDetails>(this.PREFIX + "/reset/password", {email: email}, jsonResponse => jsonResponse)
    }

    static async logout(): Promise<void> {
        await AuthenticationService.instance.post<void>(this.PREFIX + "/logout", {}, jsonResponse => jsonResponse)
    }
}
