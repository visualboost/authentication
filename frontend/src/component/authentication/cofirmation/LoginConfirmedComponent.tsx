import {Button, Result} from 'antd';
import {CheckCircleOutlined} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import {Routes} from "../../../models/Routes.tsx";
import {AuthenticationService} from "../../../api/AuthenticationService.tsx";


const LoginConfirmedComponent = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="success"
            title="Login Successful!"
            subTitle="You have successfully logged into your account."
            icon={<CheckCircleOutlined style={{color: '#52c41a', fontSize: '48px'}}/>}
            extra={[
                <Button type="primary" key="logout" onClick={async () => {
                    await AuthenticationService.logout();
                    navigate(Routes.ROOT)
                }}>
                    Logout
                </Button>,
            ]}
        />
    );
};

export default LoginConfirmedComponent;
