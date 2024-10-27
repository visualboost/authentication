export class BlackListItem {

    ip: string | null;
    email: string | null;
    createdAt: Date | null;

    constructor(ip: string | null,email: string | null, createdAt: Date | null) {
        this.ip = ip;
        this.email = email;
        this.createdAt = createdAt;
    }
}