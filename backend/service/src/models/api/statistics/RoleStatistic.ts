import {TimeLineHistory} from "./TimeLineHistory.ts";
import {SecurityStatistics} from "./SecurityStatistics.ts";

export class RoleStatistic {

    role: string;
    totalUsers: number

    constructor(role: string, totalUsers: number) {
        this.role = role;
        this.totalUsers = totalUsers;
    }
}