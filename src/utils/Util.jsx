import _ from 'lodash';
import { BigNumber } from "bignumber.js";
import { Web3 } from "@dharmaprotocol/dharma.js";

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

export const niceNumberDisplay = (value,decimalPoint) => {
    let niceNumber = parseFloat(value);
    let decimal = (!_.isUndefined(decimalPoint)) ? decimalPoint : 3;
    niceNumber = (niceNumber > 0) ? niceNumber.toFixed(decimal).replace(/\d(?=(\d{3})+\.)/g, '$&,') : 0;
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

var getTransactionReceiptPromise = function(hash) {
  let web3js = window.web3 ? new Web3(window.web3.currentProvider) : '';
    return new Promise(function (resolve, reject) {
      web3js.eth.getTransactionReceipt(hash, function (err, data) {
        if (err !== null) reject(err);
        else resolve(data);
      });
    });
};

export const getTransactionReceipt = async (hash) => {
  try {
    let receipt = null;
    let data = '';
    while (receipt === null) {
      /*we are going to check every second if transation is mined or not, once it is mined we'll leave the loop*/
      data = await getTransactionReceiptPromise(hash);
      if (!_.isUndefined(data) && data != null && data.blockHash != null && data.blockHash != null && data.from != null && data.from != '' && data.to != null && data.to != '') {
        receipt = data;
      }
      /*can put sleep for one sec*/
    }
    return receipt;
  }
  catch (e) {
    console.log('We have the error', e);
  }
}