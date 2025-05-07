import "./AdminComponent.css";

import {PropsWithChildren, JSX, ReactNode} from 'react';
import ProgressComponent from "../common/ProgressComponent.tsx";
import CardHeader from "../common/CardHeader.tsx";

interface AdminDetailSectionComponentProps {
    enableLoading?: boolean
    title?: string;
    subtitle?: string;
    subtitleElement?: ReactNode;
    actions?: JSX.Element | null;
}

const AdminDetailSectionComponent = (props: PropsWithChildren<AdminDetailSectionComponentProps>) => {

    return (
        <div className={"admin_detail_section"}>
            {props.title && <CardHeader title={props.title} subtitle={props.subtitle} subtitleElement={props.subtitleElement} actions={props.actions}/>}
            {props.enableLoading &&
                <ProgressComponent>
                    {props.children}
                </ProgressComponent>
            }
            {!props.enableLoading && props.children}
        </div>
    );
};

AdminDetailSectionComponent.defaultProps = {
    enableLoading: true,
    title: null,
    actions: null
}

export default AdminDetailSectionComponent;
