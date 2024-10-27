import {Button, Result} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import {AuthenticationService} from "../../../api/AuthenticationService.tsx";
import {Routes} from "../../../models/Routes.tsx";
import {useNavigate} from "react-router-dom";

const RegistrationConfirmedComponent = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="success"
            title="Registration Successful!"
            subTitle="You have successfully registered your account."
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '48px' }} />}
            extra={[
                <Button type="primary" key="logout" onClick={async () => {
                    await AuthenticationService.logout();
                    navigate(Routes.ROOT)
                }}>
                    Login
                </Button>,
            ]}
        />
    );
};

export default RegistrationConfirmedComponent;
