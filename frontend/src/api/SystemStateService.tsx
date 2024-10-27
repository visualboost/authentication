import {SystemState} from "../models/SystemState.tsx";
import {APIHandler} from "./APIHandler.tsx";
import {PrivacyPolicyOptions} from "../models/system/PrivacyPolicyOptions.tsx";
import {Hooks} from "../models/settings/Hooks.ts";

export class SystemStateService extends APIHandler {

    static instance: SystemStateService = new SystemStateService();

    constructor() {
        super();
    }

    static async getSystemState(): Promise<SystemState> {
        //@ts-ignore
        return SystemStateService.instance.get<SystemState>("/system/state", jsonResponse => jsonResponse.state as SystemState)
    }

    static async getAllowRegistrationView(): Promise<boolean> {
        //@ts-ignore
        return SystemStateService.instance.get<boolean>("/system/enableRegistrationView", jsonResponse => jsonResponse.enableRegistrationView as boolean)
    }

    static async getPrivacyPolicy(): Promise<PrivacyPolicyOptions> {
        //@ts-ignore
        return SystemStateService.instance.get<PrivacyPolicyOptions>("/system/privacypolicy", jsonResponse => new PrivacyPolicyOptions(jsonResponse.showPrivacyPolicy, jsonResponse.privacyPolicyUrl))
    }

    /**
     * Get xsfr token to avoid csfr attacks
     */
    static async getXsfrToken(): Promise<void> {
        await SystemStateService.instance.get<void>("/system/xsfr", jsonResponse => jsonResponse)
    }

    static async getHooks(): Promise<Record<Hooks, string>> {
        return SystemStateService.instance.get<Record<Hooks, string>>("/system/hooks", jsonResponse => jsonResponse as Record<Hooks, string>)
    }


}

