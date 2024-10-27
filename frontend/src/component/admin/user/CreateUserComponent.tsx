import {Tabs} from 'antd';
import CardHeader from "../../common/CardHeader.tsx";
import UserInputForm from "./UserInputForm.tsx";
import UserInvitationForm from "./UserInvitationForm.tsx";
import {MdOutlineMarkEmailUnread} from "react-icons/md";
import {UserAddOutlined} from "@ant-design/icons";

const CreateUserOptions = [
    {
        icon: <UserAddOutlined/>,
        label: "Create User",
        key: "create_user",
        children: <UserInputForm/>,
    },
    {
        icon: <MdOutlineMarkEmailUnread/>,
        label: "Invite User",
        key: "invite_user",
        children: <UserInvitationForm/>,
    }
]


const CreateUserComponent = () => {
    return (
        <div>
            <CardHeader title={"Add User"}/>
            <Tabs
                defaultActiveKey="1"
                tabPosition={"right"}
                style={{height: '100%'}}
                items={CreateUserOptions}
            />
        </div>
    );
};

export default CreateUserComponent;
