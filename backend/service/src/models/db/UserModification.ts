import mongoose, {Model, ObjectId} from "mongoose";
import {UserModifications} from "../../constants/UserModifications.ts";
import {User} from "./User.ts";
import NotFoundError from "../../errors/NotFoundError.ts";
import {TimeUtil} from "../../util/TimeUtil.ts";
import {JwtHandler} from "../../util/JwtHandler.ts";
import {encrypt, encryptEmailIfAllowedBySystem, hash} from "../../util/EncryptionUtil.ts";

const Schema = mongoose.Schema;

const EXPIRES_IN_MINUTES = 5;

export interface EmailModificationMetaData {
    originMail: string;
    newEmail: string;
}

export interface PasswordChangeModificationMetaData {
    newPassword: string;
}

export interface IUserModification extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    modificationTarget: UserModifications;
    expiration: Date;
    metadata?: any;

    isEmail(): boolean;
    isPasswordChange(): boolean;
    isPasswordReset(): boolean;
    isExpired(): boolean;
    refreshExpirationDate(): Promise<void>;
    createToken(): Promise<string>;
}


export interface IEmailModification extends IUserModification {
    metadata: EmailModificationMetaData;
}

export interface IPasswordChangeModification extends IUserModification {
    metadata: PasswordChangeModificationMetaData;
}

export interface IEmailModification extends IUserModification {
    metadata: EmailModificationMetaData;
}

export interface IUserModificationModel extends Model<IUserModification> {
    createEMailModification(userId: string, newEmail: string): Promise<IEmailModification>;
    createPasswordModification(userId: string, newPassword: string): Promise<IUserModification>;
    createPasswordResetModificationObject(userId: string): Promise<IUserModification>;
    findByToken(token: string): Promise<IUserModification | null>;
    clearEmailModifications(userId: ObjectId | string): Promise<void>;
    clearPasswordModifications(userId: ObjectId | string): Promise<void>;
}

const UserModificationSchema = new Schema<IUserModification, IUserModificationModel>({
        userId: {type: Schema.Types.ObjectId, ref: 'User'},
        modificationTarget: {
            type: String,
            enum: [UserModifications.EMAIL, UserModifications.PASSWORD, UserModifications.PASSWORD_RESET],
            required: true
        },
        expiration: {
            type: Date, required: true, default: function () {
                return TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES)
            }
        },
        metadata: {type: Schema.Types.Mixed, required: false}
    },
    {
        methods: {
            isEmail: function () {
                return this.modificationTarget === UserModifications.EMAIL
            },
            isPasswordChange: function () {
                return this.modificationTarget === UserModifications.PASSWORD
            },
            isPasswordReset: function () {
                return this.modificationTarget === UserModifications.PASSWORD_RESET
            },
            isExpired: function () {
                //@ts-ignore
                return this.expiration < Date.now();
            },
            refreshExpirationDate: async function () {
                //@ts-ignore
                this.expiration = TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES);
                await this.save();
            },

            createToken: async function (): Promise<string> {
                const user = await User.findById(this.userId);
                const credentials = await user.getCredentials();
                return JwtHandler.createModificationToken(this._id.toString(), credentials.password)
            }
        },


        statics: {
            createEMailModification: async function (userId: string, newEmail: string): Promise<IEmailModification> {
                const user = await User.findOne({_id: userId}).populate("credentials").lean();
                if (!user) {
                    throw new NotFoundError();
                }

                //Delete existing modifications
                await UserModification.deleteMany({userId: user._id, modificationTarget: UserModifications.EMAIL})

                //encrypt email if defined in settings
                const email = await encryptEmailIfAllowedBySystem(newEmail);
                const emailModification = new this({
                    userId: userId,
                    modificationTarget: UserModifications.EMAIL,
                    expiration: TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES),
                    metadata: {
                        //@ts-ignore
                        originMail: user.credentials.email,
                        newEmail: email
                    }
                });
                await emailModification.save();
                return emailModification as IEmailModification;
            },
            /**
             * Create a user modification object when the user changed password.
             */
            createPasswordModification: async function (userId: string, newPassword: string): Promise<IUserModification> {
                const user = await User.findOne({_id: userId}).populate("credentials").lean();
                if (!user) {
                    throw new NotFoundError();
                }

                //Delete existing modifications
                await UserModification.deleteMany({userId: user._id, modificationTarget: UserModifications.PASSWORD})

                const hashedPassword = await hash(newPassword);
                const passwordModification = new this({
                    userId: userId,
                    modificationTarget: UserModifications.PASSWORD,
                    expiration: TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES),
                    metadata: {
                        newPassword: hashedPassword
                    }
                });
                await passwordModification.save();

                return passwordModification;
            },

            /**
             * Create a user modification object when the user forgot his password and wants to reset it.
             */
            createPasswordResetModificationObject: async function (userId: string): Promise<IUserModification> {
                const user = await User.findOne({_id: userId}).lean();
                if (!user) {
                    throw new NotFoundError();
                }

                //Delete existing modifications
                await UserModification.deleteMany({
                    userId: user._id,
                    modificationTarget: UserModifications.PASSWORD_RESET
                })

                const passwordResetModificationObject = new this({
                    userId: userId,
                    modificationTarget: UserModifications.PASSWORD_RESET,
                    expiration: TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES)
                });
                await passwordResetModificationObject.save();
                return passwordResetModificationObject;
            },

            findByToken: async function (token: string): Promise<IUserModification | null> {
                const decodedToken = JwtHandler.decodeWithoutVerification(token);
                //@ts-ignore
                const modificationId = decodedToken.modificationId;

                if(!modificationId) {
                    return null;
                }

                const userModificationDoc = await this.findById(modificationId);
                if(!userModificationDoc){
                    return null;
                }

                const user = await User.findById(userModificationDoc.userId);
                const credentials = await user.getCredentials();

                //Verify the token
                const verifiedToken = JwtHandler.verify(token, credentials.password);

                return userModificationDoc;
            },
            clearEmailModifications: async function(userId: ObjectId | string){
                    await this.deleteMany({userId: userId, modificationTarget: UserModifications.EMAIL})
            },
            clearPasswordModifications: async function(userId: ObjectId | string){
                await this.deleteMany({userId: userId, modificationTarget: UserModifications.PASSWORD})
            }

        }
    });


const UserModification = mongoose.model<IUserModification, IUserModificationModel>('UserModification', UserModificationSchema);

export {
    UserModification
}
