import { Dharma,Web3 } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, ListGroup } from "reactstrap";
import { BigNumber } from "bignumber.js";
import * as moment from "moment-timezone";
import { toast } from "react-toastify";
import BootstrapTable from "react-bootstrap-table-next";
import Modal from "react-responsive-modal";
import _ from "lodash";
import paginationFactory from 'react-bootstrap-table2-paginator';
import SummaryItem from "./SummaryItem/SummaryItem";
import Api from "../../services/api";
import LoadingFull from "../LoadingFull/LoadingFull";
import Loading from "../Loading/Loading";
import { niceNumberDisplay } from "../../utils/Util";
import "./Detail.css";
class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      widths: 80,
      principal: 0,
      principalTokenSymbol: "",
      collateralAmount: 0,
      collateralTokenSymbol: "",
      interestRate: "",
      termLength: "",
      termUnit: "",
      createdDate: null,
      createdTime: null,
      interestAmount: 0,
      totalRepaymentAmount: 0,
      outstandingAmount: 0,
      repaymentLoans: [],
      isLoading: true,
      modalOpen: false,
      repaymentAmount: 0,
      agreementId: "",
      totalRepaidAmount: 0,
      collateralBtnDisplay: false,
      repaymentBtnDisplay: false,
      collateralSeizeBtnDisplay: false,
      creditorEthAddress: "",
      debtorEthAddress: "",
      currentEthAddress: "",
      collateralCurrentAmount: 0,
      LTVRatioValue: 0,
      loanScheduleDisplay: false,
      nextRepaymentDate:'',
      loanRequestData:[],
      repaymentButtonDisabled:false,
      overViewBackgroundClass:'',
      overViewButtonBackgroundClass:'',
      transationHistory: []
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.processRepayment = this.processRepayment.bind(this);
  }
  componentWillMount(){
    this.getDetailData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reloadDetails === true && !nextProps.isTokenLoading) {
      this.getDetailData();
    }
  }
  convertBigNumber(obj,power,flag) {
    let responseNumber = 0;
    if(_.isUndefined(flag))
    {
      responseNumber = obj.div(new BigNumber(10).pow(power.toNumber()));  
    }
    else
    {
      let decimal = "1E" + power;
      let amount = obj / decimal;
      responseNumber = amount; 
    }
    responseNumber = (responseNumber > 0) ? parseFloat(responseNumber) : 0;
    return responseNumber;
  }

  getScheduledata(params){
    let response = [];
    if(!_.isUndefined(params))
    {
      let repaymentLoanstemp = [];
      let lastExpectedRepaidAmount = 0;
      let expectedRepaidAmountDharma = 0;
      let nextRepaymentAmount = 0;
      let nextRepaymentDate = '';
      let overViewBackgroundClass = 'overview-bg-success';
      let overViewButtonBackgroundClass = 'overview-bg-btn-success';
      let i = 1;
      let j = 1;
      let schedule = params["schedule"];
      let installmentPrincipal = params["installmentPrincipal"];
      let installmentInterestAmount = params["installmentInterestAmount"];
      let totalRepaidAmount = params["totalRepaidAmount"];
      let userTimezone = params["userTimezone"];
      let totalRepaymentAmount = params["totalRepaymentAmount"];
      let principalTokenSymbol = params["principalTokenSymbol"];
      let debtorEthAddress = params["debtorEthAddress"];
      let creditorEthAddress = params["creditorEthAddress"];
      let currentAccount = params["currentAccount"];
      
      if(!_.isUndefined(schedule) && schedule.length > 0)
      {
        schedule.forEach(ts => {  
          let date = new Date(ts);
          let currentTimestamp = moment().unix();
          ts = ts / 1000;
          let expectedRepaidAmount = parseFloat(installmentPrincipal) + parseFloat(installmentInterestAmount);
          expectedRepaidAmountDharma += expectedRepaidAmount;

          if (ts > currentTimestamp && j == 1 && totalRepaidAmount < expectedRepaidAmountDharma) {
            nextRepaymentAmount = expectedRepaidAmountDharma - totalRepaidAmount;
            nextRepaymentAmount = (nextRepaymentAmount > 0) ? nextRepaymentAmount : 0;
            nextRepaymentDate  = moment(date, "DD/MM/YYYY", true).format("DD/MM/YYYY");
            response["nextRepaymentDate"] = nextRepaymentDate;
            response["nextRepaymentAmount"] = response["repaymentAmount"] = niceNumberDisplay(nextRepaymentAmount);
            j++;
          }
          else if(ts < currentTimestamp && totalRepaidAmount < totalRepaymentAmount){
            nextRepaymentAmount = expectedRepaidAmountDharma - totalRepaidAmount;
            nextRepaymentAmount = (nextRepaymentAmount > 0) ? nextRepaymentAmount : 0;
            response["nextRepaymentAmount"] = response["repaymentAmount"] = niceNumberDisplay(nextRepaymentAmount);
          }
          let paidStatus = (totalRepaidAmount >= expectedRepaidAmountDharma) ? 'paid' : ((totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount) ? 'partial_paid' : ((ts < currentTimestamp) ? 'missed' : 'due'));
          if(ts < currentTimestamp && (debtorEthAddress == currentAccount || creditorEthAddress == currentAccount))
          {
            if(totalRepaidAmount >= expectedRepaidAmountDharma)
            {
              overViewBackgroundClass = 'overview-bg-success';   
              overViewButtonBackgroundClass = 'overview-bg-btn-success';   
            }
            else if(totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount){
              overViewBackgroundClass = 'overview-bg-orange';   
              overViewButtonBackgroundClass = 'overview-bg-btn-orange';
            }
            else{
              if(ts < currentTimestamp){
                overViewBackgroundClass = 'overview-bg-error';   
                overViewButtonBackgroundClass = 'overview-bg-btn-error';
              }
            }  
          }

          response['overViewBackgroundClass'] = overViewBackgroundClass;
          response['overViewButtonBackgroundClass'] = overViewButtonBackgroundClass;
          
          if(lastExpectedRepaidAmount != expectedRepaidAmountDharma)
          {
            lastExpectedRepaidAmount = expectedRepaidAmountDharma;  
          }
          repaymentLoanstemp.push({
            id: i,
            ts: ts,
            createdDate: moment.tz(date, 'DD/MM/YYYY HH:mm:ss', userTimezone).format(),
            principalAmount: niceNumberDisplay(installmentPrincipal),
            principalTokenSymbol: principalTokenSymbol,
            interestAmount: niceNumberDisplay(installmentInterestAmount),
            totalRepaymentAmount: niceNumberDisplay(expectedRepaidAmount),
            status: paidStatus
          });
          i++;
        });  
        response["repaymentLoanstemp"] = repaymentLoanstemp;  
      }
    }
    return response;
  }
  
  buttonOperations(params){
    let response = [];
    response["repaymentBtnDisplay"] = false;
    response["collateralBtnDisplay"] = false;
    response["collateralSeizeBtnDisplay"] = false;
    response["loanScheduleDisplay"] = false;
    let debtorEthAddress = params["debtorEthAddress"];    
    let creditorEthAddress = params["creditorEthAddress"];    
    let currentAccount = params["currentAccount"];    
    let outstandingAmount = params["outstandingAmount"];    
    let collateralReturnable = params["collateralReturnable"];    
    let isCollateralSeizable = params["isCollateralSeizable"];    
    let isRepaid = params["isRepaid"];    

    if (typeof debtorEthAddress != "undefined" && debtorEthAddress == currentAccount) {
      if (outstandingAmount > 0) {
        response["repaymentBtnDisplay"] = true;
      }
      if (outstandingAmount == 0 && collateralReturnable === true) {
        response["collateralBtnDisplay"] = true;
      }
    }
    if (typeof creditorEthAddress != "undefined" && creditorEthAddress == currentAccount && isCollateralSeizable === true && isRepaid === false) {
      response["collateralSeizeBtnDisplay"] = true;
    }
    if ((typeof debtorEthAddress != "undefined" && debtorEthAddress == currentAccount) || (typeof creditorEthAddress != "undefined" && creditorEthAddress == currentAccount)) {
      response["loanScheduleDisplay"] = true;
    }
    return response;
  }

  async getDetailData() {
    const { dharma, id } = this.props;
    let stateObj = {};
    let currentAccount = await dharma.blockchain.getCurrentAccount();
    currentAccount = _.toLower(currentAccount);
    let collateralReturnable = false;
    let scheduleParams = [];
    let buttonParams = [];
    let transationHistoryTemp = [];
    let userTimezone = moment.tz.guess();
    let k = 1;
    const api = new Api();
    if(this.state.isLoading == false)
    {
      this.setState({ isLoading: true });
    }
    api
      .setToken(this.props.token)
      .get(`loan/${id}`)
      .then(async loanRequestData => {
        if (!_.isUndefined(loanRequestData)) {
          let principalTokenSymbol = loanRequestData.principalSymbol;
          let collateralTokenSymbol = loanRequestData.collateralSymbol;
          let principalAmount = this.convertBigNumber(loanRequestData.principalAmount,loanRequestData.principalNumDecimals,true);
          let collateralAmount = this.convertBigNumber(loanRequestData.collateralAmount,loanRequestData.collateralNumDecimals,true);
          let interestRate = parseFloat(loanRequestData.interestRatePercent);
          let interestAmount = (principalAmount * interestRate) / 100;
          let displayAgreementId = _(id).truncate(4);
          await api
            .setToken(this.props.token)
            .get(`priceFeed`)
            .then(async priceFeedData => {
              let principalTokenCurrentPrice = priceFeedData[principalTokenSymbol].USD;
              let principalCurrentAmount = parseFloat(principalAmount) * principalTokenCurrentPrice;
              let collateralTokenCurrentPrice = priceFeedData[collateralTokenSymbol].USD;
              let collateralCurrentAmount = parseFloat(collateralAmount) * collateralTokenCurrentPrice;
              collateralCurrentAmount = (collateralCurrentAmount > 0) ? collateralCurrentAmount : 0;
              stateObj["collateralCurrentAmount"] = niceNumberDisplay(collateralCurrentAmount);

              if (principalCurrentAmount > 0 && collateralCurrentAmount > 0) {
                let LTVRatioValue = (principalCurrentAmount / collateralCurrentAmount) * 100;
                stateObj["LTVRatioValue"] = (LTVRatioValue > 0) ? niceNumberDisplay(LTVRatioValue): 0;
              }
          });
          stateObj["principal"] = niceNumberDisplay(principalAmount);
          stateObj["principalTokenSymbol"] = principalTokenSymbol;
          stateObj["collateralAmount"] = niceNumberDisplay(collateralAmount);
          stateObj["collateralTokenSymbol"] = collateralTokenSymbol;
          stateObj["interestRate"] = interestRate;
          stateObj["termLength"] = loanRequestData.termLengthAmount;
          stateObj["termUnit"] = loanRequestData.termLengthUnit;
          stateObj["createdDate"] = moment(loanRequestData.createdDate).format(
            "DD/MM/YYYY"
          );
          stateObj["createdTime"] = moment(loanRequestData.createdDate).format(
            "HH:mm:ss"
          );
          stateObj["interestAmount"] = interestAmount;
          stateObj["agreementId"] = displayAgreementId;
            
          const isRepaid = loanRequestData.isRepaid;
          const isCollateralSeizable = loanRequestData.isCollateralSeizable;
          let creditorEthAddress = loanRequestData.creditorAddress;
          let debtorEthAddress = loanRequestData.debtorAddress;
          let repayments = loanRequestData.repayments;
          const principalTokenDecimals = await dharma.token.getNumDecimals(principalTokenSymbol);
          let totalRepaymentAmount = this.convertBigNumber(loanRequestData.totalExpectedRepayment,loanRequestData.principalNumDecimals,true);
          let totalRepaidAmount = this.convertBigNumber(loanRequestData.repaidAmount,loanRequestData.principalNumDecimals,true);
          const outstandingAmount = totalRepaymentAmount - totalRepaidAmount;
          if (outstandingAmount == 0) {
            let issuanceHash = id;
            collateralReturnable = await dharma.adapters.collateralizedSimpleInterestLoan.canReturnCollateral(
              issuanceHash
              );
          }

          let installmentPrincipal = principalAmount / loanRequestData.termLengthAmount;
          installmentPrincipal = (installmentPrincipal > 0) ? installmentPrincipal : 0;
          let installmentInterestAmount = (installmentPrincipal * interestRate) / 100;
          
          scheduleParams["schedule"] = loanRequestData.repaymentSchedule;
          scheduleParams["installmentPrincipal"] = installmentPrincipal;
          scheduleParams["installmentInterestAmount"] = installmentInterestAmount;
          scheduleParams["totalRepaidAmount"] = totalRepaidAmount;
          scheduleParams["userTimezone"] = userTimezone;
          scheduleParams["principalTokenSymbol"] = principalTokenSymbol;
          scheduleParams["totalRepaymentAmount"] = totalRepaymentAmount;
          scheduleParams["debtorEthAddress"] = debtorEthAddress;
          scheduleParams["creditorEthAddress"] = creditorEthAddress;
          scheduleParams["currentAccount"] = currentAccount;
          let scheduleResponse = this.getScheduledata(scheduleParams);
          stateObj['nextRepaymentDate'] = scheduleResponse['nextRepaymentDate'];
          stateObj['nextRepaymentAmount'] = scheduleResponse['nextRepaymentAmount'];
          stateObj['repaymentAmount'] = scheduleResponse['repaymentAmount'];
          stateObj['lastExpectedRepaidAmount'] = scheduleResponse['lastExpectedRepaidAmount'];
          stateObj['repaymentLoans'] = scheduleResponse['repaymentLoanstemp'];
          stateObj["overViewBackgroundClass"] = scheduleResponse["overViewBackgroundClass"];
          stateObj["overViewButtonBackgroundClass"] = scheduleResponse["overViewButtonBackgroundClass"];

          repayments.forEach(data => {     
            let amount = this.convertBigNumber(data.amount,loanRequestData.principalNumDecimals,true);
            let date = new Date(data.date);
            transationHistoryTemp.push({
              id: k,
              createdDate: moment.tz(date, 'DD/MM/YYYY HH:mm:ss', userTimezone).format(),
              amount: niceNumberDisplay(amount),
              principalTokenSymbol:principalTokenSymbol        
            });
            k++;
          });

          stateObj["currentEthAddress"] = currentAccount;
          
          buttonParams["debtorEthAddress"] = debtorEthAddress;
          buttonParams["creditorEthAddress"] = creditorEthAddress;
          buttonParams["currentAccount"] = currentAccount;
          buttonParams["outstandingAmount"] = outstandingAmount;
          buttonParams["collateralReturnable"] = collateralReturnable;
          buttonParams["isCollateralSeizable"] = isCollateralSeizable;
          buttonParams["isRepaid"] = isRepaid;
          let buttonOperationResponse = this.buttonOperations(buttonParams);
          
          stateObj["repaymentBtnDisplay"] = buttonOperationResponse["repaymentBtnDisplay"];
          stateObj["collateralBtnDisplay"] = buttonOperationResponse["collateralBtnDisplay"];
          stateObj["collateralSeizeBtnDisplay"] = buttonOperationResponse["collateralSeizeBtnDisplay"];
          stateObj["loanScheduleDisplay"] = buttonOperationResponse["loanScheduleDisplay"];
          stateObj["principalTokenDecimals"] = principalTokenDecimals;
          stateObj["totalRepaidAmount"] = niceNumberDisplay(totalRepaidAmount);
          
          stateObj["isLoading"] = false;
          stateObj["totalRepaymentAmount"] = niceNumberDisplay(totalRepaymentAmount);
          stateObj["outstandingAmount"] = niceNumberDisplay(outstandingAmount);
          stateObj["debtorEthAddress"] = debtorEthAddress;
          
          stateObj["transationHistory"] = transationHistoryTemp;

          this.setState(stateObj);
        }
      });
  }



  makeRepayment(event, callback) {
    this.setState({ modalOpen: true });
  }

  async getTransactionReceipt (hash) {
    let receipt = null;
    let data = '';
    while(receipt === null)
    {
      /*we are going to check every second if transation is mined or not, once it is mined we'll leave the loop*/
      data = await this.getTransactionReceiptPromise(hash);
      if(!_.isUndefined(data) && data != null && data.blockHash != null && data.blockHash != null && data.from != null && data.from != '' && data.to != null && data.to != '')
      {
        receipt = data;
      }
      /*can put sleep for one sec*/
    }
    return receipt;
  }

  getTransactionReceiptPromise(hash) {
    let web3js = window.web3 ? new Web3(window.web3.currentProvider) : '';
    return new Promise(function(resolve, reject) {
        web3js.eth.getTransactionReceipt(hash, function(err, data) {
            if (err !== null) reject(err);
            else resolve(data);
        });
    });
  }

  async processRepayment() {
    const { Debt } = Dharma.Types;
    const { dharma, id } = this.props;
    const { debtorEthAddress, principalTokenSymbol } = this.state;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    let stateObj = {};
    let repaymentAmount = parseFloat(niceNumberDisplay(this.state.repaymentAmount));
    let outstandingAmount = parseFloat(niceNumberDisplay(this.state.outstandingAmount));
    if (typeof currentAccount != "undefined" && debtorEthAddress == currentAccount &&repaymentAmount > 0
    ) 
    {
        this.setState({ repaymentButtonDisabled: true });
        const debt = await Debt.fetch(dharma, id);
        if (repaymentAmount <= outstandingAmount && outstandingAmount > 0) {
          try {
            const txHash = await debt.makeRepayment(repaymentAmount);
            let response = await this.getTransactionReceipt(txHash);
            if (response) {
              let _this = this;
              setTimeout(function(){ 
                _this.props.refreshTokens();
                _this.getDetailData();
                toast.success(
                  "You have successfully repaid "+repaymentAmount+ " "+principalTokenSymbol+".",
                  {
                    autoClose: 8000
                  }
                );
              }, 2500);
              stateObj["modalOpen"] = false;
              stateObj["repaymentButtonDisabled"] = false;
              stateObj["isLoading"] = true;
              this.setState(stateObj);
            }
          }
          catch (e) {
            console.log(e)
            console.log(new Error(e))
            toast.error(
              "You have not granted the token a sufficient allowance in the specified token to execute this repayment or you does not have sufficient balance."
            );
            this.setState({ repaymentButtonDisabled: false });
          }
        }
        else {
          toast.error(
            "Repayment amount can not be more then outstanding amount."
          );
          this.setState({ repaymentButtonDisabled: false });
        }      
    } else {
      let msg =
        currentAccount != debtorEthAddress
          ? "Invalid access."
          : repaymentAmount == 0
            ? "Payment amount must be greater then zero."
            : "Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured and reload the page.";
      toast.error(msg, {
        autoClose: 8000
      });
      this.setState({ repaymentButtonDisabled: false });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    this.setState({ repaymentAmount: value });
  }

  async unblockCollateral(event, callback) {
    const { Debt } = Dharma.Types;
    const { dharma, id } = this.props;
    const debt = await Debt.fetch(dharma, id);
    if (typeof debt != "undefined") {
      const outstandingAmount = await debt.getOutstandingAmount();
      if (outstandingAmount == 0) {
        const txHash = await debt.returnCollateral();
        let response = await this.getTransactionReceipt(txHash);
        if (response) {
          this.getDetailData();
          toast.success("Collateral return requested successfully.", {
            autoClose: 8000
          });
        }
      }
    }
  }

  async seizeCollateral(event, callback) {
    const { Investment } = Dharma.Types;
    const { dharma, id } = this.props;
    const investment = await Investment.fetch(dharma, id);
    const isRepaid = await investment.isRepaid();
    
    if (typeof investment != "undefined" && isRepaid === false) {
      const isCollateralSeizable = await investment.isCollateralSeizable();
      if (isCollateralSeizable === true) {
        const txHash = await investment.seizeCollateral();
        let response = await this.getTransactionReceipt(txHash);
        if (response) {
          this.getDetailData();
          toast.success("Collateral seize requested successfully.", {
            autoClose: 8000
          });
        } else {
          toast.error("Something went wrong.Please try again.", {
            autoClose: 8000
          });
        }
      } else {
        toast.error("Collateral can not be seized.", {
          autoClose: 8000
        });
      }
    }
  }

  onCloseModal = () => {
    this.setState({ modalOpen: false });
  };

  render() {
    const pagination = paginationFactory({
      page: 1,
      alwaysShowAllBtns:true            
    });

    const columns = [
      {
        dataField: "createdDate",
        text: "Repayment Date",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          var date = moment(cell).format("DD/MM/YYYY");
          var time = moment(cell).format("HH:mm:ss");
          return (
            <div>
              <div className="text-left">
                <span className="number-highlight">
                  {date}
                  <br />
                </span>
                <span className="funded-loans-time-label">{time}</span>
              </div>
            </div>
          );
        }
      },
      {
        dataField: "principalAmount",
        text: "Principle Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <div className="text-right dispaly-inline-block">
                <span className="number-highlight">{cell}</span>
                <br />
                {row.principalTokenSymbol}
              </div>
            </div>
          );
        }
      },
      {
        dataField: "interestAmount",
        text: "Interest Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <span className="number-highlight">{cell}</span> <br />
              {row.principalTokenSymbol}
            </div>
          );
        }
      },
      {
        dataField: "totalRepaymentAmount",
        text: "Total Repaymnet Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <span className="number-highlight">{cell}</span> <br />
              {row.principalTokenSymbol}
            </div>
          );
        }
      },
      {
        dataField: "status",
        text: "Status",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let label = "Due";
          let className = "payment-due";
          let iconName = "fa-check-circle";
          if (row.status == 'paid') {
            label = "Paid";
            className = "payment-success";
          }
          else if(row.status == "partial_paid"){
            label = "Partially Paid";
            className = "payment-partial-paid";   
          }
          else if(row.status == "missed"){
            label = "Missed";
            className = "payment-missed";   
            iconName = "fa-times-circle"
          }
          return (
            <div className={className}>
              <i className={"fa payment-check-circle " + iconName } />
              <br />
              {label}
            </div>
          );
        }
      }
    ];

    const transactionColumns = [
      {
        dataField: "createdDate",
        text: "Repayment Date",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          var date = moment(cell).format("DD/MM/YYYY");
          var time = moment(cell).format("HH:mm:ss");
          return (
            <div>
              <div className="text-left">
                <span className="number-highlight">
                  {date}
                  <br />
                </span>
                <span className="funded-loans-time-label">{time}</span>
              </div>
            </div>
          );
        }
      },
      {
        dataField: "amount",
        text: "Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <div className="text-right dispaly-inline-block">
                <span className="number-highlight">{cell}</span>
                <br />
                {row.principalTokenSymbol}
              </div>
            </div>
          );
        }
      }      
    ];

    const {
      principal,
      principalTokenSymbol,
      collateralAmount,
      collateralTokenSymbol,
      termUnit,
      termLength,
      interestRate,
      createdDate,
      createdTime,
      interestAmount,
      totalRepaymentAmount,
      isLoading,
      outstandingAmount,
      modalOpen,
      nextRepaymentAmount,
      repaymentAmount,
      collateralBtnDisplay,
      repaymentBtnDisplay,
      collateralSeizeBtnDisplay,
      currentEthAddress,
      debtorEthAddress,
      collateralCurrentAmount,
      LTVRatioValue,
      loanScheduleDisplay,
      nextRepaymentDate,
      repaymentButtonDisabled,
      overViewBackgroundClass,
      overViewButtonBackgroundClass,
      repaymentLoans            
    } = this.state;
    let buttonText = (repaymentButtonDisabled===true) ? 'processing' : 'Make Repayment';
    let transationHistory = _.reverse(_.sortBy(this.state.transationHistory,['createdDate']));
    return (
      <div>
        <div className="page-title">
          <Row>
            <Col>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link className="link-blue" to="/dashboard">My Loans</Link>
                </BreadcrumbItem>
                <BreadcrumbItem active>Loan Detail</BreadcrumbItem>
              </Breadcrumb>
            </Col>
          </Row>

          <Row className="mt-4 mb-4">
            <Col>
              <h4 className="mb-0"> Loan Detail</h4>
            </Col>
          </Row>
        </div>
        {
          isLoading && <LoadingFull />
        }
        {
          !isLoading &&
          <div>
            <Row className="mb-30">
              <Col lg={4} md={4} sm={6} xl={4}>
                <div>
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
                            {principal > 0 ? principalTokenSymbol : ""}
                          </div>
                        </Col>

                        <Col lg={6} md={6} sm={6} xl={6}>
                          <div className="">
                            <span>Outstanding Amount</span>
                            <br />
                            <span className="loan-detail-numbers">
                              {outstandingAmount > 0 ? outstandingAmount : " - "}
                            </span>{" "}
                            {outstandingAmount > 0 ? principalTokenSymbol : ""}
                          </div>
                        </Col>
                      </Row>

                      <Row className="mt-20">
                        {outstandingAmount > 0 &&
                          currentEthAddress == debtorEthAddress && (
                            <Col lg={6} md={6} sm={6} xl={6}>
                              <div className="pull-left">
                                <span>Next Repayment</span>
                                <br />
                                <span className="loan-detail-numbers">
                                  {nextRepaymentAmount > 0
                                    ? nextRepaymentAmount
                                    : " - x"}
                                </span>{" "}
                                {outstandingAmount > 0 ? principalTokenSymbol : ""}
                                <br />
                                <span>{nextRepaymentDate}</span>
                              </div>
                            </Col>
                          )}

                        <Col lg={6} md={6} sm={6} xl={6}>
                          {repaymentBtnDisplay === true && (
                            <button
                              className={"btn cognito repayment-button icon mb-15 btn-make-repayment btn-sm "+overViewButtonBackgroundClass}
                              onClick={event => this.makeRepayment()}
                            >
                              Make Repayment
                        </button>
                          )}

                          {outstandingAmount == 0 &&
                            collateralBtnDisplay === true && (
                              <button
                                className="btn cognito repayment-button icon mb-15 btn-make-repayment"
                                onClick={event => this.unblockCollateral()}
                              >
                                Claim Collateral
                          </button>
                            )}

                          {collateralSeizeBtnDisplay === true && (
                            <button
                              className={"btn cognito repayment-button icon mb-15 btn-make-repayment btn-sm "+overViewButtonBackgroundClass}
                              onClick={event => this.seizeCollateral()}
                            >
                              Seize Collateral
                        </button>
                          )}
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </div>

                <div className="mt-30">
                  <Card className="card-statistics mb-30 h-100 p-4">
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
                            labelValue={collateralAmount > 0 ? collateralAmount : ' - '}
                            labelValue2={collateralAmount > 0 ? collateralTokenSymbol : ''}
                          />
                          <SummaryItem
                            labelName="Collateral Value"
                            labelValue={collateralCurrentAmount > 0 ? collateralCurrentAmount : ' - '}
                            labelValue2={collateralCurrentAmount > 0 ? '$' : ''}
                          />
                          <SummaryItem
                            labelName="LTV"
                            labelValue={LTVRatioValue > 0 ? LTVRatioValue : ' - '}
                            labelValue2={LTVRatioValue > 0 ? '%' : ''}
                          />
                          <SummaryItem
                            labelName="Loan Term"
                            labelValue={termLength > 0 ? termLength : ' - '}
                            labelValue2={termLength > 0 ? termUnit : ''}
                          />
                          <SummaryItem
                            labelName="Interest Rate(Per Loan Term)"
                            labelValue={interestRate > 0 ? interestRate : ' - '}
                            labelValue2={interestRate > 0 ? '%' : ''}
                          />
                          <SummaryItem
                            labelName="Interest Amount"
                            labelValue={interestAmount > 0 ? interestAmount : ' - '}
                            labelValue2={interestAmount > 0 ? principalTokenSymbol : ' - '}
                          />
                          <SummaryItem
                            labelName="Total Repayment Amount"
                            labelValue={totalRepaymentAmount > 0 ? totalRepaymentAmount : ' - '}
                            labelValue2={totalRepaymentAmount > 0 ? principalTokenSymbol : ' - '}
                          />
                        </ListGroup>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Col>

              {loanScheduleDisplay === true && (
                <Col lg={8} md={8} sm={6} xl={8}>
                  <Card className="card-statistics mb-30 p-4">
                    <CardBody>
                      <CardTitle>Repayment Schedule</CardTitle>

                      {isLoading === true && <Loading />}

                      {isLoading === false && (
                        <BootstrapTable
                          hover={false}
                          keyField="id"
                          classes={"open-request"}
                          columns={columns}
                          data={repaymentLoans}
                          headerClasses={"text-center"}
                          bordered={false}
                        />
                      )}
                    </CardBody>
                  </Card>

                  { transationHistory.length > 0 && (

                  <Card className="card-statistics mb-30 p-4">
                    <CardBody>
                      <CardTitle>Transaction History</CardTitle>

                      {isLoading === true && <Loading />}

                      {isLoading === false && (
                        <BootstrapTable
                          hover={false}
                          keyField="id"
                          classes={"open-request"}
                          columns={transactionColumns}
                          data={transationHistory}
                          headerClasses={"text-center"}
                          bordered={false}
                          pagination={pagination}
                        />
                      )}
                    </CardBody>
                  </Card>

                  )}
                </Col>
              )}
            </Row>

            <Modal open={modalOpen} onClose={this.onCloseModal} center>
              <Row>
                <Col lg={12} md={12} sm={6} xl={12}>
                  <h2 className="text-center text-bold">Make Repayment</h2>

                  <p className="repayment-details mt-15 mb-15">
                    Your outstanding balance is <span className="text-bold">{outstandingAmount} {principalTokenSymbol}</span> in total. You are due <span className="text-bold">{nextRepaymentAmount} {principalTokenSymbol}</span> by <span className="text-bold">{nextRepaymentDate}</span>.
                  </p>

                  <input
                    type="text"
                    className="form-control"
                    name="repaymentAmount"
                    id="repayment_amount"
                    value={repaymentAmount}
                    onChange={this.handleInputChange}
                  />

                  <div className="mt-20 text-center">
                    <button
                      className="btn cognito orange small icon mb-15 make-repayment-btn"
                      onClick={this.processRepayment} disabled={repaymentButtonDisabled}>{buttonText}</button>
                    <button
                      className="btn cognito small icon mb-15 ml-10"
                      onClick={this.onCloseModal}>Cancel</button>
                  </div>
                </Col>
              </Row>
            </Modal>
          </div>
        }
      </div>
    );
  }
}
export default Detail;
