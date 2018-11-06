export const amortizationUnitToFrequency = (unit: string) => {
    let frequency: string = "";
    switch (unit) {
        case "hours":
            frequency = "Hourly";
            break;
        case "days":
            frequency = "Daily";
            break;
        case "weeks":
            frequency = "Weekly";
            break;
        case "months":
            frequency = "Monthly";
            break;
        case "years":
            frequency = "Yearly";
            break;
        default:
            break;
    }
    return frequency;
};

export const niceNumberDisplay = (value: number) => {
    let niceNumber = parseFloat(value);
    niceNumber = (niceNumber > 0) ? niceNumber.toFixed(2) : 0;
    return niceNumber;
}
