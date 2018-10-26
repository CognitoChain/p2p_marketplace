// External libraries
import React, { Component } from "react";
import * as moment from "moment";
import "./MyActivities.css";
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
      myFundedRequestsProcessCompleted: false,
      metaMaskMsg:false,
      myLoansIsMounted:true,
      myInvestmensIsMounted:true,
      displayNoRecordMsg:true
    };
  }

  convert_big_number(obj) {
    let expectedRepaymentAmountScheduleTime = obj.toNumber();
    let expectedScheduleTimeAmountDecimal = "1E" + obj.e;
    let expectedRepaidAmount =
      expectedRepaymentAmountScheduleTime / expectedScheduleTimeAmountDecimal;
    expectedRepaidAmount = (expectedRepaidAmount > 0) ? expectedRepaidAmount.toFixed(2) : 0;  
    return expectedRepaidAmount;
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async componentWillReceiveProps(nextProps) {
    const { dharma, myBorrowedRequests,myFundedRequests } = nextProps;
    const { currentMetamaskAccount } = this.props;
    const { myloanRequestsProcessCompleted,myLoansIsMounted,myFundedRequestsProcessCompleted,myInvestmensIsMounted,displayNoRecordMsg } = this.state;
    const myLoanRequestPropsLength = this.props.myBorrowedRequests.length;
    const myLoanRequestLength = myBorrowedRequests.length;
    const myFundedRequestPropsLength = this.props.myFundedRequests.length
    const myFundedRequestLength = myFundedRequests.length; 
    const CurrentAccount = await dharma.blockchain.getCurrentAccount();
    /*if (myLoanRequests == this.props.myLoanRequests) {
      return;
    }*/
    let repaymentSchedule;
    let expectedRepaidAmount;
    let loanRequestsActivities = [];
    let investmentsActivities = [];

    if (myLoanRequestPropsLength != myLoanRequestLength && myloanRequestsProcessCompleted === false && !_.isUndefined(CurrentAccount)) {
      if(displayNoRecordMsg)
      {
        this.setState({
          displayNoRecordMsg: false
        });  
      }

      await this.asyncForEach(myBorrowedRequests, async ts => {
            repaymentSchedule = ts.repaymentSchedule;
            let current_timestamp = moment().unix();
            let i = 1;
            if(!_.isUndefined(repaymentSchedule))
            {
                await this.asyncForEach(repaymentSchedule, async st => {
                  if (st > current_timestamp && i == 1) {
                    let date = new Date(st);
                    let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
                      ts.id,
                      st
                    );
                    expectedRepaidAmount = this.convert_big_number(
                        expectedRepaidAmountBigNumber
                    );

                    let buttonText = '';
                    if(ts.debtorAddress == currentMetamaskAccount)
                    {
                        buttonText = (parseFloat(ts.repaidAmount) < parseFloat(ts.repaymentAmount) && ts.isRepaid == false) ? 'Pay' : ((ts.repaidAmount == ts.repaymentAmount) ? 'Request Collateral' : '');
                    }

                    loanRequestsActivities.push({
                      id:_.random(999999999),
                      date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                      amount: expectedRepaidAmount,
                      type: "minus",
                      sybmol: ts.principalSymbol,
                      agreementId: ts.id,
                      sortTimestamp: st,
                      buttonText:buttonText
                    });
                    i++;
                  }
                });  
            }  
        
      });
      if(myLoansIsMounted)
      {
        this.setState({
          loanRequestsActivities,
          myloanRequestsProcessCompleted: true
        });  
      }      
    }    
    
    if (myFundedRequestPropsLength != myFundedRequestLength && myFundedRequestsProcessCompleted === false && !_.isUndefined(myFundedRequests)) {
        let expectedRepaidAmount;
        let repaymentSchedule;
        if(displayNoRecordMsg)
        {
          this.setState({
            displayNoRecordMsg: false
          });  
        }
        
        await this.asyncForEach(myFundedRequests, async ts => {
          let current_timestamp = moment().unix();
          let i = 1;
          repaymentSchedule = ts.repaymentSchedule;
          if(!_.isUndefined(repaymentSchedule)){
              await this.asyncForEach(repaymentSchedule, async schedule_ts => {
                if (schedule_ts > current_timestamp && i == 1) {
                  let date = new Date(schedule_ts);
                  let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
                    ts.id,
                    schedule_ts
                  );
                  expectedRepaidAmount = this.convert_big_number(
                    expectedRepaidAmountBigNumber
                  );

                  let buttonText = '';
                  if(ts.creditorAddress == currentMetamaskAccount)
                  {
                      buttonText = (parseFloat(ts.repaidAmount) < parseFloat(ts.repaymentAmount) && ts.isCollateralSeizable == true) ? 'Seize Collateral' : '';
                  }

                  investmentsActivities.push({
                    id:_.random(999999999),
                    date: moment(date, "DD/MM/YYYY HH:mm:ss", true).format(),
                    amount: expectedRepaidAmount,
                    type: "plus",
                    sybmol: ts.principalSymbol,
                    agreementId: ts.id,
                    sortTimestamp: schedule_ts,
                    buttonText:buttonText
                  });
                  i++;
                }
            });  
          }
        });
        if(myInvestmensIsMounted)
        {
          this.setState({
            investmentsActivities,
            myFundedRequestsProcessCompleted: true
          });  
        }        
    }
  }

  componentDidMount(){
    const { myloanRequestsProcessCompleted,myFundedRequestsProcessCompleted,displayNoRecordMsg } = this.state;
    if(!myloanRequestsProcessCompleted && !myFundedRequestsProcessCompleted && displayNoRecordMsg){
      setTimeout(()=>{
        this.setState({
          myloanRequestsProcessCompleted:true,
          myFundedRequestsProcessCompleted:true
        });
      },50000)
    }
  }
  
  componentWillUnmount(){
    this.setState({
      myLoansIsMounted: false,
      myInvestmensIsMounted: false       
    });
  }

  render() {
    const { loanRequestsActivities, investmentsActivities, myloanRequestsProcessCompleted, myFundedRequestsProcessCompleted,metaMaskMsg } = this.state;
    let isLoading = true;
    if (myloanRequestsProcessCompleted === true && myFundedRequestsProcessCompleted === true) {
      isLoading = false;
    }
    let activities = [];
    if (!isLoading) {
      activities = [...loanRequestsActivities, ...investmentsActivities];
    }
    activities = _.sortBy(activities, function(o) { return new moment(o.date); });
    const columns = [
      {
        dataField: "icon",
        text: "Icon",
        isDummyField: true,
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let img;
          let classname;
          if (row.type == "minus") {
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
                    <img src={img} height="20" className="mt-10" alt="Image" />
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
            text = "Repayment due";
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
          if (row.type == "minus" && row.buttonText != '') {
            return (
              <div>
                <a href={`detail/${row.agreementId}`} target="_blank" className="btn cognito x-small orange">{row.buttonText}</a>
              </div>
            );
          }
          else if(row.type == "plus" && row.buttonText != ''){
            return (
              <div>
                <a href={`detail/${row.agreementId}`} target="_blank" className="btn cognito x-small green">{row.buttonText}</a>
              </div>
            );
          }
        }
      },
      {
        dataField: "amount",
        text: "Amount",
        isDummyField: true,
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let label_color = "";
          if (row.type == "minus") {
            label_color = "number-highlight color-orange";
          } else if (row.type == "plus") {
            label_color = "number-highlight color-green";
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
            {isLoading && <Loading />}
            {!isLoading && activities.length==0 && <MyActivitiesEmpty />}
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
