import './App.css'
import {Outlet, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {SystemStateService} from "./api/SystemStateService.tsx";
import {Routes} from "./models/Routes.tsx";
import ProgressComponent from "./component/common/ProgressComponent.tsx";
import ServiceUnavailableError from "./models/errors/ServiceUnavailableError.ts";
import {useLoader} from "./component/common/LoaderProvider.tsx";

function App() {
    const navigate = useNavigate();
    const {showProgress, hideProgress} = useLoader();

    useEffect(() => {
        handleSystemState();
    }, [])

    const handleSystemState = async () => {
        try {
            showProgress();

            //Request xsfr token
            await SystemStateService.getXsfrToken();
            navigate(Routes.AUTHENTICATION);
        } catch (e) {
            navigate(Routes.Error.getErrorRoute(new ServiceUnavailableError().status));
        } finally {
            hideProgress()
        }
    }

    return (
        <div>
            <ProgressComponent>
                <Outlet/>
            </ProgressComponent>
        </div>
    )
}

export default App
