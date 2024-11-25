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
import {initAssets} from "./util/FileHandler.ts";
import {logDebug, logError, logInfo} from "./server/middlewares/log/Logger.ts";

initConfig();
/**
 * Listen on provided port, on all network interfaces.
 */
const initHttpServer = () => {
    this!.server = http.createServer(app);
    const serverConfig = ServerConfig.init();
    const port = serverConfig.backendPort || '3000';
    this.server.listen(port, () => {
        logInfo('HTTP: Listen to port ' + port);
    });
}

const connectToDb = async (attemptCount: number = 5) => {
    const dbConfig = DatabaseConfig.init();
    const connectionString = `mongodb://${dbConfig.domain}:${dbConfig.port}/${dbConfig.dbName}?directConnection=true`;

    let connection;
    let error;
    for (let i = 0; i < attemptCount; i++) {
        try {
            connection = await mongoose.connect(connectionString, {
                authSource: "admin",
                user: dbConfig.user,
                pass: dbConfig.password
            });
            error = null;
            break;
        } catch (err) {
            error = err;
        }
    }

    if (error) throw error;
    return connection;
}

async function waitForReplicaSetSetup(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        const admin = mongoose.connection.db.admin();
        const status = await admin.command({isMaster: 1});

        if (status.ismaster) {
            return;
        }

        logInfo('Primary node is not setup. Wait for ' + delay + " milliseconds and try again.");
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('Replica set is not setup correctly. Tried it ' + retries + " times.")
}

const startApplication = async () => {
    try {
        await initAssets();
        /**
         * Try to load secrets to validate if all secrets are defined
         */
        validateSecrets();

        logInfo("Connection to database ...")

        await connectToDb();
        logInfo("Database connection successfully established.")

        logInfo("Validate replica set ...");
        await waitForReplicaSetSetup();

        const initializedRoles = await Role.initRolesByFile();
        logInfo("initialized roles: " + JSON.stringify(initializedRoles));

        initHttpServer();
    } catch (e) {
        logError(e.message)
        process.exit(1);
    }
}

const stopApplication = async () => {
    this.server?.close(() => {
        logInfo("Server shutdown")
    });

    await mongoose.disconnect();
    logInfo("DB connections closed")
}

export {
    startApplication,
    stopApplication
}



