import "../admin/ContentComponent.css";

import {useEffect, useState} from 'react';
import {Button, Descriptions, Flex, Space, Tooltip} from 'antd';
import {DeleteOutlined, StopOutlined} from '@ant-design/icons';
import {useNavigate, useParams} from "react-router-dom";
import {UserService} from "../../api/UserService.tsx";
import {UserDetails} from "../../models/user/UserDetails.ts";
import {SystemRoles} from "../../models/user/SystemRoles.ts";
import StateComponent from "../admin/user/StateComponent.tsx";
import {UserState} from "../../models/auth/UserState.ts";
import {CiEdit} from "react-icons/ci";
import RoleSelectComponent from "../admin/role/RoleSelectComponent.tsx";
import {MdSaveAs} from "react-icons/md";
import {AdminService} from "../../api/AdminService.tsx";
import {VscDiscard} from "react-icons/vsc";
import {createProps, ModalComponent, ModalComponentProps} from "../common/ModalComponent.tsx";
import CopyToClipboardButton from "../common/CopyToClipboardButton.tsx";
import {Routes} from "../../models/Routes.tsx";
import {NotificationHandler} from "../../util/NotificationHandler.tsx";
import {useLoader} from "../common/LoaderProvider.tsx";
import AdminDetailSectionComponent from "../admin/AdminDetailSectionComponent.tsx";

const UserDetailComponent = () => {
    const navigate = useNavigate();

    const {userId} = useParams();
    const {showProgress, hideProgress} = useLoader();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [editModeEnabled, enabledEditMode] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [modalConfig, setModalConfig] = useState<ModalComponentProps | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            showProgress();
            if (!userId) return;

            const userDetails = await UserService.getUserDetails(userId);
            setUser(userDetails);
            setUserRole(userDetails.role);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const getUserState = (): UserState => {
        const numberAsString = user?.state ? user.state : "-1"
        //@ts-ignore
        return parseInt(numberAsString)
    }

    const openConfirmModal = () => {
        setModalConfig(createProps(true, "Update User", "Yes, save changes", updateUserRole, () => setModalConfig(null), false,
            <p>Do you want to confirm you changes?</p>))
    }

    const openDeleteModal = () => {
        setModalConfig(createProps(true, "Delete User", "Delete", deleteUser, () => setModalConfig(null), true,
            <p>Do you want to delete the user <b>{user?.username}?</b></p>))
    }

    const openBlockDialog = () => {
        setModalConfig(createProps(true, "Block User", "Add to blacklist", blockUser, () => setModalConfig(null), true,
            <p>Do you want add the user <b>{user?.username}</b> to the blacklist?</p>))
    }

    const updateUserRole = async () => {
        try {
            showProgress();
            if (!userId) return;
            if (!userRole) return;

            const userDetails = await AdminService.User.updateUserRole(userId, userRole);
            setUser(userDetails);
            setUserRole(userDetails.role);
            enabledEditMode(false);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
            setModalConfig(null);
        }
    }

    const deleteUser = async () => {
        try {
            showProgress();
            if (!userId) return;

            await AdminService.User.deleteUser(userId);
            navigate(-1);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
            setModalConfig(null);
        }
    }

    const blockUser = async () => {
        try {
            showProgress();
            if (!user?.email) return;

            await AdminService.Blacklist.blockEmail(user.email);
            navigate(Routes.getUserListPath(true));
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
            setModalConfig(null);
        }
    }

    return (
        <AdminDetailSectionComponent title={"Details"} actions={<div>
            {!editModeEnabled &&
                <Tooltip title={"Edit User"} placement={"bottom"}>
                    <Button size={"large"} type={"text"} icon={<CiEdit/>}
                            onClick={() => enabledEditMode(!editModeEnabled)}></Button>
                </Tooltip>

            }
            {editModeEnabled &&
                <Space direction={"horizontal"}>

                    <Tooltip title={"Discard"} placement={"bottom"}>
                        <Button size={"large"} type={"text"} icon={<VscDiscard/>}
                                onClick={() => enabledEditMode(!editModeEnabled)}></Button>
                    </Tooltip>

                    <Tooltip title={"Save changes"} placement={"bottom"}>
                        <Button size={"large"} type={"text"} icon={<MdSaveAs/>}
                                onClick={openConfirmModal}></Button>
                    </Tooltip>
                </Space>
            }
        </div>}>
            <Descriptions column={1} bordered>
                <Descriptions.Item labelStyle={{width: "200px"}} label="ID">{user?._id}</Descriptions.Item>
                <Descriptions.Item label="IP">
                    <Space>
                        {user?.ip}
                        {user?.ip && <Tooltip title={"Copy IP-Address"} placement={"right"}>
                            <CopyToClipboardButton value={user?.ip}/>
                        </Tooltip>
                        }
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Username">{user?.username}</Descriptions.Item>
                <Descriptions.Item label="Email">
                    <Space>
                        {user?.email}
                        <Tooltip title={"Copy E-Mail"} placement={"right"}>
                            <CopyToClipboardButton value={user?.email}/>
                        </Tooltip>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                    {/*@ts-ignore*/}
                    {editModeEnabled &&
                        <RoleSelectComponent roleName={userRole} onRoleChanged={(role) => setUserRole(role)}/>}
                    {!editModeEnabled && user?.role}
                </Descriptions.Item>
                <Descriptions.Item label="Status"><StateComponent state={getUserState()}/></Descriptions.Item>
                <Descriptions.Item label="Created at">{user?.createdAt?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Last Update">{user?.updatedAt?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Last Login">{user?.lastLogin?.toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <Flex justify={"flex-end"} align={"flex-end"}>
                <Space style={{marginTop: 16}}>
                    {user?.role !== SystemRoles.ADMIN &&
                        <Button type="default" icon={<StopOutlined/>} danger onClick={openBlockDialog}>
                            Blockieren
                        </Button>
                    }
                    {user?.role !== SystemRoles.ADMIN &&
                        <Button type="primary" icon={<DeleteOutlined/>} danger onClick={openDeleteModal}>
                            Delete
                        </Button>
                    }
                </Space>
            </Flex>

            {
                modalConfig !== null &&
                <ModalComponent open={modalConfig !== null} title={modalConfig?.title} okBtnTxt={modalConfig?.okBtnTxt}
                                danger={modalConfig.danger}
                                okAction={modalConfig.okAction} onClose={modalConfig.onClose}
                                children={modalConfig.children}/>
            }
        </AdminDetailSectionComponent>);
};

export default UserDetailComponent;
