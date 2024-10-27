export class TimeUtil {

    static minutesToMillis = (expiresInMinutes: number) => {
        return (1000 * 60 * expiresInMinutes)
    }

    static hoursToMillis = (expiresInHours: number) => {
        return TimeUtil.minutesToMillis(60) * expiresInHours;
    }

    static createTimeInMinutes = (expiresInMinutes: number) => {
        return Date.now() + TimeUtil.minutesToMillis(expiresInMinutes)
    }

    static createTimeInHours = (expiresInHours: number) => {
        return Date.now() +  TimeUtil.hoursToMillis(expiresInHours)
    }
}