import {SystemState} from "../../constants/SystemState.ts";

export class SystemStateResponse {

    state: SystemState;

    constructor(state: SystemState) {
        this.state = state;
    }

    static InitializedState(): SystemStateResponse {
        return new SystemStateResponse(SystemState.INITIALIZED)
    }

    static NotInitializedState(): SystemStateResponse {
        return new SystemStateResponse(SystemState.NOT_INITIALIZED)
    }
}