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

export const niceNumberDisplay = (value, decimalPoint) => {
  let niceNumber = 0;
  if(!_.isUndefined(value))
  {
    niceNumber = parseFloat(value);
    let decimal = (!_.isUndefined(decimalPoint)) ? decimalPoint : 3;
    let numberAsString = value.toString();
    if(numberAsString.indexOf('.') === -1) {
      niceNumber = (niceNumber > 0) ? numberAsString.replace(/\d(?=(\d{3})+\.)/g, '$&,') : 0;
    }
    else
    {
      niceNumber = (niceNumber > 0) ? niceNumber.toFixed(decimal).replace(/\d(?=(\d{3})+\.)/g, '$&,') : 0;  
    }
  }  
  return niceNumber;
}
export const tooltipNumberDisplay = (value, symbol, action = "append") => {
  let finalNumber = '';
  if(!_.isUndefined(value)){
    let niceNumber = parseFloat(value);
    let numberAsString = value.toString();
    niceNumber = (niceNumber > 0) ? numberAsString.replace(/\d(?=(\d{3})+\.)/g, '$&,') : 0;
    if(!_.isUndefined(symbol))
    {
      finalNumber = action == "append" ? niceNumber + " " + symbol : symbol + " " + niceNumber;  
    }
    else
    {
      finalNumber = niceNumber;
    }
  }
  return finalNumber;
}
export const convertBigNumber = (obj, power) => {
  let responseNumber = 0;
  if (_.isObject(obj)) {
    responseNumber = obj.div(new BigNumber(10).pow(power.toNumber()));
  }
  else {
    let decimal = "1E" + power;
    let amount = obj / decimal;
    responseNumber = amount;
  }
  responseNumber = (responseNumber > 0) ? parseFloat(responseNumber) : 0;
  return responseNumber;
}

var getTransactionReceiptPromise = function (hash) {
  let web3js = window.web3 ? new Web3(window.web3.currentProvider) : '';
  return new Promise(function (resolve, reject) {
    web3js.eth.getTransactionReceipt(hash, function (err, data) {
      if (err !== null) reject(err);
      else resolve(data);
    });
  });
};

var timeOut = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getTransactionReceipt = async (hash) => {
  try {
    let receipt = null;
    let data = '';
    while (receipt === null) {
      /*we are going to check every second if transation is mined or not, once it is mined we'll leave the loop*/
      data = await getTransactionReceiptPromise(hash);
      if (!_.isUndefined(data) && data != null && data.blockHash != null && data.blockHash != null && data.from != null && data.from != '' && data.to != null && data.to != '') {
        receipt = data;
        await timeOut(2000);
      }
      /*can put sleep for one sec*/
    }
    return receipt;
  }
  catch (e) {
    console.log('We have the error', e);
  }
}