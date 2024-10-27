import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import ChangePasswordComponent from "./ChangePasswordComponent.tsx";
import {Routes} from "../../models/Routes.tsx";
import BadRequestError from "../../models/errors/BadRequestError.ts";
import {UserService} from "../../api/UserService.tsx";
import {AuthenticationService} from "../../api/AuthenticationService.tsx";
import {Card, Flex} from 'antd';
import {NotificationHandler} from "../../util/NotificationHandler.tsx";

/**
 * Set password after forgot password (reset password)
 */
const SetPasswordComponent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            navigate(Routes.Error.getErrorRoute(new BadRequestError().status))
            return;
        }

        setToken(token);
    }, []);

    const handleSetPassword = async (newPassword: string) => {
        if (!token) {
            navigate(Routes.Error.getErrorRoute(new BadRequestError().status))
            return;
        }

        await UserService.setPassword(newPassword, token);
        await AuthenticationService.logout();
        navigate(Routes.ROOT);

        NotificationHandler.showSuccessNotification("Password changed", "You have successfully changed your password. Login to continue.")
    }

    return (
        <Flex align={"center"} justify={"center"} style={{width: '100%', height: '100%'}}>
            <Card title="Change Password" style={{width: 400, margin: '0 auto'}}>
                <ChangePasswordComponent changePassword={handleSetPassword} showCurrentPassword={false}/>
            </Card>
        </Flex>
    );
};

export default SetPasswordComponent;
