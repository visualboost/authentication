export class PrivacyPolicyOptions {

    showPrivacyPolicy: boolean;
    privacyPolicyUrl: string | null;

    constructor(showPrivacyPolicy: boolean, privacyPolicyUrl: string | null) {
        this.showPrivacyPolicy = showPrivacyPolicy;
        this.privacyPolicyUrl = privacyPolicyUrl;
    }
}