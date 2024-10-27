import {getEnv, initConfig} from "../env/config.ts";
import {ServerConfig} from "../models/util/ServerConfig.ts";
initConfig();

export class ServerUtil {

    static getUrl(path: string): string {
        const SSL_ENABLED = getEnv("SSL_ENABLED")
        const protocol = (SSL_ENABLED === true || false) ? "https://" : "http://";
        const config = ServerConfig.init();
        return `${protocol}${config.domain}${config.backendPort ? `:${config.backendPort}` : ""}${path ? `${path}` : ""}`
    }

    static getFrontendUrl(path: string): string {
        const SSL_ENABLED = getEnv("SSL_ENABLED")
        const protocol = (SSL_ENABLED === true || false) ? "https://" : "http://";
        const config = ServerConfig.init();
        return `${protocol}${config.domain}${config.frontendPort ? `:${config.frontendPort}` : ""}${path ? `${path}` : ""}`
    }

    static getChangedEmailUrl(): string {
        return ServerUtil.getFrontendUrl("/confirmed/email/changed")
    }

    /**
     * The default url that should be displayed after a user registered successfully.
     */
    static getConfirmedRegistrationUrl(): string {
        return ServerUtil.getFrontendUrl("/confirmed/registration")
    }

    static getConfirmChangedPasswordUrl(): string {
        return ServerUtil.getFrontendUrl("/confirmed/password/changed");
    }

    static getResetPasswordUrl(userModificationId: string): string {
        return ServerUtil.getFrontendUrl("/user/:modificationId/password".replace(":modificationId", userModificationId));
    }



}