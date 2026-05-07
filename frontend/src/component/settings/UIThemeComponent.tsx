import {useEffect, useState} from 'react';
import {Button, Card, ColorPicker, Empty, Flex, Space, Tabs, Tooltip, Typography, Upload,} from 'antd';
import {AdminService} from "../../api/AdminService.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import AdminDetailSectionComponent from "../admin/AdminDetailSectionComponent.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";
import {UITheme} from "../../models/settings/UITheme.ts";
import LoginComponent from "../authentication/LoginComponent.tsx";
import {DeleteOutlined, UndoOutlined} from "@ant-design/icons";
import RegistrationComponent from "../authentication/RegistrationComponent.tsx";
import ResetPasswordComponent from "../user/ResetPasswordComponent.tsx";
import {SaveOutlined} from "@ant-design/icons/lib/icons";
import {SystemStateService} from "../../api/SystemStateService.tsx";

const {Title} = Typography;

const UIThemeComponent = () => {
    const {showProgress, hideProgress} = useLoader();
    const [uiTheme, setUITheme] = useState<UITheme | null>(null);

    useEffect(() => {
        loadUITheme();
    }, []);

    const loadUITheme = async () => {
        try {
            showProgress();

            const theme = await SystemStateService.getUITheme();
            setUITheme(theme);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const resetUITheme = async () => {
        try {
            showProgress();

            const theme = await AdminService.Settings.resetUITheme();
            setUITheme(theme);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const updateUITheme = async () => {
        try {
            showProgress();

            if (!uiTheme) return;
            const updatedTheme = await AdminService.Settings.updateUITheme(uiTheme);
            setUITheme(updatedTheme);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const setBackgroundColor = async (backgroundColor: string) => {
        if (!uiTheme) return;
        uiTheme.backgroundColor = backgroundColor;
        setUITheme({...uiTheme});
    }

    const setButtonColor = async (buttonColor: string) => {
        if (!uiTheme) return;
        uiTheme.buttonColor = buttonColor;
        setUITheme({...uiTheme});
    };

    const setButtonTextColor = async (buttonTextColor: string) => {
        if (!uiTheme) return;
        uiTheme.buttonTextColor = buttonTextColor;
        setUITheme({...uiTheme});
    };

    const setLinkColor = async (linkColor: string) => {
        if (!uiTheme) return;
        uiTheme.linkColor = linkColor;
        setUITheme({...uiTheme});
    };

    const setInputTextColor = async (inputTextColor: string) => {
        if (!uiTheme) return;
        uiTheme.inputTextColor = inputTextColor;
        setUITheme({...uiTheme});
    }

    const setCardBackgroundColor = async (cardBackgroundColor: string) => {
        if (!uiTheme) return;
        uiTheme.cardBackgroundColor = cardBackgroundColor;
        setUITheme({...uiTheme});
    }

    const setCardBorderColor = async (cardBorderColor: string) => {
        if (!uiTheme) return;
        uiTheme.cardBorderColor = cardBorderColor;
        setUITheme({...uiTheme});
    }

    const setRegistrationLogo = async (base64: string | null) => {
        if (!uiTheme) return;
        uiTheme.registrationLogo = base64;
        setUITheme({...uiTheme});
    };

    const setLoginLogo = async (base64: string | null) => {
        if (!uiTheme) return;
        uiTheme.loginLogo = base64;
        setUITheme({...uiTheme});
    };

    if (!uiTheme) return;
    return (
        <AdminDetailSectionComponent title={"UI-Theme"} style={{height: '100%', overflow: "hidden"}} actions={
            <div>
                <Tooltip title={"Save Theme "} placement={"bottom"}>
                    <Button size={"large"} type={"text"} icon={<SaveOutlined/>}
                            onClick={updateUITheme}></Button>
                </Tooltip>
                <Tooltip title={"Reset Theme "} placement={"bottom"}>
                    <Button size={"large"} type={"text"} icon={<UndoOutlined/>}
                            onClick={resetUITheme}></Button>
                </Tooltip>
            </div>


        }>
            <Flex gap={25} align="flex-start" style={{height: '100%'}}>

                <Space direction="vertical" style={{width: '50%'}}>

                    <Card style={{width: "100%"}}>
                        <Title level={4} style={{margin: '0 0 25px 0'}}>Colors:</Title>

                        <Flex gap={25} wrap="wrap">
                            <Space direction="vertical">
                                <span>Background Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.backgroundColor}
                                    showText
                                    onChange={(e) => setBackgroundColor(e.toHexString())}
                                />
                            </Space>

                            <Space direction="vertical">
                                <span>Card Background Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.cardBackgroundColor}
                                    showText
                                    onChange={(e) => setCardBackgroundColor(e.toHexString())}
                                />
                            </Space>

                            <Space direction="vertical">
                                <span>Card Border Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.cardBorderColor}
                                    showText
                                    onChange={(e) => setCardBorderColor(e.toHexString())}
                                />
                            </Space>

                            <Space direction="vertical">
                                <span>Text Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.inputTextColor}
                                    showText
                                    onChange={(e) => setInputTextColor(e.toHexString())}
                                />
                            </Space>

                            <Space direction="vertical">
                                <span>Button Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.buttonColor}
                                    showText
                                    onChange={(e) => setButtonColor(e.toHexString())}
                                />
                            </Space>

                            <Space direction="vertical">
                                <span>Button Text Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.buttonTextColor}
                                    showText
                                    onChange={(e) => setButtonTextColor(e.toHexString())}
                                />
                            </Space>

                            <Space direction="vertical">
                                <span>Link Color</span>
                                <ColorPicker
                                    defaultValue={uiTheme.linkColor}
                                    showText
                                    onChange={(e) => setLinkColor(e.toHexString())}
                                />
                            </Space>
                        </Flex>
                    </Card>

                    <Card style={{width: "100%"}}>
                        <Title level={4} style={{margin: '0 0 25px 0'}}>Logos:</Title>
                        <Space direction="vertical" style={{width: "100%"}}>

                            {/* Login Logo */}
                            <Space direction="vertical" style={{width: "100%"}}>
                                <span>Login Logo</span>

                                <div style={{position: "relative", width: "100%"}}>
                                    {uiTheme.loginLogo && (
                                        <DeleteOutlined
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLoginLogo(null);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                fontSize: 20,
                                                color: "red",
                                                zIndex: 10,
                                                cursor: "pointer"
                                            }}
                                        />
                                    )}

                                    <Upload.Dragger
                                        accept="image/*"
                                        maxCount={1}
                                        beforeUpload={async (file) => {
                                            const base64 = await fileToBase64(file);
                                            setLoginLogo(base64);
                                            return false;
                                        }}
                                        showUploadList={false}
                                        style={{width: "100%"}}
                                    >
                                        {uiTheme.loginLogo ? (
                                            <img
                                                src={uiTheme.loginLogo}
                                                alt="Login"
                                                style={{maxWidth: "150px", marginTop: 10}}
                                            />
                                        ) : (
                                            <Empty description={"Click to add an image"}/>
                                        )}
                                    </Upload.Dragger>
                                </div>
                            </Space>

                            {/* Registration Logo */}
                            <Space direction="vertical" style={{width: "100%"}}>
                                <span>Registration Logo</span>

                                <div style={{position: "relative", width: "100%"}}>
                                    {uiTheme.registrationLogo && (
                                        <DeleteOutlined
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRegistrationLogo(null);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                fontSize: 20,
                                                color: "red",
                                                zIndex: 10,
                                                cursor: "pointer"
                                            }}
                                        />
                                    )}

                                    <Upload.Dragger
                                        accept="image/*"
                                        maxCount={1}
                                        beforeUpload={async (file) => {
                                            const base64 = await fileToBase64(file);
                                            setRegistrationLogo(base64);
                                            return false;
                                        }}
                                        showUploadList={false}
                                        style={{width: "100%"}}
                                    >
                                        {uiTheme.registrationLogo ? (
                                            <img
                                                src={uiTheme.registrationLogo}
                                                alt="Registration"
                                                style={{maxWidth: "150px", marginTop: 10}}
                                            />
                                        ) : (
                                            <Empty description={"Click to add an image"}/>
                                        )}
                                    </Upload.Dragger>
                                </div>
                            </Space>

                        </Space>


                    </Card>

                </Space>

                <Card style={{width: "50%"}}>
                    <Title level={4} style={{margin: '0 0 25px 0'}}>Preview:</Title>

                    <Tabs
                        defaultActiveKey="login"
                        items={[
                            {
                                key: "login",
                                label: "Login",
                                children: <div style={{backgroundColor: uiTheme.backgroundColor, padding: "20px"}}>
                                    <LoginComponent uiTheme={uiTheme} preventDefault={true}/>
                                </div>
                            },
                            {
                                key: "registration",
                                label: "Registration",
                                children: <div style={{backgroundColor: uiTheme.backgroundColor, padding: "20px"}}>
                                    <RegistrationComponent
                                        id={"registration_preview"}
                                        title={"Registration"}
                                        uiTheme={uiTheme}
                                        showPrivacyPolicyLink={true}
                                        privacyPolicyUrl={"test"}
                                        showLoginLink={true}
                                        preventDefault={true}/>
                                </div>
                            },
                            {
                                key: "reset_passsword",
                                label: "Reset Password",
                                children: <div style={{backgroundColor: uiTheme.backgroundColor, padding: "20px"}}>
                                    <ResetPasswordComponent uiTheme={uiTheme} preventDefault={true}/>
                                </div>
                            }
                        ]}
                    />
                </Card>
            </Flex>
        </AdminDetailSectionComponent>
    )
        ;
};

export default UIThemeComponent;
