import {useState} from 'react';
import {Form, Input, Button, message, Flex} from 'antd';
import {UserFormInput} from "../../../models/user/UserFormInput.tsx";
import {AdminService} from "../../../api/AdminService.tsx";
import RoleSelectComponent from "../role/RoleSelectComponent.tsx";
import {MdSave} from "react-icons/md";
import AnimatedAlert from "../../common/AnimatedAlert.tsx";
import ConflictError from "../../../models/errors/ConflictError.ts";
import FailedDependencyError from "../../../models/errors/FailedDependencyError.ts";


const UserInputForm = () => {
    const [loading, isLoading] = useState(false);
    const [enabled, isEnabled] = useState(true);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form] = Form.useForm();

    //@ts-ignore
    const addUser = async (values) => {
        try{
            isLoading(true);
            isEnabled(false)

            const input = new UserFormInput(values.username, values.email, values.password, values.role);
            await AdminService.User.addUser(input);

            setSuccessMsg(`The user was successfully created. We also sent a confirmation email to ${values.email}.`)
            form.resetFields();
        }catch (e){
            if(e instanceof ConflictError){
                setErrorMsg(`A user with the mail address ${values.email} does already exist or you did provide an invalid user role`);
            }else if(e instanceof FailedDependencyError){
                setErrorMsg(`Failed to reach ${values.email}. Please make sure that you entered a valid email address.`)
            }else{
                message.error((e as Error).message)
            }
        }finally {
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
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input the username!' }]}
                >
                    <Input placeholder="Enter username" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input the email address!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                    ]}
                >
                    <Input placeholder="Enter email address" />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: 'Please select a role!' }]}
                >
                    <RoleSelectComponent style={{width: '100%'}} onRoleChanged={(role) => {
                        form.setFieldValue("role", role)
                    }}/>
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input the password!' }]}
                >
                    <Input.Password placeholder="Enter password" />
                </Form.Item>

                <Form.Item>
                    <Flex justify={"flex-end"} align={"flex-end"}>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<MdSave/>}>
                            Add
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

export default UserInputForm;
