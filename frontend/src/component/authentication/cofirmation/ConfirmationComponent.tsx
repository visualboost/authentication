import {Outlet} from "react-router-dom";

const ConfirmationComponent = () => {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f2f5',
        }}>
            <Outlet/>
        </div>
    );
};

export default ConfirmationComponent;
