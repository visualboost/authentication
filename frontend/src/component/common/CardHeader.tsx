import "./CardHeader.css"
import {Divider, Typography} from "antd";
const { Title } = Typography;

export interface CardHeaderProps {
    title: string;
    actions?: JSX.Element | null;
}

const CardHeader = (props: CardHeaderProps) => {

    return (
        <div className={"header"}>
            <div className={"content_header"}>
                <Title level={3}>{props.title}</Title>
                {props.actions}
            </div>
            <Divider/>
        </div>
    );
};

export default CardHeader;
