import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";
import * as moment from "moment-timezone";
import _ from "lodash";
import Summary from "./Summary/Summary";
import Overview from "./Overview/Overview";
import PayModal from "./PayModal/PayModal";
import Transactions from "./Transactions/Transactions";
import RepaymentSchedule from "./RepaymentSchedule/RepaymentSchedule";
import Api from "../../services/api";
import LoadingFull from "../LoadingFull/LoadingFull";
import { niceNumberDisplay, convertBigNumber, getTransactionReceipt } from "../../utils/Util";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import "./Detail.css";
class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      widths: 80,
      loanDetails: {},
      buttonLoading: false,
      repaymentButtonLoading: false,
      unlockTokenButtonLoading: false,
      modalButtonLoading: false,
      userTimezone: null,
      priceFeeds: [],
      repaymentLoans: [],
      isLoading: true,
      modalOpen: false,
      collateralBtnDisplay: false,
      repaymentBtnDisplay: false,
      collateralSeizeBtnDisplay: false,
      collateralCurrentAmount: 0,
      LTVRatioValue: 0,
      loanScheduleDisplay: false,
      nextRepaymentDate: '',
      loanRequestData: [],
      overViewBackgroundClass: '',
      overViewButtonBackgroundClass: '',
      transationHistory: [],
      alertMessageDisplay: '',
      alertMessage: '',
      modalMessage: '',
      modalMessageDisplay: '',
      isLoanUser: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.processRepayment = this.processRepayment.bind(this);
    this.seizeCollateral = this.seizeCollateral.bind(this);
    this.makeRepayment = this.makeRepayment.bind(this);
    this.unblockCollateral = this.unblockCollateral.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.unlockToken = this.unlockToken.bind(this);

  }
  componentWillMount() {
    this.getPriceFeeds();
    this.getDetailData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reloadDetails === true && !nextProps.isTokenLoading) {
      this.getDetailData();
    }
  }
  getScheduledata() {
    const { currentMetamaskAccount } = this.props;
    const { loanDetails, userTimezone, repaymentBtnDisplay, collateralBtnDisplay, collateralSeizeBtnDisplay, isLoanUser } = this.state;
    const {
      principalAmount,
      creditorAddress,
      debtorAddress,
      totalRepaymentAmount,
      repaymentSchedule,
      termLengthAmount,
      interestRatePercent,
      totalRepaidAmount,
      principalSymbol,
      isCollateralSeized,
      isCollateralReturned,
      isCollateralSeizable
    } = loanDetails;
    let installmentPrincipal = principalAmount / termLengthAmount;
    installmentPrincipal = (installmentPrincipal > 0) ? installmentPrincipal : 0;
    let installmentInterestAmount = (installmentPrincipal * parseFloat(interestRatePercent)) / 100;
    if (!_.isEmpty(loanDetails)) {
      let repaymentLoanstemp = [];
      let lastExpectedRepaidAmount = 0;
      let expectedRepaidAmountDharma = 0;
      let nextRepaymentAmount, repaymentAmount = 0;
      let nextRepaymentDate = '';
      let overViewBackgroundClass = '';
      let overViewButtonBackgroundClass = '';
      let i = 1;
      let j = 1;
      if ((!_.isUndefined(repaymentSchedule) && repaymentSchedule.length > 0) && isLoanUser) {
        repaymentSchedule.forEach(ts => {
          let date = new Date(ts);
          let currentTimestamp = moment().unix();
          ts = ts / 1000;
          let expectedRepaidAmount = parseFloat(installmentPrincipal) + parseFloat(installmentInterestAmount);
          expectedRepaidAmountDharma += expectedRepaidAmount;
          if (ts > currentTimestamp && j == 1 && totalRepaidAmount < expectedRepaidAmountDharma) {
            nextRepaymentAmount = expectedRepaidAmountDharma - totalRepaidAmount;
            nextRepaymentDate = moment(date, "DD/MM/YYYY", true).format("DD/MM/YYYY");
            nextRepaymentAmount = repaymentAmount = niceNumberDisplay(nextRepaymentAmount);
            j++;
          }
          else if (ts < currentTimestamp && totalRepaidAmount < totalRepaymentAmount) {
            nextRepaymentAmount = expectedRepaidAmountDharma - totalRepaidAmount;
            nextRepaymentAmount = repaymentAmount = niceNumberDisplay(nextRepaymentAmount);
          }
          let paidStatus = '-'

          paidStatus = (totalRepaidAmount >= expectedRepaidAmountDharma) ? 'paid' : ((totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount) ? 'partial_paid' : ((ts < currentTimestamp) ? 'missed' : 'due'));

          if(creditorAddress == currentMetamaskAccount || debtorAddress == currentMetamaskAccount)
          {
            if(isCollateralSeizable == true || isCollateralSeized == true)
            {
              overViewBackgroundClass = 'overview-bg-error';
              overViewButtonBackgroundClass = 'overview-bg-btn-error';
            }
            else if(isCollateralReturned || collateralReturnable){
              overViewBackgroundClass = 'overview-bg-success';
              overViewButtonBackgroundClass = 'overview-bg-btn-success';
            }
            else
            {
              if (ts < currentTimestamp || (overViewBackgroundClass == '' && overViewButtonBackgroundClass == '')) {
                if (totalRepaidAmount >= expectedRepaidAmountDharma) {
                  overViewBackgroundClass = 'overview-bg-success';
                  overViewButtonBackgroundClass = 'overview-bg-btn-success';
                }
                else if (totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount) {
                  overViewBackgroundClass = 'overview-bg-orange';
                  overViewButtonBackgroundClass = 'overview-bg-btn-orange';
                }
                else {
                  if (ts < currentTimestamp) {
                    overViewBackgroundClass = 'overview-bg-error';
                    overViewButtonBackgroundClass = 'overview-bg-btn-error';
                  }
                  else
                  {
                    overViewBackgroundClass = 'overview-bg-success';
                    overViewButtonBackgroundClass = 'overview-bg-btn-success';
                  }
                }
              } 
            }  
          }
          else
          {
            overViewBackgroundClass = 'overview-bg-success';
            overViewButtonBackgroundClass = 'overview-bg-btn-success';
          }

          if (lastExpectedRepaidAmount != expectedRepaidAmountDharma) {
            lastExpectedRepaidAmount = expectedRepaidAmountDharma;
          }
          repaymentLoanstemp.push({
            id: i,
            ts: ts,
            createdDate: moment.tz(date, 'DD/MM/YYYY HH:mm:ss', userTimezone).format(),
            principalAmount: installmentPrincipal,
            principalSymbol: principalSymbol,
            interestAmount: installmentInterestAmount,
            totalRepaymentAmount: expectedRepaidAmount,
            status: paidStatus
          });
          i++;
        });
        this.setState({
          nextRepaymentAmount,
          overViewBackgroundClass,
          overViewButtonBackgroundClass,
          repaymentAmount,
          nextRepaymentDate,
          lastExpectedRepaidAmount,
          repaymentLoans: repaymentLoanstemp
        })
      }
    }
  }
  getTxnHistory() {
    const { loanDetails, userTimezone } = this.state;
    const {
      repayments,
      principalNumDecimals,
      principalSymbol
    } = loanDetails;
    let transationHistory = [];
    let k = 1;
    repayments.forEach(data => {
      let amount = convertBigNumber(data.amount, principalNumDecimals);
      let date = new Date(data.date);
      transationHistory.push({
        id: k,
        createdDate: moment.tz(date, 'DD/MM/YYYY HH:mm:ss', userTimezone).format(),
        amount: amount,
        principalSymbol: principalSymbol
      });
      k++;
    });
    this.setState({
      transationHistory
    })
  }
  async buttonOperations() {
    const { currentMetamaskAccount } = this.props;
    const { loanDetails } = this.state;
    const {
      isRepaid,
      isCollateralSeizable,
      creditorAddress,
      debtorAddress,
      outstandingAmount,
      collateralReturnable,
      isCollateralSeized,
      isCollateralReturned
    } = loanDetails;

    let repaymentBtnDisplay, collateralBtnDisplay, collateralSeizeBtnDisplay, loanScheduleDisplay = false;

    if (typeof debtorAddress != "undefined" && debtorAddress == currentMetamaskAccount) {
      if (outstandingAmount > 0 && !isCollateralSeized) {
        repaymentBtnDisplay = true;
      }
      if (outstandingAmount == 0 && collateralReturnable === true && isCollateralReturned == false) {
        collateralBtnDisplay = true;
      }
    }
    if (typeof creditorAddress != "undefined" && creditorAddress == currentMetamaskAccount && isCollateralSeizable === true && isRepaid === false) {
      collateralSeizeBtnDisplay = true;
    }
    if ((typeof debtorAddress != "undefined" && debtorAddress == currentMetamaskAccount) || (typeof creditorAddress != "undefined" && creditorAddress == currentMetamaskAccount)) {
      loanScheduleDisplay = true;
    }
    this.setState({
      repaymentBtnDisplay,
      collateralBtnDisplay,
      collateralSeizeBtnDisplay,
      loanScheduleDisplay
    }, () => {
      this.getScheduledata();
      this.getTxnHistory();
    })
  }
  async getPriceFeeds() {
    const api = new Api();
    const priceFeeds = await api
      .setToken(this.props.token)
      .get(`priceFeed`);
    this.setState({ priceFeeds })
  }
  async getDetailData(isRefreshOnly = false) {
    const { dharma, id, currentMetamaskAccount } = this.props;
    let collateralReturnable, isCollateralSeizable, isCollateralSeized = false;
    let userTimezone = moment.tz.guess();
    const api = new Api();
    if (!isRefreshOnly) {
      this.setState({ isLoading: true });
    }
    api
      .setToken(this.props.token)
      .get(`loan/${id}`)
      .then(async loanRequestData => {

        if (!_.isUndefined(loanRequestData)) {
          let {
            principalAmount,
            principalNumDecimals,
            collateralAmount,
            collateralNumDecimals,
            totalExpectedRepayment,
            repaidAmount,
            debtorAddress,
            creditorAddress
          } = loanRequestData;
          loanRequestData.principalAmount = convertBigNumber(principalAmount, principalNumDecimals);
          loanRequestData.collateralAmount = convertBigNumber(collateralAmount, collateralNumDecimals);
          loanRequestData.principal = niceNumberDisplay(loanRequestData.principalAmount);
          loanRequestData.collateral = niceNumberDisplay(loanRequestData.collateralAmount)
          loanRequestData.totalRepaymentAmount = convertBigNumber(totalExpectedRepayment, principalNumDecimals);
          loanRequestData.totalRepaidAmount = convertBigNumber(repaidAmount, principalNumDecimals);
          loanRequestData.outstandingAmount = loanRequestData.totalRepaymentAmount - loanRequestData.totalRepaidAmount;

          loanRequestData.totalRepaymentAmountDisplay = niceNumberDisplay(loanRequestData.totalRepaymentAmount)
          loanRequestData.totalRepaidAmountDisplay = niceNumberDisplay(loanRequestData.totalRepaidAmount)
          loanRequestData.outstandingAmountDisplay = niceNumberDisplay(loanRequestData.outstandingAmount)

          if (loanRequestData.outstandingAmount == 0) {
            collateralReturnable = await dharma.adapters.collateralizedSimpleInterestLoan.canReturnCollateral(
              id
            );
          }
          loanRequestData.collateralReturnable = collateralReturnable;
          isCollateralSeizable = await dharma.adapters.collateralizedSimpleInterestLoan.canSeizeCollateral(
            id
          );;
          loanRequestData.isCollateralSeizable = isCollateralSeizable;
          if (loanRequestData.outstandingAmount > 0) {
            isCollateralSeized = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralSeized(
              id
            );
          }
          loanRequestData.isCollateralSeized = isCollateralSeized;

          let isCollateralReturned = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralReturned(
            id
          );
          loanRequestData.isCollateralReturned = isCollateralReturned;
          console.log(loanRequestData)
          this.setState({
            userTimezone,
            isLoading: false,
            loanDetails: loanRequestData,
            isLoanUser: (debtorAddress == currentMetamaskAccount || creditorAddress == currentMetamaskAccount)
          }, () => {
            this.buttonOperations();
          })
        }
      });
  }
  async checkTokenAllowance() {
    const { dharma, currentMetamaskAccount } = this.props;
    const { Token } = Dharma.Types;
    const { loanDetails } = this.state;
    const { principalSymbol } = loanDetails;
    const tokenData = await Token.getDataForSymbol(dharma, principalSymbol, currentMetamaskAccount);
    let modalMessage, modalMessageDisplay = '';
    let unlockTokenButtonDisplay = !tokenData.hasUnlimitedAllowance;
    if (unlockTokenButtonDisplay) {
      modalMessage = 'Please unlock token to make repayment.';
      modalMessageDisplay = 'danger';
    }
    this.setState({
      unlockTokenButtonDisplay,
      modalMessageDisplay,
      modalMessage,
      modalButtonLoading: false
    })
  }


  makeRepayment(event, callback) {
    this.setState({ modalOpen: true, buttonLoading: true, modalButtonLoading: true }, () => {
      this.checkTokenAllowance();
    });
  }
  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async processRepayment() {
    const { Debt } = Dharma.Types;
    const { dharma, id, currentMetamaskAccount } = this.props;
    const { loanDetails, repaymentAmount } = this.state;
    const { debtorAddress, outstandingAmount, principalSymbol } = loanDetails;
    let repaymentAmountDisplay = niceNumberDisplay(repaymentAmount)
    this.setState({ repaymentButtonLoading: true, buttonLoading: true });
    const debtorEthAddress = debtorAddress;
    let alertMessage, alertMessageDisplay = '';
    if (typeof currentMetamaskAccount != "undefined" && debtorEthAddress == currentMetamaskAccount && repaymentAmount > 0
    ) {
      const debt = await Debt.fetch(dharma, id);
      if (parseFloat(repaymentAmount) <= parseFloat(outstandingAmount) && parseFloat(outstandingAmount) > 0) {
        try {
          const txHash = await debt.makeRepayment(repaymentAmount);
          let response = await getTransactionReceipt(txHash);
          if (response) {
            await this.timeout(3000);
            this.props.refreshTokens();
            await this.getDetailData(true);
            alertMessageDisplay = 'success';
            alertMessage = "We're processing your repayment of " + repaymentAmountDisplay + " " + principalSymbol + ". We'll notify you, Once payment is confirmed."
          }
        }
        catch (e) {
          console.log(e)
          console.log(new Error(e))
          alertMessageDisplay = 'danger';
          alertMessage = "Please try again."
        }
      }
      else {
        alertMessageDisplay = 'danger';
        alertMessage = "Repayment amount can not be more then outstanding amount."
      }
    } else {
      alertMessage =
        currentMetamaskAccount != debtorEthAddress
          ? "Invalid access."
          : repaymentAmount == 0
            ? "Payment amount must be greater then zero."
            : "Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured and reload the page.";
      alertMessageDisplay = 'danger';
    }
    this.setState({
      modalOpen: false,
      repaymentButtonLoading: false,
      buttonLoading: false,
      alertMessageDisplay,
      alertMessage
    })
  }

  async unlockToken() {
    const { loanDetails } = this.state;
    const { currentMetamaskAccount, dharma } = this.props;
    const { Token } = Dharma.Types;
    this.setState({ unlockTokenButtonLoading: true });
    try {
      let txHash = await Token.makeAllowanceUnlimitedIfNecessary(
        dharma,
        loanDetails.principalSymbol,
        currentMetamaskAccount
      );
      let response = await this.getTransactionReceipt(txHash);
      if (response) {
        await this.timeout(3000);
        this.setState({
          unlockTokenButtonLoading: false,
          modalMessageDisplay: 'success',
          unlockTokenButtonDisplay: false,
          modalMessage: 'Token Authorised.',

        });
      }
    }
    catch (e) {

      this.setState({
        unlockTokenButtonLoading: false,
        alertMessageDisplay: 'danger',
        alertMessage: "Please try again."
      });
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
    this.setState({
      buttonLoading: true
    });
    const debt = await Debt.fetch(dharma, id);
    let alertMessage, alertMessageDisplay = '';
    if (typeof debt != "undefined") {
      const outstandingAmount = await debt.getOutstandingAmount();
      if (outstandingAmount == 0) {
        try {
          const txHash = await debt.returnCollateral();
          let response = await this.getTransactionReceipt(txHash);
          if (response) {
            await this.timeout(3000);
            this.props.refreshTokens();
            this.getDetailData(true);
            alertMessageDisplay = 'success';
            alertMessage = "We're processing your request to claim your collateral. We'll notify you, Once request is completed."
          }
        } catch (e) {
          alertMessageDisplay = 'danger';
          alertMessage = "Please try again."
        }
      }
    }
    this.setState({
      buttonLoading: false,
      collateralBtnDisplay: !(alertMessageDisplay == "success"),
      alertMessage,
      alertMessageDisplay
    });
  }

  async seizeCollateral(event, callback) {
    const { Investment } = Dharma.Types;
    const { dharma, id } = this.props;
    const { loanDetails } = this.state;
    let alertMessage, alertMessageDisplay = '';
    this.setState({
      buttonLoading: true
    });
    const investment = await Investment.fetch(dharma, id);
    const {
      isRepaid,
      isCollateralSeizable
    } = loanDetails;
    if (typeof investment != "undefined" && isRepaid === false) {
      if (isCollateralSeizable === true) {
        try {
          const txHash = await investment.seizeCollateral();
          let response = await this.getTransactionReceipt(txHash);
          if (response) {
            await this.timeout(3000);
            this.props.refreshTokens();
            await this.getDetailData(true);
            alertMessageDisplay = 'success';
            alertMessage = "We're processing your request to seize your collateral. We'll notify you, Once request is completed."
          } else {
            alertMessageDisplay = 'danger';
            alertMessage = "Please try again."
          }
        } catch (e) {
          alertMessageDisplay = 'danger';
          alertMessage = "Please try again."
        }
      } else {
        alertMessageDisplay = 'danger';
        alertMessage = "Collateral can not be seized."
      }
    }
    this.setState({
      buttonLoading: false,
      collateralSeizeBtnDisplay: !(alertMessageDisplay == "success"),
      alertMessage,
      alertMessageDisplay
    })
  }

  onCloseModal = () => {
    const { repaymentButtonLoading } = this.state;
    this.setState({ buttonLoading: repaymentButtonLoading, modalOpen: false });
  };

  render() {
    const {
      isLoading,
      loanScheduleDisplay,
      alertMessageDisplay,
      alertMessage
    } = this.state;
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
            {
              alertMessageDisplay != '' && <Row className="mb-30">
                <Col>
                  <CustomAlertMsg
                    bsStyle={alertMessageDisplay}
                    title={alertMessage}
                  />
                </Col>
              </Row>
            }

            <Row className="mb-30">
              <Col lg={4} md={4} sm={6} xl={4}>
                <div>
                  <Overview {...this.state} {...this.props} makeRepayment={this.makeRepayment} unblockCollateral={this.unblockCollateral} seizeCollateral={this.seizeCollateral} />
                </div>
                <div className="mt-30">
                  <Summary {...this.state} {...this.props} />
                </div>
                {
                  loanScheduleDisplay === true && (
                    <div className="mt-30">
                      <Transactions {...this.props} {...this.state} />
                    </div>
                  )
                }
              </Col>

              {loanScheduleDisplay === true && (
                <Col lg={8} md={8} sm={6} xl={8}>
                  <RepaymentSchedule {...this.props} {...this.state} />
                </Col>
              )}
            </Row>

            <PayModal {...this.props} {...this.state} onCloseModal={this.onCloseModal} handleInputChange={this.handleInputChange} processRepayment={this.processRepayment} unlockToken={this.unlockToken} />
          </div>
        }
      </div>
    );
  }
}
export default Detail;
