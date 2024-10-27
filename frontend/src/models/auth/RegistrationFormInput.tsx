export class RegistrationFormInput{

    username: string;
    email: string | null;
    password: string;
    privacyPolicyChecked: boolean;

    constructor(username: string, email: string | null, password: string, privacyPolicyChecked: boolean) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.privacyPolicyChecked = privacyPolicyChecked;
    }
}