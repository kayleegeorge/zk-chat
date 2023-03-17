export declare enum TimePeriod {
    Hour = "hour",
    Day = "day",
    Week = "week",
    Month = "month"
}
export declare function getDates(timePeriod: TimePeriod): {
    startTime: Date;
    endTime: Date;
};
