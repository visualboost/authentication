import './App.css'
import {router} from "./router/Router.tsx";
import {RouterProvider} from "react-router-dom";
import {LoaderProvider} from "./component/common/LoaderProvider.tsx";

function AppRouterProvider() {

    return (
        <LoaderProvider>
            <RouterProvider router={router}/>
        </LoaderProvider>
    )
}

export default AppRouterProvider
