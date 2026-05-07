import React, {useState} from 'react';
import {Button, Card, Checkbox, Flex, Form, Image, Input} from 'antd';
import {Link} from "react-router-dom";
import {RegistrationFormInput} from "../../models/auth/RegistrationFormInput.tsx";
import {Routes} from "../../models/Routes.tsx";
import {UITheme} from "../../models/settings/UITheme.ts";
import {useUITheme} from "../settings/UIThemeProvider.tsx";

interface RegistrationComponentProps {
    id: string;
    title: string;
    privacyPolicyUrl?: string | null;
    showPrivacyPolicyLink: boolean;
    onRegister?: (values: RegistrationFormInput) => Promise<void>;
    hideEmailField?: boolean;
    showLoginLink: boolean
    uiTheme: UITheme;
    preventDefault?: boolean;
}

const RegistrationComponent = (props: RegistrationComponentProps) => {
    const {uiTheme} = useUITheme();
    const theme = props?.uiTheme || uiTheme;

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
        <Card style={{
            background: theme?.cardBackgroundColor || "#FFFFFF",
            borderColor: theme?.cardBorderColor || undefined
        }}>
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
                {theme?.registrationLogo ? <Flex justify={"center"}>
                        <Image src={theme?.registrationLogo} preview={false}/>
                    </Flex> :
                    <h2 style={{
                        textAlign: 'center',
                        color: theme?.inputTextColor
                    }}>{props.title || "Registration"}</h2>}

                <Form.Item
                    label={<span style={{color: theme?.inputTextColor}}>Username</span>}
                    name="username"
                    rules={[{required: true, message: 'Please enter a username!'}]}
                >
                    <Input aria-label={"Registration Username Input"} placeholder="Enter username"/>
                </Form.Item>

                {!props.hideEmailField && <Form.Item
                    label={<span style={{color: theme?.inputTextColor}}>E-Mail</span>}
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
                    label={<span style={{color: theme?.inputTextColor}}>Password</span>}
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
                            <span style={{color: theme?.inputTextColor}}>I agree to the <a
                                style={{color: theme?.linkColor}} href={props.privacyPolicyUrl}
                                onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                    if (props?.preventDefault) {
                                        event.preventDefault();
                                    }
                                }}>privacy policy.</a></span>
                        </Checkbox>
                    </Form.Item>
                }

                <Form.Item>
                    <Button aria-label={"Registration Button"} type="primary" htmlType="submit"
                            disabled={getRegisterBtnState()}
                            style={{
                                width: '100%',
                                backgroundColor: theme?.buttonColor,
                                color: theme?.buttonTextColor,
                                borderColor: theme?.buttonColor
                            }}
                            loading={loading}
                            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                if (props?.preventDefault) {
                                    event.preventDefault();
                                }
                            }}>
                        Register
                    </Button>
                </Form.Item>

                {props.showLoginLink &&
                    <Form.Item style={{textAlign: 'center'}}>
                        <p>
                            <span style={{color: theme?.inputTextColor}}>Already have an account?{' '}</span>

                            <Link to={Routes.Authentication.LOGIN} style={{
                                color: theme?.linkColor,
                            }} onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                if (props?.preventDefault) {
                                    event.preventDefault();
                                }
                            }}>Login</Link>
                        </p>
                    </Form.Item>
                }
            </Form>
        </Card>
    );
};

export default RegistrationComponent;
