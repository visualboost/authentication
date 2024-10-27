import {useEffect, useState} from 'react';
import {Card, Flex, Space, Typography,} from 'antd';
import SaveInputComponent from "../common/SaveInputComponent.tsx";
import {MdEmail} from "react-icons/md";
import ModifyPasswordComponent from "../user/ModifyPasswordComponent.tsx";
import {UserService} from "../../api/UserService.tsx";
import {CookieHandler} from "../../util/CookieHandler.tsx";
import {UserDetails} from "../../models/user/UserDetails.ts";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";
import AdminDetailSectionComponent from "../admin/AdminDetailSectionComponent.tsx";

const {Title, Text} = Typography;

const CredentialsSettingsComponent = () => {
    const {showProgress, hideProgress} = useLoader();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    useEffect(() => {
        loadAdminCredentials();
    }, []);

    const loadAdminCredentials = async () => {
        try {
            showProgress();

            const decodedJwt = CookieHandler.getAuthTokenDecoded();
            if (!decodedJwt) return;

            const response = await UserService.getUserDetails(decodedJwt.getUserId());
            setUserDetails(response);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    /**
     * Create an email modification object.
     * After sending the request, the user will receive a confirmation mail. He/she needs to click the confirmation button, to change the email address.
     */
    const modifyEmail = async (newEmail: string) => {
        if (!newEmail) return;

        try {
            await UserService.modifyEmail(newEmail);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        }
    }

    return (
        <AdminDetailSectionComponent title={"Credentials"}>
            <Flex vertical style={{width: '100%', height: '100%'}}>
                <Space size={20} direction={"vertical"}>

                    <Card>
                        <Title level={4} style={{margin: 0}}>E-Mail:</Title>
                        <Space size={20} direction={"vertical"} style={{width: '100%'}}>
                            <Text type="secondary">
                                Enter a new e-mail and hit <b>Enter</b> to change your e-mail address
                            </Text>
                            <SaveInputComponent
                                addonBefore={<div style={{textAlign: 'start'}}>{<MdEmail/>}</div>}
                                defaultValue={userDetails?.email}
                                placeholder={"Enter your new email address"}
                                onSave={(value) => modifyEmail(value)}
                            />
                        </Space>
                    </Card>

                    <Card>
                        <Title level={4} style={{margin: 0}}>Password</Title>
                        <Space size={20} direction={"vertical"} style={{width: '100%'}}>
                            <Text type="secondary">
                                To set a new password, please enter your current password, choose a new password, and
                                confirm the new password.
                            </Text>
                            <ModifyPasswordComponent/>
                        </Space>
                    </Card>
                </Space>
            </Flex>
        </AdminDetailSectionComponent>
    );
};

export default CredentialsSettingsComponent;
