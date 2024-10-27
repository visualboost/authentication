import dotenv from "dotenv";
import path from "path";

const initConfig = (configPath: string = undefined, envFileName: string = '.env', options = {}) => {
    const envFile = configPath ? path.join(configPath, envFileName) : path.join(process.cwd(), envFileName);
    dotenv.config({ path: envFile, ...options });
}

const getEnv = (key: string) => {
    const envValue = process.env[key];

    if(envValue === 'true') return true;
    if(envValue === 'false') return false;

    return envValue;
}

export {
    initConfig,
    getEnv
}

