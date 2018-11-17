import _ from 'lodash';
import { BigNumber } from "bignumber.js";

export const amortizationUnitToFrequency = (unit) => {
    let frequency = "";
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

export const niceNumberDisplay = (value) => {
    let niceNumber = parseFloat(value);
    niceNumber = (niceNumber > 0) ? niceNumber.toFixed(3) : 0;
    return niceNumber;
}
export const convertBigNumber= (obj,power) => {
    let responseNumber = 0;
    if(_.isObject(obj)){
      responseNumber = obj.div(new BigNumber(10).pow(power.toNumber()));  
    }
    else{
      let decimal = "1E" + power;
      let amount = obj / decimal;
      responseNumber = amount; 
    }
    responseNumber = (responseNumber > 0) ? parseFloat(responseNumber) : 0;
    return responseNumber;
  }