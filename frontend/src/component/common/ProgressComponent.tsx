import {Flex, Spin} from "antd";
import {PropsWithChildren} from "react";
import {useLoader} from "./LoaderProvider.tsx";

const ProgressComponent = (props: PropsWithChildren) => {
    const { loading } = useLoader();

    return (
        <div style={{height: "100%"}}>
            {loading &&
                <Flex style={{height: 'calc(100% - 150px)', width: '100%'}} align={"center"} justify={"center"}>
                    <Spin/>
                </Flex>
                }
            {!loading && props.children}
        </div>
    );
};


export default ProgressComponent;
