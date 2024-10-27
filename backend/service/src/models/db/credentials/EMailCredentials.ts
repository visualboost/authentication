//@ts-nocheck

import mongoose, { Model, ObjectId} from "mongoose";
import {validatePassword} from "../../../util/PasswordUtil.ts";
import {NGram} from "../NGram.ts";
import {decrypt, encrypt, encryptEmailIfAllowedBySystem, hash} from "../../../util/EncryptionUtil.ts";

const Schema = mongoose.Schema;

export interface IEmailCredentials extends mongoose.Document {
    email: string;
    password: string;

    validatePassword(password: string): Promise<boolean>;

    encryptAndSetPassword(password: string): Promise<void>;
}

export interface IEmailCredentialsModel extends Model<IEmailCredentials> {
    emailExists(email: string): Promise<boolean>;

    newCredentials(email: string, password: string): Promise<IEmailCredentials>;

    deleteSearchIndex(userId: ObjectId): Promise<void>;

    /**
     * Encrypt all email addresses
     */
    encryptAll(session: mongoose.mongo.ClientSession): Promise<void>;

    /**
     * Decrypt all email addresses
     */
    decryptAll(session: mongoose.mongo.ClientSession): Promise<void>;
}

const EMailCredentialsSchema = new Schema<IEmailCredentials, IEmailCredentialsModel>(
        {
            email: {type: String, required: true, unique: true, indexed: true},
            password: {type: String, required: true}
        }, {
            timestamps: true,
            methods: {
                validatePassword: async function (password: string) {
                    return bcrypt.compare(password, this.password);
                },
                encryptAndSetPassword: async function (password: string) {
                    const hashedPassword = await hash(password);
                    this.password = hashedPassword;
                }
            },
            statics: {
                emailExists: async (value: string): Promise<boolean> => {
                    const email = await encryptEmailIfAllowedBySystem(value);
                    const emailCredentialWithMail = await EmailCredentialsModel.findOne({email: email});
                    if (emailCredentialWithMail) return true

                    return false;
                },
                newCredentials: async (email: string, password: string): Promise<IEmailCredentials> => {
                    const violations = validatePassword(password);
                    if (violations.length > 0) {
                        throw new Error(JSON.stringify(violations))
                    }

                    const encryptedOrPlainEmail = await encryptEmailIfAllowedBySystem(email);
                    const hashedPassword = await hash(password);
                    return new EmailCredentialsModel({
                        email: encryptedOrPlainEmail,
                        password: hashedPassword
                    })
                },
                deleteSearchIndex: async function (userId: ObjectId) {
                    await NGram.clearField(userId, "email")
                },
                encryptAll: async function (session: mongoose.mongo.ClientSession) {
                    const credentials = await this.find().lean();

                    const credentialUpdates = credentials.map(credential => {
                        if (!credential.email.includes("@")) return null;
                        //Only encrypt email if it contains '@' (means it is not yet encrypted)
                        let email = encrypt(credential.email);

                        return {
                            updateOne: {
                                filter: {_id: credential._id},
                                update: {
                                    $set: {
                                        email: email
                                    }
                                }
                            }
                        }
                    })

                    await this.bulkWrite(credentialUpdates.filter(bulkWriteOperation => bulkWriteOperation !== null), {session});
                },
                decryptAll: async function (session: mongoose.mongo.ClientSession) {
                    const credentials = await this.find().lean();

                    const credentialUpdates = credentials.map(credential => {
                        //Only decrypt email if it does not contain '@' (means it is not yet decrypted)
                        if (credential.email.includes("@")) return null;
                        let email = decrypt(credential.email);

                        return {
                            updateOne: {
                                filter: {_id: credential._id},
                                update: {$set: {email: email}}
                            }
                        }
                    })

                    //Decrypt all emails
                    await this.bulkWrite(credentialUpdates.filter(bulkWriteOperation => bulkWriteOperation !== null), {session});
                }
            }
        }
    );

const EmailCredentialsModel = mongoose.model<IEmailCredentials, IEmailCredentialsModel>('EMailCredentials', EMailCredentialsSchema);

export {
    EmailCredentialsModel
}

