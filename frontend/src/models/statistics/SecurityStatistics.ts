export class SecurityStatistics {

    blockedEmails: number;
    blockedIPs: number;

    constructor(blockedEmails: number, blockedIPs: number) {
        this.blockedEmails = blockedEmails;
        this.blockedIPs = blockedIPs;
    }

    static fromJson(json: SecurityStatistics): SecurityStatistics{
        return new SecurityStatistics(json.blockedEmails, json.blockedIPs)
    }
}