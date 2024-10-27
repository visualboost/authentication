import {Button, Modal} from "antd";
import {JSX} from "react";

export interface ModalComponentProps {
    open: boolean
    title: string | null;
    okBtnTxt: string;
    okAction: () => void;
    onClose: () => void;
    danger: boolean | null,
    children: JSX.Element;
}

const ModalComponent = (props: ModalComponentProps) => {

    return (
        <Modal
            open={props.open}
            title={props.title}
            centered
            onCancel={props.onClose}
            footer={(_, {CancelBtn}) => (
                <>
                    <CancelBtn/>
                    <Button type={"primary"} danger={props.danger || false}
                            onClick={props.okAction}>{props.okBtnTxt}</Button>
                </>
            )}
        >
            {props.children}
        </Modal>
    );
};

const createProps = (open: boolean, title: string | null, okBtnTxt: string, okAction: () => void, onClose: () => void, danger: boolean, children: JSX.Element): ModalComponentProps => {
    return {
        open: open,
        title: title,
        okBtnTxt: okBtnTxt,
        okAction: okAction,
        onClose: onClose,
        danger: danger,
        children: children
    }
}

export {
    ModalComponent,
    createProps
};
