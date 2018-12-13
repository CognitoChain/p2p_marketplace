import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap";
import * as moment from "moment-timezone";
import _ from "lodash";
import { toast } from 'react-toastify';
import Summary from "./Summary/Summary";
import Overview from "./Overview/Overview";
import PayModal from "./PayModal/PayModal";
import Transactions from "./Transactions/Transactions";
import RepaymentSchedule from "./RepaymentSchedule/RepaymentSchedule";
import Api from "../../services/api";
import LoadingFull from "../LoadingFull/LoadingFull";
import { niceNumberDisplay, convertBigNumber, getTransactionReceipt, numberUsFormat } from "../../utils/Util";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import auth from '../../utils/auth';
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
      isLoanUser: false,
      isMetaMaskAuthRised: this.props.isMetaMaskAuthRised,
      isMounted:true 
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.processRepayment = this.processRepayment.bind(this);
    this.seizeCollateral = this.seizeCollateral.bind(this);
    this.makeRepayment = this.makeRepayment.bind(this);
    this.unblockCollateral = this.unblockCollateral.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.unlockToken = this.unlockToken.bind(this);

  }
  async componentWillMount() {
    this.getPriceFeeds();
    const { isMetaMaskAuthRised } = this.props;
    if(isMetaMaskAuthRised)
    {
      await this.getDetailData();  
    }
  }
   componentDidUpdate(prevProps) {

    if(prevProps.reloadDetails != this.props.reloadDetails && this.props.reloadDetails == true){
      //this.props.updateReloadDetails();
      this.setState({
        isMetaMaskAuthRised: this.props.isMetaMaskAuthRised
      }, (async () => {
        await this.getDetailData();
      }));
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isMounted;
  }
  
  componentWillUnmount() {
    this.setState({
        isMounted: false
    });
  }
  async getScheduledata() {
    const { dharma } = this.props;
    const { loanDetails, userTimezone, isLoanUser } = this.state;
    const {
      id,
      principalAmount,
      totalRepaymentAmount,
      repaymentSchedule,
      termLengthAmount,
      interestRatePercent,
      totalRepaidAmount,
      totalRepaidAmountNumber,
      principalSymbol,
      isCollateralSeized,
      isCollateralReturned,
      isCollateralSeizable,
      collateralReturnable,
      isRepaid,
      outstandingAmount,
      principalNumDecimals
    } = loanDetails;

    let installmentPrincipal = principalAmount / termLengthAmount;
    installmentPrincipal = (installmentPrincipal > 0) ? installmentPrincipal : 0;
    let installmentInterestAmount = (installmentPrincipal * parseFloat(interestRatePercent)) / 100;
    installmentInterestAmount = numberUsFormat(installmentInterestAmount); 
    installmentInterestAmount = (installmentInterestAmount > 0) ? installmentInterestAmount : 0;
    /*let repaymentInstallment = parseFloat(totalRepaymentAmount) / termLengthAmount;*/

    if (!_.isEmpty(loanDetails)) {
      let repaymentLoanstemp = [];
      let lastExpectedRepaidAmount = 0;
      let expectedRepaidAmountDharma = 0;
      let nextRepaymentAmount = 0;
      let repaymentAmount = 0;
      let nextRepaymentDate = '';
      let overViewBackgroundClass = '';
      let overViewButtonBackgroundClass = '';
      let i = 1;
      let j = 1;
      let nextRepaymentTimestamp = '';
      if ((!_.isUndefined(repaymentSchedule) && repaymentSchedule.length > 0) && isLoanUser) {
        let firstRepaymentTimestamp = repaymentSchedule[0] / 1000;
        let firstExpectedAmountToPayBigNumber = await dharma.servicing.getExpectedValueRepaid(
          id,
          firstRepaymentTimestamp
        );
        let firstExpectedAmountToNumber = firstExpectedAmountToPayBigNumber.toNumber();
        let repaymentInstallment = convertBigNumber(firstExpectedAmountToNumber,principalNumDecimals);
        repaymentSchedule.forEach(ts => {
          let date = new Date(ts);
          let currentTimestamp = moment().unix() * 1000;
          expectedRepaidAmountDharma += repaymentInstallment;

          if(ts > currentTimestamp && j == 1 && totalRepaidAmount < expectedRepaidAmountDharma)
          {
            nextRepaymentTimestamp = ts;
            j++;
          }
          else if(ts < currentTimestamp)
          {
            nextRepaymentTimestamp = ts;
          }

          let paidStatus = '-';
          paidStatus = (totalRepaidAmount >= expectedRepaidAmountDharma) ? 'paid' : ((totalRepaidAmount < expectedRepaidAmountDharma && totalRepaidAmount > lastExpectedRepaidAmount) ? 'partial_paid' : ((ts < currentTimestamp) ? 'missed' : 'due'));

          if (isLoanUser) {
            if ((isCollateralSeizable == true && isRepaid == false) || isCollateralSeized == true) {
              overViewBackgroundClass = 'overview-bg-error';
              overViewButtonBackgroundClass = 'overview-bg-btn-error';
            }
            else if (isCollateralReturned || collateralReturnable) {
              overViewBackgroundClass = 'overview-bg-success';
              overViewButtonBackgroundClass = 'overview-bg-btn-success';
            }
            else {
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
                  else {
                    overViewBackgroundClass = 'overview-bg-success';
                    overViewButtonBackgroundClass = 'overview-bg-btn-success';
                  }
                }
              }
            }
          }
          else {
            overViewBackgroundClass = 'overview-bg-success';
            overViewButtonBackgroundClass = 'overview-bg-btn-success';
          }

          if (lastExpectedRepaidAmount != expectedRepaidAmountDharma) {
            lastExpectedRepaidAmount = expectedRepaidAmountDharma;
          }
          repaymentLoanstemp.push({
            id: i++,
            ts: ts,
            createdDate: moment.tz(date, 'DD/MM/YYYY HH:mm:ss', userTimezone).format(),
            principalAmount: installmentPrincipal,
            principalSymbol: principalSymbol,
            interestAmount: installmentInterestAmount,
            totalRepaymentAmount: repaymentInstallment,
            status: paidStatus
          });
        });

        if(nextRepaymentTimestamp != '')
        {
          let nextRepaymentScheduleTimestamp = nextRepaymentTimestamp / 1000;
          let expectedAmountToPayBigNumber = await dharma.servicing.getExpectedValueRepaid(
            id,
            nextRepaymentScheduleTimestamp
          );
          let expectedAmountToNumber = expectedAmountToPayBigNumber.toNumber();
          nextRepaymentAmount = expectedAmountToNumber - totalRepaidAmountNumber;
          nextRepaymentAmount = repaymentAmount = convertBigNumber(nextRepaymentAmount,principalNumDecimals);
          nextRepaymentDate = moment(new Date(nextRepaymentTimestamp), "DD/MM/YYYY", true).format("DD/MM/YYYY");
        }

        this.setState({
          nextRepaymentAmount,
          repaymentAmount,
          overViewBackgroundClass,
          overViewButtonBackgroundClass,
          nextRepaymentDate,
          lastExpectedRepaidAmount,
          repaymentLoans: repaymentLoanstemp,
          isLoading:false
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
    const { loanDetails, isMetaMaskAuthRised, isLoanUser} = this.state;
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
    if (isMetaMaskAuthRised && typeof debtorAddress != "undefined" && debtorAddress == currentMetamaskAccount) {
      if (!isRepaid && !isCollateralReturned && !isCollateralSeized) {
        repaymentBtnDisplay = true;
      }
      if (collateralReturnable) {
        collateralBtnDisplay = true;
      }
    }
    if (isMetaMaskAuthRised && typeof creditorAddress != "undefined" && creditorAddress == currentMetamaskAccount && isCollateralSeizable) {
      collateralSeizeBtnDisplay = true;
    }
    if (isLoanUser) {
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
    const authToken = auth.getToken();
    const priceFeeds = await api
      .setToken(authToken)
      .get(`priceFeed`);
    this.setState({ priceFeeds })
  }
  async getDetailData(isRefreshOnly = false) {
    const { id, dharma, currentMetamaskAccount } = this.props;
    const { isMetaMaskAuthRised } = this.state;
    const { Investment, Debt } = Dharma.Types;
    let userTimezone = moment.tz.guess();
    let collateralReturnable = false;
    let isCollateralSeizable = false;
    let isCollateralSeized = false;
    const authToken = auth.getToken();
    const api = new Api();
    if (!isRefreshOnly) {
      this.setState({ isLoading: true });
    }
   return api
      .setToken(authToken)
      .get(`loan/${id}`)
      .then(async loanRequestData => {
        if (!_.isUndefined(loanRequestData)) {
          let {
            principalAmount,
            principalNumDecimals,
            collateralAmount,
            collateralNumDecimals,
            totalExpectedRepayment,
            debtorAddress,
            creditorAddress
          } = loanRequestData;
          loanRequestData.principalAmount = convertBigNumber(principalAmount, principalNumDecimals);
          loanRequestData.collateralAmount = convertBigNumber(collateralAmount, collateralNumDecimals);
          loanRequestData.totalRepaymentAmount = convertBigNumber(totalExpectedRepayment, principalNumDecimals);

          const valueRepaidAr = await dharma.servicing.getValueRepaid(
            id
          );
          loanRequestData.totalRepaidAmountNumber = valueRepaidAr.toNumber();
          loanRequestData.totalRepaidAmount = convertBigNumber(valueRepaidAr.toNumber(), principalNumDecimals);

          const debt = await Debt.fetch(dharma, id);
          loanRequestData.outstandingAmount = await this.getOutstandingAmount(principalNumDecimals,totalExpectedRepayment);
          
          collateralReturnable = await dharma.adapters.collateralizedSimpleInterestLoan.canReturnCollateral(
            id
          );
          loanRequestData.collateralReturnable = collateralReturnable;

          isCollateralSeizable = await dharma.adapters.collateralizedSimpleInterestLoan.canSeizeCollateral(
            id
          );;
          loanRequestData.isCollateralSeizable = isCollateralSeizable;
          isCollateralSeized = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralSeized(
            id
          );
          loanRequestData.isCollateralSeized = isCollateralSeized;
          let isCollateralReturned = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralReturned(
            id
          );
          loanRequestData.isCollateralReturned = isCollateralReturned;
          const investment = await Investment.fetch(dharma, id);
          loanRequestData.isRepaid = await investment.isRepaid();
          this.setState({
            userTimezone,
            loanDetails: loanRequestData,
            isLoanUser: isMetaMaskAuthRised && (debtorAddress == currentMetamaskAccount || creditorAddress == currentMetamaskAccount),
            buttonLoading: false,
            repaymentButtonLoading: false,
            modalOpen: false
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
  async getOutstandingAmount(principalNumDecimals,totalExpectedRepayment){
    const { dharma,id } = this.props;
    const valueRepaidAr = await dharma.servicing.getValueRepaid(
      id
    );
    let totalRepaidAmountNumber = valueRepaidAr.toNumber();
    let outstandingAmount = totalExpectedRepayment - totalRepaidAmountNumber;
    outstandingAmount = convertBigNumber(outstandingAmount,principalNumDecimals);
    return outstandingAmount;
  }
  async processRepayment() {
    const { Debt } = Dharma.Types;
    const { dharma, id, currentMetamaskAccount } = this.props;
    const { isMetaMaskAuthRised } = this.state;
    let { loanDetails, repaymentAmount } = this.state;
    let { debtorAddress, principalSymbol,principalNumDecimals,totalExpectedRepayment } = loanDetails;
    let repaymentAmountDisplay = niceNumberDisplay(repaymentAmount)
    this.setState({ repaymentButtonLoading: true, buttonLoading: true });
    const debtorEthAddress = debtorAddress;
    let alertMessage, alertMessageDisplay = '';
    repaymentAmount = parseFloat(repaymentAmount);
    if (isMetaMaskAuthRised && debtorEthAddress == currentMetamaskAccount && repaymentAmount > 0
    ) {
      const debt = await Debt.fetch(dharma, id);
      const outstandingAmount = await this.getOutstandingAmount(principalNumDecimals,totalExpectedRepayment);
      if (repaymentAmount <= outstandingAmount && outstandingAmount > 0) {
        try {
          const txHash = await debt.makeRepayment(repaymentAmount);
          let response = await getTransactionReceipt(txHash);
          if (response) {
            let outstandingAmountAfterRepayment = await this.getOutstandingAmount(principalNumDecimals,totalExpectedRepayment);
            if(outstandingAmount != outstandingAmountAfterRepayment)
            {
              this.props.refreshTokens();
              await this.getDetailData(true);  
            }
            else
            {
              let refreshFlag = null;
              let _this = this;
              while (refreshFlag === null) {
                await _this.timeout(2000);
                let outstandingAmountAfterRepayment = await this.getOutstandingAmount(principalNumDecimals,totalExpectedRepayment);

                if(outstandingAmount != outstandingAmountAfterRepayment)
                {
                  refreshFlag = true;
                  break;
                }
              } 

              if(refreshFlag === true)
              {
                this.props.refreshTokens();
                await this.getDetailData(true);    
              }
            }
            alertMessageDisplay = 'success';
            alertMessage = "Your repayment of " + repaymentAmountDisplay + " " + principalSymbol + " has completed."
          }
        }
        catch (e) {
          let errorMsg = (!_.isUndefined(e.message)) ? e.message : 'Something went wrong. Please try again.';
          toast.error(errorMsg);
        }
      }
      else {
        toast.error("Repayment amount can not be more then outstanding amount.");
      }
    } else {
      let toastMessage =
        currentMetamaskAccount != debtorEthAddress
          ? "Invalid access."
          : repaymentAmount == 0
            ? "Payment amount must be greater then zero."
            : "Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured and reload the page.";
      toast.error(toastMessage);
    }
    this.setState({
      alertMessageDisplay,
      alertMessage,
      repaymentButtonLoading: false,
      buttonLoading:false,
      modalOpen: false
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
      let response = await getTransactionReceipt(txHash);
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
      let errorMsg = (!_.isUndefined(e.message)) ? e.message : 'Something went wrong. Please try again.';
      toast.error(errorMsg);
      this.setState({
        unlockTokenButtonLoading: false
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
    const { loanDetails } = this.state;
    const { isRepaid } = loanDetails;
    this.setState({
      buttonLoading: true
    });
    const debt = await Debt.fetch(dharma, id);
    let alertMessage, alertMessageDisplay = '';
    if (!_.isUndefined(debt)) {
      let collateralReturnable = await dharma.adapters.collateralizedSimpleInterestLoan.canReturnCollateral(
            id
          );
      if (collateralReturnable) {
        try {
          const txHash = await debt.returnCollateral();
          let response = await getTransactionReceipt(txHash);
          if (response) {
            let _this = this;
            let isCollateralReturned = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralReturned(
              id
            );
            if(isCollateralReturned)
            {
              this.props.refreshTokens();  
              loanDetails.isCollateralReturned = true;
              this.setState({
                loanDetails,
                collateralBtnDisplay: false
              });
            }
            else
            {
              let refreshFlag = null;
              while (refreshFlag === null) {
                await _this.timeout(2000);
                let isCollateralReturned = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralReturned(
                  id
                );
                if(isCollateralReturned)
                {
                  refreshFlag = true;
                  break;
                }
              } 

              if(refreshFlag === true)
              {
                this.props.refreshTokens();
                loanDetails.isCollateralReturned = true;
                this.setState({
                  loanDetails,
                  collateralBtnDisplay: false
                });
              }
            }
            alertMessageDisplay = 'success';
            alertMessage = "You have successfully claimed your collateral.";
          }
        } catch (e) {
          //console.log("e");
          //console.log(e);
          let errorMsg = (!_.isUndefined(e.message)) ? e.message : 'Something went wrong. Please try again.';
          alertMessageDisplay = 'danger';
          alertMessage = errorMsg;
        }
      }
      else{
        alertMessageDisplay = 'danger';
        alertMessage = "You have not repaid your loan amount yet.";
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
    let isCollateralSeizable = await dharma.adapters.collateralizedSimpleInterestLoan.canSeizeCollateral(
            id
    );;

    if (typeof investment != "undefined") {
      if (isCollateralSeizable === true) {
        try {
          const txHash = await investment.seizeCollateral();
          let response = await getTransactionReceipt(txHash);
          if (response) {
            let isCollateralSeized = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralSeized(
              id
            );
            if (isCollateralSeized == true) {
              this.props.refreshTokens();
              loanDetails.isCollateralSeized = true;
              this.setState({
                loanDetails,
                collateralSeizeBtnDisplay: false
              });
            }
            else
            {
              let refreshFlag = null;
              let _this = this;
              while (refreshFlag === null) {
                await _this.timeout(2000);
                let isCollateralSeized = await dharma.adapters.collateralizedSimpleInterestLoan.isCollateralSeized(
                    id
                );
                if(isCollateralSeized)
                {
                  refreshFlag = true;
                  break;
                }
              } 

              if(refreshFlag === true)
              {
                this.props.refreshTokens();
                loanDetails.isCollateralSeized = true;
                this.setState({
                  loanDetails,
                  collateralSeizeBtnDisplay: false
                });
              }
            }
            alertMessageDisplay = 'success';
            alertMessage = "You have successfully seized collateral."
          } else {
            alertMessageDisplay = 'danger';
            alertMessage = "Please try again."
          }
        } catch (e) {
          let errorMsg = (!_.isUndefined(e.message)) ? e.message : 'Something went wrong. Please try again.';
          alertMessageDisplay = 'danger';
          alertMessage = errorMsg;
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
    this.setState({ buttonLoading: false, modalOpen: false });
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
