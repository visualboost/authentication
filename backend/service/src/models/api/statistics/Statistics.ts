import {TimeLineHistory} from "./TimeLineHistory.ts";
import {SecurityStatistics} from "./SecurityStatistics.ts";
import {RoleStatistic} from "./RoleStatistic.ts";

export class Statistics {

    totalUsers: number
    newUsers: TimeLineHistory;
    deletedUsers: TimeLineHistory;
    activeUsers: TimeLineHistory;
    userOfRoles: Array<RoleStatistic>;
    failedLoginAttempts: TimeLineHistory;
    securityStatistics: SecurityStatistics;

    constructor(totalUsers: number, newUsers: TimeLineHistory, deletedUsers: TimeLineHistory, activeUsers: TimeLineHistory, userOfRoles: Array<RoleStatistic>, failedLoginAttempts: TimeLineHistory, securityStatistics: SecurityStatistics) {
        this.totalUsers = totalUsers;
        this.newUsers = newUsers;
        this.deletedUsers = deletedUsers;
        this.activeUsers = activeUsers;
        this.userOfRoles = userOfRoles;
        this.failedLoginAttempts = failedLoginAttempts;
        this.securityStatistics = securityStatistics;
    }
}