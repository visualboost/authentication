import {useState} from 'react';
import {Alert, Button, Form, Input, Typography} from 'antd';
import {MailOutlined} from '@ant-design/icons';
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";

const {Title, Paragraph} = Typography;

interface ResetPasswordItem {
    email: string;
}

const ResetPasswordComponent = () => {

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
        <div>
            <Typography>
                <Title level={2}>Reset Your Password</Title>
                <Paragraph>
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
                    label="Email Address"
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
                    >
                        Send Reset Link
                    </Button>
                    {showSuccessAlert && <Alert style={{marginTop: '20px'}}
                                                message="If this email is registered, you will receive a password reset link shortly."
                                                type="success"/>}
                </Form.Item>
            </Form>
        </div>
    );
};

export default ResetPasswordComponent;
