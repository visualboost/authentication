export class RoleResponse {

    id: string;
    name: string;
    description: string;
    createdAt: Date;

    constructor(id: string, name: string, description: string, createdAt: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }
}