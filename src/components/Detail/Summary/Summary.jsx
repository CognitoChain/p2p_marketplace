import React, { Component } from "react";
import { Card, CardBody, CardTitle, ListGroup } from "reactstrap";
import * as moment from "moment-timezone";
import _ from "lodash";
import { niceNumberDisplay } from "../../../utils/Util";
import SummaryItem from "../SummaryItem/SummaryItem";

class Summary extends Component {
  render() {
    const { loanDetails, priceFeeds } = this.props;
    let {
      principalAmount,
      createdDate,
      collateral,
      collateralAmount,
      collateralSymbol,
      termLengthAmount,
      termLengthUnit,
      principalSymbol,
      interestRatePercent,
      totalRepaymentAmountDisplay
    } = loanDetails;
    let createdTime = moment(createdDate).format(
      "HH:mm:ss"
    );
    createdDate = moment(createdDate).format(
      "DD/MM/YYYY"
    );
    
    let interestRate = parseFloat(interestRatePercent);
    let interestAmount = (principalAmount * parseFloat(interestRate)) / 100;
    let collateralCurrentAmount = 0;
    let collateralCurrentAmountDisplay = "";
    let LTVRatioValue = '';
    let LTVRatioValueDisplay = '';
    let principalCurrentAmount = 0;
    if (!_.isEmpty(priceFeeds)) {
      let pricePrincipalSymbol = (principalSymbol == "WETH" && _.isUndefined(priceFeeds[principalSymbol])) ? "ETH" : principalSymbol;
      let priceCollateralSymbol = (collateralSymbol == "WETH" && _.isUndefined(priceFeeds[collateralSymbol])) ? "ETH" : collateralSymbol;
      if(!_.isUndefined(priceFeeds[pricePrincipalSymbol]))
      {
        let principalTokenCurrentPrice = priceFeeds[pricePrincipalSymbol].USD;
        principalCurrentAmount = parseFloat(principalAmount) * principalTokenCurrentPrice;
      }  
      if(!_.isUndefined(priceFeeds[priceCollateralSymbol])){
        let collateralTokenCurrentPrice = priceFeeds[priceCollateralSymbol].USD;
        collateralCurrentAmount = parseFloat(collateralAmount) * collateralTokenCurrentPrice;
        collateralCurrentAmountDisplay = niceNumberDisplay(collateralCurrentAmount);  
      }
      
      if (principalCurrentAmount > 0 && collateralCurrentAmount > 0) {
        LTVRatioValue = (principalCurrentAmount / collateralCurrentAmount) * 100;
        LTVRatioValueDisplay = niceNumberDisplay(LTVRatioValue);
      }
    }
    return (
      <Card className="card-statistics h-100 p-4">
        <CardBody>
          <CardTitle>More Details </CardTitle>
          <div
            className="scrollbar"
            tabIndex={2}
            style={{ overflowY: "hidden", outline: "none" }}
          >
            <ListGroup className="list-unstyled to-do">
              <SummaryItem
                labelName="Created Date"
                labelValue={createdDate != "" ? createdDate : ' - '}
                labelValue2={createdTime != "" ? createdTime : ''}
              />
              <SummaryItem
                labelName="Collateral Amount"
                labelValue={collateral > 0 ? niceNumberDisplay(collateral) : ' - '}
                labelValue2={collateral > 0 ? collateralSymbol : ''}
              />
              <SummaryItem
                labelName="Collateral Value"
                labelValue={collateralCurrentAmountDisplay > 0 ? collateralCurrentAmountDisplay : ' - '}
                labelValue2={collateralCurrentAmountDisplay > 0 ? '$' : ''}
              />
              <SummaryItem
                labelName="LTV"
                labelValue={LTVRatioValueDisplay > 0 ? LTVRatioValueDisplay : ' - '}
                labelValue2={LTVRatioValueDisplay > 0 ? '%' : ''}
              />
              <SummaryItem
                labelName="Loan Term"
                labelValue={termLengthAmount > 0 ? termLengthAmount : ' - '}
                labelValue2={termLengthAmount > 0 ? termLengthUnit : ''}
              />
              <SummaryItem
                labelName="Interest Rate(Per Loan Term)"
                labelValue={interestRate > 0 ? niceNumberDisplay(interestRate,2) : ' - '}
                labelValue2={interestRate > 0 ? '%' : ''}
              />
              <SummaryItem
                labelName="Interest Amount"
                labelValue={interestAmount > 0 ? niceNumberDisplay(interestAmount) : ' - '}
                labelValue2={interestAmount > 0 ? principalSymbol : ' - '}
              />
              <SummaryItem
                labelName="Total Repayment Amount"
                labelValue={totalRepaymentAmountDisplay > 0 ? totalRepaymentAmountDisplay : ' - '}
                labelValue2={totalRepaymentAmountDisplay > 0 ? principalSymbol : ' - '}
              />
            </ListGroup>
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default Summary;
