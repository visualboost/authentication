import {getEnv, initConfig} from "../env/config.ts";
import {ServerConfig} from "../models/util/ServerConfig.ts";
initConfig();

export interface UrlQuery {
    key: string,
    value: string
}

export class ServerUtil {

    static createUrl(protocol: string, domain: string, port: number, path: string, queries: Array<UrlQuery>): string {
        const url = new URL(`${protocol}${domain}`);
        url.port = port.toString();
        url.pathname = path;

        queries.forEach(query => {
            url.searchParams.append(query.key, query.value);
        })

        return url.toString();
    }

    /**
     * Return the url of the backend service
     *
     * @param path the urls route/path
     * @param queries the url queries
     */
    static getUrl(path: string, queries: Array<UrlQuery>): string {
        const SSL_ENABLED = getEnv("SSL_ENABLED")
        const protocol = (SSL_ENABLED === true || false) ? "https://" : "http://";
        const config = ServerConfig.init();
        const proxyBackendRoute = config.proxyBackendRoute;

        let route = path;
        if(proxyBackendRoute.startsWith("/") && proxyBackendRoute.length > 1){
            route = proxyBackendRoute + route;
        }

        return ServerUtil.createUrl(protocol, config.domain, config.proxyBackendPort, route, queries)
    }

    /**
     * Return the url of the react service
     *
     * @param path the urls route/path
     * @param queries the url queries
     */
    static getFrontendUrl(path: string, queries: Array<UrlQuery> = []): string {
        const SSL_ENABLED = getEnv("SSL_ENABLED")
        const protocol = (SSL_ENABLED === true || false) ? "https://" : "http://";
        const config = ServerConfig.init();
        return ServerUtil.createUrl(protocol, config.domain, config.frontendPort, path, queries)
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