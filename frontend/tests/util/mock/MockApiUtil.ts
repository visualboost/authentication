import {vi} from "vitest";
import {SystemState} from "../../../src/models/SystemState";
import {SystemStateService} from "../../../src/api/SystemStateService";
import {AuthenticationService} from "../../../src/api/AuthenticationService";
import {SigninResponseBody} from "../../../src/models/auth/SigninResponseBody";
import {RegistrationFormInput} from "../../../src/models/auth/RegistrationFormInput";
import {PrivacyPolicyOptions} from "../../../src/models/system/PrivacyPolicyOptions";

export class MockApiUtil {

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
    }


    static AuthenticationService = class {

        static mockSignin(result: SigninResponseBody | Error) {
            if (result instanceof Error) {
                return vi.spyOn(AuthenticationService, 'signin').mockRejectedValue(result);
            } else {
                return vi.spyOn(AuthenticationService, 'signin').mockResolvedValue(result);
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

