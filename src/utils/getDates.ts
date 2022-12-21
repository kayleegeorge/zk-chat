export enum TimePeriod {
    Hour = "hour",
    Day = "day",
    Week = "week",
    Month = "month"
}

export function getDates(timePeriod: TimePeriod) {
    const startTime = new Date();
    switch(timePeriod) {
        case TimePeriod.Hour:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 1)
        case TimePeriod.Day:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 1)
        case TimePeriod.Week:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 7)
        case TimePeriod.Month:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 31)
    }
    
    const endTime = new Date();

    return { startTime, endTime }
}