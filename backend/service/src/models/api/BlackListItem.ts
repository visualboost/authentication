export class BlackListItem {

    ip: string;
    email: string;
    createdAt: Date;

    constructor(ip: string,email: string, createdAt: Date) {
        this.ip = ip;
        this.email = email;
        this.createdAt = createdAt;
    }
}