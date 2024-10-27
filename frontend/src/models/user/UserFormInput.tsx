export class UserFormInput{

    username: string;
    email: string;
    password: string;
    role: string;

    constructor(username: string, email: string, password: string, role: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}