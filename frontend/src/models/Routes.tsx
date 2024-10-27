import {CookieHandler} from "../util/CookieHandler.tsx";

export class Routes {

    static ROOT = "/";
    static AUTHENTICATION = "/authentication";
    static ADMIN = "/admin";
    static USER = "/user";
    static INVITATION = "/invited";
    static ERROR = "/error/:status";
    static CONFIRMED = "/confirmed";

    static Authentication = class {
        static LOGIN = Routes.AUTHENTICATION + "/login";
        static REGISTRATION = Routes.AUTHENTICATION + "/register";
        static REGISTRATION_ADMIN = Routes.AUTHENTICATION + "/register/admin";
        static CONFIRM_REGISTRATION = Routes.AUTHENTICATION + "/confirm";
        static TWO_FACTOR = Routes.AUTHENTICATION + "/confirm/two-factor/:id";

        static RESET_PASSWORD = Routes.AUTHENTICATION + "/reset/password";
    }

    static Confirmation = class {
        static LOGIN = Routes.CONFIRMED + "/login";
        static REGISTRATION = Routes.CONFIRMED + "/registration";
        static EMAIL_CHANGED = Routes.CONFIRMED + "/email/changed";
        static PASSWORD_CHANGED = Routes.CONFIRMED + "/password/changed";

    }

    static Admin = class {

        static Dashboard = class {
            static ROOT = Routes.ADMIN + "/dashboard";
        }

        static UserSection = class {
            static LIST = Routes.ADMIN + "/user";
            static CREATE = Routes.ADMIN + "/user/create";
            static BLACKLIST = Routes.ADMIN + "/user/blacklist";
            static USER_DETAIL = Routes.ADMIN + "/user/details/:userId";
        }


        static RoleSection = class {
            static LIST = Routes.ADMIN + "/role";
            static DETAIL = Routes.ADMIN + "/role/:roleId";
            static CREATE = Routes.ADMIN + "/role/create";
        }

        static Settings = class {
            static OVERVIEW = Routes.ADMIN + "/settings";
            static CREDENTIALS = Routes.ADMIN + "/settings/credentials";
        }
    }

    static User = class {
        static DETAIL = Routes.USER + "/details/:userId";
        static CHANGE_PASSWORD = Routes.USER + "/:modificationObjectId/password";
    }

    static Error = class {
        static getErrorRoute(status: number) {
            return Routes.ERROR.replace(":status", status.toString());
        }
    }

    static getUserListPath(reload: boolean = false) {
        if(!reload){
            return Routes.Admin.UserSection.LIST;
        }

        return Routes.Admin.UserSection.LIST + "?reload"
    }

    static getUserDetailPath(userId: string) {
        if (CookieHandler.getAuthTokenDecoded()?.isAdmin()) {
            return this.Admin.UserSection.USER_DETAIL.replace(":userId", userId);
        } else {
            return this.User.DETAIL.replace(":userId", userId);
        }
    }

    static getRoleDetailPath(roleId: string) {
        return this.Admin.RoleSection.DETAIL.replace(":roleId", roleId);
    }

    static getConfirmTwoFactorAuth(twoFactorAuthId: string) {
        return this.Authentication.TWO_FACTOR.replace(":id", twoFactorAuthId);
    }
}
