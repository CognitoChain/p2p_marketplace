import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, ListGroup } from 'reactstrap';
import _ from "lodash";
import * as moment from "moment";
import { Link } from 'react-router-dom';
import Api from "../../services/api";
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import LoadingFull from "../LoadingFull/LoadingFull";
import SummaryItem from "./SummaryItem/SummaryItem";
import Error from "../Error/Error";
import fundLoanImg from "../../assets/images/fund_loan.png";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import {niceNumberDisplay, getTransactionReceipt, tooltipNumberDisplay, numberUsFormat} from "../../utils/Util";
import auth from '../../utils/auth';
import "./LoanRequest.css";
import ReactGA from 'react-ga';

class LoanRequest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loanRequest: null,
            error: null,
            principal: 0,
            principalTokenSymbol: "WETH",
            LTVRatioValue: 0,
            collateral: 0,
            collateralTokenSymbol: "REP",
            interestRate: 0,
            termLength: 0,
            termUnit: "weeks",
            hasSufficientAllowance: false,
            txHash: null,
            createdDate:null,
            createdTime:null,
            interestAmount: 0,
            totalRepaymentAmount: 0,
            collateralCurrentAmount: 0,
            userLoanAgree: false,
            customAlertMsgDisplay: false,
            customAlertMsgStyle: '',
            customAlertMsgClassname: '',
            customAlertMsgTitle: '',
            disableSubmitBtn: true,
            isBottomButtonLoading: true,
            unlockTokenButtonLoading:false,
            buttonLoading:false
        };

        // handlers
        this.handleFill = this.handleFill.bind(this);
        this.handleAuthorize = this.handleAuthorize.bind(this);
        this.handleAgreeChange = this.handleAgreeChange.bind(this);

        // setters
        this.reloadState = this.reloadState.bind(this);
        this.setHasSufficientAllowance = this.setHasSufficientAllowance.bind(this);
        this.assertFillable = this.assertFillable.bind(this);
    }

    componentWillMount() {
        const { LoanRequest } = Dharma.Types;

        const { dharma, id } = this.props;
        const authToken = auth.getToken();
        const api = new Api();
        let LTVRatioValue = 0;
        api.setToken(authToken).get(`loanRequests/${id}`).then(async (loanRequestData) => {

            const loanRequest = await LoanRequest.load(dharma, loanRequestData);
            let collateralCurrentAmount = 0;
            let principalCurrentAmount = 0;
            this.setState({ loanRequest }, () => {
                this.reloadState();
            });
            var get_terms = loanRequest.getTerms();

            await api.setToken(authToken).get(`priceFeed`)
                .then(async priceFeedData => {
                    let principalTokenSymbol = get_terms.principalTokenSymbol;
                    principalTokenSymbol = (principalTokenSymbol == "WETH" && _.isUndefined(priceFeedData[principalTokenSymbol])) ? "ETH" : principalTokenSymbol;

                    let collateralTokenSymbol = get_terms.collateralTokenSymbol;
                    collateralTokenSymbol = (collateralTokenSymbol == "WETH" && _.isUndefined(priceFeedData[collateralTokenSymbol])) ? "ETH" : collateralTokenSymbol;                        

                    if (!_.isUndefined(priceFeedData[principalTokenSymbol])) {
                        let principalTokenCurrentPrice = priceFeedData[principalTokenSymbol].USD;
                        principalCurrentAmount = parseFloat(get_terms.principalAmount) * principalTokenCurrentPrice;
                        principalCurrentAmount = numberUsFormat(principalCurrentAmount);
                    }
                    if (!_.isUndefined(priceFeedData[collateralTokenSymbol])) {
                        let collateralTokenCurrentPrice =
                            priceFeedData[collateralTokenSymbol].USD;
                        collateralCurrentAmount =
                            parseFloat(get_terms.collateralAmount) *
                            collateralTokenCurrentPrice;
                        collateralCurrentAmount = numberUsFormat(collateralCurrentAmount);
                    }
                    if (principalCurrentAmount > 0 && collateralCurrentAmount > 0) {
                        LTVRatioValue = (principalCurrentAmount / collateralCurrentAmount) * 100;
                    }

                    let principal = get_terms.principalAmount;
                    let interestRate = get_terms.interestRate;
                    let interestAmount = (principal * interestRate) / 100;
                    let totalReapaymentAmount = parseFloat(principal) + parseFloat(interestAmount);
                    totalReapaymentAmount = numberUsFormat(totalReapaymentAmount);
                    this.setState({
                        principal: get_terms.principalAmount,
                        principalTokenSymbol: get_terms.principalTokenSymbol,
                        collateral: get_terms.collateralAmount,
                        collateralTokenSymbol: get_terms.collateralTokenSymbol,
                        interestRate: get_terms.interestRate,
                        termLength: get_terms.termDuration,
                        termUnit: get_terms.termUnit,
                        createdAt: moment(loanRequest.data.createdAt).format("DD/MM/YYYY HH:mm:ss"),
                        createdDate:moment(loanRequest.data.createdAt).format( "DD/MM/YYYY"),
                        createdTime:moment(loanRequest.data.createdAt).format("HH:mm:ss"),
                        interestAmount: interestAmount,
                        totalRepaymentAmount: totalReapaymentAmount,
                        collateralCurrentAmount: collateralCurrentAmount,
                        LTVRatioValue: LTVRatioValue
                    });
                });

        });
    }

    reloadState(tokenSymbol,status) {
        this.setHasSufficientAllowance(status);
        this.assertFillable();
    }

    async handleFill() {

        // GA Tracking
        ReactGA.event({
            category: 'User',
            action: 'loan-request-fill'
        });

        const { loanRequest, userLoanAgree } = this.state;
        this.setState({buttonLoading: true});
        if (userLoanAgree === true) {
            try {
                loanRequest
                    .fillAsCreditor()
                    .then(async (txHash) => {
                        let response = await getTransactionReceipt(txHash);
                        if(response)
                        {
                            this.setState({
                                buttonLoading:false,
                                customAlertMsgStyle: 'success',
                                customAlertMsgClassname: 'fa fa-check fa-2x pull-left mr-2',
                                customAlertMsgTitle: 'Loan request filled'
                            });
                            this.props.onFillComplete();
                        }
                    });
            }
            catch (e) {
                let error = new Error(e);
                this.setState({
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                    customAlertMsgTitle: error.props.message,
                    disableSubmitBtn: false,
                    buttonLoading:false
                });
            }
        }
        else {
            this.setState({
                txHash:'',
                customAlertMsgDisplay: true,
                customAlertMsgStyle: 'danger',
                customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                customAlertMsgTitle: 'Please accept loan agreement terms.',
                disableSubmitBtn: true,
                buttonLoading:false
            });
        }
    }

    async handleAuthorize() {
        const { loanRequest } = this.state;
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const owner = await dharma.blockchain.getCurrentAccount();
        const terms = loanRequest.getTerms();
        this.setState({unlockTokenButtonLoading: true});
        if (typeof owner != 'undefined') {
            try{
                const txHash = await Token.makeAllowanceUnlimitedIfNecessary(dharma, terms.principalTokenSymbol, owner);
                this.setState({
                    txHash,
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'warning',
                    customAlertMsgClassname: 'fa fa-info fa-2x pull-left mr-2',
                    customAlertMsgTitle: 'Mining transaction',
                    customAlertMsgDescription:''
                });
                let response = await getTransactionReceipt(txHash);
                if (!_.isUndefined(response)) {
                    this.setState({
                        error:null,
                        unlockTokenButtonLoading:false,
                        hasSufficientAllowance:true,
                        customAlertMsgDisplay: true,
                        customAlertMsgStyle: 'success',
                        customAlertMsgClassname: 'fa fa-check fa-2x pull-left mr-2',
                        customAlertMsgTitle: 'Token Authorised.',
                        customAlertMsgDescription:''
                    });
                }
                else
                {
                    this.setState({unlockTokenButtonLoading: true});
                }
            }
            catch(e)
            {
                this.setState({unlockTokenButtonLoading: false});
            }
        }
    }

    async assertFillable() {
        const { loanRequest } = this.state;

        loanRequest
            .assertFillable()
            .then(() => {
                this.setState({
                    error: null,
                    customAlertMsgDisplay: false,
                });
            })
            .catch((error) => {
                let title = "This loan request cannot be filled";
                let description = error.message;
                if (error.message == "Creditor allowance is insufficient") {
                    error = null
                    title = "Steps Required"
                    description = 'Token transfer authorization required. Click "Unlock Token".'
                }
                else if (error.message == "Creditor balance is insufficient") {
                    description = "You don't have sufficient balance to fund this loan"
                }
                else if (error.message == "Debtor does not have sufficient balance required for collateral transfer.") {
                    description = "Borrower does not have sufficient balance required for collateral transfer"
                }
                this.setState({
                    error,
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                    customAlertMsgTitle: title,
                    customAlertMsgDescription: description                    
                });
            });
    }

    async setHasSufficientAllowance(status) {
        const { dharma } = this.props;
        const { loanRequest } = this.state;

        const { Token } = Dharma.Types;
        this.setState({customAlertMsgDisplay:false});
        const currentAccount = await dharma.blockchain.getCurrentAccount();

        const terms = loanRequest.getTerms();
        const isCompleted = status && status == "success" ? true : false;
        let stateObj = {};

        if (typeof currentAccount != "undefined") {
            const tokenData = await Token.getDataForSymbol(dharma, terms.principalTokenSymbol, currentAccount);
            const hasSufficientAllowance =
                tokenData.hasUnlimitedAllowance || tokenData.allowance >= terms.principalAmount || isCompleted;
            if(tokenData.hasUnlimitedAllowance === true && tokenData.balance >= terms.principalAmount)
            {
                stateObj["customAlertMsgDisplay"] = true;
                stateObj["customAlertMsgStyle"] = 'success';
                stateObj["customAlertMsgClassname"] = 'fa fa-check fa-2x pull-left mr-2';
                stateObj["customAlertMsgTitle"] = 'Token Authorised.';
                stateObj["customAlertMsgDescription"] = '';
            }
            stateObj["hasSufficientAllowance"] = hasSufficientAllowance;
            stateObj["isBottomButtonLoading"] = false;
        }
        else {
            stateObj["hasSufficientAllowance"] = false;
            stateObj["isBottomButtonLoading"] = false;
        }
        this.setState(stateObj);
    }

    handleAgreeChange(event) {
        let checked = event.target.checked;
        if (checked === true) {
            this.setState({
                userLoanAgree: true,
                disableSubmitBtn: false
            });
        }
        else {
            this.setState({
                userLoanAgree: false,
                disableSubmitBtn: true
            });
        }
    }

    render() {
        const {
            principal,
            principalTokenSymbol,
            collateral,
            collateralTokenSymbol,
            termUnit,
            termLength,
            interestRate,
            error,
            hasSufficientAllowance,
            txHash,
            LTVRatioValue,
            loanRequest,
            createdDate,
            createdTime,
            interestAmount,
            totalRepaymentAmount,
            collateralCurrentAmount,
            customAlertMsgDisplay,
            customAlertMsgStyle,
            customAlertMsgClassname,
            customAlertMsgTitle,
            customAlertMsgDescription,
            disableSubmitBtn,
            isBottomButtonLoading,
            unlockTokenButtonLoading,
            buttonLoading
        } = this.state;

        let extraTitle = '';
        if (txHash != '' && txHash != null) {
            extraTitle = (<span className="transaction-detail-link"><a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"> Transaction Details</a></span>);
        }
        return (
            <div>

                <div className="page-title">
                    <Row>
                        <Col>
                            <Breadcrumb>
                                <BreadcrumbItem>
                                    <Link className="link-blue" to="/market">Market</Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem active>Fund Loan</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-4">
                        <Col>
                            <h4 className="mb-0"> <div className="round-icon round-icon-lg olivegreen"><img className="mb-2" src={fundLoanImg} height="20" alt="Fund Loan" /></div> Fund Loan</h4>
                        </Col>
                    </Row>
                </div>
                {
                    (!loanRequest || hasSufficientAllowance === null) && <LoadingFull />
                }
                {
                    (loanRequest && hasSufficientAllowance != null) &&
                    <div>
                        <Row>
                            <Col lg={6} md={6} sm={6} xl={4} className="mb-30">
                                <Card className="card-statistics h-100">
                                    <CardBody className="pb-0">
                                        <div className="p-4 pb-0">
                                            <CardTitle>Summary </CardTitle>
                                            <div>
                                                <ListGroup className="list-unstyled to-do">
                                                    <SummaryItem
                                                        labelName="Loan Amount"
                                                        labelValue={principal > 0 ? niceNumberDisplay(principal) : ' - '}
                                                        labelValue2={principal > 0 ? principalTokenSymbol : ''}
                                                        tooltipValue={tooltipNumberDisplay(principal,principalTokenSymbol)}

                                                    />
                                                    <SummaryItem
                                                        labelName="Created Date"
                                                        labelValue={createdDate != "" ? createdDate : ' - '}
                                                        labelValue2={createdTime != "" ? createdTime : ''}
                                                    />
                                                    <SummaryItem
                                                        labelName="Collateral Amount"
                                                        labelValue={collateral > 0 ? niceNumberDisplay(collateral) : ' - '}
                                                        labelValue2={collateral > 0 ? collateralTokenSymbol : ''}
                                                        tooltipValue={tooltipNumberDisplay(collateral,collateralTokenSymbol)}

                                                    />
                                                    <SummaryItem
                                                        labelName="Collateral Value"
                                                        labelValue={collateralCurrentAmount > 0 ? niceNumberDisplay(collateralCurrentAmount) : ' - '}
                                                        labelValue2={collateralCurrentAmount > 0 ? '$' : ''}
                                                        tooltipValue={tooltipNumberDisplay(collateralCurrentAmount,"$","prepend")}
                                                    />
                                                    <SummaryItem
                                                        labelName="LTV"
                                                        labelValue={LTVRatioValue > 0 ? niceNumberDisplay(LTVRatioValue) : ' - '}
                                                        labelValue2={LTVRatioValue > 0 ? '%' : ''}
                                                        tooltipValue={tooltipNumberDisplay(LTVRatioValue,"%")}

                                                    />
                                                    <SummaryItem
                                                        labelName="Loan Term"
                                                        labelValue={termLength > 0 ? termLength : ' - '}
                                                        labelValue2={termLength > 0 ? termUnit : ''}

                                                    />
                                                    <SummaryItem
                                                        labelName="Interest Rate(Per Loan Term)"
                                                        labelValue={interestRate>0 ? niceNumberDisplay(interestRate,2) : ' - '}
                                                        labelValue2={interestRate>0 ? '%' :''}
                                                        tooltipValue={tooltipNumberDisplay(interestRate,"%")}

                                                    />
                                                    <SummaryItem
                                                        labelName="Interest Amount"
                                                        labelValue={interestAmount > 0 ? niceNumberDisplay(interestAmount) : ' - '}
                                                        labelValue2={interestAmount > 0 ? principalTokenSymbol : ''}
                                                        tooltipValue={tooltipNumberDisplay(interestAmount,principalTokenSymbol)}
                                                    />
                                                    <SummaryItem
                                                        labelName="Total Repayment Amount"
                                                        labelValue={totalRepaymentAmount > 0 ? niceNumberDisplay(totalRepaymentAmount) : ' - '}
                                                        labelValue2={totalRepaymentAmount > 0 ? principalTokenSymbol : ''}
                                                        tooltipValue={tooltipNumberDisplay(totalRepaymentAmount,principalTokenSymbol)}
                                                    />
                                                </ListGroup>

                                                <hr />

                                                <div className="agree-loan-check pt-1 mtb-2 mb-30">
                                                    <label className="checkbox-container">
                                                        <span>I agree to the <a href="/terms" target="_blank" className="link-blue">Terms and Conditions</a></span>
                                                        <input type="checkbox" id="gridCheck" name="loanAgreement" value="y" onChange={this.handleAgreeChange} />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>

                                    
                                    {customAlertMsgDisplay === true &&
                                        <CustomAlertMsg
                                            bsStyle={customAlertMsgStyle}
                                            className={customAlertMsgClassname}
                                            title={[customAlertMsgTitle, ' ', extraTitle]}
                                            description={customAlertMsgDescription}
                                        />
                                    }

                                    <CardBody className="pl-4 pt-1 mtb-2 mt-10 text-center">
                                        <div>
                                            <div className="create-loan-buttons-container">
                                                {
                                                    !isBottomButtonLoading && <AuthorizableAction
                                                        canTakeAction={!error && hasSufficientAllowance && !disableSubmitBtn}
                                                        canAuthorize={error || hasSufficientAllowance}
                                                        onAction={this.handleFill}
                                                        onAuthorize={this.handleAuthorize}
                                                        unlockTokenButtonLoading={unlockTokenButtonLoading}
                                                        buttonLoading={buttonLoading}
                                                    >
                                                        <p>Unlock Tokens {unlockTokenButtonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}</p>
                                                        <p>Fund Loan {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}</p>
                                                    </AuthorizableAction>
                                                }
                                                {
                                                    isBottomButtonLoading && <i className="btn btn-sm fa-spin fa fa-spinner"></i>
                                                }

                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                }
            </div>
        );
    }
}
export default LoanRequest;