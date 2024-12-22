export class RoleResponse {

    id: string;
    name: string;
    description: string;
    createdAt: Date;
    scopes: string[];

    constructor(id: string, name: string, description: string, createdAt: Date, scopes: string[] = []) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.scopes = scopes;
    }
}