import {Button, Result} from 'antd';
import {CheckCircleOutlined} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import {Routes} from "../../../models/Routes.tsx";
import {AuthenticationService} from "../../../api/AuthenticationService.tsx";

const EmailChangedConfirmComponent = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="success"
            title="Email Address Changed Successfully!"
            subTitle="Your email address has been successfully updated. Please log out and log back in for the changes to take effect."
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '48px' }} />}
            extra={[
                <Button type={"primary"} key="logout" onClick={async () => {
                    await AuthenticationService.logout();
                    navigate(Routes.ROOT)
                }}>
                    Logout
                </Button>,
            ]}
        />
    );
};

export default EmailChangedConfirmComponent;
