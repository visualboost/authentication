import {UserState} from "../../constants/UserState.ts";
import {SystemRoles} from "../../constants/role/SystemRoles.ts";

export class JwtContent {
    private userId: string;
    private role: string;
    private scopes: string[];
    private state: UserState;

    constructor(userId: string, role: string, scopes: string[], state: UserState) {
        this.userId = userId;
        this.role = role;
        this.scopes = scopes || [];
        this.state = state;
    }

    getUserId(): string {
        return this.userId;
    }

    getRole(): string {
        return this.role;
    }

    getScopes(): string[] {
        return this.scopes;
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

    /**
     * Check if the jwt token contains one of the
     * @param scopes
     */
    containsScopes(...scopes: string[]): boolean {
        if(scopes.length === 0) return false;
        return scopes.every(scope => this.getScopes().includes(scope));
    }


    isValid(): boolean {
        return this.getUserId() !== undefined && this.getRole() !== undefined && this.scopes !== undefined && this.getState() !== undefined;
    }
}