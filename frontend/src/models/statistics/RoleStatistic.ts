export class RoleStatistic {

    role: string;
    totalUsers: number

    constructor(role: string, totalUsers: number) {
        this.role = role;
        this.totalUsers = totalUsers;
    }

    static fromJson(json: Array<RoleStatistic>): Array<RoleStatistic> {
        return json.map(roleStatistic =>  new RoleStatistic(roleStatistic.role, roleStatistic.totalUsers));
    }
}