import {LoaderProvider} from "../../src/component/common/LoaderProvider";
import * as React from "react";
import type {Router as RemixRouter} from "@remix-run/router/dist/router";
import {RouterProvider} from "react-router-dom";

export interface TestRouterProviderProps{
    router: RemixRouter;
}

const TestRouterProvider = (props: TestRouterProviderProps) => {
    return(
        <LoaderProvider>
            <RouterProvider router={props.router}/>
        </LoaderProvider>
    )
}


export default TestRouterProvider;