import './Verification.css'
import {Outlet, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {Routes} from "../../models/Routes.tsx";
import {CookieHandler} from "../../util/CookieHandler.tsx";
import ServiceUnavailableError from "../../models/errors/ServiceUnavailableError.ts";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import {SystemState} from "../../models/SystemState.tsx";
import {UserState} from "../../models/auth/UserState.ts";
import {Hooks} from "../../models/settings/Hooks.ts";

function VerificationComponent() {
    const navigate = useNavigate();

    useEffect(() => {
        handleNavigation();
    }, [])

    const handleNavigation = async () => {
        try {
            const systemState = await SystemStateService.getSystemState();
            if (systemState === SystemState.NOT_INITIALIZED) {
                navigate(Routes.Authentication.REGISTRATION_ADMIN);
                return;
            }

            if (!CookieHandler.authTokenExists() && systemState === SystemState.INITIALIZED) {
                navigate(Routes.Authentication.LOGIN);
                return;
            }

            const decodedToken = CookieHandler.getAuthTokenDecoded();
            if (decodedToken?.getState() === UserState.PENDING) {
                navigate(Routes.Authentication.CONFIRM_REGISTRATION);
                return;
            }

            if (decodedToken?.isAdmin()) {
                navigate(Routes.Admin.Dashboard.ROOT);
                return;
            }

            const allHooks = await SystemStateService.getHooks();
            const authHook = allHooks[Hooks.AUTHENTICATION] as string;
            if(authHook){
                window.location.replace(authHook)
            } else {
                navigate(Routes.Confirmation.LOGIN);
            }
        } catch (e) {
            navigate(Routes.Error.getErrorRoute(new ServiceUnavailableError().status));
        }
    }

    return (
        <div className={"verification-parent"}>
            <div className={"verification-form"}>
                <Outlet/>
            </div>
        </div>
    )
}

export default VerificationComponent
