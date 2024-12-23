import {SystemRoles} from "../user/SystemRoles.ts";

export class RoleResponse {

    id: string;
    name: string;
    description: string;
    createdAt: Date;
    isSystemRole: boolean;
    scopes: string[];

    constructor(id: string, name: string, description: string, createdAt: Date, scopes: string[] = []) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.isSystemRole = name === SystemRoles.ADMIN || name === SystemRoles.USER;
        this.scopes = scopes;
    }

    isAdmin(): boolean{
        return this.name === SystemRoles.ADMIN;
    }
}