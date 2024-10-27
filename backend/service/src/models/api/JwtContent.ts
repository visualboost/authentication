import {UserState} from "../../constants/UserState.ts";
import {SystemRoles} from "../../constants/SystemRoles.ts";

export class JwtContent {
    private userId: string;
    private role: string;
    private state: UserState;

    constructor(userId: string, role: string, state: UserState) {
        this.userId = userId;
        this.role = role;
        this.state = state;
    }

    getUserId(): string {
        return this.userId;
    }

    getRole(): string {
        return this.role;
    }

    getState(): UserState {
        return this.state;
    }

    getModificationId(): string | null {
        //@ts-ignore
        return this.getHook().modificationId || null;
    }

    isAdmin(): boolean {
        return this.getRole() === SystemRoles.ADMIN;
    }

    userIsActive(): boolean {
        //@ts-ignore
        return parseInt(this.getState() || UserState.UNKNOWN) === UserState.ACTIVE
    }


    isValid(): boolean {
        return this.getUserId() !== undefined && this.getRole() !== undefined && this.getState() !== undefined;
    }
}