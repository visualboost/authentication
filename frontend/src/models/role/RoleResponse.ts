import {SystemRoles} from "../user/SystemRoles.ts";

export class RoleResponse {

    id: string;
    name: string;
    description: string;
    createdAt: Date;
    isSystemRole: boolean;

    constructor(id: string, name: string, description: string, createdAt: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.isSystemRole = name === SystemRoles.ADMIN || name === SystemRoles.USER;
    }

    isAdmin(): boolean{
        return this.name === SystemRoles.ADMIN;
    }
}