import {getDockerSecret} from "../../util/EncryptionUtil.ts";
import {isDevEnvironment} from "../../util/ConfigUtil.ts";

export class MailConfig {

    host: string;
    port: number;
    user: string;
    password: string;

    constructor(host: string, port: number, user: string, password: string) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
    }

    static init(): MailConfig {
        let config: MailConfig;

        if (isDevEnvironment()) {
            config = MailConfig.initFromEnvironment();
        } else {
            config = MailConfig.initFromSecrets();
        }

        config.validate();
        return config;
    }

    static initFromEnvironment(): MailConfig{
        return new MailConfig(process.env.MAIL_HOST, parseInt(process.env.MAIL_PORT), process.env.MAIL_USER, process.env.MAIL_PW)
    }

    static initFromSecrets(): MailConfig{
        const secretContent = getDockerSecret("mail_config").split("\n");

        let host = "";
        let port = 0;
        let user = "";
        let pw = "";

        for(let i = 0; i < secretContent.length; i++) {
            const splittedLine = secretContent[i].split("=");
            const key = splittedLine[0].trim();

            if(key === "MAIL_HOST"){
                host = splittedLine[1].trim();
            }else if(key === "MAIL_PORT"){
                port = parseInt(splittedLine[1].trim());
            }else if(key === "MAIL_USER"){
                user = splittedLine[1].trim();
            }else if(key === "MAIL_PW"){
                pw = splittedLine[1].trim();
            }
        }

        return new MailConfig(host, port, user, pw);
    }

    validate(){
        if(!this.host || !this.port || !this.user || !this.password){
            throw Error("Invalid mail configuration");
        }
    }
}