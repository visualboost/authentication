export class SecurityStatistics {

    blockedEmails: number;
    blockedIPs: number;

    constructor(blockedEmails: number, blockedIPs: number) {
        this.blockedEmails = blockedEmails;
        this.blockedIPs = blockedIPs;
    }
}