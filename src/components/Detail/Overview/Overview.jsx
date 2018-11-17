import React, { Component } from "react";
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";

class Overview extends Component {
  render() {
    const {
      loanDetails,
      nextRepaymentAmount,
      nextRepaymentDate,
      repaymentBtnDisplay,
      currentMetamaskAccount,
      collateralBtnDisplay,
      collateralSeizeBtnDisplay,
      overViewButtonBackgroundClass,
      overViewBackgroundClass,
      makeRepayment,
      unblockCollateral,
      seizeCollateral,
      buttonLoading,
      isLoanUser,
    } = this.props;
    let {
      principal,
      principalSymbol,
      outstandingAmountDisplay,
      debtorAddress,
      creditorAddress,
      isCollateralSeized,
      isCollateralReturned
    } = loanDetails;

    return (
      <Card className={"card-statistics h-100 my-activities-container p-3 loan-detail-card-statistics " + overViewBackgroundClass}>
        <CardBody>
          <CardTitle>Overview</CardTitle>
          <Row>
            <Col lg={6} md={6} sm={6} xl={6}>
              <div className="pull-left">
                <span>Loan Amount</span>
                <br />
                <span className="loan-detail-numbers">
                  {principal > 0 ? principal : " - "}
                </span>{" "}
                {principal > 0 && principalSymbol}
              </div>
            </Col>

            <Col lg={6} md={6} sm={6} xl={6} className="text-right">
              {outstandingAmountDisplay > 0 && isLoanUser &&
                <div className="">
                  <span>Outstanding Amount</span>
                  <br />
                  <span className="loan-detail-numbers">
                    {outstandingAmountDisplay}
                  </span>{" "}
                  {principalSymbol}
                </div>
              }
            </Col>
          </Row>
          <Row className="mt-20">
            <Col>

              <div>
                <span>Debtor Address</span>
                <br />
                <span className="loan-detail-numbers">{debtorAddress}</span>
              </div>
            </Col>
          </Row>
          <Row className="mt-20">
            <Col>
              <div>
                <span>Creditor Address</span>
                <br />
                <span className="loan-detail-numbers">{creditorAddress}</span>
              </div>


            </Col>
          </Row>
          <Row className="mt-20">
            <Col lg={5} md={5} sm={6} xl={5}>
              {outstandingAmountDisplay > 0 &&
                currentMetamaskAccount == debtorAddress && (

                  <div className="pull-left">
                    <span>Next Repayment</span>
                    <br />
                    <span className="loan-detail-numbers">
                      {nextRepaymentAmount > 0
                        ? nextRepaymentAmount
                        : " - x"}
                    </span>{" "}
                    {outstandingAmountDisplay > 0 ? principalSymbol : ""}
                    <br />
                    <span>{nextRepaymentDate}</span>
                  </div>

                )}
            </Col>
            <Col lg={7} md={7} sm={6} xl={7} className="text-right">
              {repaymentBtnDisplay === true && (
                <button
                  className={"btn cognito repayment-button icon mb-15 btn-make-repayment btn-sm " + overViewButtonBackgroundClass}
                  onClick={makeRepayment}
                  disabled={buttonLoading}
                >
                  Make Repayment {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                </button>
              )}

              {outstandingAmountDisplay == 0 &&
                collateralBtnDisplay === true && (
                  <button
                    className="btn cognito repayment-button icon mb-15 btn-make-repayment"
                    onClick={unblockCollateral}
                    disabled={buttonLoading}
                  >
                    Claim Collateral {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                  </button>
                )}

              {collateralSeizeBtnDisplay === true && (
                <button
                  className={"btn cognito repayment-button icon mb-15 btn-make-repayment btn-sm " + overViewButtonBackgroundClass}
                  onClick={seizeCollateral}
                  disabled={buttonLoading}
                >
                  Seize Collateral {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                </button>
              )}

            </Col>
            <Col>
              {
                isCollateralSeized && <h4 className="text-center"><span class="badge badge-danger p-2 font-weight-normal">Collateral was seized</span></h4>
              }
              {
                isCollateralReturned && <h4 className="text-center"><span class="badge badge-success p-2 font-weight-normal">Collateral was returned</span></h4>
              }
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  }
}

export default Overview;
