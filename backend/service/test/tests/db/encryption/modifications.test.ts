import {TestDatabase} from "../../../util/database/TestDatabase.ts";
import {User} from "../../../../src/models/db/User.ts";
import {SystemRoles} from "../../../../src/constants/role/SystemRoles.ts";
import {
    EmailModificationMetaData,
    IEmailModification,
    UserModification
} from "../../../../src/models/db/UserModification.ts";
import * as EncryptionUtil from "../../../../src/util/EncryptionUtil.ts";
import {Settings} from "../../../../src/models/db/Settings.ts";
import {encrypt} from "../../../../src/util/EncryptionUtil.ts";

describe('Tests for Model: UserModification', () => {

    beforeAll(async () => {
        await TestDatabase.connectToDb();
    })

    beforeEach(async () => {
        await TestDatabase.dropUser();
        await TestDatabase.dropModifications();
    })

    afterAll(async () => {
        await TestDatabase.closeConnection();
    });

    test('E-Mail-Modification encrypt the new email address', async () => {
        const settings = await Settings.load();
        settings.encryptEmail = true;
        await settings.save();

        const newUser = await User.createNewUser("Test-User", "test@test.com", "Test12345!XX", SystemRoles.USER);

        const newEmail = "test2@test.com"
        const userModification = await UserModification.createEMailModification(newUser._id.toString(), newEmail) as IEmailModification

        expect(userModification.metadata.originMail).toEqual(encrypt("test@test.com"))
        expect(userModification.metadata.newEmail).toEqual(encrypt(newEmail))

    });



});
