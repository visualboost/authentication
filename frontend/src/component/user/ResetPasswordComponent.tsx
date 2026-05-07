import React, {useState} from 'react';
import {Alert, Button, Card, Form, Input, Typography} from 'antd';
import {MailOutlined} from '@ant-design/icons';
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {UITheme} from "../../models/settings/UITheme.ts";
import {useUITheme} from "../settings/UIThemeProvider.tsx";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

const {Title, Paragraph} = Typography;

interface ResetPasswordItem {
    email: string;
}

interface ResetPasswordComponentProps {
    uiTheme?: UITheme;
    preventDefault?: boolean;
}

const ResetPasswordComponent = (props: ResetPasswordComponentProps) => {
    const { t } = useTranslation();
    const {uiTheme} = useUITheme();
    const theme = props?.uiTheme || uiTheme;

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const onFinish = async (values: ResetPasswordItem) => {
        setLoading(true);
        try {
            await AuthenticationService.resetPassword(values.email);
            showSuccessNotification();
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            setLoading(false);
        }
    };

    const showSuccessNotification = () => {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 2000);
    };

    return (
        <Card style={{
            background: theme?.cardBackgroundColor || "#FFFFFF",
            borderColor: theme?.cardBorderColor || undefined
        }}>
            <Typography>
                <Title level={2} style={{color: theme?.inputTextColor}}>
                    {t("auth.resetPassword.title")}
                </Title>

                <Paragraph style={{color: theme?.inputTextColor}}>
                    {t("auth.resetPassword.description")}
                </Paragraph>
            </Typography>

            <Form
                name="reset_password"
                layout="vertical"
                initialValues={{email: ''}}
                onFinish={onFinish}
            >
                <Form.Item
                    label={<span style={{color: theme?.inputTextColor}}>
                        {t("auth.resetPassword.email.label")}
                    </span>}
                    name="email"
                    rules={[
                        {required: true, message: t("auth.resetPassword.email.required")},
                        {type: 'email', message: t("auth.resetPassword.email.invalid")}
                    ]}
                >
                    <Input
                        prefix={<MailOutlined/>}
                        placeholder={t("auth.resetPassword.email.placeholder")}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        style={{
                            width: '100%',
                            backgroundColor: theme?.buttonColor,
                            color: theme?.buttonTextColor,
                            borderColor: theme?.buttonColor
                        }}
                        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                            if (props?.preventDefault) event.preventDefault();
                        }}
                    >
                        {t("auth.resetPassword.submit")}
                    </Button>

                    <Button
                        type="primary"
                        block
                        style={{
                            marginTop: "10px",
                            width: '100%',
                            backgroundColor: theme?.buttonColor,
                            color: theme?.buttonTextColor,
                            borderColor: theme?.buttonColor
                        }}
                        onClick={() => {
                            if (props?.preventDefault) {
                                return;
                            }

                            navigate(-1);
                        }}
                    >
                        {t("auth.resetPassword.back")}
                    </Button>

                    {showSuccessAlert && (
                        <Alert
                            style={{marginTop: '20px'}}
                            message={t("auth.resetPassword.successMessage")}
                            type="success"
                        />
                    )}
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ResetPasswordComponent;
