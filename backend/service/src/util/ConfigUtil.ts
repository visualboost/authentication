import {initConfig} from "../env/config.ts";
import fs from "fs";

initConfig();

const isDevEnvironment = (): boolean => {
    return process.env.ENVIRONMENT === "DEVELOPMENT"
}

/**
 * Reads the docker config and returns a value of a given key.
 *
 * Example: "DOMAIN" as key will return "localhost" if the docker config contains "DOMAIN=localhost".
 */
const getDockerConfig = (key: string): string | null => {
    const filePath = "/config";
    if (!fs.existsSync(filePath)) return null;
    const configFileContent = fs.readFileSync(filePath, "utf-8");
    const configLines = configFileContent.split("\n");
    const keyLine = configLines.find(line => line.trim().startsWith(key))
    const value = keyLine.split("=")[1];
    const valueWithoutLineSeparators = value.replace(/(\r\n|\n|\r)/gm, '');
    return valueWithoutLineSeparators;
}




export {
    isDevEnvironment,
    getDockerConfig,
}
