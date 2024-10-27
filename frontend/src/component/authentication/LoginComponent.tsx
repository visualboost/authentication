import {Button, Flex, Form, Input} from 'antd';
import {Link, useNavigate} from "react-router-dom";
import {LoginFormInput} from "../../models/auth/LoginFormInput.tsx";
import {useEffect, useState} from "react";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {CookieHandler} from "../../util/CookieHandler.tsx";
import {Routes} from "../../models/Routes.tsx";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import {HttpError} from "../../models/errors/HttpError.tsx";
import {JwtContent} from "../../models/auth/JwtContent.ts";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";

const LoginComponent = () => {
    const navigate = useNavigate();

    const [loading, isLoading] = useState(false);
    const [enabled, isEnabled] = useState(true);
    const [allowRegistrationView, setAllowRegistrationView] = useState(false);
    const [error, setError] = useState<Error | HttpError | null>(null);

    const [form] = Form.useForm();

    useEffect(() => {
        getAllowRegistrationView();
    }, []);

    const getAllowRegistrationView = async () => {
        try {
            const allowRegistrationView = await SystemStateService.getAllowRegistrationView();
            setAllowRegistrationView(allowRegistrationView);
        } catch (e) {
            setAllowRegistrationView(false);
        }
    }

    const callLogin = async (data: LoginFormInput) => {
        try {
            setError(null);
            isLoading(true);
            isEnabled(false);

            await AuthenticationService.logout();

            /**
             * If two factor auth is enabled, navigate to two factor authentication
             */
            const signinResponseBody = await AuthenticationService.signin(data);
            if(signinResponseBody.twoFactorAuthIdNotNull()){
                navigate(Routes.getConfirmTwoFactorAuth(signinResponseBody.twoFactorAuthId as string));
                return;
            }

            CookieHandler.setAuthToken(signinResponseBody.token);
            const decodedToken = CookieHandler.getAuthTokenDecoded() as JwtContent;

            if (!decodedToken.isActive()) {
                navigate(Routes.Authentication.CONFIRM_REGISTRATION);
                return;
            }

            if (decodedToken.isAdmin()) {
                navigate(Routes.Admin.Dashboard.ROOT);
                return;
            }

            const hooks = await SystemStateService.getHooks();
            const authHook = hooks.AUTHENTICATION;
            if (authHook) {
                window.location.replace(authHook)
            } else {
                navigate(Routes.Confirmation.LOGIN);
            }
        } catch (e) {
            setError(e as HttpError);
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false);
            isEnabled(true);
        }
    }

    const onFinish = async (values: unknown) => {
        //@ts-ignore
        await callLogin(new LoginFormInput(values.email, values.password))
    };

    return (
        <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            disabled={!enabled}
        >
            <h2 style={{textAlign: 'center'}}>Login</h2>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    {required: true, message: 'Please enter your email!'},
                    {type: 'email', message: 'Please enter a valid email!'},
                ]}
            >
                <Input aria-label={"Login Email Input"} status={(error instanceof HttpError && error.status === 404) ? "error" : ""} placeholder="Enter your email"/>
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{required: true, message: 'Please enter your password!'}]}
                style={{marginBottom: 0}}
            >
                <Input.Password aria-label={"Login Password Input"} status={(error instanceof HttpError && error.status === 404) ? "error" : ""} placeholder="Enter your password"/>
            </Form.Item>
            <Flex justify={"flex-end"}>
                <p style={{margin: '0 0 20px 0'}}>
                    <Link aria-label="Forgot Password Link"
                          to={Routes.Authentication.RESET_PASSWORD}>Forgot your password?
                    </Link>
                </p>
            </Flex>

            <Form.Item>
                <Button aria-label={"Login Button"} type="primary" htmlType="submit" style={{width: '100%'}} loading={loading}>
                    Log In
                </Button>
            </Form.Item>

            {allowRegistrationView &&
                <Form.Item style={{textAlign: 'center'}}>
                    <p>
                        Don't have an account?{' '}
                        <Link aria-label={"Registration Link"} to={Routes.Authentication.REGISTRATION}>Register
                            here</Link>
                    </p>
                </Form.Item>
            }
        </Form>
    );
};

export default LoginComponent;
