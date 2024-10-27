import {Button, notification} from "antd";
import {FiCopy} from "react-icons/fi";

interface CopyToClipboardButtonProps {
    value: string | undefined;
}

const CopyToClipboardButton = (props: CopyToClipboardButtonProps) => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = () => {
        api.success({
            message: `Copied value to clipboard`,
            placement: "bottomRight"
        });
    };

    const handleCopyToClipboard = () => {
        if (!props.value) return;
        navigator.clipboard.writeText(props.value)
        openNotification();
    }

    return (
        <>
            {contextHolder}
            <Button type={"text"} icon={<FiCopy/>} onClick={handleCopyToClipboard}></Button>
        </>
    );
};


export default CopyToClipboardButton;
