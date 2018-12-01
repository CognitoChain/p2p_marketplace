import React, { Component } from "react";
import { Card, CardBody, CardTitle, ListGroup } from "reactstrap";
import * as moment from "moment-timezone";
import _ from "lodash";
import { niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
import SummaryItem from "../SummaryItem/SummaryItem";

class Summary extends Component {
  render() {
    const { loanDetails, priceFeeds } = this.props;
    let {
      principalAmount,
      createdDate,
      collateralAmount,
      collateralSymbol,
      termLengthAmount,
      termLengthUnit,
      principalSymbol,
      interestRatePercent,
      debtorAddress,
      creditorAddress,
      totalRepaymentAmount
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
    let LTVRatioValue = '';
    let principalCurrentAmount = 0;
    let debtorAddressDisplay = debtorAddress.substr(0,4)+'....'+debtorAddress.substr(-4);
    let creditorAddressDisplay = creditorAddress.substr(0,4)+'....'+creditorAddress.substr(-4);
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
      }
      
      if (principalCurrentAmount > 0 && collateralCurrentAmount > 0) {
        LTVRatioValue = (principalCurrentAmount / collateralCurrentAmount) * 100;
      }
    }
    return (
      <Card className="card-statistics h-100 p-4">
        <CardBody>
          <CardTitle>More Details </CardTitle>
          <div
            tabIndex={2}
          >
            <ListGroup className="list-unstyled to-do">
              <SummaryItem
                labelName="Created Date"
                labelValue={createdDate != "" ? createdDate : ' - '}
                labelValue2={createdTime != "" ? createdTime : ''}
              />
              <SummaryItem
                labelName="Collateral Amount"
                labelValue={collateralAmount > 0 ? niceNumberDisplay(collateralAmount) : ' - '}
                labelValue2={collateralAmount > 0 ? collateralSymbol : ''}
                tooltipValue={tooltipNumberDisplay(collateralAmount,collateralSymbol)}
              />
              <SummaryItem
                labelName="Collateral Value"
                labelValue={collateralCurrentAmount > 0 ? niceNumberDisplay(collateralCurrentAmount) : ' - '}
                labelValue2={collateralCurrentAmount > 0 ? '$' : ''}
                tooltipValue={tooltipNumberDisplay(collateralCurrentAmount,"$","prepend")}
              />
              <SummaryItem
                labelName="LTV"
                labelValue={LTVRatioValue > 0 ? niceNumberDisplay(LTVRatioValue) : ' - '}
                labelValue2={LTVRatioValue > 0 ? '%' : ''}
                tooltipValue={tooltipNumberDisplay(LTVRatioValue,"%")}
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
                tooltipValue={tooltipNumberDisplay(interestRate)}
              />
              <SummaryItem
                labelName="Interest Amount"
                labelValue={interestAmount > 0 ? niceNumberDisplay(interestAmount) : ' - '}
                labelValue2={interestAmount > 0 ? principalSymbol : ' - '}
                tooltipValue={tooltipNumberDisplay(interestAmount,principalSymbol)}
              />
              <SummaryItem
                labelName="Total Repayment Amount"
                labelValue={totalRepaymentAmount > 0 ? niceNumberDisplay(totalRepaymentAmount) : ' - '}
                labelValue2={totalRepaymentAmount > 0 ? principalSymbol : ' - '}
                tooltipValue={tooltipNumberDisplay(totalRepaymentAmount,principalSymbol)}
              />
              <SummaryItem
                labelName="Debtor Address"
                labelValue={debtorAddressDisplay}
                labelValue2=''
              />
              <SummaryItem
                labelName="Creditor Address"
                labelValue={creditorAddressDisplay}
                labelValue2=''
              />

            </ListGroup>
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default Summary;
