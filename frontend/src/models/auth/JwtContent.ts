import {UserState} from "./UserState.ts";
import {SystemRoles} from "../user/SystemRoles.ts";

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

    isActive(): boolean{
        return this.getState() === UserState.ACTIVE;
    }


    isAdmin(): boolean{
        return this.getRole() === SystemRoles.ADMIN;
    }

    isValid(): boolean {
        return this.getUserId() !== undefined && this.getRole() !== undefined && this.getState() !== undefined;
    }
}