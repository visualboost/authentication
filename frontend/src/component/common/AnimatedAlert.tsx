import "../../animations.css";
import {Alert, AlertProps} from "antd";
import {CSSTransition} from "react-transition-group";

interface AnimatedAlertProps extends AlertProps {
    show: boolean;
    duration: number;
    onHide: () => void;
}

const AnimatedAlert = (props: AnimatedAlertProps) => {

    if (props.show) {
        setTimeout(() => {
            props.onHide();
        }, props.duration)
    }

    return (
        <CSSTransition
            in={props.show}
            timeout={300}
            classNames="alert"
            unmountOnExit
        >
            <Alert
                {...props}
                onClose={props.onHide}
            />
        </CSSTransition>

    );
};


export default AnimatedAlert;
