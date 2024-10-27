import {getDockerSecret} from "../../util/EncryptionUtil.ts";
import {isDevEnvironment} from "../../util/ConfigUtil.ts";

export class DatabaseConfig {

    domain: string;
    port: number;
    user: string;
    password: string;
    dbName: string;

    constructor(domain: string, port: number, user: string, password: string) {
        this.domain = domain;
        this.port = port;
        this.user = user;
        this.password = password;
        this.dbName = "db";
    }

    static init(): DatabaseConfig {
        let config : DatabaseConfig;

        if (isDevEnvironment()) {
            config = DatabaseConfig.initFromEnvironment();
        } else {
            config = DatabaseConfig.initFromSecrets();
        }

        config.validate();
        return config;
    }

    static initFromEnvironment(): DatabaseConfig {
        return new DatabaseConfig(process.env.MONGO_DOMAIN, parseInt(process.env.MONGO_PORT), process.env.MONGO_USER, process.env.MONGO_PASSWORD)
    }

    static initFromSecrets(): DatabaseConfig {
        const port = getDockerSecret("mongo_port");
        const user = getDockerSecret("mongo_user");
        const password = getDockerSecret("mongo_password");

        return new DatabaseConfig("auth_database", parseInt(port), user, password);
    }

    validate(){
        if(!this.domain || !this.port || !this.user || !this.password || !this.dbName){
            throw Error("Invalid database configuration");
        }
    }
}