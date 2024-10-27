import {APIHandler} from "./APIHandler.tsx";
import {UserDetails} from "../models/user/UserDetails.ts";
import {Interceptor} from "./Interceptors.tsx";

export class UserService extends APIHandler {

    static PREFIX = "/user"
    static instance: UserService = new UserService();

    constructor() {
        super();
        Interceptor.addUnauthorizedInterceptor(this.client);
    }

    static async getUserDetails(id: string): Promise<UserDetails> {
        //@ts-ignore
        return UserService.instance.get<UserDetails>(this.PREFIX + "/" + id, jsonResponse => new UserDetails(jsonResponse._id, jsonResponse.ip, jsonResponse.username, jsonResponse.email, jsonResponse.role, jsonResponse.state, new Date(jsonResponse.createdAt), new Date(jsonResponse.updatedAt), new Date(jsonResponse.lastLogin)))
    }

    static async modifyEmail(email: string): Promise<void> {
        await UserService.instance.patch<void>(this.PREFIX + "/modify/email", {email: email}, jsonResponse => jsonResponse);
    }

    static async modifyPassword(currentPassword: string, newPassword: string): Promise<void> {
        //@ts-ignore
        await UserService.instance.patch<string>(this.PREFIX + "/modify/password", {currentPassword: currentPassword, newPassword: newPassword}, jsonResponse => jsonResponse);
    }

    /**
     * @param password
     */
    static async setPassword(password: string, token: string): Promise<void> {
        //@ts-ignore
        await UserService.instance.patch<string>("/modification/password?token=" + token, {password: password}, jsonResponse => jsonResponse);
    }

}
