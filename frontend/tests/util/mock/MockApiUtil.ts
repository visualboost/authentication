import {vi} from "vitest";
import {SystemState} from "../../../src/models/SystemState";
import {SystemStateService} from "../../../src/api/SystemStateService";
import {AuthenticationService} from "../../../src/api/AuthenticationService";
import {SigninResponseBody} from "../../../src/models/auth/SigninResponseBody";
import {PrivacyPolicyOptions} from "../../../src/models/system/PrivacyPolicyOptions";
import {Hooks} from "../../../src/models/settings/Hooks";

export class MockApiUtil {

    static restore() {
        vi.restoreAllMocks();
    }

    static SystemService = class {

        static mockSystemState(result: SystemState | Error) {
            if (result instanceof Error) {
                return vi.spyOn(SystemStateService, 'getSystemState').mockRejectedValue(result);
            } else {
                return vi.spyOn(SystemStateService, 'getSystemState').mockResolvedValue(result as SystemState);
            }
        };

        static mockGetAllowRegistrationView(result: boolean | Error) {
            if (result instanceof Error) {
                return vi.spyOn(SystemStateService, 'getAllowRegistrationView').mockRejectedValue(result);
            } else {
                return vi.spyOn(SystemStateService, 'getAllowRegistrationView').mockResolvedValue(result);
            }
        };

        static mockGetPrivacyPolicy(result: PrivacyPolicyOptions | Error) {
            if (result instanceof Error) {
                return vi.spyOn(SystemStateService, 'getPrivacyPolicy').mockRejectedValue(result);
            } else {
                return vi.spyOn(SystemStateService, 'getPrivacyPolicy').mockResolvedValue(result);
            }
        };

        static mockGetHooks(result: Record<Hooks, string> | Error) {
            if (result instanceof Error) {
                return vi.spyOn(SystemStateService, 'getHooks').mockRejectedValue(result);
            } else {
                return vi.spyOn(SystemStateService, 'getHooks').mockResolvedValue(result);
            }
        };

        static mockGetXsfrToken(result: Error | null = null) {
            if (result instanceof Error) {
                return vi.spyOn(SystemStateService, 'getXsfrToken').mockRejectedValue(result);
            } else {
                return vi.spyOn(SystemStateService, 'getXsfrToken').mockResolvedValue(undefined);
            }
        };
    }


    static AuthenticationService = class {

        static mockSignin(result: SigninResponseBody | Error) {
            if (result instanceof Error) {
                return vi.spyOn(AuthenticationService, 'signin').mockRejectedValue(result);
            } else {
                return vi.spyOn(AuthenticationService, 'signin').mockResolvedValue(result);
            }
        };

        static mockLogout(result: Error | null = null) {
            if (result && result instanceof Error) {
                return vi.spyOn(AuthenticationService, 'logout').mockRejectedValue(result);
            } else {
                return vi.spyOn(AuthenticationService, 'logout').mockResolvedValue(undefined);
            }
        };

        static mockCreateUser(result: string | Error) {
            if (result instanceof Error) {
                return vi.spyOn(AuthenticationService, 'createUser').mockRejectedValue(result);
            } else {
                return vi.spyOn(AuthenticationService, 'createUser').mockResolvedValue(result);
            }
        };

        static mockRefetchToken(result: string | Error) {
            if (result instanceof Error) {
                return vi.spyOn(AuthenticationService, 'refreshToken').mockRejectedValue(result);
            } else {
                return vi.spyOn(AuthenticationService, 'refreshToken').mockResolvedValue(result);
            }
        };
    }

}

