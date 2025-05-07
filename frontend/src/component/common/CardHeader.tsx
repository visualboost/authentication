import "./CardHeader.css"
import {Divider, Flex, Typography} from "antd";
import {ReactNode} from "react";
const { Title, Paragraph } = Typography;

export interface CardHeaderProps {
    title: string;
    subtitle?: string;
    subtitleElement?: ReactNode;
    actions?: JSX.Element | null;
}

const CardHeader = (props: CardHeaderProps) => {

    return (
        <div className={"header"}>
            <div className={"content_header"}>
                <Flex vertical={true}>
                    <Title style={{marginBottom: "0.2em"}} level={3}>{props.title}</Title>
                    {props.subtitle && <Paragraph>{props.subtitle}</Paragraph>}
                    {props.subtitleElement && props.subtitleElement}
                </Flex>
                {props.actions && <Flex vertical={false} justify={"flex-end"} align={"flex-end"}>{props.actions}</Flex>}
            </div>
            <Divider/>
        </div>
    );
};

export default CardHeader;
