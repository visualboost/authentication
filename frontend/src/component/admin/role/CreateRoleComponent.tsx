import {useState} from 'react';
import {Button, Collapse, Flex, Form, Input} from 'antd';
import {AdminService} from "../../../api/AdminService.tsx";
import {useNavigate} from "react-router-dom";
import {Routes} from "../../../models/Routes.tsx";
import {MdSave} from "react-icons/md";
import CardHeader from "../../common/CardHeader.tsx";
import {NotificationHandler} from "../../../util/NotificationHandler.tsx";
import ScopeComponent from "./scopes/ScopeComponent.tsx";

const CreateRoleCOmponent = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, isLoading] = useState(false);
    const [scopes, setScopes] = useState<string[]>([]);

    //@ts-ignore
    const handleSubmit = async (values) => {
        try {
            isLoading(true);
            await AdminService.Role.createRole(values.name, values.description, scopes);
            navigate(Routes.Admin.RoleSection.LIST);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false);
        }
    };

    return (
        <div>
            <CardHeader title={"Add Role"}/>
            <Form
                form={form}
                layout="vertical"
                autoComplete={"off"}
                onFinish={handleSubmit}
                disabled={loading}>
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
                <ScopeComponent scopes={scopes} onScopesSelected={setScopes}/>
                <Form.Item>
                    <Flex justify={"flex-end"} align={"flex-end"} style={{marginTop: '20px'}}>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<MdSave/>}>
                            Add
                        </Button>
                    </Flex>
                </Form.Item>
            </Form>
        </div>

    );
};

export default CreateRoleCOmponent;
