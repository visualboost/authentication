import mongoose, {model, Model, ObjectId} from "mongoose";
import {SystemRoles} from "../../constants/role/SystemRoles.ts";
import {UserState} from "../../constants/UserState.ts";
import {JwtHandler} from "../../util/JwtHandler.ts";
import {JwtBody} from "../api/JwtBody.ts";
import {EmailCredentialsModel, IEmailCredentials} from "./credentials/EMailCredentials.ts";
import {UserDetails} from "../api/UserDetails.ts";
import {DeletedUserStatisticModel} from "./settings/DeletedUserStatistic.ts";
import {TimeUtil} from "../../util/TimeUtil.ts";
import {Settings} from "./Settings.ts";
import {decrypt, encrypt, encryptEmailIfAllowedBySystem} from "../../util/EncryptionUtil.ts";
import {compare} from "bcrypt";
import {Role} from "./Roles.ts";

const Schema = mongoose.Schema;

const EXPIRES_IN_HOURS = 48;

export interface IUser extends mongoose.Document {
    _id: ObjectId;
    ip: string;
    userName: string;
    credentials: mongoose.Schema.Types.ObjectId | IEmailCredentials;
    confirmation: {
        state: UserState;
        expiration: Date;
    };
    role: string;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;

    getAuthToken(): Promise<JwtBody>;

    getRefreshToken(metadata?: object): string;

    getEmail(): Promise<string>;

    setEmail(email: string): Promise<void>;

    setPassword(password: string): Promise<void>;

    getPassword(): Promise<string>;

    updateLastLogin(ip: string): Promise<void>;

    isAdmin(): boolean,

    getCredentials(): Promise<IEmailCredentials>;

    block(): Promise<void>;

    activate(): Promise<void>;

}

export interface IUserModel extends Model<IUser> {
    getByCredentials(email: string, password: string): Promise<IUser | null>;

    getByEmail(email: string): Promise<IUser | null>;

    createNewUser(username: string, email: string, password: string, role?: SystemRoles): Promise<IUser>;

    createAdmin(username: string, email: string, password: string): Promise<IUser>;

    findAllByEmail(emailSearchValue: string): Promise<Array<IUser>>;
    findAllByUsername(usernameSearchValue: string): Promise<Array<IUser>>

    delete(_id: ObjectId): Promise<IUser>;

    getDetails(_id: ObjectId | string): Promise<UserDetails | null>
    activate(_id: ObjectId | string): Promise<IUser>,
    getByIP(ip: string, populate: boolean): Promise<IUser | null>

    userExists(email: string): Promise<boolean>
}

const UserSchema = new Schema<IUser, IUserModel>({
        ip: {type: String, indexed: true},
        userName: {type: String, required: true},
        credentials: {type: Schema.Types.ObjectId, ref: 'EMailCredentials'},
        confirmation: {
            state: {
                type: Number,
                enum: [UserState.PENDING, UserState.ACTIVE, UserState.BLOCKED],
                default: UserState.PENDING
            },
            expiration: {
                type: Date, required: true, default: function () {
                    return TimeUtil.createTimeInHours(EXPIRES_IN_HOURS)
                }
            }
        },
        role: {type: String, required: true, indexed: true},
        lastLogin: {type: Date, required: true, default: new Date(), indexed: true},
    },
    {
        timestamps: true,
        methods: {
            getAuthToken: async function (): Promise<JwtBody> {
                const role = await Role.findOne({name: this.role});
                if(!role) {
                    throw new Error("Can't find role: " + this.role);
                }
                return JwtHandler.createAuthTokenBody(this._id.toString(), role.name, role.scopes, this.confirmation.state);
            },
            getRefreshToken: function (metadata: object | undefined): string {
                return JwtHandler.createRefreshToken(this._id.toString());
            },
            getCredentials: async function (): Promise<IEmailCredentials> {
                const credentials = await EmailCredentialsModel.findById(this.credentials);
                return credentials;
            },
            updateLastLogin: async function (ip: string) {
                this.ip = ip;
                this.lastLogin = new Date();
                await this.save();
            },
            isAdmin: function (): boolean {
                return this.role === SystemRoles.ADMIN;
            },
            getEmail: async function () {
                const credentials = await this.getCredentials();
                return credentials.email;
            },
            setEmail: async function (value: string): Promise<void> {
                const credentials = await this.getCredentials();
                const email = await encryptEmailIfAllowedBySystem(value);
                credentials.email = email;
                await credentials.save();
            },
            setPassword: async function (password: string) {
                const credentials = await this.getCredentials();
                await credentials.encryptAndSetPassword(password);
                await credentials.save();
            },
            getPassword: async function () {
                const credentials = await this.getCredentials();
                return credentials.password;
            },
            block: async function () {
                this.confirmation.state = UserState.BLOCKED;
                await this.save();
            },
            activate: async function () {
                this.confirmation.state = UserState.ACTIVE;
                await this.save();
            }
        },
        statics: {
            getByCredentials: async function (email: string, password: string): Promise<IUser | null> {
                const settings = await Settings.load();
                let query = {email: new RegExp(email, "i")}

                if (settings.encryptEmail) {
                    //@ts-ignore
                    query = {email: encrypt(email)}
                }

                const credentials = await EmailCredentialsModel.findOne(query);
                if (!credentials) return null;

                const passwordIsValid = await compare(password, credentials.password);
                if (passwordIsValid === false) return null;

                const user = await this.findOne({credentials: credentials._id});
                return user;
            },
            /**
             * Get user by an email address
             */
            getByEmail: async function (email: string, populate: boolean = false): Promise<IUser | null> {
                const credentials = await EmailCredentialsModel.findOne({email: new RegExp(email, "i")});
                if (!credentials) return null;

                let user;
                if (populate === true) {
                    user = await this.findOne({credentials: credentials._id}).populate("credentials");
                } else {
                    user = await this.findOne({credentials: credentials._id});
                }
                return user;
            },
            findAllByUsername: async function (usernameSearchValue: string): Promise<Array<IUser>> {
                return User.find({userName: new RegExp(usernameSearchValue, 'i'), "confirmation.state": {$ne: UserState.BLOCKED}}).populate("credentials");
            },
            findAllByEmail: async function (emailSearchValue: string): Promise<Array<IUser>> {
                const emailsAreEncrypted = await Settings.getEmailEncryptionEnabled();

                let query;
                let emailCredentialResult = [];

                if (emailsAreEncrypted) {
                    emailCredentialResult = await EmailCredentialsModel.find({email: encrypt(emailSearchValue)}, {"_id": 1}).lean();
                } else {
                    emailCredentialResult = await EmailCredentialsModel.find({email: new RegExp(emailSearchValue, 'i')}, {"_id": 1}).lean();
                }
                const credentialIds = emailCredentialResult.map(cred => cred._id.toString());
                query = User.find({
                    credentials: {$in: credentialIds},
                    "confirmation.state": {$ne: UserState.BLOCKED}
                }).populate("credentials").lean();

                return await query.exec() as Array<IUser>;
            },
            createNewUser: async function (username: string, email: string, password: string, role: SystemRoles = SystemRoles.USER): Promise<IUser> {
                const credentials = await EmailCredentialsModel.newCredentials(email.toLowerCase(), password);

                const newUser = new this({
                    userName: username,
                    credentials: credentials._id,
                    confirmation: {
                        state: UserState.PENDING,
                        expiration: TimeUtil.createTimeInHours(EXPIRES_IN_HOURS)
                    },
                    role: role,
                    lastLogin: Date.now()
                })

                const session = await mongoose.startSession();
                try {
                    await session.withTransaction(async () => {
                        await credentials.save({session});
                        await newUser.save({session});
                    })
                } finally {
                    await session.endSession();
                }


                return newUser;
            },
            createAdmin: async function (username: string, email: string, password: string): Promise<IUser> {
                return User.createNewUser(username, email, password, SystemRoles.ADMIN);
            },
            delete: async function (_id: ObjectId) {
                const userToDelete = await this.findOne({_id: _id}) as IUser;

                //Remove credentials
                await EmailCredentialsModel.deleteSearchIndex(userToDelete._id);
                await EmailCredentialsModel.deleteOne({_id: userToDelete.credentials});

                //Add to statistics
                //@ts-ignore
                await DeletedUserStatisticModel.logUserDeleted(_id.toString());

                const deletedUser = await this.findOneAndDelete({_id: _id}).lean();

                return deletedUser;
            },
            getDetails: async function (_id: string): Promise<UserDetails | null> {
                const user = await this.findOne({_id: _id}).populate("credentials").lean() as IUser;
                if (!user) return null;

                const emailsAreEncrypted = await Settings.getEmailEncryptionEnabled();
                let email = (user.credentials as IEmailCredentials).email;
                if (emailsAreEncrypted && !email.includes("@")) {
                    email = decrypt(email)
                }

                return new UserDetails(user._id.toString(), user.ip, user.userName, email, user.role, user.confirmation.state, user.createdAt, user.updatedAt, user.lastLogin);
            },
            activate: async function (_id: ObjectId | string): Promise<IUser> {
                return User.findOneAndUpdate({_id: _id}, {"confirmation.state": UserState.ACTIVE}, {new: true}) as Promise<IUser>;
            },
            getByIP: async function (ip: string, populate: boolean = false): Promise<IUser | null> {
                let user;
                if (populate === true) {
                    user = await User.findOne({ip: ip}).populate("credentials");
                } else {
                    user = await User.findOne({ip: ip});
                }
                return user;
            },
            userExists: async function (email: string): Promise<boolean> {
                const credentialsWithEmail = await EmailCredentialsModel.findOne({email: email}).lean();
                if (credentialsWithEmail != null) {
                    return true;
                }

                return false;
            }
        }
    });


UserSchema.statics.adminExists = async function () {
    const admin = await User.findOne({role: SystemRoles.ADMIN}).lean();
    return admin != null;
}

UserSchema.methods.hasPendingState = async function () {
    return this.confirmation.state === UserState.PENDING;
}

UserSchema.methods.hasActiveState = async function () {
    return this.confirmation.state === UserState.ACTIVE;
}

UserSchema.methods.hasBlockedState = async function () {
    return this.confirmation.state === UserState.BLOCKED;
}

const User = model<IUser, IUserModel>('User', UserSchema);

export {
    User
}
