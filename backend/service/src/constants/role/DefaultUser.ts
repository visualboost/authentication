import {SystemRoles} from "./SystemRoles.ts";

export class DefaultUser {

    name: string;
    scopes: Array<string>;

    constructor() {
        this.name = SystemRoles.USER
        this.scopes = []
    }

}