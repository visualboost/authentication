import {Tag} from 'antd';
import {UserState} from "../../../models/auth/UserState.ts";

interface StateComponentProps {
    state: UserState
}

const StateComponent = (props: StateComponentProps) => {

    const renderState = () => {
        if (props.state === UserState.PENDING) {
            return <Tag color="processing">PENDING</Tag>
        } else if (props.state === UserState.ACTIVE) {
            return <Tag color="success">ACTIVE</Tag>
        } else if (props.state === UserState.BLOCKED) {
            return <Tag color="error">INACTIVE</Tag>
        }
    }

    return renderState();
};

export default StateComponent;
