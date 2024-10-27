import mongoose from "mongoose";
import {initConfig} from "../../../src/env/config.ts";
import {User} from "../../../src/models/db/User.ts";
import {EmailCredentialsModel} from "../../../src/models/db/credentials/EMailCredentials.ts";
import {NGram} from "../../../src/models/db/NGram.ts";
import {UserModification} from "../../../src/models/db/UserModification.ts";
import {Settings} from "../../../src/models/db/Settings.ts";
import {validatePassword} from "../../../src/util/PasswordUtil.ts";
import {encrypt, encryptEmailIfAllowedBySystem} from "../../../src/util/EncryptionUtil.ts";
import bcrypt from "bcrypt";
import {faker} from "@faker-js/faker";
import {SystemRoles} from "../../../src/constants/SystemRoles.ts";
import {UserState} from "../../../src/constants/UserState.ts";
import {TimeUtil} from "../../../src/util/TimeUtil.ts";
import {TestDataHandler} from "../../data/TestDataHandler.ts";
import {Blacklist} from "../../../src/models/db/Blacklist.ts";
import {DatabaseConfig} from "../../../src/models/util/DatabaseConfig.ts";

initConfig()

export class TestDatabase {
    static DB_NAME = "testDatabase";

    static connectToDb = async () => {
        const dbConfig = DatabaseConfig.init();
        const connectionString = `mongodb://localhost:${dbConfig.port}/${TestDatabase.DB_NAME}?directConnection=true`;
        return mongoose.connect(connectionString, { authSource: "admin", user: dbConfig.user, pass: dbConfig.password});
    }

    static isConnected = (): boolean => {
        return mongoose.connection.readyState === 1;
    }

    static dropDb = async () => {
        await TestDataHandler.dropDb();
    }

    static dropUser = async () => {
        await TestDataHandler.dropUser();
    }

    static dropCredentials = async () => {
        await TestDataHandler.dropCredentials();
    }

    static dropModifications = async () => {
        await TestDataHandler.dropModifications();
    }

    static dropSettings = async () => {
        await TestDataHandler.dropSettings();
    }

    static dropBlacklist = async () => {
        await Blacklist.deleteMany();
    }

    static closeConnection = async () => {
        await TestDataHandler.closeConnection();
    }
}