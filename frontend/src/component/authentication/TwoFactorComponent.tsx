import {useState} from 'react';
import {Flex, Input, Spin, Typography} from 'antd';
import {LockOutlined} from "@ant-design/icons";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {CookieHandler} from "../../util/CookieHandler.tsx";
import {Routes} from "../../models/Routes.tsx";
import {SystemStateService} from "../../api/SystemStateService.tsx";
import {Hooks} from "../../models/settings/Hooks.ts";

const {Title, Text} = Typography;


const TwoFactorComponent = () => {
    const {id} = useParams();
    const navigate= useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [value, setValue] = useState("");

    const verifyAuthCode = async (code: string) => {
        try {
            setLoading(true);
            if(!id) return;

            await AuthenticationService.logout();

            const signinResponseBody = await AuthenticationService.confirm2FactorCode(id, code);
            if (!signinResponseBody) {
                setError(true);
                return;
            };

            const jwt = signinResponseBody.token;
            CookieHandler.setAuthToken(jwt);
            const decodedToken = CookieHandler.getAuthTokenDecoded();

            if(!decodedToken) return;
            if(decodedToken.isAdmin()){
                navigate(Routes.Admin.Dashboard.ROOT);
                return;
            }

            const allHooks = await SystemStateService.getHooks();
            const authHook = allHooks[Hooks.AUTHENTICATION] as string;
            if(authHook){
                window.location.replace(authHook)
            } else {
                navigate(Routes.Confirmation.LOGIN);
            }

            setError(false);
        } catch (e) {
            setError(true);
        } finally {
            setValue("");
            setLoading(false);
        }
    };

    const onCodeEnter = async (value: string) => {
        setValue(value);

        if (value.length !== 6) return;
        await verifyAuthCode(value);
    }


    return (
        <Flex vertical style={{width: '100%', boxSizing: 'border-box', padding: '20px'}} align={"center"}
              justify={"center"}>
            <LockOutlined style={{fontSize: '48px', color: '#1890ff', marginBottom: '20px'}}/>
            <Title level={3}>Two-Factor Authentication</Title>
            <Text type="secondary"
                  style={{textAlign: 'center', display: 'block', marginBottom: '0 10px 20px 10px', fontSize: 18}}>
                We have sent a verification code to your email address.<br/>Please enter the 6-digit code below to
                verify your identity and continue.
            </Text>
            <Input.OTP status={error ? "error" : ""} size={"large"} length={6} style={{margin: '20px'}} value={value}
                       onChange={onCodeEnter} disabled={loading}/>
            {loading && <Spin/>}
            {error && <Text type="danger" style={{
                textAlign: 'center',
                display: 'block',
                marginBottom: '0 10px 20px 10px',
                fontSize: 18
            }}>
                Invalid code
            </Text>}
        </Flex>
    );
};

export default TwoFactorComponent;
