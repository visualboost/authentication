import {SystemRoles} from "./SystemRoles.ts";
import Scope from "./Scope.ts";

export class Admin {

    name: string;
    scopes: Array<string>;

    constructor() {
        this.name = SystemRoles.ADMIN
        this.scopes = [
            ...Scope.Scopes.getAllScopes(),
            ...Scope.User.getAllScopes(),
            ...Scope.Role.getAllScopes(),
            ...Scope.Blacklist.getAllScopes(),
            ...Scope.Settings.getAllScopes(),
            ...Scope.Statistics.getAllScopes(),
            ...Scope.Api.getAllScopes()
        ]
    }

}