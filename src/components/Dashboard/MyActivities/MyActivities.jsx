import React, { Component } from "react";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";
import * as moment from "moment";
import _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Link } from 'react-router-dom';
import Loading from "../../Loading/Loading";
import MyActivitiesEmpty from "./MyActivitiesEmpty/MyActivitiesEmpty";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
import { niceNumberDisplay,convertBigNumber,tooltipNumberDisplay } from "../../../utils/Util";

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
      myInvestmensIsMounted: true,
      myBorrowRequestProcessing:false
    };
  }

  async componentWillReceiveProps(nextProps) {
    const { dharma, myBorrowedRequests: nextBorrowedRequests, myFundedRequests: nextFundedRequests, myBorrowedLoading, myFundedLoading } = nextProps;
    const { myBorrowedRequests, myFundedRequests, currentMetamaskAccount } = this.props;
    const { myLoansIsMounted, myInvestmensIsMounted,myBorrowRequestProcessing } = this.state;

    let repaymentSchedule;
    let expectedRepaidAmount;
    let loanRequestsActivities = [];
    let investmentsActivities = [];
    let myBorrowedRequestsLoading = true;
    let myFundedRequestsLoading = true;
    
    if (myBorrowedRequests != nextBorrowedRequests && myBorrowedLoading === false && !_.isUndefined(currentMetamaskAccount) && myBorrowRequestProcessing == false) {
      console.log(nextBorrowedRequests.length);
      this.setState({
        myBorrowRequestProcessing:true        
      });
      if (nextBorrowedRequests.length > 0) {
        await this.asyncForEach(nextBorrowedRequests, async ts => {
          let isCollateralSeized = false;
          let totalRepaidAmount = parseFloat(ts.repaidAmount); 
          let totalRepaymentAmount = parseFloat(ts.repaymentAmount);
          let outstandingAmount = totalRepaymentAmount - totalRepaidAmount;
          if (outstandingAmount > 0) {
            isCollateralSeized = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralSeized(
                ts.id
            );
          }
          repaymentSchedule = ts.repaymentSchedule;
          let expectedRepaidAmountDharma = 0;
          let interestRatePercent = parseFloat(ts.interestRatePercent);
          let installmentPrincipal = parseFloat(ts.principal) / parseFloat(ts.termLengthAmount);
          installmentPrincipal = (installmentPrincipal > 0) ? installmentPrincipal : 0;
          let installmentInterestAmount = (installmentPrincipal * parseFloat(interestRatePercent)) / 100;  
          let current_timestamp = moment().unix();
          let i = 1;
          let missedButtonText = '';
          let missedButtonClassName = '';
          let lastExpectedRepaidAmount = 0;
          let missedRepaymentAmount = 0;
          let missedSt = '';
          let missedDate = '';
          let missedPaymentClass = '';

          if(ts.debtorAddress == currentMetamaskAccount && ts.repaidAmount == ts.repaymentAmount && ts.isRepaid == true)
          {
            let isCollateralReturned = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralReturned(
              ts.id
            );
            if(isCollateralReturned == false)
            {
              let claimTimestamp = repaymentSchedule.pop();
              let claimDate = new Date(claimTimestamp);
              loanRequestsActivities.push({
                id: "l_" + _.random(999999999),
                date: moment(claimDate, "DD/MM/YYYY HH:mm:ss", true).format(),
                type: "claim",
                agreementId: ts.id,
                buttonText: 'Claim Collateral',
                buttonClassName: 'green',
                amount: ts.collateral,
                sybmol: ts.collateralSymbol,
              });  
            }
          }
          else if(isCollateralSeized == false)
          {
            if (!_.isUndefined(repaymentSchedule)) {
              await this.asyncForEach(repaymentSchedule, async st => {
                let currentTimestamp = moment().unix();
                let date = new Date(st);
                st = st / 1000; 

                let buttonText = '';
                let buttonClassName = '';
                let expectedRepaidAmount = parseFloat(installmentPrincipal) + parseFloat(installmentInterestAmount);
                expectedRepaidAmountDharma += expectedRepaidAmount;
                
                let paidStatus = (totalRepaidAmount >= expectedRepaidAmountDharma) ? 'paid' : ((totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount) ? 'partial_paid' : ((st < currentTimestamp) ? 'missed' : 'due'));
                let amount = parseFloat(expectedRepaidAmountDharma) - parseFloat(ts.repaidAmount);

                if (st > current_timestamp && i == 1 && amount > 0) {
                  if (ts.debtorAddress == currentMetamaskAccount) {
                    if (parseFloat(ts.repaidAmount) < parseFloat(ts.repaymentAmount) && ts.isRepaid == false) {
                      buttonText = 'Pay';
                      buttonClassName = 'orange';
                    }
                  }

                  var now = moment(new Date()); 
                  var end = moment(date, "YYYY-MM-DD", true).format();
                  var duration = moment.duration(now.diff(end));
                  var daysBefore = parseInt(duration.asDays());
                  var hoursBefore = parseInt(duration.asHours());

                  if((daysBefore < 0 || hoursBefore < 0) && paidStatus != 'missed')
                  {
                    daysBefore = daysBefore * -1; 
                    hoursBefore = hoursBefore * -1; 
                  }

                  loanRequestsActivities.push({
                    id: "l_" + _.random(999999999),
                    date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                    amount: amount,
                    type: "minus",
                    sybmol: ts.principalSymbol,
                    agreementId: ts.id,
                    sortTimestamp: st,
                    buttonText: buttonText,
                    buttonClassName: buttonClassName,
                    repaymentText:'due',
                    daysBefore:daysBefore,
                    hoursBefore:hoursBefore
                  });
                  i++;                
                }
                else if (st < currentTimestamp && totalRepaidAmount < totalRepaymentAmount) {
                  missedRepaymentAmount = expectedRepaidAmountDharma - totalRepaidAmount;
                  missedRepaymentAmount = niceNumberDisplay(missedRepaymentAmount);
                  missedSt = st;
                  missedDate = date;
                  if((paidStatus == 'partial_paid' || paidStatus == 'missed') && ts.debtorAddress == currentMetamaskAccount)
                  {
                    missedPaymentClass = (paidStatus == 'partial_paid') ? 'partial_paid' : 'missed';
                    missedButtonText = 'Pay';
                    missedButtonClassName = 'orange';
                  }
                }
                if (lastExpectedRepaidAmount != expectedRepaidAmountDharma) {
                  lastExpectedRepaidAmount = expectedRepaidAmountDharma;
                }
              });

              if(missedButtonText != '' && missedButtonClassName != '' && missedRepaymentAmount > 0)
              {
                var now = moment(new Date()); 
                var end = moment(missedDate, "YYYY-MM-DD", true).format();
                var duration = moment.duration(now.diff(end));
                var daysBefore = parseInt(duration.asDays());
                var hoursBefore = parseInt(duration.asHours());

                loanRequestsActivities.push({
                  id: "l_" + _.random(999999999),
                  date: moment(missedDate, "DD/MM/YYYY HH:mm:ss", true).format(),
                  amount: missedRepaymentAmount,
                  type: "minus",
                  sybmol: ts.principalSymbol,
                  agreementId: ts.id,
                  sortTimestamp: missedSt,
                  buttonText: missedButtonText,
                  buttonClassName: missedButtonClassName,
                  repaymentText:'missed',
                  daysBefore:daysBefore,
                  hoursBefore:hoursBefore,
                  missedPaymentClass:missedPaymentClass
                });
              }
            }  
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
          let expectedRepaidAmountDharma = 0;
          let interestRatePercent = parseFloat(ts.interestRatePercent);
          let installmentPrincipal = parseFloat(ts.principal) / parseFloat(ts.termLengthAmount);
          installmentPrincipal = (installmentPrincipal > 0) ? installmentPrincipal : 0;
          let installmentInterestAmount = (installmentPrincipal * parseFloat(interestRatePercent)) / 100;
          if(ts.creditorAddress == currentMetamaskAccount && ts.isCollateralSeizable == true && ts.isRepaid === false)
          {
            let seizeTimestamp = repaymentSchedule.pop();
            let seizeDate = new Date(seizeTimestamp);
            investmentsActivities.push({
              id: "i_" + _.random(999999999),
              date: moment(seizeDate, "DD/MM/YYYY HH:mm:ss", true).format(),
              amount: ts.collateral,
              type: "plus",
              sybmol: ts.collateralSymbol,
              agreementId: ts.id,
              sortTimestamp: seizeTimestamp,
              buttonText: 'Seize Collateral',
              buttonClassName: 'green'
            });
          }
          else
          {
            if (!_.isUndefined(repaymentSchedule)) {
              await this.asyncForEach(repaymentSchedule, async schedule_ts => {
                if (schedule_ts > current_timestamp * 1000 && i == 1) {
                  let date = new Date(schedule_ts);
                  let expectedRepaidAmount = parseFloat(installmentPrincipal) + parseFloat(installmentInterestAmount);
                  expectedRepaidAmountDharma += expectedRepaidAmount;
                  let amount = parseFloat(expectedRepaidAmountDharma) - parseFloat(ts.repaidAmount);
                  if(amount > 0)
                  {
                    investmentsActivities.push({
                      id: "i_" + _.random(999999999),
                      date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                      amount: amount,
                      type: "plus",
                      sybmol: ts.principalSymbol,
                      agreementId: ts.id,
                      sortTimestamp: schedule_ts,
                      buttonText: '',
                      buttonClassName: ''
                    });  
                  }
                  i++;
                }
              });
            }
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
          let modulorHours = row.hoursBefore % 24;
          if (row.type == "minus") {
            text = "Repayment "; 
            text += (row.repaymentText == "missed") ? "missed before " : "due in ";
            text += (row.daysBefore != '' && row.daysBefore >= 1 && modulorHours > 0) ? row.daysBefore+' days '+modulorHours+' hours' : (row.daysBefore != '' && row.daysBefore > 1) ? row.daysBefore + ' days' : ((row.hoursBefore != '' && row.hoursBefore > 1) ? row.hoursBefore+' hours' : ((row.hoursBefore < 1) ? " few minutes" : ""));
          } else if (row.type == "plus") {
            text = "Earning";
          }
          else if(row.type == "claim"){
            text = "Claim collateral"; 
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
          var label = (row.type == "claim") ? 'Date' : 'Due Date';
          return (
            <div>
              <span className="weight-bolder">{date}</span>
              <br />
              {label}
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
              {
                row.buttonText!='' && <Link to={`detail/${row.agreementId}`}><button className={"btn cognito x-small " + row.buttonClassName}>{row.buttonText}</button></Link>
              }
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
            label_color = "number-highlight color-orange number-bold custom-tooltip";
          } else if (row.type == "plus") {
            label_color = "number-highlight color-green number-bold custom-tooltip";
          }
          return (
            <div>
              <span className={label_color} tooltip-title={tooltipNumberDisplay(row.amount,row.sybmol)}>
                {niceNumberDisplay(row.amount)}
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
      hideSizePerPage:true,
      /*showTotal:true,*/
      alwaysShowAllBtns: true,
      sizePerPage: 4,
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
