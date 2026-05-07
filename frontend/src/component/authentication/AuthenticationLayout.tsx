import './Verification.css'
import {Outlet} from "react-router-dom";
import {isMobile} from "react-device-detect";
import {useUITheme} from "../settings/UIThemeProvider.tsx";

function AuthenticationLayout() {
    const {uiTheme} = useUITheme();

    return (
        <div style={{backgroundColor: uiTheme?.backgroundColor}} className={"verification-parent"}>
            <div style={{width: isMobile ? "95%" : "50%", maxWidth: isMobile ? undefined : "600px"}}>
                <Outlet/>
            </div>
        </div>
    )
}

export default AuthenticationLayout
