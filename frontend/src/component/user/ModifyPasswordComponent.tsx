import {useState} from 'react';
import {UserService} from "../../api/UserService.tsx";
import ChangePasswordComponent from "./ChangePasswordComponent.tsx";
import {Alert} from "antd";

const ModifyPasswordComponent = () => {
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const handleSetPassword = async (newPassword: string, currentPassword: string | null) => {
        if (!currentPassword) return;
        await UserService.modifyPassword(currentPassword, newPassword);
        setShowSuccessAlert(true);
    }

    return (
        <div>
            <ChangePasswordComponent changePassword={handleSetPassword} showCurrentPassword={true}/>
            {showSuccessAlert && <Alert style={{marginTop: '20px'}}
                                        message="We've send an email to confirm your new password. After confirmation, logout and login again"
                                        type="success"/>}
        </div>

    );
};

export default ModifyPasswordComponent;
