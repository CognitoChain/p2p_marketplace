import React, { Component } from "react";
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";
import { niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
class Overview extends Component {
  render() {
    const {
      loanDetails,
      nextRepaymentAmount,
      nextRepaymentDate,
      repaymentBtnDisplay,
      isMetaMaskAuthRised,
      collateralBtnDisplay,
      collateralSeizeBtnDisplay,
      overViewButtonBackgroundClass,
      overViewBackgroundClass,
      makeRepayment,
      unblockCollateral,
      seizeCollateral,
      buttonLoading,
      isLoanUser      
    } = this.props;
    let {
      principalAmount,
      principalSymbol,
      isCollateralSeized,
      isCollateralReturned,
      outstandingAmount,
      isRepaid,
      totalRepaymentAmount,
      totalRepaidAmount
    } = loanDetails;
    let outstandingAmountDisplay = niceNumberDisplay(outstandingAmount);
    return (
      <Card className={"card-statistics h-100 my-activities-container p-3 loan-detail-card-statistics " + overViewBackgroundClass}>
        <CardBody>
          <CardTitle>Overview</CardTitle>
          <Row>
            <Col lg={6} md={6} sm={6} xl={6}>
              <div className="pull-left">
                <span>Loan Amount</span>
                <br />
                <span className="loan-detail-numbers custom-tooltip" tooltip-title={tooltipNumberDisplay(principalAmount,principalSymbol)}>
                  {principalAmount > 0 ? niceNumberDisplay(principalAmount) : " - "}
                </span>{" "}
                {principalAmount > 0 && principalSymbol}
              </div>
            </Col>

            <Col lg={6} md={6} sm={6} xl={6} className="text-right">
              {outstandingAmountDisplay > 0 && isLoanUser && !isCollateralSeized &&
                <div className="">
                  <span>Outstanding Amount</span>
                  <br />
                  <span className="loan-detail-numbers custom-tooltip" tooltip-title={tooltipNumberDisplay(outstandingAmount,principalSymbol)}>
                    {outstandingAmountDisplay}
                  </span>{" "}
                  {principalSymbol}
                </div>
              }
              {(isRepaid || isCollateralSeized || isCollateralReturned) &&
                <div className="text-right">
                  <span>Total Repaid Amount</span>
                  <br />
                  <span className="loan-detail-numbers custom-tooltip" tooltip-title={tooltipNumberDisplay(totalRepaymentAmount,principalSymbol)}>
                    {niceNumberDisplay(totalRepaymentAmount)}
                  </span>{" "}
                  {principalSymbol}
                </div>
              }
            </Col>
          </Row>
          <Row className="mt-30">
            <Col lg={6} md={6} sm={6} xl={6}>
              {outstandingAmountDisplay > 0 && isMetaMaskAuthRised && !isCollateralSeized && isLoanUser && (
                  <div className="pull-left">
                    <span>Next Repayment</span>
                    <br />
                    <span className="loan-detail-numbers custom-tooltip" tooltip-title={tooltipNumberDisplay(nextRepaymentAmount,principalSymbol)}>
                      {nextRepaymentAmount > 0
                        ? niceNumberDisplay(nextRepaymentAmount)
                        : " - x"}
                    </span>{" "}
                    {outstandingAmountDisplay > 0 ? principalSymbol : ""}
                    <br />
                    <span>{nextRepaymentDate}</span>
                  </div>

                )}
            </Col>

            <Col lg={6} md={6} sm={6} xl={6} className="text-right">
              {outstandingAmountDisplay > 0 && isMetaMaskAuthRised && !isCollateralReturned && !isCollateralSeized && isLoanUser && (
                  <div className="pull-left">
                    <span>Total Repaid Amount</span>
                    <br />
                    <span className="loan-detail-numbers custom-tooltip" tooltip-title={tooltipNumberDisplay(totalRepaidAmount,principalSymbol)}>
                      {niceNumberDisplay(totalRepaidAmount)}
                    </span>{" "}
                    {principalSymbol}
                  </div>
                )}
            </Col>
            
            <Col>
              {
                isCollateralSeized && isLoanUser && <h4 className="text-center"><span className="badge badge-danger p-2 font-weight-normal">Collateral was seized</span></h4>
              }
              {
                isCollateralReturned && isLoanUser && <h4 className="text-center"><span className="badge badge-success p-2 font-weight-normal">Collateral was returned</span></h4>
              }
            </Col>
          </Row>

          {(repaymentBtnDisplay || collateralBtnDisplay || collateralSeizeBtnDisplay) && (
            <Row className="mt-20">
              <Col className="text-center">
                {repaymentBtnDisplay === true && (
                  <button
                    className={"btn cognito repayment-button icon btn-make-repayment btn-sm " + overViewButtonBackgroundClass}
                    onClick={makeRepayment}
                    disabled={buttonLoading}
                  >
                    Make Repayment {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                  </button>
                )}

                {collateralBtnDisplay === true && (
                    <button
                      className="btn cognito repayment-button icon btn-make-repayment"
                      onClick={unblockCollateral}
                      disabled={buttonLoading}
                    >
                      Claim Collateral {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                    </button>
                  )}

                {collateralSeizeBtnDisplay === true && (
                  <button
                    className={"btn cognito repayment-button icon btn-make-repayment btn-sm " + overViewButtonBackgroundClass}
                    onClick={seizeCollateral}
                    disabled={buttonLoading}
                  >
                    Seize Collateral {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                  </button>
                )}
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>
    );
  }
}

export default Overview;
