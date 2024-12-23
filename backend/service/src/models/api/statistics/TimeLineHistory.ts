import {UserState} from "../../../constants/UserState.ts";

export class TimeLineHistory {

    last7Days: number
    last30Days: number;
    last3Months: number;
    last6Months: number;
    last12Months: number;

    constructor(last7Days: number, last30Days: number, last3Months: number, last6Months: number, last12Months: number) {
        this.last7Days = last7Days;
        this.last30Days = last30Days;
        this.last3Months = last3Months;
        this.last6Months = last6Months;
        this.last12Months = last12Months;
    }
}