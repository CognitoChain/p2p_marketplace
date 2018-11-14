import React, { Component } from "react";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";
import * as moment from "moment";
import _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { BigNumber } from "bignumber.js";
import Loading from "../../Loading/Loading";
import MyActivitiesEmpty from "./MyActivitiesEmpty/MyActivitiesEmpty";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
import { niceNumberDisplay } from "../../../utils/Util";
import fundLoanImg from "../../../assets/images/fund_loan.png";
import borrowLoanImg from "../../../assets/images/borrow.png";
import "./MyActivities.css";
class MyActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      investmentsActivities: [],
      loanRequestsActivities: [],
      isLoading: true,
      myBorrowedRequestsLoading: true,
      myFundedRequestsLoading: true,
      metaMaskMsg: false,
      myLoansIsMounted: true,
      myInvestmensIsMounted: true
    };
  }

  async componentWillReceiveProps(nextProps) {
    const { dharma, myBorrowedRequests: nextBorrowedRequests, myFundedRequests: nextFundedRequests, myBorrowedLoading, myFundedLoading } = nextProps;
    const { myBorrowedRequests, myFundedRequests, currentMetamaskAccount } = this.props;
    const { myLoansIsMounted, myInvestmensIsMounted } = this.state;

    let repaymentSchedule;
    let expectedRepaidAmount;
    let loanRequestsActivities = [];
    let investmentsActivities = [];
    let myBorrowedRequestsLoading = true;
    let myFundedRequestsLoading = true;
    if (myBorrowedRequests != nextBorrowedRequests && myBorrowedLoading === false && !_.isUndefined(currentMetamaskAccount)) {
      if (nextBorrowedRequests.length > 0) {
        await this.asyncForEach(nextBorrowedRequests, async ts => {
          repaymentSchedule = ts.repaymentSchedule;
          let current_timestamp = moment().unix();
          let i = 1;
          if (!_.isUndefined(repaymentSchedule)) {
            await this.asyncForEach(repaymentSchedule, async st => {
              if (st > current_timestamp * 1000 && i == 1) {
                let date = new Date(st);
                st = st / 1000;
                const principalTokenDecimals = await dharma.token.getNumDecimals(ts.principalSymbol);
                let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
                  ts.id,
                  st
                );
                expectedRepaidAmount = this.convertBigNumber(expectedRepaidAmountBigNumber, principalTokenDecimals);

                let buttonText = '';
                let buttonClassName = '';
                if (ts.debtorAddress == currentMetamaskAccount) {
                  if (parseFloat(ts.repaidAmount) < parseFloat(ts.repaymentAmount) && ts.isRepaid == false) {
                    buttonText = 'Pay';
                    buttonClassName = 'orange';
                  }
                  else if (ts.repaidAmount == ts.repaymentAmount && ts.isRepaid == true) {
                    buttonText = 'Claim Collateral';
                    buttonClassName = 'green';
                  }
                }
                let amount = parseFloat(expectedRepaidAmount) - parseFloat(ts.repaidAmount);
                amount = niceNumberDisplay(amount);
                if(amount > 0)
                {
                  loanRequestsActivities.push({
                    id: "l_" + _.random(999999999),
                    date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                    amount: amount,
                    type: "minus",
                    sybmol: ts.principalSymbol,
                    agreementId: ts.id,
                    sortTimestamp: st,
                    buttonText: buttonText,
                    buttonClassName: buttonClassName
                  });
                  i++;
                }
              }
            });
          }
        });
      }
      myBorrowedRequestsLoading = false
      if (myLoansIsMounted) {
        this.setState({
          loanRequestsActivities,
          myBorrowedRequestsLoading
        });
      }
    }

    if (nextFundedRequests != myFundedRequests && myFundedLoading === false) {
      let expectedRepaidAmount;
      let repaymentSchedule;
      if (nextFundedRequests.length > 0) {
        await this.asyncForEach(nextFundedRequests, async ts => {
          let current_timestamp = moment().unix();
          let i = 1;
          repaymentSchedule = ts.repaymentSchedule;
          if (!_.isUndefined(repaymentSchedule)) {
            await this.asyncForEach(repaymentSchedule, async schedule_ts => {
              if (schedule_ts > current_timestamp * 1000 && i == 1) {
                let date = new Date(schedule_ts);
                const principalTokenDecimals = await dharma.token.getNumDecimals(ts.principalSymbol);
                schedule_ts = schedule_ts / 1000;
                let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
                  ts.id,
                  schedule_ts
                );
                expectedRepaidAmount = this.convertBigNumber(expectedRepaidAmountBigNumber, principalTokenDecimals);

                let buttonText = '';
                let buttonClassName = '';
                if (ts.creditorAddress == currentMetamaskAccount) {
                  buttonText = (ts.isCollateralSeizable == true && ts.isRepaid === false) ? 'Seize Collateral' : '';
                  buttonClassName = 'green';
                }
                let amount = parseFloat(expectedRepaidAmount) - parseFloat(ts.repaidAmount);
                amount = niceNumberDisplay(amount);
                investmentsActivities.push({
                  id: "i_" + _.random(999999999),
                  date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                  amount: amount,
                  type: "plus",
                  sybmol: ts.principalSymbol,
                  agreementId: ts.id,
                  sortTimestamp: schedule_ts,
                  buttonText: buttonText,
                  buttonClassName: buttonClassName
                });
                i++;
              }
            });
          }
        });
      }
      myFundedRequestsLoading = false;
      if (myInvestmensIsMounted) {
        this.setState({
          investmentsActivities,
          myFundedRequestsLoading
        });
      }
    }
  }

  componentWillUnmount() {
    this.setState({
      myLoansIsMounted: false,
      myInvestmensIsMounted: false
    });
  }
  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  convertBigNumber(obj, power) {
    return obj.div(new BigNumber(10).pow(power.toNumber()));
  }
  render() {
    const { loanRequestsActivities, investmentsActivities, metaMaskMsg, myFundedRequestsLoading, myBorrowedRequestsLoading } = this.state;
    const { myFundedLoading, myBorrowedLoading } = this.props;
    let isLoading = myBorrowedRequestsLoading || myFundedRequestsLoading || myBorrowedLoading || myFundedLoading;

    let activities = [];
    if (!isLoading) {
      activities = [...loanRequestsActivities, ...investmentsActivities];
    }
    activities = _.sortBy(activities, function (o) { return new moment(o.date); });
    const columns = [
      {
        dataField: "icon",
        text: "Icon",
        isDummyField: true,
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let img;
          let classname;
          if (row.type == "minus") {
            img = borrowLoanImg;
            classname = "rounded-circle bg-orange icon-box";
          } else {
            img = fundLoanImg;
            classname = "rounded-circle bg-green icon-box";
          }
          return (
            <div>
              <div className="text-left">
                <div className="d-inline-block">
                  <div className={classname}>
                    <img src={img} height="20" className="mt-10" alt="acitivity_img" />
                  </div>
                </div>
              </div>
            </div>
          );
        }
      },
      {
        dataField: "loanText",
        text: "Loan Text",
        isDummyField: true,
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let text = "";
          if (row.type == "minus") {
            text = "Repayment due in ";
          } else if (row.type == "plus") {
            text = "Earning";
          }
          return (
            <div>
              <span className="weight-bolder">{text}</span>
            </div>
          );
        }
      },
      {
        dataField: "date",
        text: "Date",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          var date = moment(cell).format("DD/MM/YYYY");
          return (
            <div>
              <span className="weight-bolder">{date}</span>
              <br />
              Due Date
            </div>
          );
        }
      },
      {
        dataField: "payBtn",
        text: "Pay Button",
        isDummyField: true,
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <a href={`detail/${row.agreementId}`} className={"btn cognito x-small " + row.buttonClassName}>{row.buttonText}</a>
            </div>
          );
        }
      },
      {
        dataField: "amount",
        text: "Amount",
        isDummyField: true,
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let label_color = "";
          if (row.type == "minus") {
            label_color = "number-highlight color-orange number-bold";
          } else if (row.type == "plus") {
            label_color = "number-highlight color-green number-bold";
          }
          return (
            <div>
              <span className={label_color}>
                {row.amount}
              </span>
              <br />
              <div className="currency-text">{row.sybmol}</div>
            </div>
          );
        }
      }
    ];

    const pagination = paginationFactory({
      page: 1,
      /*showTotal:true,*/
      alwaysShowAllBtns: true,
      sizePerPage: 4,
      sizePerPageList: [{ text: "4", value: 4 }, { text: "10", value: 10 }]
    });

    return (
      <Col lg={6} md={6} sm={6} xl={6} className="LoanRequests">
        <Card className="card-statistics h-100 my-activities-container">
          <CardBody>
            <CardTitle>My Activities</CardTitle>
            {isLoading &&
              <Row className="h-100 position-absolute portfolio-row align-items-center justify-content-center w-100">
                <Col md={12}>
                  <Loading />
                </Col>
              </Row>}
            {!isLoading && activities.length == 0 && <MyActivitiesEmpty />}
            {
              metaMaskMsg &&
              <Row>
                <Col md={12}>
                  <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={["Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured."]} />
                </Col>
              </Row>
            }
            {!isLoading && activities.length > 0 && (
              <div className="LoanRequests">
                <BootstrapTable
                  hover={false}
                  hideSizePerPage={true}
                  keyField="id"
                  classes={"open-request"}
                  columns={columns}
                  data={activities}
                  headerClasses={"text-center"}
                  bordered={false}
                  pagination={pagination}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    );
  }
}

export default MyActivities;
