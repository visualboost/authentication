import {TestDatabase} from "../../util/database/TestDatabase.ts";
import {IUser, User} from "../../../src/models/db/User.ts";
import {SystemRoles} from "../../../src/constants/SystemRoles.ts";
import {EmailCredentialsModel} from "../../../src/models/db/credentials/EMailCredentials.ts";
import mongoose from "mongoose";
import {Settings} from "../../../src/models/db/Settings.ts";

describe('User', () => {

    beforeAll(async () => {
        await TestDatabase.connectToDb();
    })

    beforeEach(async () => {
        await TestDatabase.dropUser();
        await TestDatabase.dropSettings();
    })

    afterAll(async () => {
        await TestDatabase.closeConnection();
    });

    describe('findAllByEmail', () => {

        const testMail = "test@test.com"
        let user: IUser;
        beforeEach(async () => {
            user = await User.createNewUser("Test-User", testMail, "Test12345!XX", SystemRoles.USER)
        })

        test('Find user by complete email even if the email address is encrypted', async () => {
            await Settings.encryptAllEmails();

            const foundUser = await User.findAllByEmail(testMail);
            expect(foundUser).toHaveLength(1);
            expect(foundUser[0]._id.toString()).toEqual(user._id.toString());
        });


        test('Find multiple user by substring, if the email address is not encrypted', async () => {
            const secondUser = await User.createNewUser("Test-User", "test12345@test.com", "Test12345!XX", SystemRoles.USER)
            await Settings.decryptAllEmails();

            const foundUser = await User.findAllByEmail("test");
            expect(foundUser).toHaveLength(2);
        });

    });


});
