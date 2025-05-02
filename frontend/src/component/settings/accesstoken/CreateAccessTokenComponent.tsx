import {useState} from 'react';
import {Button, Collapse, Flex, Form, Input, Select} from 'antd';
import {NotificationHandler} from "../../../util/NotificationHandler.tsx";
import CardHeader from "../../common/CardHeader.tsx";
import {MdSave} from "react-icons/md";
import ScopeComponent from "../../admin/role/scopes/ScopeComponent.tsx";
import {AdminService} from "../../../api/AdminService.tsx";
import DisplayPersonalAccessTokenComponent from "./DisplayPersonalAccessTokenComponent.tsx";

const durations = [
    {label: "1 Week", value: "7d"},
    {label: "2 Week", value: "14d"},
    {label: "1 Month", value: "30d"},
    {label: "2 Months", value: "60d"},
    {label: "3 Months", value: "90d"},
    {label: "6 Months", value: "180d"},
    {label: "1 Year", value: "360d"},
    {label: "Never  ", value: "999y"},
];

const CreateAccessTokenComponent = () => {
    const [form] = Form.useForm();
    const [loading, isLoading] = useState(false);
    const [expiresIn, setExpiresIn] = useState<string | null>(null);
    const [scopes, setScopes] = useState<string[]>([]);
    const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
    const [collapseKey, setCollapseKey] = useState<string | string[] | undefined>();
    const [noScopesSelected, setNoScopesSelected] = useState<boolean>(false);

    //@ts-ignore
    const handleSubmit = async (values) => {
        try {
            if(scopes.length === 0){
                setNoScopesSelected(true);
                return;
            }

            isLoading(true);
            const accessToken = await AdminService.AccessToken.createAccessToken(values.name, values.expiresIn, scopes);
            setAccessToken(accessToken);

            //Reset
            form.resetFields();
            setScopes([]);
            setCollapseKey(undefined);
            setNoScopesSelected(false);
        } catch (e) {
            NotificationHandler.showErrorNotificationFromError(e as Error);
        } finally {
            isLoading(false);
        }
    };

    return (
        <div>
            <CardHeader title={"New Access Token"}/>
            {accessToken && <DisplayPersonalAccessTokenComponent accessToken={accessToken} style={{marginBottom: '20px'}}/>}
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
                <Form.Item label="Expiration" name={"expiresIn"}
                           rules={[{required: true, message: 'Please enter an expiration date!'}]}>

                    <Select
                        style={{width: 220}}
                        placeholder="Token-Dauer wählen"
                        onChange={setExpiresIn}
                    >
                        {durations.map(({label, value}) => (
                            <Option key={value} value={value}>
                                {label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <ScopeComponent collapseKey={collapseKey} onCollapse={setCollapseKey} scopes={scopes} onScopesSelected={setScopes} danger={noScopesSelected}/>
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

export default CreateAccessTokenComponent;
