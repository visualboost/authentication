import {useState} from 'react';
import {Alert, Button, Input} from 'antd';
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {useTranslation} from "react-i18next";

const ConfirmEmailComponent = () => {
    const {t} = useTranslation();

    const [showAlert, isShowingAlert] = useState(false);
    const [loading, isLoading] = useState(false);
    const [email, setEmail] = useState<string>("");

    const handleResendEmail = async () => {
        try {
            if (email.length === 0) return;

            isLoading(true);
            await AuthenticationService.resendConfirmRegistrationMail(email);
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
                message={t('auth.confirmEmail.title')}
                description={t('auth.confirmEmail.description')}
                type="info"
                showIcon
                style={{marginBottom: 20}}
            />

            <Input placeholder={t('auth.confirmEmail.input_placeholder')} style={{marginBottom: 20}} value={email}
                   onChange={(e) => setEmail(e.target.value)}></Input>
            <Button style={{width: '100%'}} type="primary" onClick={handleResendEmail} loading={loading}>
                {t('auth.confirmEmail.btn_text')}
            </Button>

            {showAlert &&
                <Alert message={t('auth.confirmEmail.sent_confirm_text')} type="success"
                       style={{marginTop: 40}}/>
            }
        </div>
    );
};

export default ConfirmEmailComponent;
