import {useEffect, useState} from 'react';
import {Alert, Button} from 'antd';
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {useInterval} from 'usehooks-ts'
import {CookieHandler} from "../../util/CookieHandler.tsx";
import {useNavigate} from "react-router-dom";
import {Routes} from "../../models/Routes.tsx";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import {Hooks} from "../../models/settings/Hooks.ts";
import ServiceUnavailableError from "../../models/errors/ServiceUnavailableError.ts";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";

const ConfirmEmailComponent = () => {
    const navigate = useNavigate();

    const [showAlert, isShowingAlert] = useState(false);
    const [loading, isLoading] = useState(false);
    const [fetching, isFetching] = useState(true);

    useEffect(() => {
        callRefetchToken();
    }, []);

    useInterval(
        async () => {
            await callRefetchToken();
        },
        fetching ? 3000 : null,
    )

    const callRefetchToken = async () => {
        try {
            if(!fetching) return;

            const token = await AuthenticationService.refreshToken();
            CookieHandler.setAuthToken(token);

            const decodedToken = CookieHandler.getAuthTokenDecoded();
            if (!decodedToken?.isActive()) return;
            isFetching(false);

            if (decodedToken?.isAdmin()) {
                navigate(Routes.ADMIN);
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
        } finally {
            isLoading(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            isLoading(true);
            await AuthenticationService.resendConfirmRegistrationMail();
            isShowingAlert(true);
            setTimeout(() => {
                isShowingAlert(false)
            }, 2000)
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false);
        }
    };

    return (
        <div style={{maxWidth: 600, margin: '50px auto', textAlign: 'center'}}>
            <Alert
                message="Email Confirmation Required"
                description="Please confirm your email address by clicking the confirmation button in the email we have sent you."
                type="info"
                showIcon
                style={{marginBottom: 20}}
            />
            <Button type="primary" onClick={handleResendEmail} loading={loading}>
                Resend Confirmation Email
            </Button>

            {showAlert &&
                <Alert message="We have sent a new confirmation email to you." type="success"
                       style={{marginTop: 40}}/>
            }
        </div>
    );
};

export default ConfirmEmailComponent;
