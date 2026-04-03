interface DataPoint {
    date: Date;
    value: number;
}

export const simpleLinearRegression = (data: DataPoint[], daysToForecast: number) => {
    if (data.length < 2) return [];

    let xSum = 0;
    let ySum = 0;
    let xySum = 0;
    let xxSum = 0;
    const n = data.length;

    data.forEach((point, i) => {
        xSum += i;
        ySum += point.value;
        xySum += i * point.value;
        xxSum += i * i;
    });

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    const forecast: DataPoint[] = [];
    const lastDate = data[data.length - 1].date;

    for (let i = 1; i <= daysToForecast; i++) {
        const nextValue = slope * (n - 1 + i) + intercept;
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);

        forecast.push({
            date: nextDate,
            value: Math.max(0, nextValue) // Prevent negative consumption
        });
    }

    return forecast;
};
