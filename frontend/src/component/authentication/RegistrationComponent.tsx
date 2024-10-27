import {useState} from 'react';
import {Button, Checkbox, Form, Input} from 'antd';
import {Link} from "react-router-dom";
import {RegistrationFormInput} from "../../models/auth/RegistrationFormInput.tsx";
import {Routes} from "../../models/Routes.tsx";

interface RegistrationComponentProps {
    id: string;
    title: string;
    privacyPolicyUrl?: string | null;
    showPrivacyPolicyLink: boolean;
    onRegister: (values: RegistrationFormInput) => Promise<void>;
    hideEmailField?: boolean;
    showLoginLink: boolean
}

const RegistrationComponent = (props: RegistrationComponentProps) => {
    const [loading, isLoading] = useState(false);
    const [enabled, isEnabled] = useState(true);

    const [form] = Form.useForm();
    const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

    //@ts-ignore
    const onFinish = async (values: any) => {
        try {
            isLoading(true);
            isEnabled(false);
            if (props.onRegister) {
                await props.onRegister(new RegistrationFormInput(values.username, values.email, values.password, values.privacyPolicy));
            }
        } finally {
            isLoading(false)
            isEnabled(true);
        }
    };

    const getRegisterBtnState = () => {
        return props.showPrivacyPolicyLink && !agreeToPrivacy
    }

    return (
        <Form
            aria-label={props.id}
            form={form}
            name="registration"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            disabled={!enabled}
            style={{width: '100%'}}
        >
            <h2 style={{textAlign: 'center'}}>{props.title || "Registration"}</h2>

            <Form.Item
                label="Username"
                name="username"
                rules={[{required: true, message: 'Please enter a username!'}]}
            >
                <Input aria-label={"Registration Username Input"} placeholder="Enter username"/>
            </Form.Item>

            {!props.hideEmailField && <Form.Item
                label="Email"
                name="email"
                rules={[
                    {required: true, message: 'Please enter an email!'},
                    {type: 'email', message: 'Please enter a valid email!'},
                ]}
            >
                <Input aria-label={"Registration Email Input"} placeholder="Enter email"/>
            </Form.Item>
            }

            <Form.Item
                label="Password"
                name="password"
                rules={[{required: true, message: 'Please enter a password!'}]}
            >
                <Input.Password aria-label={"Registration Password Input"}
                                placeholder="Enter password"/>
            </Form.Item>

            {props.privacyPolicyUrl &&
                <Form.Item
                    name="privacyPolicy"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) =>
                                value ? Promise.resolve() : Promise.reject('You must agree to the privacy policy!'),
                        },
                    ]}
                >
                    <Checkbox
                        aria-label={"Registration Privacy Policy Link"}
                        checked={agreeToPrivacy}
                        onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                    >
                        I agree to the <a href={props.privacyPolicyUrl}>privacy policy</a>.
                    </Checkbox>
                </Form.Item>
            }

            <Form.Item>
                <Button aria-label={"Registration Button"} type="primary" htmlType="submit"
                        disabled={getRegisterBtnState()}
                        style={{width: "100%"}}
                        loading={loading}>
                    Register
                </Button>
            </Form.Item>

            {props.showLoginLink &&
                <Form.Item style={{textAlign: 'center'}}>
                    <p>
                        Already have an account?{' '}
                        <Link to={Routes.Authentication.LOGIN}>Login</Link>
                    </p>
                </Form.Item>
            }
        </Form>
    );
};

export default RegistrationComponent;
