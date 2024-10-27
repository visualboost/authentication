export class InvitationToken {
    private userInvitationId: string;

    constructor(userInvitationId: string) {
        this.userInvitationId = userInvitationId;
    }

    getUserInvitationId(): string {
        return this.userInvitationId;
    }
}