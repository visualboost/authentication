import RegistrationComponent from "./RegistrationComponent.tsx";
import {RegistrationFormInput} from "../../models/auth/RegistrationFormInput.tsx";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {useNavigate} from "react-router-dom";
import {Routes} from "../../models/Routes.tsx";
import {useEffect, useState} from "react";
import ProgressComponent from "../common/ProgressComponent.tsx";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import NotFoundError from "../../models/errors/NotFoundError.ts";
import {PrivacyPolicyOptions} from "../../models/system/PrivacyPolicyOptions.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";

const UserRegistrationComponent = () => {
    const {showProgress, hideProgress} = useLoader();
    const [privacyPolicyOptions, setPrivacyPolicyOptions] = useState<PrivacyPolicyOptions | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadPrivacyPolicyUrl();
    }, []);

    const loadPrivacyPolicyUrl = async () => {
        try {
            showProgress();

            const allowRegistrationView = await SystemStateService.getAllowRegistrationView();
            if(!allowRegistrationView) {
                navigate(Routes.Error.getErrorRoute(403), {replace: true});
                return;
            }

            const privacyPolicyOptions = await SystemStateService.getPrivacyPolicy();
            setPrivacyPolicyOptions(privacyPolicyOptions);
        } catch (e) {
            if(e instanceof NotFoundError){
                NotificationHandler.showErrorNotification("Missing privacy policy", "Privacy policy is enabled but no resource found.");
                return;
            }

            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const callCreateUser = async function (formInput: RegistrationFormInput) {
        try {
            await AuthenticationService.createUser(formInput)
            navigate(Routes.Authentication.CONFIRM_REGISTRATION);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        }
    }

    const getShowPrivacyPolicy = () => {
        if(privacyPolicyOptions){
            return privacyPolicyOptions.showPrivacyPolicy;
        }

        return true;
    }

    return (
        <ProgressComponent>
            <RegistrationComponent
                id={"user_registration_component"}
                title={"Registration"} onRegister={callCreateUser}
                privacyPolicyUrl={privacyPolicyOptions?.privacyPolicyUrl || ""}
                showPrivacyPolicyLink={getShowPrivacyPolicy()}
                showLoginLink={true}
            />
        </ProgressComponent>
    );
};

export default UserRegistrationComponent;
