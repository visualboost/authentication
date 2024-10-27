import {useState} from 'react';
import {Button, Flex, Form, Input, message} from 'antd';
import RoleSelectComponent from "../role/RoleSelectComponent.tsx";
import {MdEmail} from "react-icons/md";
import AnimatedAlert from "../../common/AnimatedAlert.tsx";
import {AdminService} from "../../../api/AdminService.tsx";
import {InvitationFormInput} from "../../../models/user/InvitationFormInput.tsx";
import FailedDependencyError from "../../../models/errors/FailedDependencyError.ts";
import ConflictError from "../../../models/errors/ConflictError.ts";

const UserInvitationForm = () => {
    const [loading, isLoading] = useState(false);
    const [enabled, isEnabled] = useState(true);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form] = Form.useForm();

    const addUser = async (values: InvitationFormInput) => {
        try {
            isLoading(true);
            isEnabled(false)

            const input = new InvitationFormInput(values.name, values.email, values.role);
            await AdminService.User.inviteUser(input);

            setSuccessMsg(`The email has been successfully sent to ${values.email}.If the user has not received the invitation, please check the spam filter and, if necessary, add the sender's email address to the whitelist of your email provider.`)
            form.resetFields();
        } catch (e) {
            if(e instanceof ConflictError){
                setErrorMsg(`A user with the mail address ${values.email} does already exist or you did provide an invalid user role`);
            }else if(e instanceof FailedDependencyError){
                setErrorMsg(`Failed to reach ${values.email}. Please make sure that you entered a valid email address.`)
            }else{
                message.error((e as Error).message)
            }
        } finally {
            isLoading(false);
            isEnabled(true)
        }
    }

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                name="user_input_form"
                onFinish={addUser}
                disabled={!enabled}
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        {required: true, message: 'Please input a name'}
                    ]}
                >
                    <Input placeholder="Enter a name"/>
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {required: true, message: 'Please input the email address!'},
                        {type: 'email', message: 'Please enter a valid email address!'},
                    ]}
                >
                    <Input placeholder="Enter email address"/>
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{required: true, message: 'Please select a role!'}]}
                >
                    <RoleSelectComponent style={{width: '100%'}} onRoleChanged={(role) => {
                        form.setFieldValue("role", role)
                    }}/>
                </Form.Item>

                <Form.Item>
                    <Flex justify={"flex-end"} align={"flex-end"}>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<MdEmail/>}>
                            Send invitation mail
                        </Button>
                    </Flex>
                </Form.Item>
            </Form>

            <AnimatedAlert
                show={successMsg !== null}
                duration={10000}
                onHide={() => setSuccessMsg(null)}
                description={successMsg}
                type="success"
                showIcon
                closable
            />

            <AnimatedAlert
                show={errorMsg !== null}
                duration={10000}
                onHide={() => setErrorMsg(null)}
                description={errorMsg}
                type="error"
                showIcon
                closable
            />

        </div>
    );
};

export default UserInvitationForm;
