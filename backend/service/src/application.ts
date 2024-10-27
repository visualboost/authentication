//@ts-nocheck

import http from "http";
import mongoose from "mongoose";
import {app} from "./server/server";

import {initConfig} from "./env/config";
import {Role} from "./models/db/Roles.ts";
import {validateSecrets} from "./util/EncryptionUtil.ts";
import {DatabaseConfig} from "./models/util/DatabaseConfig.ts";
import {ServerUtil} from "./util/ServerUtil.ts";
import {ServerConfig} from "./models/util/ServerConfig.ts";
initConfig();
/**
 * Listen on provided port, on all network interfaces.
 */
const initHttpServer = () => {
    this!.server = http.createServer(app);
    const serverConfig = ServerConfig.init();
    const port = serverConfig.backendPort || '3000';
    this.server.listen(port, () => {
        console.log('HTTP: Listen to port ' + port);
    });
}

const connectToDb = async () => {
    const dbConfig = DatabaseConfig.init();
    const connectionString = `mongodb://${dbConfig.domain}:${dbConfig.port}/${dbConfig.dbName}?directConnection=true`;
    return mongoose.connect(connectionString, { authSource: "admin", user: dbConfig.user, pass: dbConfig.password});
}

const startApplication = async () => {
    try {
        /**
         * Try to load secrets to validate if all secrets are defined
         */
        validateSecrets();

        await connectToDb();
        console.log("DB-Connection successfully established.");

        const initializedRoles = await Role.initRoles([])
        console.log("Initialized Roles: " + JSON.stringify(initializedRoles));

        initHttpServer();
    } catch (e) {
        console.log(e);
    }
}

const stopApplication = async () => {
    this.server?.close(() => {
        console.log("Server shutdown")
    });

    await mongoose.disconnect();
    console.log("DB connections closed")
}

export {
    startApplication,
    stopApplication
}



