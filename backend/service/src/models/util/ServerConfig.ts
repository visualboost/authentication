import {getDockerConfig, isDevEnvironment} from "../../util/ConfigUtil.ts";

export class ServerConfig {

    static instance: ServerConfig;

    domain: string;
    backendPort: number;
    frontendPort: number;

    proxyBackendPort: number;
    proxyBackendRoute: string;

    constructor(domain: string, backendPort: number, frontendPort: number, proxyBackendPort: number, proxyBackendRoute: string) {
        this.domain = domain;
        this.backendPort = backendPort;
        this.frontendPort = frontendPort;
        this.proxyBackendPort = proxyBackendPort;
        this.proxyBackendRoute = proxyBackendRoute;
    }

    static init(): ServerConfig {
        if(this.instance) return this.instance;

        const domain = ServerConfig.getDomain();
        const frontendPort = ServerConfig.getFrontendPort();

        const backendPort = ServerConfig.getBackendPort();
        const proxyBackendPort = ServerConfig.getProxyBackendPort();
        const proxyBackendRoute = ServerConfig.getProxyBackendRoute();

        if(!domain || !backendPort || !frontendPort || !proxyBackendPort || !proxyBackendRoute) {
            throw Error("Invalid server configuration");
        }

        this.instance = new ServerConfig(domain, parseInt(backendPort), parseInt(frontendPort), parseInt(proxyBackendPort), proxyBackendRoute);
        return this.instance;
    }

    static getDomain(): string{
        if(isDevEnvironment()){
            return process.env.DOMAIN;
        }else {
            return getDockerConfig("DOMAIN");
        }
    }

    static getBackendPort(): string{
        if(isDevEnvironment()){
            return process.env.PORT_BACKEND;
        }else {
            return getDockerConfig("PORT_BACKEND");
        }
    }

    static getFrontendPort(): string{
        if(isDevEnvironment()){
            return process.env.PORT_FRONTEND;
        }else {
            return getDockerConfig("PORT_FRONTEND");
        }
    }

    /**
     * The proxy port of the backend service.
     *
     * Default value is '/api'.
     * During development and without docker and traefik it the port should be equal to {@link ServerConfig.backendPort}.
     */
    static getProxyBackendPort(): string{
        if(isDevEnvironment()){
            return process.env.PROXY_BACKEND_PORT;
        }else {
            return getDockerConfig("PROXY_BACKEND_PORT");
        }
    }

    /**
     * The proxy path of the backend service.
     *
     * Default value is '/api'.
     * During development and without docker and traefik it can be '/'.
     */
    static getProxyBackendRoute(): string{
        if(isDevEnvironment()){
            return process.env.PROXY_BACKEND_ROUTE;
        }else {
            return getDockerConfig("PROXY_BACKEND_ROUTE");
        }
    }
}