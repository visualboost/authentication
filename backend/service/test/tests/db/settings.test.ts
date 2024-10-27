import {TestDatabase} from "../../util/database/TestDatabase.ts";
import {Settings} from "../../../src/models/db/Settings.ts";
import {EmailCredentialsModel} from "../../../src/models/db/credentials/EMailCredentials.ts";
import {Blacklist} from "../../../src/models/db/Blacklist.ts";

jest.mock("../../../src/models/db/credentials/EMailCredentials.ts")
jest.mock("../../../src/models/db/Blacklist.ts")

describe('User', () => {

    beforeAll(async () => {
        await TestDatabase.connectToDb();
    })

    beforeEach(async () => {
        jest.resetAllMocks();

        await TestDatabase.dropUser();
        await TestDatabase.dropSettings();
    })

    afterAll(async () => {
        await TestDatabase.closeConnection();
    });

    describe('encryptAllEmails', () => {

        test('After encryption "encryptEmail" is true', async () => {
            let emailsEncrypted = await Settings.getEmailEncryptionEnabled();
            expect(emailsEncrypted).toEqual(false);

            await Settings.encryptAllEmails();

            emailsEncrypted = await Settings.getEmailEncryptionEnabled();
            expect(emailsEncrypted).toEqual(true);
        });

        test('EmailCredentials.encryptAll is called', async () => {
            await Settings.encryptAllEmails();
            expect(EmailCredentialsModel.encryptAll).toHaveBeenCalledTimes(1);
        });

        test('Blacklist.encryptAll is called', async () => {
            await Settings.encryptAllEmails();
            expect(Blacklist.encryptAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('decryptAllEmails', () => {

        beforeEach(async () => {
            await Settings.setEmailEncryption(true);
        })

        test('After decryption "encryptEmail" is false', async () => {
            let emailsEncrypted = await Settings.getEmailEncryptionEnabled();
            expect(emailsEncrypted).toEqual(true);

            await Settings.decryptAllEmails();

            emailsEncrypted = await Settings.getEmailEncryptionEnabled();
            expect(emailsEncrypted).toEqual(false);
        });

        test('EmailCredentials.decryptAll is called', async () => {
            await Settings.decryptAllEmails();
            expect(EmailCredentialsModel.decryptAll).toHaveBeenCalledTimes(1);
        });

        test('Blacklist.decryptAll is called', async () => {
            await Settings.decryptAllEmails();
            expect(Blacklist.decryptAll).toHaveBeenCalledTimes(1);
        });
    });

});
