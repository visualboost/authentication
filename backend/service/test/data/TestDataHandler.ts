import {initConfig} from "../../src/env/config";
import {User} from "../../src/models/db/User";
import {Role} from "../../src/models/db/Roles";
import {dv, faker} from '@faker-js/faker';
import mongoose from "mongoose";
import {SystemRoles} from "../../src/constants/SystemRoles.ts";
import bcrypt from "bcrypt";
import {encrypt} from "../../src/util/EncryptionUtil.ts";
import {UserState} from "../../src/constants/UserState.ts";
import {EmailCredentialsModel} from "../../src/models/db/credentials/EMailCredentials.ts";
import {NGram} from "../../src/models/db/NGram.ts";
import {UserModification} from "../../src/models/db/UserModification.ts";
import {Settings} from "../../src/models/db/Settings.ts";
import {Blacklist} from "../../src/models/db/Blacklist.ts";
import {DatabaseConfig} from "../../src/models/util/DatabaseConfig.ts";

initConfig();


export class TestDataHandler {

    static async connectToDb() {
        const dbConfig = DatabaseConfig.init();
        const connectionString = `mongodb://localhost:${dbConfig.port}/db?directConnection=true`;
        return mongoose.connect(connectionString, { authSource: "admin", user: dbConfig.user, pass: dbConfig.password});
    }

    static async closeConnection() {
        await mongoose.connection.close();
    }

    static async createTestUser(email: string | null = null) {
        await User.createNewUser(faker.internet.userName(), email || faker.internet.email(), faker.internet.password({length: 10, prefix: "Test12345_", pattern: /w/}), SystemRoles.USER)
    }

    static async createTestUsers(number: number) {
        const emails = faker.helpers.uniqueArray(faker.internet.email, number);

        let count = 0;
        await Promise.all(emails.map(async email => {
            try {
                await this.createTestUser(email);
                console.log("Added user number: " + (++count));
            }catch (e){
                console.error(e)
            }
        }))
    }

    static async addRoles(roles: Array<string> = ["DEVELOPER", "MAINTAINER"]) {
        for(let i = 0; i < roles.length; i++) {
            try{
                const role = new Role({name: roles[i]});
                await role.save();
            }catch (e){
                console.error(e)
            }
        }
    }

    /**
     * This function create a lot of users;
     */
    static addBigAmountOfUser = async (userCount: number = 100000, encryptionEnabled: boolean | null = null) => {
        const emails = faker.helpers.uniqueArray(faker.internet.email, userCount);
        const passwords = faker.helpers.uniqueArray(faker.internet.password, userCount);
        const securePassword = await Promise.all(passwords.map(pw => bcrypt.hash(pw, 1)))

        const encryptionInSettingsEnabled = await Settings.getEmailEncryptionEnabled();
        if(encryptionEnabled === null){
            encryptionEnabled = encryptionInSettingsEnabled
        }

        const userBulkWriteOperations = [];
        const credentialsBulkWriteOperations = [];
        for (let i = 0; i < emails.length; i++) {
            const mail = encryptionEnabled ? encrypt(emails[i]) : emails[i];
            const password = securePassword[i]
            const username = faker.internet.userName();

            const credentialsId = new mongoose.Types.ObjectId()
            credentialsBulkWriteOperations.push({
                insertOne: {
                    document: {
                        _id: credentialsId,
                        email: mail,
                        password: password
                    }
                }
            })

            userBulkWriteOperations.push({
                insertOne: {
                    document: {
                        userName: username,
                        credentials: credentialsId,
                        confirmation: {
                            state: UserState.PENDING,
                            expiration: 86400
                        },
                        role: SystemRoles.USER,
                        lastLogin: Date.now()
                    }
                }
            })
        }

        await Promise.all([EmailCredentialsModel.bulkWrite(credentialsBulkWriteOperations), User.bulkWrite(userBulkWriteOperations)])
    }

    static dropDb = async () => {
        await mongoose.connection.db.dropDatabase();
    }

    static dropUser = async () => {
        await User.deleteMany();
        await this.dropCredentials();
    }

    static dropCredentials = async () => {
        await EmailCredentialsModel.deleteMany();
    }

    static dropModifications = async () => {
        await UserModification.deleteMany();
    }

    static dropSettings = async () => {
        await Settings.deleteMany();
    }

    static dropBlacklist = async () => {
        await Blacklist.deleteMany();
    }

}