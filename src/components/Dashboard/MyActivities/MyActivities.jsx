// External libraries
import React, { Component } from "react";
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import "./MyActivities.css";
import { amortizationUnitToFrequency } from "../../../utils/Util";
import BootstrapTable from "react-bootstrap-table-next";
import fundLoanImg from "../../../assets/images/fund_loan.png";
import borrowLoanImg from "../../../assets/images/borrow.png";
import _ from "lodash";
import paginationFactory from "react-bootstrap-table2-paginator";
import Loading from "../../Loading/Loading";
import MyActivitiesEmpty from "./MyActivitiesEmpty/MyActivitiesEmpty";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
/**
 * Here we define the columns that appear in the table that holds all of the
 * open Loan Requests.
 */

class MyActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      investmentsActivities: [],
      loanRequestsActivities: [],
      myloanRequestsProcessCompleted: false,
      myInvestmentsRequestsProcessCompleted: false,
      metaMaskMsg:false
    };
  }

  convert_big_number(obj) {
    let expectedRepaymentAmountScheduleTime = obj.toNumber();
    let expectedScheduleTimeAmountDecimal = "1E" + obj.e;
    let expectedRepaidAmount =
      expectedRepaymentAmountScheduleTime / expectedScheduleTimeAmountDecimal;
    return expectedRepaidAmount;
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async componentWillReceiveProps(nextProps) {
    //const { dharma } = this.props;
    const { dharma, myloanRequests } = nextProps;
    const { myloanRequestsProcessCompleted } = this.state;
    const CurrentAccount = await dharma.blockchain.getCurrentAccount();
    if (myloanRequests == this.props.myloanRequests) {
      return;
    }
    let repaymentSchedule;
    let expectedRepaidAmount;
    let loanRequestsActivities = [];
    console.log("CurrentAccount");
    console.log(CurrentAccount);
    if (myloanRequestsProcessCompleted === false && typeof CurrentAccount != "undefined") {
      await this.asyncForEach(myloanRequests, async ts => {
        repaymentSchedule = await dharma.servicing.getRepaymentScheduleAsync(
          ts.id
        );
        let current_timestamp = moment().unix();
        let i = 1;
        await this.asyncForEach(repaymentSchedule, async st => {
          if (st > current_timestamp && i == 1) {
            let date = new Date(st * 1000);
            let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
              ts.id,
              st
            );
            let expectedRepaymentAmountBignumber = expectedRepaidAmountBigNumber.toNumber();
            let expectedRepaymentAmountDecimal =
              "1E" + expectedRepaidAmountBigNumber.e;
            expectedRepaidAmount =
              expectedRepaymentAmountBignumber / expectedRepaymentAmountDecimal;
            loanRequestsActivities.push({
              icon: "minus",
              loanText: "minus",
              date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
              amount: expectedRepaidAmount,
              type: "minus",
              payBtn: "minus",
              sybmol: ts.principalTokenSymbol,
              agreementId: ts.id,
              sortTimestamp: st
            });
            i++;
          }
        });
      });
      console.log(loanRequestsActivities)
      this.setState({
        loanRequestsActivities,
        myloanRequestsProcessCompleted: true
      });
    }    
  }
  /**
   * When the component mounts, use the API to get all of the load requests from the relayer
   * database, and parse those into LoanRequest objects using Dharma.js. Then, set the state of
   * the current component to include those loan requests so that they can be rendered as a table.
   *
   * This function assumes that there is a database with Loan Request data, and that we have
   * access to Dharma.js, which is connected to a blockchain.
   */
  async componentDidMount() {
    const { dharma, myloanRequests } = this.props;
    let repaymentSchedule;
    let expectedRepaidAmount;
    let investmentsActivities = [];
    const { Investments } = Dharma.Types;
    const CurrentAccount = await dharma.blockchain.getCurrentAccount();
    if (typeof CurrentAccount != "undefined") {
      const investments = await Investments.getExpandedData(
        dharma,
        CurrentAccount
      );
      let investmentsMapped = investments.map(investment => {
        return {
          ...investment,
          principal: `${investment.principalAmount} ${
            investment.principalTokenSymbol
            }`,
          collateral: `${investment.collateralAmount} ${
            investment.collateralTokenSymbol
            }`,
          term: `${investment.termDuration} ${investment.termUnit}`,
          repaidAmount: `${investment.repaidAmount} ${
            investment.principalTokenSymbol
            }`,
          totalExpectedRepaymentAmount: `${
            investment.totalExpectedRepaymentAmount
            } ${investment.principalTokenSymbol}`
        };
      });

      if (typeof investmentsMapped != "undefined") {
        await this.asyncForEach(investmentsMapped, async ts => {
          let current_timestamp = moment().unix();
          let i = 1;
          repaymentSchedule = await dharma.servicing.getRepaymentScheduleAsync(
            ts.id
          );
          await this.asyncForEach(repaymentSchedule, async schedule_ts => {
            if (schedule_ts > current_timestamp && i == 1) {
              let date = new Date(schedule_ts * 1000);
              let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
                ts.id,
                schedule_ts
              );
              expectedRepaidAmount = this.convert_big_number(
                expectedRepaidAmountBigNumber
              );
              investmentsActivities.push({
                icon: "plus",
                loanText: "plus",
                date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                amount: expectedRepaidAmount,
                type: "plus",
                payBtn: "plus",
                sybmol: ts.principalTokenSymbol,
                agreementId: ts.id,
                sortTimestamp: schedule_ts
              });
            }
          });
        });

        this.setState({
          investmentsActivities,
          myInvestmentsRequestsProcessCompleted: true
        });
      }
    }    
  }

  async componentWillMount() {
    const { dharma, myloanRequests } = this.props;
    const CurrentAccount = await dharma.blockchain.getCurrentAccount();
    if (typeof CurrentAccount == "undefined") {
      this.setState({
        myloanRequestsProcessCompleted: true,
        myInvestmentsRequestsProcessCompleted:true,
        metaMaskMsg:true,
        myloanRequestsProcessCompleted:true
      });
    }
  }

  render() {
    const { loanRequestsActivities, investmentsActivities, myloanRequestsProcessCompleted, myInvestmentsRequestsProcessCompleted,metaMaskMsg } = this.state;
    let isLoading = true;
    if (myloanRequestsProcessCompleted === true && myInvestmentsRequestsProcessCompleted === true) {
      isLoading = false;
    }
    let activities = [];
    if (!isLoading) {
      activities = [...loanRequestsActivities, ...investmentsActivities]
    }
   

    activities = _.sortBy(activities, function(o) { return new moment(o.date); }).reverse();
    const columns = [
      {
        dataField: "icon",
        text: "Icon",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let img;
          let classname;
          if (cell == "minus") {
            img = fundLoanImg;
            classname = "rounded-circle bg-orange icon-box";
          } else {
            img = borrowLoanImg;
            classname = "rounded-circle bg-green icon-box";
          }
          return (
            <div>
              <div className="text-left">
                <div className="d-inline-block">
                  <div className={classname}>
                    <img src={img} height="20" className="mt-10" />
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
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let text = "";
          if (row.loanText == "minus") {
            text = "Loan repayment due";
          } else if (row.loanText == "plus") {
            text = "Loan settlement";
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
        formatter: function (cell, row, rowIndex, formatExtraData) {
          if (cell == "minus") {
            return (
              <div>
                <a href={`detail/${row.agreementId}`} target="_blank" className="btn cognito x-small orange">Pay</a>
              </div>
            );
          }
        }
      },
      {
        dataField: "amount",
        text: "Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let label_color = "";
          if (row.loanText == "minus") {
            label_color = "color-orange";
          } else if (row.loanText == "plus") {
            label_color = "color-green";
          }
          return (
            <div>
              <span className="number-highlight color-orange">
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
      sizePerPage: 5,
      sizePerPageList: [{ text: "5", value: 5 }, { text: "10", value: 10 }]
    });

    return (
      <Col lg={6} md={6} sm={6} xl={6} className="LoanRequests">
        <Card className="card-statistics h-100 my-activities-container">
          <CardBody>
            <CardTitle>My Activities</CardTitle>
            {isLoading && <Loading />}
            {activities.length>0 && <MyActivitiesEmpty />}
            {
                metaMaskMsg &&
                <Row>
                    <Col md={12}>
                        <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={["Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured."]} />
                    </Col>
                </Row>
            }
            {!isLoading && activities.length>0 && (
              <div className="LoanRequests">
                <BootstrapTable
                  hover={false}
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
