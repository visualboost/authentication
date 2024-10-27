import {TestDatabase} from "../../../util/database/TestDatabase.ts";
import {User} from "../../../../src/models/db/User.ts";
import {encrypt} from "../../../../src/util/EncryptionUtil.ts";
import {Settings} from "../../../../src/models/db/Settings.ts";
import {TestDataHandler} from "../../../data/TestDataHandler.ts";
import mongoose from "mongoose";
import {Blacklist} from "../../../../src/models/db/Blacklist.ts";
import {UserState} from "../../../../src/constants/UserState.ts";

describe('E-Mail-Credentials', () => {

    beforeAll(async () => {
        await TestDatabase.connectToDb();
    })

    beforeEach(async () => {
        await TestDatabase.dropUser();
        await TestDatabase.dropSettings();
        await TestDatabase.dropBlacklist();
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    afterAll(async () => {
        await TestDatabase.closeConnection();
    });

    describe("addEmail", () => {

        const testEmail = "test@test.com"

        test('Add a new Blacklist-Entry with an E-Mail', async () => {
            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(0);

            await Blacklist.addEmail(testEmail)

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(1);
        });

        test('Set the userstate to BLOCKED if the user with the email address exist', async () => {
            await TestDataHandler.createTestUser(testEmail);

            let user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).not.toEqual(UserState.BLOCKED);
            await Blacklist.addEmail(testEmail)

            user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).toEqual(UserState.BLOCKED);
        });

        test('E-Mail is encrypted if settings.encryptEmail is true', async () => {
            await Settings.setEmailEncryption(true);
            await TestDataHandler.createTestUser(testEmail);

            let user = await User.getByEmail(encrypt(testEmail));
            expect(user.confirmation.state).not.toEqual(UserState.BLOCKED);

            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(0);

            await Blacklist.addEmail(testEmail)

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(1);
            expect(blacklistedEmails[0].email).toEqual(encrypt(testEmail));

            user = await User.getByEmail(encrypt(testEmail));
            expect(user.confirmation.state).toEqual(UserState.BLOCKED);
        });

        test('E-Mail is not encrypted if settings.encryptEmail is false', async () => {
            await Settings.setEmailEncryption(false);
            await TestDataHandler.createTestUser(testEmail);

            let user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).not.toEqual(UserState.BLOCKED);

            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(0);

            await Blacklist.addEmail(testEmail)

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(1);
            expect(blacklistedEmails[0].email).toEqual(testEmail);

            user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).toEqual(UserState.BLOCKED);
        });
    })

    describe("deleteEmail", () => {

        const testEmail = "test@test.com"

        test('Deletes an existing Blacklist-Entry with an E-Mail', async () => {
            await Blacklist.addEmail(testEmail)

            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(1);

            await Blacklist.deleteEmail(testEmail)

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(0);
        });

        test('Set the userstate to ACTIVE if the user with the email address exist', async () => {
            await TestDataHandler.createTestUser(testEmail);
            await Blacklist.addEmail(testEmail);

            let user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).toEqual(UserState.BLOCKED);
            await Blacklist.deleteEmail(testEmail)

            user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).toEqual(UserState.ACTIVE);
        });

        test('Works for encrypted email addresses', async () => {
            await Settings.setEmailEncryption(true);
            await TestDataHandler.createTestUser(testEmail);
            await Blacklist.addEmail(testEmail);

            let user = await User.getByEmail(encrypt(testEmail));
            expect(user.confirmation.state).toEqual(UserState.BLOCKED);

            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(1);

            await Blacklist.deleteEmail(testEmail)

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(0);

            user = await User.getByEmail(encrypt(testEmail));
            expect(user.confirmation.state).toEqual(UserState.ACTIVE);
        });

        test('Works for plain (non encrypted) email addresses', async () => {
            await Settings.setEmailEncryption(false);
            await TestDataHandler.createTestUser(testEmail);
            await Blacklist.addEmail(testEmail);

            let user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).toEqual(UserState.BLOCKED);

            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(1);

            await Blacklist.deleteEmail(testEmail)

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(0);

            user = await User.getByEmail(testEmail);
            expect(user.confirmation.state).toEqual(UserState.ACTIVE);
        });
    })

    describe("encryptAll", () => {

        const testEmail = "test@test.com"
        const testEmail2 = "test2@test.com"
        const testEmail3 = "test3@test.com"

        beforeEach(async () => {
            await Blacklist.addEmail(testEmail);
            await Blacklist.addEmail(testEmail2);
            await Blacklist.addEmail(testEmail3);
        })

        test('Encrypts all email addresses', async () => {
            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(3);
            expect(blacklistedEmails[0].email).toEqual(testEmail);
            expect(blacklistedEmails[1].email).toEqual(testEmail2);
            expect(blacklistedEmails[2].email).toEqual(testEmail3);

            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await Blacklist.encryptAll(session);
                })

            } finally {
                await session.endSession();
            }

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails[0].email).toEqual(encrypt(testEmail));
            expect(blacklistedEmails[1].email).toEqual(encrypt(testEmail2));
            expect(blacklistedEmails[2].email).toEqual(encrypt(testEmail3));
        });
    });

    describe("decryptAll", () => {

        const testEmail = "test@test.com"
        const testEmail2 = "test2@test.com"
        const testEmail3 = "test3@test.com"

        beforeEach(async () => {
            await Blacklist.addEmail(testEmail);
            await Blacklist.addEmail(testEmail2);
            await Blacklist.addEmail(testEmail3);

            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await Blacklist.encryptAll(session);
                })

            } finally {
                await session.endSession();
            }
        })

        test('Decrypts all email addresses', async () => {
            let blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails).toHaveLength(3);
            expect(blacklistedEmails[0].email).toEqual(encrypt(testEmail));
            expect(blacklistedEmails[1].email).toEqual(encrypt(testEmail2));
            expect(blacklistedEmails[2].email).toEqual(encrypt(testEmail3));


            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await Blacklist.decryptAll(session);
                })

            } finally {
                await session.endSession();
            }

            blacklistedEmails = await Blacklist.find().lean();
            expect(blacklistedEmails[0].email).toEqual(testEmail);
            expect(blacklistedEmails[1].email).toEqual(testEmail2);
            expect(blacklistedEmails[2].email).toEqual(testEmail3);
        });
    })
});
