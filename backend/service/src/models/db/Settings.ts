import mongoose, {Model, ObjectId} from "mongoose";
import {SystemRoles} from "../../constants/SystemRoles.ts";
import {Hooks} from "../../constants/Hooks.ts";
import {EmailCredentialsModel} from "./credentials/EMailCredentials.ts";
import {Blacklist} from "./Blacklist.ts";

const Schema = mongoose.Schema;

export interface Hook {
    type: Hooks;
    url: string;
}

export interface TwoFactorAuthorization {
    admin: boolean;
    clients: boolean;
}

export interface TokenExpiration {
    authenticationToken: number;
    refreshToken: number;
}


interface ISettings extends mongoose.Document {
    _id: ObjectId;
    ID: string;

    //Only for frontend - Navigates to error page if user is not admin
    restrictLoginToAdmin: boolean;
    enableRegistrationView: boolean;

    showPrivacyPolicy: boolean;
    privacyPolicyUrl: string;

    defaultRole: string;
    hooks: Array<Hook>;

    twoFactorAuthorization: TwoFactorAuthorization;

    encryptEmail: boolean;

    tokenExpiration: TokenExpiration;
}

interface ISettingsModel extends Model<ISettings> {
    load(): Promise<ISettings>;
    getAuthenticationHook(): Promise<Hook | null>;
    getEmailChangeHook(): Promise<Hook | null>;
    getResetPasswordHook(): Promise<Hook | null>;
    getPasswordChangeHook(): Promise<Hook | null>;
    updateSettings(settings: ISettings): Promise<ISettings>;
    getEmailEncryptionEnabled(): Promise<boolean>;
    setEmailEncryption(enable: boolean): Promise<ISettings>;
    encryptAllEmails(): Promise<void>;
    decryptAllEmails(): Promise<void>;
}

const SettingsSchema = new Schema<ISettings, ISettingsModel>({
    ID: {type: String, required: true, default: "ID", unique: true},
    restrictLoginToAdmin: {type: Boolean, required: true, default: false},
    enableRegistrationView: {type: Boolean, required: true, default: false},
    showPrivacyPolicy: {type: Boolean, required: true, default: false},
    privacyPolicyUrl: {type: String},
    defaultRole: {type: String, required: true, default: SystemRoles.USER},
    hooks: [{
        type: {
            type: String,
            enum: [Hooks.AUTHENTICATION, Hooks.PASSWORD_RESET, Hooks.PASSWORD_CHANGE, Hooks.EMAIL_CHANGE]
        },
        url: {type: String}
    }],
    twoFactorAuthorization: {
        admin: {type: Boolean, required: true, default: false},
        clients: {type: Boolean, required: true, default: false}
    },
    encryptEmail: {type: Boolean, required: true, default: false},
    tokenExpiration: {
        //Default is 30 minutes
        authenticationToken: {type: Number, required: true, default: 30},
        //Default is 8h
        refreshToken: {type: Number, required: true, default: 480}
    }
}, {
    statics: {
        load: async function (): Promise<ISettings> {
            let settings = await this.findOne({ID: "ID"});

            if (!settings) {
                settings = new Settings({
                    ID: "ID",
                    restrictLoginToAdmin: false,
                    enableRegistrationView: false,
                    defaultRole: SystemRoles.USER,
                    hooks: [
                        {
                            type: Hooks.AUTHENTICATION,
                            url: null
                        },
                        {
                            type: Hooks.PASSWORD_RESET,
                            url: null
                        },
                        {
                            type: Hooks.PASSWORD_CHANGE,
                            url: null
                        },
                        {
                            type: Hooks.EMAIL_CHANGE,
                            url: null
                        }],
                    twoFactorAuthorization: {
                        admin: false,
                        clients: false
                    },
                    encryptEmail: false
                })
                await settings.save();
            }

            return settings;
        },
        getEmailChangeHook: async function () {
            //@ts-ignore
            const settings = await this.load();
            return settings.hooks.find(function (hook: Hook) {
                return (hook as Hook).type === Hooks.EMAIL_CHANGE;
            });
        },
        getAuthenticationHook: async function () {
            const settings = await (this as ISettingsModel).load();
            return settings.hooks.find(function (hook: Hook) {
                return (hook as Hook).type === Hooks.AUTHENTICATION;
            });
        },
        getResetPasswordHook: async function () {
            //@ts-ignore
            const settings = await this.load();
            return settings.hooks.find(function (hook: Hook) {
                return (hook as Hook).type === Hooks.PASSWORD_RESET;
            });
        },
        getPasswordChangeHook: async function (): Promise<Hook> {
            const settings = await (Settings as ISettingsModel).load();
            return settings.hooks.find(function (hook: Hook) {
                return (hook as Hook).type === Hooks.PASSWORD_CHANGE;
            });
        },
        updateSettings: async function (settings: ISettings) {
            const updatedSettings = await this.findOneAndUpdate({ID: "ID"}, {...settings}, {new: true});
            return updatedSettings;
        },
        getEmailEncryptionEnabled: async function(){
            const s: ISettings = await Settings.load();
            return s.encryptEmail;
        },
        setEmailEncryption: async function(enable: boolean){
            const s: ISettings = await Settings.load();
            s.encryptEmail = enable;
            await s.save();

            return s;
        },
        /**
         * Encrypts all emails of {@EmailCredentialsModel} and {@Blacklist}.
         * Sets the {@Settings.encryptEmail} to true.
         */
        encryptAllEmails: async function(){
            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const settings = await Settings.load();
                    if(settings.encryptEmail === true) return;

                    await EmailCredentialsModel.encryptAll(session);
                    await Blacklist.encryptAll(session);

                    settings.encryptEmail = true;
                    await settings.save({session})
                })
            } finally {
                await session.endSession();
            }
        },
        /**
         * Decrypts all emails of {@EmailCredentialsModel} and {@Blacklist}.
         * Sets the {@Settings.encryptEmail} to false
         */
        decryptAllEmails: async function(){
            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const settings = await Settings.load();
                    if(settings.encryptEmail === false) return;

                    await EmailCredentialsModel.decryptAll(session);
                    await Blacklist.decryptAll(session);

                    settings.encryptEmail = false;
                    await settings.save({session})
                })
            } finally {
                await session.endSession();
            }
        }
    }
});

const Settings = mongoose.model<ISettings, ISettingsModel>('Settings', SettingsSchema);

export {
    Settings
}
