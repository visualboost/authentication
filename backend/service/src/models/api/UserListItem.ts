import {UserState} from "../../constants/UserState.ts";

export class UserListItem {

    id: string
    username: string;
    email: string;
    state: UserState;
    role: string;
    createdAt: Date;
    lastLogin: Date;


    constructor(id: string, username: string, email: string, state: UserState, role: string, createdAt: Date, lastLogin: Date) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.state = state;
        this.role = role;

        this.lastLogin = lastLogin;
        this.createdAt = createdAt;

    }
}