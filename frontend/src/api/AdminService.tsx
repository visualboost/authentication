import {APIHandler} from "./APIHandler.tsx";
import {UserListItem} from "../models/user/UserListItem.ts";
import {UserFormInput} from "../models/user/UserFormInput.tsx";
import {RoleResponse} from "../models/role/RoleResponse.ts";
import {UserSearchCriterias} from "../models/user/UserSearchCriterias.ts";
import {UserDetails} from "../models/user/UserDetails.ts";
import {BlackListItem} from "../models/blacklist/BlackListItem.ts";
import {Settings} from "../models/settings/Settings.ts";
import {Statistics} from "../models/statistics/Statistics.ts";
import {InvitationFormInput} from "../models/user/InvitationFormInput.tsx";
import {Interceptor} from "./Interceptors.tsx";

export interface UserFilterParams {
    value: string;
    type: UserSearchCriterias
}

export class AdminService extends APIHandler {

    static PREFIX = "/admin"
    static instance: AdminService = new AdminService();

    constructor() {
        super();
        Interceptor.addUnauthorizedInterceptor(this.client);
        Interceptor.addUnauthorizedInterceptor(this.cachedClient);
    }

    static User = class {
        static PREFIX = "/user"

        static async getAllUser(search: UserFilterParams | null = null, forceReload: boolean = false): Promise<Array<UserListItem>> {
            let url = AdminService.PREFIX + "/user?";
            if (search) {
                url += "value=" + search.value + "&type=" + search.type
            }

            return AdminService.instance.getAndCache<Array<UserListItem>>(url, function (jsonResponse) {
                //@ts-ignore
                return jsonResponse.map(u => new UserListItem(u.id, u.username, u.email, u.state, u.role, new Date(u.createdAt), new Date(u.lastLogin)))
            }, {}, forceReload)
        }

        static async addUser(input: UserFormInput): Promise<void> {
            await AdminService.instance.post<unknown>(AdminService.PREFIX + "/user/add", input, jsonResponse => jsonResponse)
        }

        static async inviteUser(input: InvitationFormInput): Promise<void> {
            await AdminService.instance.post<unknown>(AdminService.PREFIX + "/user/invite", input, jsonResponse => jsonResponse)
        }

        static async updateUserRole(userId: string, role: string): Promise<UserDetails> {
            return await AdminService.instance.patch<UserDetails>(AdminService.PREFIX + this.PREFIX + "/" + userId + "/role",
                {role: role},
                function (jsonResponse) {
                    //@ts-ignore
                    return new UserDetails(jsonResponse._id, jsonResponse.ip, jsonResponse.username, jsonResponse.email, jsonResponse.role, jsonResponse.state, new Date(jsonResponse.createdAt), new Date(jsonResponse.updatedAt), new Date(jsonResponse.lastLogin));
                })
        }

        static async deleteUser(userId: string): Promise<UserDetails> {
            return await AdminService.instance.delete<UserDetails>(AdminService.PREFIX + this.PREFIX + "/" + userId,
                function (jsonResponse) {
                    //@ts-ignore
                    return new UserDetails(jsonResponse._id, jsonResponse.ip, jsonResponse.username, jsonResponse.email, jsonResponse.role, jsonResponse.state, new Date(jsonResponse.createdAt), new Date(jsonResponse.updatedAt), new Date(jsonResponse.lastLogin));
                })
        }
    }

    static Blacklist = class {
        static PREFIX = "/blacklist"

        static async getAllBlacklistItems(emailSearchValue: string = ""): Promise<Array<BlackListItem>> {
            //@ts-ignore
            return AdminService.instance.get<BlackListItem>(AdminService.PREFIX + this.PREFIX + "/?email=" + emailSearchValue, jsonResponse => jsonResponse.map(item => new BlackListItem(item.ip, item.email, new Date(item.createdAt))));
        }

        static async blockEmail(email: string): Promise<string> {
            //@ts-ignore
            return AdminService.instance.post<string>(AdminService.PREFIX + this.PREFIX + "/email", {email: email}, jsonResponse => jsonResponse.msg as string)
        }

        static async unblockEmail(email: string): Promise<string> {
            //@ts-ignore
            return AdminService.instance.delete<string>(AdminService.PREFIX + this.PREFIX + "/email?email=" + email, jsonResponse => jsonResponse.msg as string)
        }

        static async blockIP(ip: string): Promise<string> {
            //@ts-ignore
            return AdminService.instance.post<string>(AdminService.PREFIX + this.PREFIX + "/ip", {ip: ip}, jsonResponse => jsonResponse.msg as string)
        }

        static async unblockIP(ip: string): Promise<string> {
            //@ts-ignore
            return AdminService.instance.delete<string>(AdminService.PREFIX + this.PREFIX + "/ip?ip=" + ip, jsonResponse => jsonResponse.msg as string)
        }
    }

    static Role = class {
        static PREFIX = "/role"

        static async createRole(name: string, description: string): Promise<RoleResponse> {
            //@ts-ignore
            return AdminService.instance.post<RoleResponse>(AdminService.PREFIX + this.PREFIX + "/", {
                    name: name,
                    description: description
                },
                //@ts-ignore
                jsonResponse => new RoleResponse(jsonResponse.id, jsonResponse.name, jsonResponse.description, new Date(jsonResponse.createdAt)))
        }

        static async getRole(id: string): Promise<RoleResponse> {
            //@ts-ignore
            return AdminService.instance.get<RoleResponse>(AdminService.PREFIX + this.PREFIX + "/" + id, jsonResponse => new RoleResponse(jsonResponse.id, jsonResponse.name, jsonResponse.description, new Date(jsonResponse.createdAt)));
        }

        static async getAllRoles(): Promise<Array<RoleResponse>> {
            //@ts-ignore
            return AdminService.instance.get<Array<RoleResponse>>(AdminService.PREFIX + "/roles/", jsonResponse => jsonResponse.map(r => new RoleResponse(r.id, r.name, r.description, new Date(r.createdAt))));
        }

        static async updateRole(id: string, name: string, description: string): Promise<Array<RoleResponse>> {
            //@ts-ignore
            return AdminService.instance.put<RoleResponse>(AdminService.PREFIX + this.PREFIX + "/" + id, {
                    name: name,
                    description: description
                },
                //@ts-ignore
                jsonResponse => new RoleResponse(jsonResponse.id, jsonResponse.name, jsonResponse.description, new Date(jsonResponse.createdAt)));
        }

        static async deleteRole(id: string): Promise<Array<RoleResponse>> {
            //@ts-ignore
            return AdminService.instance.delete<RoleResponse>(AdminService.PREFIX + this.PREFIX + "/" + id, jsonResponse => new RoleResponse(jsonResponse.id, jsonResponse.name, jsonResponse.description, new Date(jsonResponse.createdAt)));
        }
    }

    static Settings = class {
        static PREFIX = "/settings"

        static async getSettings(): Promise<Settings> {
            return AdminService.instance.get<Settings>(AdminService.PREFIX + this.PREFIX + "/", function (jsonResponse) {
                return Settings.fromJson(jsonResponse as Settings)
            });
        }

        static async update(settings: Settings): Promise<Settings> {
            return AdminService.instance.put<Settings>(AdminService.PREFIX + this.PREFIX + "/", {settings: settings}, function (jsonResponse) {
                //@ts-ignore
                return Settings.fromJson(jsonResponse as Settings)
            });
        }

        static async encryptEmailAddresses(encryptEmails: boolean): Promise<Settings> {
            return AdminService.instance.post<Settings>(AdminService.PREFIX + this.PREFIX + "/encrypt/emails", {encryptEmails: encryptEmails}, function (jsonResponse) {
                return Settings.fromJson(jsonResponse as Settings)
            });
        }
    }

    static Statistics = class {
        static PREFIX = "/statistics"

        static async getStatistics(): Promise<Statistics> {
            //@ts-ignore
            return AdminService.instance.get<Statistics>(AdminService.PREFIX + this.PREFIX + "/", function (jsonResponse) {
                //@ts-ignore
                return Statistics.fromJson(jsonResponse)
            });
        }

    }
}

