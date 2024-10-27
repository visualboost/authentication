import './Verification.css'

import RegistrationComponent from "./RegistrationComponent.tsx";
import {RegistrationFormInput} from "../../models/auth/RegistrationFormInput.tsx";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Routes} from "../../models/Routes.tsx";
import {ForbiddenError} from "../../models/errors/ForbiddenError.tsx";
import {useEffect, useState} from "react";
import ProgressComponent from "../common/ProgressComponent.tsx";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import NotFoundError from "../../models/errors/NotFoundError.ts";
import {PrivacyPolicyOptions} from "../../models/system/PrivacyPolicyOptions.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";

const InvitedUserRegistrationComponent = () => {
    const [searchParams] = useSearchParams();
    const {showProgress, hideProgress} = useLoader();
    const [privacyPolicyOptions, setPrivacyPolicyOptions] = useState<PrivacyPolicyOptions | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadPrivacyPolicyUrl();
    }, []);

    const loadPrivacyPolicyUrl = async () => {
        try {
            showProgress();

            const privacyPolicyOptions = await SystemStateService.getPrivacyPolicy();
            setPrivacyPolicyOptions(privacyPolicyOptions);
        } catch (e) {
            if(e instanceof NotFoundError){
                NotificationHandler.showErrorNotification("Missing privacy policy", "Privacy policy is enabled but no resource found.")
                return;
            }

            NotificationHandler.showErrorNotificationFromError(e as Error)
        } finally {
            hideProgress();
        }
    }

    const callAcceptInvitation = async function (formInput: RegistrationFormInput) {
        try {
            await AuthenticationService.logout();

            const invitationToken = searchParams.get("token");
            if (!invitationToken) return;

            await AuthenticationService.confirmInvitation(invitationToken, formInput.username, formInput.password)
            navigate(Routes.Authentication.LOGIN);

            NotificationHandler.showSuccessNotification("Registration finished", "You have successfully created a new account. Login now to continue.")
        } catch (e) {
            if (e instanceof ForbiddenError) {
                navigate(Routes.Error.getErrorRoute(403));
                return;
            }
        }
    }

    const getShowPrivacyPolicy = () => {
        if(privacyPolicyOptions){
            return privacyPolicyOptions.showPrivacyPolicy;
        }

        return true;
    }

    return (
        <div className={"verification-parent"}>
            <div className={"verification-form"}>
                <ProgressComponent>
                    <RegistrationComponent
                        id={"invite_user_registration"}
                        title={"Registration"} onRegister={callAcceptInvitation}
                        privacyPolicyUrl={privacyPolicyOptions?.privacyPolicyUrl || ""}
                        showPrivacyPolicyLink={getShowPrivacyPolicy()}
                        hideEmailField
                        showLoginLink={false}/>
                </ProgressComponent>
            </div>
        </div>
    );
};

export default InvitedUserRegistrationComponent;
