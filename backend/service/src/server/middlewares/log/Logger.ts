import DailyRotateFile from "winston-daily-rotate-file";
import winston, {createLogger, format, transports} from "winston";
import {isDevEnvironment} from "../../../util/ConfigUtil.ts";
import * as Transport from "winston-transport";
const {combine, timestamp} = format;

const transport = new DailyRotateFile({
    level: 'debug',
    dirname: 'logs',
    filename: 'auth-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '10d'
});

const loggingTransports: Array<Transport> = [transport];
if(isDevEnvironment()){
    loggingTransports.push(new winston.transports.Console())
}

const logger = createLogger({
    format: combine(
        timestamp(),
        format.printf(
            (info) => {
                let logMsg = `${new Date().toUTCString()} ${info.level}: ${info.message}`;

                const {message, ...infoWithoutMessage} = info;

                for (const [key, value] of Object.entries(infoWithoutMessage)) {
                    if(!value) continue;

                    logMsg += `\n${key}: ${value}`
                }

                return logMsg;
            }
        )
    ),
    transports: loggingTransports
});

const logError = (msg: string) => {
    logger.error(msg);
}

const logDebug = (msg: string) => {
    logger.debug(msg);
}

const logInfo = (msg: string) => {
    logger.info(msg);
}

export {
    logger,
    logError,
    logDebug,
    logInfo
}

