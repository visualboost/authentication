import React, {useState} from 'react';
import {Button, Card, Checkbox, Flex, Form, Image, Input} from 'antd';
import {Link} from "react-router-dom";
import {RegistrationFormInput} from "../../models/auth/RegistrationFormInput.tsx";
import {Routes} from "../../models/Routes.tsx";
import {UITheme} from "../../models/settings/UITheme.ts";
import {useUITheme} from "../settings/UIThemeProvider.tsx";
import {useTranslation} from "react-i18next";

interface RegistrationComponentProps {
    id: string;
    title: string;
    privacyPolicyUrl?: string | null;
    showPrivacyPolicyLink: boolean;
    onRegister?: (values: RegistrationFormInput) => Promise<void>;
    hideEmailField?: boolean;
    showLoginLink: boolean
    uiTheme?: UITheme;
    preventDefault?: boolean;
}

const RegistrationComponent = (props: RegistrationComponentProps) => {
    const {t} = useTranslation();
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
        <Card
            style={{
                background: theme?.cardBackgroundColor || "#FFFFFF",
                borderColor: theme?.cardBorderColor || undefined
            }}
        >
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
                {theme?.registrationLogo ? (
                    <Flex justify={"center"}>
                        <Image src={theme?.registrationLogo} preview={false}/>
                    </Flex>
                ) : (
                    <h2 style={{textAlign: 'center', color: theme?.inputTextColor}}>
                        {props.title || t("auth.registration.title")}
                    </h2>
                )}

                {/* USERNAME */}
                <Form.Item
                    label={<span style={{color: theme?.inputTextColor}}>
                        {t("auth.registration.username.label")}
                    </span>}
                    name="username"
                    rules={[
                        {required: true, message: t("auth.registration.username.required")}
                    ]}
                >
                    <Input
                        aria-label={"Registration Username Input"}
                        placeholder={t("auth.registration.username.placeholder")}
                    />
                </Form.Item>

                {/* EMAIL */}
                {!props.hideEmailField && (
                    <Form.Item
                        label={<span style={{color: theme?.inputTextColor}}>
                            {t("auth.registration.email.label")}
                        </span>}
                        name="email"
                        rules={[
                            {required: true, message: t("auth.registration.email.required")},
                            {type: 'email', message: t("auth.registration.email.invalid")}
                        ]}
                    >
                        <Input
                            aria-label={"Registration Email Input"}
                            placeholder={t("auth.registration.email.placeholder")}
                        />
                    </Form.Item>
                )}

                {/* PASSWORD */}
                <Form.Item
                    label={<span style={{color: theme?.inputTextColor}}>
                        {t("auth.registration.password.label")}
                    </span>}
                    name="password"
                    rules={[
                        {required: true, message: t("auth.registration.password.required")}
                    ]}
                >
                    <Input.Password
                        aria-label={"Registration Password Input"}
                        placeholder={t("auth.registration.password.placeholder")}
                    />
                </Form.Item>

                {/* PRIVACY POLICY */}
                {props.privacyPolicyUrl && (
                    <Form.Item
                        name="privacyPolicy"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value
                                        ? Promise.resolve()
                                        : Promise.reject(t("auth.registration.privacyPolicy.required"))
                            }
                        ]}
                    >
                        <Checkbox
                            aria-label={"Registration Privacy Policy Checkbox"}
                            checked={agreeToPrivacy}
                            onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                        >
                            <span style={{color: theme?.inputTextColor}}>
                                {t("auth.registration.privacyPolicy.label")}{" "}
                                <a
                                    style={{color: theme?.linkColor}}
                                    href={props.privacyPolicyUrl}
                                    onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                        if (props?.preventDefault) event.preventDefault();
                                    }}
                                >
                                    {t("auth.registration.privacyPolicy.link")}
                                </a>
                                {t("auth.registration.privacyPolicy.labelEnd")}
                            </span>
                        </Checkbox>
                    </Form.Item>
                )}

                {/* SUBMIT BUTTON */}
                <Form.Item>
                    <Button
                        aria-label={"Registration Button"}
                        type="primary"
                        htmlType="submit"
                        disabled={getRegisterBtnState()}
                        style={{
                            width: '100%',
                            backgroundColor: theme?.buttonColor,
                            color: theme?.buttonTextColor,
                            borderColor: theme?.buttonColor
                        }}
                        loading={loading}
                        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                            if (props?.preventDefault) event.preventDefault();
                        }}
                    >
                        {t("auth.registration.submit")}
                    </Button>
                </Form.Item>

                {/* LOGIN LINK */}
                {props.showLoginLink && (
                    <Form.Item style={{textAlign: 'center'}}>
                        <p>
                            <span style={{color: theme?.inputTextColor}}>
                                {t("auth.registration.alreadyHaveAccount")}{" "}
                            </span>

                            <Link
                                to={Routes.Authentication.LOGIN}
                                style={{color: theme?.linkColor}}
                                onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                    if (props?.preventDefault) event.preventDefault();
                                }}
                            >
                                {t("auth.registration.loginHere")}
                            </Link>
                        </p>
                    </Form.Item>
                )}
            </Form>
        </Card>
    );
};

export default RegistrationComponent;
