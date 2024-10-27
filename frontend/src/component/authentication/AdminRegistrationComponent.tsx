import RegistrationComponent from "./RegistrationComponent.tsx";
import {RegistrationFormInput} from "../../models/auth/RegistrationFormInput.tsx";
import {useNavigate} from "react-router-dom";
import {CookieHandler} from "../../util/CookieHandler.tsx";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {Routes} from "../../models/Routes.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";


const AdminRegistrationComponent = () => {
    const navigate = useNavigate();

    const callCreateAdmin = async function (formInput: RegistrationFormInput) {
        try {
            const token = await AuthenticationService.createAdmin(formInput)
            CookieHandler.setAuthToken(token);
            navigate(Routes.Authentication.CONFIRM_REGISTRATION);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        }
    }

    return (
        <RegistrationComponent id={"admin_registration"}
                               title={"Create Admin"} onRegister={callCreateAdmin} showPrivacyPolicyLink={false}
                               showLoginLink={false}/>
    );
};

export default AdminRegistrationComponent;
