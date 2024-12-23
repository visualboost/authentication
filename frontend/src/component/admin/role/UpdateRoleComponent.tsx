import {useEffect, useState} from 'react';
import {Button, Collapse, Flex, Form, Input, Modal, Space} from 'antd';
import {AdminService} from "../../../api/AdminService.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {Routes} from "../../../models/Routes.tsx";
import {MdDelete, MdSave} from "react-icons/md";
import {NotificationHandler} from "../../../util/NotificationHandler.tsx";
import AdminDetailSectionComponent from "../AdminDetailSectionComponent.tsx";
import {useLoader} from "../../common/LoaderProvider.tsx";
import ScopeComponent from "./scopes/ScopeComponent.tsx";

const UpdateRoleComponent = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const {roleId} = useParams();
    const [enabled, isEnabled] = useState(false);
    const {showProgress, hideProgress} = useLoader();
    const [updating, isUpdating] = useState(false);
    const [deleting, isDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [scopes, setScopes] = useState<string[]>([]);

    //@ts-ignore
    const handleSubmit = async (values) => {
        try {
            isUpdating(true);
            if (!roleId) return;
            await AdminService.Role.updateRole(roleId, values.name, values.description, scopes);
            navigate(Routes.Admin.RoleSection.LIST);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isUpdating(false);
        }
    };

    useEffect(() => {
        loadRole();
    }, [])

    const loadRole = async () => {
        try {
            showProgress();

            if (!roleId) return
            const role = await AdminService.Role.getRole(roleId);
            //@ts-ignore
            form.setFieldsValue({
                id: role.id,
                name: role.name,
                description: role.description,
            });

            setScopes(role.scopes);
            isEnabled(!role.isSystemRole)
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            hideProgress();
        }
    }

    const deleteRole = async () => {
        try {
            isDeleting(true);

            if (!roleId) return
            await AdminService.Role.deleteRole(roleId);
            navigate(Routes.Admin.RoleSection.LIST);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isDeleting(false)
        }
    }

    const callShowDeleteDialog = () => {
        setShowDeleteDialog(true)
    }

    return (
        <AdminDetailSectionComponent title={"Details"}>
            <Form
                form={form}
                layout="vertical"
                autoComplete={"off"}
                onFinish={handleSubmit}
                disabled={!enabled}>
                <Form.Item label="Name" name={"name"} validateFirst
                           rules={[{required: true, message: 'Please enter a name!'}]}>
                    <Input
                        placeholder="Name"
                    />
                </Form.Item>
                <Form.Item label="Description" name={"description"}>
                    <Input.TextArea
                        placeholder="Description"
                        rows={4}
                    />
                </Form.Item>
                <Collapse items={[
                    {
                        key: '1',
                        label: 'Scopes',
                        children: <ScopeComponent onScopesSelected={setScopes} scopes={scopes}/>
                    }
                ]}>
                </Collapse>
                <Form.Item>
                    {enabled &&
                        <Flex justify={"flex-end"} align={"flex-end"} style={{marginTop: '20px'}}>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={updating} icon={<MdSave/>}>
                                    Update
                                </Button>
                                <Button type="primary" danger loading={deleting} icon={<MdDelete/>}
                                        onClick={callShowDeleteDialog}>
                                    Delete
                                </Button>
                            </Space>
                        </Flex>
                    }
                </Form.Item>
            </Form>
            <Modal
                open={showDeleteDialog}
                title="Delete Role"
                centered
                onCancel={() => {
                    setShowDeleteDialog(false)
                }}
                footer={(_, {CancelBtn}) => (
                    <>
                        <CancelBtn/>
                        <Button type={"primary"} danger loading={deleting} onClick={deleteRole}>Delete</Button>
                    </>
                )}
            >
                <p>Do you really want to the the role <b>{form.getFieldValue("name")}</b> ?</p>
            </Modal>
        </AdminDetailSectionComponent>

    );
};

export default UpdateRoleComponent;
