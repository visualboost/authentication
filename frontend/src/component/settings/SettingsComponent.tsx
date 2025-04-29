import {useEffect, useState} from 'react';
import {Alert, Card, Flex, Modal, Space, Switch, Tabs, Typography,} from 'antd';
import {Settings} from "../../models/settings/Settings.ts";
import {AdminService} from "../../api/AdminService.tsx";
import SaveInputComponent from "../common/SaveInputComponent.tsx";
import RoleSelectComponent from "../admin/role/RoleSelectComponent.tsx";
import {Routes} from "../../models/Routes.tsx";
import {Hooks} from "../../models/settings/Hooks.ts";
import {ExclamationCircleFilled} from "@ant-design/icons";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import AdminDetailSectionComponent from "../admin/AdminDetailSectionComponent.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";

const {Title, Text} = Typography;
const {confirm} = Modal;

const SettingsComponent = () => {
    const {showProgress, hideProgress} = useLoader();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [selectedTabKey, setSelectedTabKey] = useState<string>("login")

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            showProgress();

            const settings = await AdminService.Settings.getSettings();
            setSettings(settings);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const updateSettings = async () => {
        try {
            showProgress();
            if (!settings) return;

            const updatedSettings = await AdminService.Settings.update(settings);
            setSettings(updatedSettings);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const setRestrictLoginToAdmin = async (restrictLoginToAdmin: boolean) => {
        if (!settings) return;
        settings.restrictLoginToAdmin = restrictLoginToAdmin;
        await updateSettings();
    }

    const setEnableRegistrationView = async (enableRegistrationView: boolean) => {
        if (!settings) return;
        settings.enableRegistrationView = enableRegistrationView;
        await updateSettings();
    }

    const setShowPrivacyPolicy = async (showPrivacyPolicy: boolean) => {
        if (!settings) return;
        settings.showPrivacyPolicy = showPrivacyPolicy;
        await updateSettings();
    }

    const setPrivacyPolicyUrl = async (privacyPolicyUrl: string) => {
        if (!settings) return;
        settings.privacyPolicyUrl = privacyPolicyUrl;
        await updateSettings();
    }

    const setAuthTokenExpirationTime = async (expirationTime?: string) => {
        if (!settings) return;
        if(!expirationTimeIsValid(expirationTime)) return;

        settings.tokenExpiration.authenticationToken = parseInt(expirationTime as string);
        await updateSettings();
    }

    const setRefreshTokenExpirationTime = async (expirationTime?: string) => {
        if (!settings) return;
        if(!expirationTimeIsValid(expirationTime)) return;
        settings.tokenExpiration.refreshToken = parseInt(expirationTime as string);
        await updateSettings();
    }

    const expirationTimeIsValid = (expirationTime?: string) => {
        if(!expirationTime || expirationTime === ""){
            NotificationHandler.showErrorNotification("Invalid expiration Time", "Please enter a valid expiration time (> 0)", 5);
            return false;
        }

        const expTime = parseInt(expirationTime);
        if(expTime <= 0){
            NotificationHandler.showErrorNotification("Invalid expiration Time", "Please enter a valid expiration time (> 0)", 5);
            return false;
        }

        return true
    }

    const setDefaultRole = async (role: string) => {
        if (!settings) return;
        settings.defaultRole = role;
        await updateSettings();
    }

    const setHook = async (type: Hooks, url: string) => {
        if (!settings) return;
        settings.setHook(type, url);
        await updateSettings();
    }

    const set2FactorAuthorizationForAdmin = async (twoFactorAuthEnabled: boolean) => {
        if (!settings) return;
        settings.twoFactorAuthorization.admin = twoFactorAuthEnabled;
        await updateSettings();
    }

    const set2FactorAuthorizationForClients = async (twoFactorAuthEnabled: boolean) => {
        if (!settings) return;
        settings.twoFactorAuthorization.clients = twoFactorAuthEnabled;
        await updateSettings();
    }

    const encryptEmailAddresses = async (encryptEmail: boolean) => {
        try {
            if (!settings) return;

            const updatedSettings = await AdminService.Settings.encryptEmailAddresses(encryptEmail)
            setSettings(updatedSettings);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        }
    }

    const renderHooks = () => {
        return <div style={{width: '100%'}}>
            <Flex vertical style={{width: '100%', marginTop: '20px'}}>
                <SaveInputComponent
                    addonBefore={<div style={{textAlign: 'start', width: '120px'}}>Login</div>}
                    defaultValue={settings?.getHook(Hooks.AUTHENTICATION)}
                    placeholder={"Enter the hook that should be called after login."}
                    onSave={(value) => setHook(Hooks.AUTHENTICATION, value)}
                />
                <SaveInputComponent
                    addonBefore={<div style={{textAlign: 'start', width: '120px'}}>E-Mail changed</div>}
                    defaultValue={settings?.getHook(Hooks.EMAIL_CHANGE)}
                    placeholder={"Enter the hook that should be called after the email address changed."}
                    onSave={(value) => setHook(Hooks.EMAIL_CHANGE, value)}
                />
                <SaveInputComponent
                    addonBefore={<div style={{textAlign: 'start', width: '120px'}}>Password changed</div>}
                    defaultValue={settings?.getHook(Hooks.PASSWORD_CHANGE)}
                    placeholder={"Enter the hook that should be called after the password changed."}
                    onSave={(value) => setHook(Hooks.PASSWORD_CHANGE, value)}
                />
                <SaveInputComponent
                    addonBefore={<div style={{textAlign: 'start', width: '120px'}}>Reset password</div>}
                    defaultValue={settings?.getHook(Hooks.PASSWORD_RESET)}
                    placeholder={"Enter the hook that should be called after the password is reset."}
                    onSave={(value) => setHook(Hooks.PASSWORD_RESET, value)}
                />
            </Flex>
        </div>

    }

    const render2FactorAuthorization = () => {
        return <div>
            <Title level={5} style={{marginBottom: '10px'}}>2-Factor-Authorization:</Title>
            <Space size={10} direction={"vertical"} style={{width: '100%'}}>
                <Space direction={"horizontal"}>
                    <Switch onChange={(checked) => set2FactorAuthorizationForAdmin(checked)}
                            checked={settings?.twoFactorAuthorization.admin}/>
                    <Text type="secondary">
                        Enable the 2-Factor-Authorization for the admin.
                    </Text>
                </Space>
                <Space direction={"horizontal"}>
                    <Switch onChange={(checked) => set2FactorAuthorizationForClients(checked)}
                            checked={settings?.twoFactorAuthorization.clients}/>
                    <Text type="secondary">
                        Enable the 2-Factor-Authorization for all users expect the admin.
                    </Text>
                </Space>
            </Space>
        </div>
    }

    const renderTokenExpirationTimeSettings = () => {
        return <div>
            <Title level={5} style={{marginBottom: '10px'}}>Token Expiration</Title>
            <Space size={0} direction={"vertical"} style={{width: '100%'}}>
                <SaveInputComponent
                    type={"number"}
                    addonBefore={<div style={{textAlign: 'start', width: '140px'}}>Access Token</div>}
                    defaultValue={settings?.tokenExpiration.authenticationToken?.toString()}
                    placeholder={"Enter the expiration time of the access token in minutes"}
                    onSave={setAuthTokenExpirationTime}/>
                <SaveInputComponent
                    type={"number"}
                    addonBefore={<div style={{textAlign: 'start', width: '140px'}}>Refresh Token</div>}
                    defaultValue={settings?.tokenExpiration.refreshToken?.toString()}
                    placeholder={"Enter the expiration time of the refresh token in minutes"}
                    onSave={setRefreshTokenExpirationTime}/>
            </Space>
        </div>
    }

    const showEncryptEmailModal = (encryptEmail: boolean) => {
        confirm({
            title: 'Encrypt email addresses?',
            icon: <ExclamationCircleFilled/>,
            content: 'Encrypting email addresses can take a moment, depending on the current number of registered users. Do you really want to encrypt all email addresses?',
            onOk() {
                return encryptEmailAddresses(encryptEmail)
            },
            onCancel() {
            },
        });
    };


    return (
        <AdminDetailSectionComponent title={"Settings"}>
            <Tabs
                // animated={false}
                activeKey={selectedTabKey}
                onChange={(activeKey) => {
                    setSelectedTabKey(activeKey)
                }}
                tabPosition={"top"}
                style={{height: 220}}
                items={[
                    {
                        key: 'login',
                        label: 'Login',
                        children: <Card>
                            <Title level={4} style={{margin: '0 0 25px 0'}}>Login Settings:</Title>
                            <Space size={0} direction={"vertical"} style={{width: '100%'}}>
                                <Space direction={"horizontal"}>
                                    <Switch onChange={(checked) => setRestrictLoginToAdmin(checked)}
                                            checked={settings?.restrictLoginToAdmin}/>
                                    <Text type="secondary">
                                        When enabled, the login form can be only used by the admin.
                                    </Text>
                                </Space>
                                {render2FactorAuthorization()}
                                {renderTokenExpirationTimeSettings()}
                            </Space>
                        </Card>,
                    },
                    {
                        key: 'registration',
                        label: 'Registration',
                        children: <Card>
                            <Title level={4} style={{margin: '0 0 25px 0'}}>Registration Settings:</Title>
                            <Space direction={"horizontal"}>
                                <Switch onChange={(checked) => setEnableRegistrationView(checked)}
                                        checked={settings?.enableRegistrationView}/>
                                <Text type="secondary">
                                    When enabled, the path <b>{Routes.Authentication.CONFIRM_REGISTRATION}</b> can
                                    be used
                                    to present a
                                    registration
                                    form.
                                </Text>
                            </Space>
                            <Title level={5} style={{marginBottom: '10px'}}>Default Role:</Title>
                            <Space size={20} direction={"vertical"} style={{width: '100%'}}>
                                <Space direction={"vertical"} style={{width: '100%'}}>
                                    <RoleSelectComponent roleName={settings?.defaultRole}
                                                         onRoleChanged={setDefaultRole}
                                                         style={{width: '100%'}}/>
                                    <Text type="secondary">
                                        The user role that a user receives by default when they register.
                                    </Text>
                                </Space>
                            </Space>

                            <Title level={5} style={{marginBottom: '10px'}}>Privacy Policy:</Title>

                            <Space size={20} direction={"vertical"}>
                                <Space direction={"horizontal"}>
                                    <Switch onChange={(checked) => setShowPrivacyPolicy(checked)}
                                            checked={settings?.showPrivacyPolicy}/>
                                    <Text type="secondary">
                                        When enabled, the registration form will display a link to the privacy
                                        policies.
                                    </Text>
                                </Space>
                                <SaveInputComponent
                                    defaultValue={settings?.privacyPolicyUrl}
                                    placeholder={"Enter the url of your privacy policy."}
                                    onSave={setPrivacyPolicyUrl}/>
                            </Space>
                        </Card>,
                    },
                    {
                        key: 'hooks',
                        label: 'Hooks',
                        children: <Card>
                            <Title level={4} style={{margin: '0 0 25px 0'}}>Hooks:</Title>
                            <Text type="secondary">
                                Hooks are urls that will be called after a specific action.
                            </Text>
                            {renderHooks()}
                        </Card>,
                    },
                    {
                        key: 'encryption',
                        label: 'Encryption',
                        children: <Card>
                            <Title level={4} style={{margin: '0 0 25px 0'}}>Email Encryption:</Title>
                            <Space size={20} direction={"vertical"}>
                                <Space direction={"horizontal"}>
                                    <Switch onChange={(checked) => {
                                        if (checked !== settings?.encryptEmail) {
                                            showEncryptEmailModal(checked)
                                        }
                                    }}
                                            checked={settings?.encryptEmail}/>
                                    <Text type="secondary">
                                        When enabled, email addresses will be encrypted. This can take a moment,
                                        depending on the current user count.
                                    </Text>
                                </Space>

                                <Alert
                                    message="When email addresses are encrypted, it is no longer possible to search for parts of the address (e.g., @gmx) because the encryption process converts the entire address into an unreadable format that cannot be partially matched."
                                    type="info" showIcon/>
                            </Space>

                        </Card>,
                    },
                ]
                }
            />
        </AdminDetailSectionComponent>);
};

export default SettingsComponent;
