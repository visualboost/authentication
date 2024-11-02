import {MemoryRouterProps} from "react-router/dist/lib/components";
import {MemoryRouter} from "react-router-dom";
import {LoaderProvider} from "../../src/component/common/LoaderProvider";
import * as React from "react";

const TestMemoryRouter = (props: MemoryRouterProps) => {
    return (
        <LoaderProvider>
            <MemoryRouter initialEntries={[...props.initialEntries]}>
                {props.children}
            </MemoryRouter>
        </LoaderProvider>
    )
}


export default TestMemoryRouter;