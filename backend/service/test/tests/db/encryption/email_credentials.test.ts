import {TestDatabase} from "../../../util/database/TestDatabase.ts";
import {User} from "../../../../src/models/db/User.ts";
import {SystemRoles} from "../../../../src/constants/SystemRoles.ts";
import * as EncryptUtil from "../../../../src/util/EncryptionUtil.ts";
import bcrypt from "bcrypt";
import {Settings} from "../../../../src/models/db/Settings.ts";
import {TestDataHandler} from "../../../data/TestDataHandler.ts";
import {EmailCredentialsModel} from "../../../../src/models/db/credentials/EMailCredentials.ts";
import mongoose, {Query, Schema} from "mongoose";
import {NGram} from "../../../../src/models/db/NGram.ts";

describe('E-Mail-Credentials', () => {

    beforeAll(async () => {
        await TestDatabase.connectToDb();
    })

    beforeEach(async () => {
        await TestDatabase.dropUser();
        await TestDatabase.dropSettings();
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    afterAll(async () => {
        await TestDatabase.closeConnection();
    });

    test('E-Mail is encrypted if settings.encryptEmail is true', async () => {
        const settings = await Settings.load();
        settings.encryptEmail = true;
        await settings.save();

        const testEmail = "test@test.com"

        //Create new user
        const newUser = await User.createNewUser("Test-User", testEmail, "Test12345!XX", SystemRoles.USER);
        const email = await newUser.getEmail();

        expect(EncryptUtil.encrypt(testEmail)).toEqual(email);
    });

    test('E-Mail is not encrypted if settings.encryptEmail is false', async () => {
        const settings = await Settings.load();
        settings.encryptEmail = false;
        await settings.save();

        const testEmail = "test@test.com"

        //Create new user
        const newUser = await User.createNewUser("Test-User", testEmail, "Test12345!XX", SystemRoles.USER);
        const email = await newUser.getEmail();

        expect(testEmail).toEqual(email);
    });

    test('Password is hashed', async () => {
        const testPassword = "Test12345!XX"

        //Create new user
        const newUser = await User.createNewUser("Test-User", "test@test.com", testPassword, SystemRoles.USER);
        const password = await newUser.getPassword();

        expect(testPassword).not.toEqual(password);

        const passwordIsEqual = await bcrypt.compare(testPassword, password)
        expect(passwordIsEqual).toBe(true);
    });

    describe('fn: encryptAll', () => {

        let numberOfTestUsers = 10;
        beforeEach(async () => {
            await TestDataHandler.addBigAmountOfUser(numberOfTestUsers);
        }, 30000)


        test('Encrypts all email addresses', async () => {
            let credentials = await EmailCredentialsModel.find().lean();
            expect(credentials).toHaveLength(numberOfTestUsers);
            for (const credential of credentials) {
                expect(credential.email).toContain("@");
            }

            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await EmailCredentialsModel.encryptAll(session);
                })

            } finally {
                await session.endSession();
            }

            credentials = await EmailCredentialsModel.find().lean();
            expect(credentials).toHaveLength(numberOfTestUsers);
            for (const credential of credentials) {
                expect(credential.email).not.toContain("@");
            }
        }, 30000);

        it('should only update emails that contain "@"', async () => {
            const mockCredentials = [
                {_id: new mongoose.Types.ObjectId(), email: "encryptedvalue1"},
                {_id: new mongoose.Types.ObjectId(), email: "user2@example.com"},
                {_id: new mongoose.Types.ObjectId(), email: "encryptedvalue2"},
                {_id: new mongoose.Types.ObjectId(), email: "user4@example.com"}
            ];

            jest.spyOn(EncryptUtil, 'encrypt').mockReturnValueOnce("user2@example.com").mockReturnValueOnce("user4@example.com");

            jest.spyOn(EmailCredentialsModel, 'find')
                //@ts-ignore
                .mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockCredentials)
                });

            const bulkWriteMock = jest.spyOn(EmailCredentialsModel, 'bulkWrite')
            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await EmailCredentialsModel.encryptAll(session);
                })

            } finally {
                await session.endSession();
            }
            expect(bulkWriteMock).toBeCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        updateOne: {
                            filter: {_id: mockCredentials[1]._id},
                            update: expect.objectContaining({
                                $set: expect.objectContaining({
                                    email: "user2@example.com"
                                })
                            })
                        }
                    }),
                    expect.objectContaining({
                        updateOne: {
                            filter: {_id: mockCredentials[3]._id},
                            update: expect.objectContaining({
                                $set: expect.objectContaining({
                                    email: "user4@example.com"
                                })
                            })
                        }
                    })
                ]),
                expect.any(Object)
            );
        });

    });

    describe('fn: decryptAll', () => {

        let numberOfTestUsers = 10;
        beforeEach(async () => {
            await TestDataHandler.addBigAmountOfUser(numberOfTestUsers);
        }, 300000)


        test('Decrypts all email addresses', async () => {
            //Encrypt everything
            let session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await EmailCredentialsModel.encryptAll(session);
                })

            } finally {
                await session.endSession();
            }

            let credentials = await EmailCredentialsModel.find().lean();
            expect(credentials).toHaveLength(numberOfTestUsers);
            for (const credential of credentials) {
                expect(credential.email).not.toContain("@");
            }

            session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await EmailCredentialsModel.decryptAll(session);
                })

            } finally {
                await session.endSession();
            }

            credentials = await EmailCredentialsModel.find().lean();
            expect(credentials).toHaveLength(numberOfTestUsers);
            for (const credential of credentials) {
                expect(credential.email).toContain("@");
            }
        });

        it('should only update emails that does not contain "@"', async () => {
            const settings = await Settings.load();
            settings.encryptEmail = true;
            await settings.save();

            const mockCredentials = [
                {_id: new mongoose.Types.ObjectId(), email: "encryptedvalue1"},
                {_id: new mongoose.Types.ObjectId(), email: "user2@example.com"},
                {_id: new mongoose.Types.ObjectId(), email: "encryptedvalue2"},
                {_id: new mongoose.Types.ObjectId(), email: "user4@example.com"}
            ];

            jest.spyOn(EncryptUtil, 'decrypt').mockReturnValueOnce("encryptedvalue1").mockReturnValueOnce("encryptedvalue2");

            jest.spyOn(EmailCredentialsModel, 'find')
                //@ts-ignore
                .mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockCredentials)
                });

            const bulkWriteMock = jest.spyOn(EmailCredentialsModel, 'bulkWrite')
            const session = await mongoose.startSession();

            try {
                await session.withTransaction(async () => {
                    await EmailCredentialsModel.decryptAll(session);
                })

            } finally {
                await session.endSession();
            }

            expect(bulkWriteMock).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        updateOne: {
                            filter: {_id: mockCredentials[0]._id},
                            update: expect.objectContaining({
                                $set: expect.objectContaining({
                                    email: "encryptedvalue1"
                                })
                            })
                        }
                    }),
                    expect.objectContaining({
                        updateOne: {
                            filter: {_id: mockCredentials[2]._id},
                            update: expect.objectContaining({
                                $set: expect.objectContaining({
                                    email: "encryptedvalue2"
                                })
                            })
                        }
                    })
                ]),
                expect.any(Object)
            );
        });

    });

});
