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
            break
        case TimePeriod.Day:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 1)
            break
        case TimePeriod.Week:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 7)
            break
        case TimePeriod.Month:
            startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 31)
            break
    }
    
    const endTime = new Date();

    return { startTime, endTime }
}