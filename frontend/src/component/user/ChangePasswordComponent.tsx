import {useState} from 'react';
import {Form, Input, Button, Flex} from 'antd';
import {LockOutlined} from '@ant-design/icons';
import {NotificationHandler} from "../../util/NotificationHandler.tsx";

export interface ChangePasswordComponent {
    changePassword(newPassword: string, currentPassword: string): Promise<void>

    showCurrentPassword: boolean
}

const ChangePasswordComponent = (props: ChangePasswordComponent) => {

    const [loading, setLoading] = useState(false);

    //@ts-ignore
    const onFinish = async (values) => {
        try {
            setLoading(true)

            const {newPassword, confirmPassword, currentPassword} = values;

            if (newPassword !== confirmPassword) {
                return;
            }

            await props.changePassword(newPassword, currentPassword);
        } catch (e) {
            NotificationHandler.showErrorNotification("Failed to set new password", (e as Error).message)
        } finally {
            setLoading(false)
        }
    };

    return (
        <Flex justify="center" align="center" style={{width: '100%', height: '100%'}}>
                <Form
                    style={{width: '100%'}}
                    name="change_password"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    {props.showCurrentPassword &&
                        <Form.Item
                            name="currentPassword"
                            label="Current Password"
                            rules={[
                                {required: true, message: 'Please enter your current password.'},
                                {min: 6, message: 'The password must be at least 6 characters long.'},
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined/>}
                                placeholder="Current Password"
                            />
                        </Form.Item>
                    }

                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            {required: true, message: 'Please enter your new password.'},
                            {min: 6, message: 'The password must be at least 6 characters long.'},
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined/>}
                            placeholder="New Password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            {required: true, message: 'Please confirm your new password.'},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The passwords do not match.'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined/>}
                            placeholder="Confirm New Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>

        </Flex>
    );
};

export default ChangePasswordComponent;
