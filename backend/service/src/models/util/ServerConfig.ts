import {getDockerConfig, isDevEnvironment} from "../../util/ConfigUtil.ts";

export class ServerConfig {

    static instance: ServerConfig;

    domain: string;
    backendPort: number;
    frontendPort: number;

    constructor(domain: string, backendPort: number, frontendPort: number) {
        this.domain = domain;
        this.backendPort = backendPort;
        this.frontendPort = frontendPort;
    }

    static init(): ServerConfig {
        if(this.instance) return this.instance;

        const domain = ServerConfig.getDomain();
        const backendPort = ServerConfig.getBackendPort();
        const frontendPort = ServerConfig.getFrontendPort();

        if(!domain || !backendPort || !frontendPort){
            throw Error("Invalid server configuration");
        }

        this.instance = new ServerConfig(domain, parseInt(backendPort), parseInt(frontendPort));
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
}