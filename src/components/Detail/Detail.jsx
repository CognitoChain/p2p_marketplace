import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, ListGroup } from "reactstrap";
import { BigNumber } from "bignumber.js";
import * as moment from "moment-timezone";
import { toast } from "react-toastify";
import BootstrapTable from "react-bootstrap-table-next";
import Modal from "react-responsive-modal";
import _ from "lodash";
import SummaryItem from "./SummaryItem/SummaryItem";
import Api from "../../services/api";
import LoadingFull from "../LoadingFull/LoadingFull";
import Loading from "../Loading/Loading";
import { BLOCKCHAIN_API } from "../../common/constants";
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
      overViewButtonBackgroundClass:''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.processRepayment = this.processRepayment.bind(this);
  }
  convertBigNumber(obj,power,flag) {
    if(_.isUndefined(flag))
    {
      return obj.div(new BigNumber(10).pow(power.toNumber()));  
    }
    else
    {
      let decimal = "1E" + power;
      let amount = obj / decimal;
      return amount; 
    }
  }
  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async prepareRepaymentScheduleDetails(){
    const { dharma, id } = this.props;
    const { Debt } = Dharma.Types;
    const { loanRequestData } = this.state;
    let currentAccount = await dharma.blockchain.getCurrentAccount();
    currentAccount = _.toLower(currentAccount);
    let collateralReturnable = false;
    let stateObj = {};
    let repaymentLoanstemp = [];
    let agreementId = id;
    let userTimezone = moment.tz.guess();
    let principalAmount = this.convertBigNumber(loanRequestData.principalAmount,loanRequestData.principalNumDecimals,true);
    let principalTokenSymbol = loanRequestData.principalSymbol;
    let repaymentSchedule = loanRequestData.repaymentSchedule;
    let nextRepaymentDate = '';
    let i = 1;
    let j = 1;
    let lastExpectedRepaidAmount = 0;
    let nextRepaymentAmount = 0;
    let overViewBackgroundClass = '';
    let overViewButtonBackgroundClass = '';
    const isRepaid = loanRequestData.isRepaid;
    const isCollateralSeizable = loanRequestData.isCollateralSeizable;
    let creditorEthAddress = loanRequestData.creditorAddress;
    let debtorEthAddress = loanRequestData.debtorAddress;
    const principalTokenDecimals = await dharma.token.getNumDecimals(principalTokenSymbol);
    /*const valueRepaidAr = await dharma.servicing.getValueRepaid(
      agreementId
    );
    const valueRepaid = this.convertBigNumber(valueRepaidAr,principalTokenDecimals);*/
    const debt = await Debt.fetch(dharma, id);
    const outstandingAmount = await debt.getOutstandingAmount();
    if (outstandingAmount == 0) {
      /*const debtRegistryEntry = await dharma.servicing.getDebtRegistryEntry(
        id
        );
      const adapter = await dharma.adapters.getAdapterByTermsContractAddress(
        debtRegistryEntry.termsContract
        );*/
      let issuanceHash = id;
      collateralReturnable = await dharma.adapters.collateralizedSimpleInterestLoan.canReturnCollateral(
        issuanceHash
        );
    }
    let totalRepaymentAmount = this.convertBigNumber(loanRequestData.totalExpectedRepayment,loanRequestData.principalNumDecimals,true);
    let totalRepaidAmount =
            parseFloat(totalRepaymentAmount) - parseFloat(outstandingAmount);
    totalRepaidAmount = (totalRepaidAmount > 0) ? totalRepaidAmount : 0;

    let installmentPrincipal = principalAmount / loanRequestData.termLengthAmount;
    installmentPrincipal = (installmentPrincipal > 0) ? installmentPrincipal : 0;

    let interestRate = parseFloat(loanRequestData.interestRatePercent);
    let interestAmount = (installmentPrincipal * interestRate) / 100;
    await this.asyncForEach(repaymentSchedule, async ts => {
      let date = new Date(ts);
      let currentTimestamp = moment().unix();
      ts = ts / 1000;
      let expectedRepaidAmountBigNumber = await dharma.servicing.getExpectedValueRepaid(
        agreementId,
        ts
      );
      let expectedRepaidAmount = parseFloat(installmentPrincipal) + parseFloat(interestAmount);
      let expectedRepaidAmountDharma = this.convertBigNumber(expectedRepaidAmountBigNumber,principalTokenDecimals);
      expectedRepaidAmount = (expectedRepaidAmount > 0) ? parseFloat(expectedRepaidAmount) : 0;
      expectedRepaidAmountDharma = (expectedRepaidAmountDharma > 0) ? parseFloat(expectedRepaidAmountDharma) : 0;

      if (ts > currentTimestamp && j == 1 && totalRepaidAmount < expectedRepaidAmountDharma) {
        nextRepaymentAmount = expectedRepaidAmountDharma - totalRepaidAmount;
        nextRepaymentAmount = (nextRepaymentAmount > 0) ? nextRepaymentAmount : 0;
        nextRepaymentDate  = moment(date, "DD/MM/YYYY", true).format("DD/MM/YYYY");
        stateObj["nextRepaymentDate"] = nextRepaymentDate;
        stateObj["nextRepaymentAmount"] = stateObj["repaymentAmount"] = niceNumberDisplay(nextRepaymentAmount);
        j++;
      }
      let paidStatus = '';
      if(totalRepaidAmount >= expectedRepaidAmountDharma)
      {
        paidStatus = 'paid';
        overViewBackgroundClass = 'overview-bg-success';   
        overViewButtonBackgroundClass = 'overview-bg-btn-success';   
      }
      else if(totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount){
        paidStatus = 'partial_paid';   
        overViewBackgroundClass = 'overview-bg-orange';   
        overViewButtonBackgroundClass = 'overview-bg-btn-orange';
      }
      else{
        paidStatus = 'due';
        if(ts < currentTimestamp){
          paidStatus = 'missed';
          overViewBackgroundClass = 'overview-bg-error';   
          overViewButtonBackgroundClass = 'overview-bg-btn-error';
        }
      }

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
        interestAmount: niceNumberDisplay(interestAmount),
        totalRepaymentAmount: niceNumberDisplay(expectedRepaidAmount),
        status: paidStatus
      });
      i++;
    });
    stateObj["currentEthAddress"] = currentAccount;
    if (typeof debtorEthAddress != "undefined" && debtorEthAddress == currentAccount) {
      if (outstandingAmount > 0) {
        stateObj["repaymentBtnDisplay"] = true;
      }
      if (outstandingAmount == 0 && collateralReturnable === true) {
        stateObj["collateralBtnDisplay"] = true;
      }
    }
    if (typeof creditorEthAddress != "undefined" && creditorEthAddress == currentAccount && isCollateralSeizable === true && isRepaid === false) {
      stateObj["collateralSeizeBtnDisplay"] = true;
    }
    if ((typeof debtorEthAddress != "undefined" && debtorEthAddress == currentAccount) || (typeof creditorEthAddress != "undefined" && creditorEthAddress == currentAccount)) {
      stateObj["loanScheduleDisplay"] = true;
    }
    stateObj["repaymentLoans"] = repaymentLoanstemp;
    stateObj["principalTokenDecimals"] = principalTokenDecimals;
    stateObj["totalRepaidAmount"] = niceNumberDisplay(totalRepaidAmount);
    stateObj["nextRepaymentDate"] = nextRepaymentDate;
    stateObj["isLoading"] = false;
    stateObj["totalRepaymentAmount"] = niceNumberDisplay(totalRepaymentAmount);
    stateObj["outstandingAmount"] = niceNumberDisplay(outstandingAmount);
    stateObj["debtorEthAddress"] = debtorEthAddress;
    stateObj["overViewBackgroundClass"] = overViewBackgroundClass;
    stateObj["overViewButtonBackgroundClass"] = overViewButtonBackgroundClass;
    this.setState(stateObj);
    return principalTokenDecimals;
  }

  async componentWillMount() {
    const { id } = this.props;
    let stateObj = {};
    const api = new Api();
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
          this.setState({ loanRequestData: loanRequestData }, () => {
            this.prepareRepaymentScheduleDetails();  
          });
          this.setState(stateObj);
        }
      });
  }

  makeRepayment(event, callback) {
    this.setState({ modalOpen: true });
  }

  async processRepayment() {
    const { Debt } = Dharma.Types;
    const { dharma, id } = this.props;
    const { repaymentAmount, debtorEthAddress, principalTokenSymbol,outstandingAmount } = this.state;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    let stateObj = {};
    if (typeof currentAccount != "undefined" && debtorEthAddress == currentAccount &&repaymentAmount > 0
    ) 
    {
        this.setState({ repaymentButtonDisabled: true });
        const debt = await Debt.fetch(dharma, id);
        if (repaymentAmount <= outstandingAmount && outstandingAmount > 0) {
          try {
            const txHash = await debt.makeRepayment(repaymentAmount);
            if (txHash != "") {
              await dharma.blockchain.awaitTransactionMinedAsync(
                txHash,
                BLOCKCHAIN_API.POLLING_INTERVAL,
                BLOCKCHAIN_API.TIMEOUT,
              );
              this.prepareRepaymentScheduleDetails();
              toast.success(
                "You have successfully repaid "+repaymentAmount+ " "+principalTokenSymbol+".",
                {
                  autoClose: 8000
                }
              );
              stateObj["modalOpen"] = false;
              stateObj["repaymentButtonDisabled"] = false;
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
        if (txHash != "") {
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
        if (txHash != "") {
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

  getData() {
    const { repaymentLoans } = this.state;
    return repaymentLoans.map(request => {
      return {
        ...request,
        requestedDate: ""
      };
    });
  }

  onCloseModal = () => {
    this.setState({ modalOpen: false });
  };

  render() {
    const data = this.getData();
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
      overViewButtonBackgroundClass      
    } = this.state;
    let buttonText = (repaymentButtonDisabled===true) ? 'processing' : 'Make Repayment';
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
                              className="btn cognito repayment-button icon mb-15 btn-make-repayment"
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
                          data={data}
                          headerClasses={"text-center"}
                          bordered={false}
                        />
                      )}
                    </CardBody>
                  </Card>
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
