import React, {useState} from 'react';
import {Alert, Button, Card, Form, Input, Typography} from 'antd';
import {MailOutlined} from '@ant-design/icons';
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {UITheme} from "../../models/settings/UITheme.ts";
import {useUITheme} from "../settings/UIThemeProvider.tsx";

const {Title, Paragraph} = Typography;

interface ResetPasswordItem {
    email: string;
}

interface ResetPasswordComponentProps {
    uiTheme?: UITheme;
    preventDefault?: boolean;
}

const ResetPasswordComponent = (props: ResetPasswordComponentProps) => {
    const {uiTheme} = useUITheme();
    const theme = props?.uiTheme || uiTheme;

    const [loading, setLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const onFinish = async (values: ResetPasswordItem) => {
        setLoading(true);
        try {
            await AuthenticationService.resetPassword(values.email);
            showSuccessNotification()
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            setLoading(false);
        }
    };

    const showSuccessNotification = () => {
        setShowSuccessAlert(true);
        setTimeout(() => {
            setShowSuccessAlert(false);
        }, 2000)
    }

    return (
        <Card style={{
            background: theme?.cardBackgroundColor || "#FFFFFF",
            borderColor: theme?.cardBorderColor || undefined
        }}>
            <Typography>
                <Title level={2} style={{color: theme?.inputTextColor}}>Reset Your Password</Title>
                <Paragraph style={{color: theme?.inputTextColor}}>
                    Please enter your email address below and we'll send you a link to reset your password.
                </Paragraph>
            </Typography>
            <Form
                name="reset_password"
                layout="vertical"
                initialValues={{email: ''}}
                onFinish={onFinish}
            >
                <Form.Item
                    label={<span style={{color: theme?.inputTextColor}}>E-Mail</span>}
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your email address!'
                        },
                        {
                            type: 'email',
                            message: 'Please enter a valid email address!'
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined/>}
                        placeholder="Enter your email address"
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
                            if (props?.preventDefault) {
                                event.preventDefault();
                            }
                        }}
                    >
                        Send Reset Link
                    </Button>
                    {showSuccessAlert && <Alert style={{marginTop: '20px'}}
                                                message="If this email is registered, you will receive a password reset link shortly."
                                                type="success"/>}
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ResetPasswordComponent;
