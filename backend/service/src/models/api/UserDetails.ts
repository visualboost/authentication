import {UserState} from "../../constants/UserState.ts";

export class UserDetails {

    _id: string;
    ip: string;
    username: string;
    email: string;
    role: string;
    state: UserState;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;

    constructor(id: string, ip: string, username: string, email: string, role: string, state: UserState, createdAt: Date, updatedAt: Date, lastLogin: Date) {
        this._id = id;
        this.ip = ip;
        this.username = username;
        this.email = email;
        this.role = role;
        this.state = state;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLogin = lastLogin;
    }
}