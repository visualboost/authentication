import {Hooks} from "./Hooks.ts";

export interface Hook {
    type: Hooks;
    url: string;
}

export interface TwoFactorAuthorization {
    admin: boolean;
    clients: boolean;
}

export class Settings {
    restrictLoginToAdmin: boolean;
    enableRegistrationView: boolean;

    showPrivacyPolicy: boolean;
    privacyPolicyUrl: string;

    defaultRole: string;
    hooks: Hook[];

    twoFactorAuthorization: TwoFactorAuthorization;
    encryptEmail: boolean;

    constructor(allowLogin: boolean, allowRegistration: boolean, showPrivacyPolicy: boolean, privacyPolicyUrl: string, defaultRole: string, hooks: Hook[] = [], twoFactorAuthorization: TwoFactorAuthorization, encryptEmail: boolean) {
        this.restrictLoginToAdmin = allowLogin;
        this.enableRegistrationView = allowRegistration;

        this.showPrivacyPolicy = showPrivacyPolicy;
        this.privacyPolicyUrl = privacyPolicyUrl;

        this.defaultRole = defaultRole;
        this.hooks = hooks;

        this.twoFactorAuthorization = twoFactorAuthorization;
        this.encryptEmail = encryptEmail;
    }

    setHook(type: Hooks, url: string | null) {
        //@ts-ignore
        const indexOfRule = this.hooks.findIndex(hook => {
            return hook.type === type
        });
        if (indexOfRule === -1) {
            this.hooks.push({type: type, url: url || ""})
            return;
        }

        this.hooks[indexOfRule].url = url || "";
    }

    getHook(type: Hooks): string {
        //@ts-ignore
        const indexOfRule = this.hooks.findIndex(hook => hook.type === type);
        if (indexOfRule === -1) return ""

        return this.hooks[indexOfRule].url;
    }

    static fromJson(json: Settings): Settings {
        return new Settings(json.restrictLoginToAdmin, json.enableRegistrationView, json.showPrivacyPolicy, json.privacyPolicyUrl, json.defaultRole, json.hooks.map(hook => {
                return {
                    type: hook.type,
                    url: hook.url
                }
            }),
            {admin: json.twoFactorAuthorization.admin, clients: json.twoFactorAuthorization.clients},
            json.encryptEmail
        )
    }
}