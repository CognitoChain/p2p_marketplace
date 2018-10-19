import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, Input, ListGroup } from 'reactstrap';
import Api from "../../services/api";
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import Terms from "./Terms/Terms";
import NotFillableAlert from "./Alert/NotFillableAlert";
import TransactionManager from "../TransactionManager/TransactionManager";
import Loading from "../Loading/Loading";
import LoadingFull from "../LoadingFull/LoadingFull";
import "./LoanRequest.css";
import SummaryItem from "./SummaryItem/SummaryItem";
import Error from "../Error/Error";
import { toast } from 'react-toastify';
import * as moment from "moment";
import fundLoanImg from "../../assets/images/fund_loan.png";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
const TRANSACTION_DESCRIPTIONS = {
    fill: "Loan Request Fill",
    allowance: "Authorize Loan Request",
};

class LoanRequest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loanRequest: null,
            transactions: [],
            error: null,
            principal: 0,
            principalTokenSymbol: "WETH",
            LTVRatioValue: 0,
            collateral: 0,
            collateralTokenSymbol: "REP",
            interestRate: 0,
            termLength: 0,
            termUnit: "weeks",
            expirationLength: 30,
            expirationUnit: "days",
            disabled: false,
            error: null,
            hasSufficientAllowance: null,
            txHash: null,
            createdAt: null,
            interestAmount: 0,
            totalRepaymentAmount: 0,
            collateralCurrentAmount: 0,
            userLoanAgree: false,
            customAlertMsgDisplay: false,
            customAlertMsgStyle: '',
            customAlertMsgClassname: '',
            customAlertMsgTitle: '',
            disableSubmitBtn: true,
            tokenAuthorised:false
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
        const { LoanRequest, Debt } = Dharma.Types;

        const { dharma, id } = this.props;

        const api = new Api();
        let LTVRatioValue = 0;
        api.setToken(this.props.token).get(`loanRequests/${id}`).then(async (loanRequestData) => {

            const loanRequest = await LoanRequest.load(dharma, loanRequestData);
            let collateralCurrentAmount = 0;
            this.setState({ loanRequest });
            var get_terms = loanRequest.getTerms();

            const all_token_price = await api.setToken(this.props.token).get(`priceFeed`)
                .then(async priceFeedData => {
                    let principalTokenCurrentPrice = priceFeedData[get_terms.principalTokenSymbol].USD;
                    let principalCurrentAmount = parseFloat(get_terms.principalAmount) * principalTokenCurrentPrice;
                    let collateralTokenCurrentPrice =
                        priceFeedData[get_terms.collateralTokenSymbol].USD;
                    collateralCurrentAmount =
                        parseFloat(get_terms.collateralAmount) *
                        collateralTokenCurrentPrice;
                    collateralCurrentAmount = (collateralCurrentAmount > 0) ? collateralCurrentAmount.toFixed(2) : 0;

                    if (principalCurrentAmount > 0 && collateralCurrentAmount > 0) {
                        LTVRatioValue = (principalCurrentAmount / collateralCurrentAmount) * 100;
                        LTVRatioValue = (LTVRatioValue > 0) ? LTVRatioValue.toFixed(2) : 0;
                    }

                    let principal = get_terms.principalAmount;
                    let interest_rate = get_terms.interestRate;
                    let interest_amount = (principal * interest_rate) / 100;
                    let total_reapayment_amount = parseFloat(principal) + parseFloat(interest_amount);

                    this.setState({
                        principal: get_terms.principalAmount,
                        principalTokenSymbol: get_terms.principalTokenSymbol,
                        collateral: get_terms.collateralAmount,
                        collateralTokenSymbol: get_terms.collateralTokenSymbol,
                        interestRate: get_terms.interestRate,
                        termLength: get_terms.termDuration,
                        termUnit: get_terms.termUnit,
                        createdAt: moment(loanRequest.data.createdAt).format("DD/MM/YYYY HH:mm:ss"),
                        interestAmount: interest_amount,
                        totalRepaymentAmount: total_reapayment_amount,
                        collateralCurrentAmount: collateralCurrentAmount,
                        LTVRatioValue: LTVRatioValue
                    });
                });
            this.reloadState();
        });
    }

    reloadState() {
        this.setHasSufficientAllowance();
        this.assertFillable();
    }

    async handleFill() {
        const { loanRequest, userLoanAgree } = this.state;

        if (userLoanAgree === true) {
            loanRequest
                .fillAsCreditor()
                .then((txHash) => {
                    console.log("txHash");
                    const { transactions } = this.state;
                    transactions.push({ txHash, description: TRANSACTION_DESCRIPTIONS.fill });
                    console.log(transactions);
                    this.setState({
                        transactions,
                        tokenAuthorised:true
                    });
                })
                .catch((error) => {
                    this.setState({
                        customAlertMsgDisplay: true,
                        customAlertMsgStyle: 'danger',
                        customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                        customAlertMsgTitle: error,
                        disableSubmitBtn: false,
                    });
                });
        }
        else {
            toast.error('Please accept loan agreement terms.');
        }
    }

    async handleAuthorize() {
        const { loanRequest, transactions } = this.state;
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const owner = await dharma.blockchain.getCurrentAccount();
        const terms = loanRequest.getTerms();

        if (typeof owner != 'undefined') {
            const txHash = await Token.makeAllowanceUnlimitedIfNecessary(dharma, terms.principalTokenSymbol, owner);
            if (txHash) {
                transactions.push({ txHash, description: TRANSACTION_DESCRIPTIONS.allowance });

                this.setState({
                    transactions,
                });
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
                });
            })
            .catch((error) => {
                this.setState({
                    error,
                });
            });
    }

    async setHasSufficientAllowance() {
        const { dharma } = this.props;
        const { loanRequest } = this.state;

        const { Token } = Dharma.Types;

        const currentAccount = await dharma.blockchain.getCurrentAccount();

        const terms = loanRequest.getTerms();

        if (typeof currentAccount != "undefined") {
            const tokenData = await Token.getDataForSymbol(dharma, terms.principalTokenSymbol, currentAccount);
            const hasSufficientAllowance =
                tokenData.hasUnlimitedAllowance || tokenData.allowance >= terms.principalAmount;
            this.setState({
                hasSufficientAllowance,
            });
        }
        else {
            this.setState({
                hasSufficientAllowance: '',
            });
        }
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
            expirationUnit,
            expirationLength,
            disabled,
            error,
            hasSufficientAllowance,
            txHash,
            LTVRatioValue,
            loanRequest,
            transactions,
            createdAt,
            interestAmount,
            totalRepaymentAmount,
            collateralCurrentAmount,
            customAlertMsgDisplay,
            customAlertMsgStyle,
            customAlertMsgClassname,
            customAlertMsgTitle,
            disableSubmitBtn,
            tokenAuthorised
        } = this.state;

        const { dharma, onFillComplete } = this.props;



        return (
            <div>

                <div className="page-title">
                    <Row>
                        <Col>
                            <Breadcrumb>
                                <BreadcrumbItem><a href="/market" className="link-blue">Market</a></BreadcrumbItem>
                                <BreadcrumbItem active>Fund Loan</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-4">
                        <Col>
                            <h4 className="mb-0"> <div className="round-icon round-icon-lg olivegreen"><img className="mb-2" src={fundLoanImg} height="20" /></div> Fund Loan</h4>
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
                                            <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
                                                <ListGroup className="list-unstyled to-do">
                                                    <SummaryItem
                                                        labelName="Loan Amount"
                                                        labelValue={principal > 0 ? principal + ' ' + principalTokenSymbol : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="Created Date"
                                                        labelValue={createdAt != '' ? createdAt : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="Collateral Amount"
                                                        labelValue={collateral > 0 ? collateral + ' ' + collateralTokenSymbol : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="Collateral Value"
                                                        labelValue={collateralCurrentAmount > 0 ? collateralCurrentAmount + '$' : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="LTV"
                                                        labelValue={LTVRatioValue > 0 ? LTVRatioValue + "%" : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="Loan Term"
                                                        labelValue={termLength > 0 ? termLength + " " + termUnit : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="Interest Rate(Per Loan Term)"
                                                        labelValue={interestRate + "%"}
                                                    />
                                                    <SummaryItem
                                                        labelName="Interest Amount"
                                                        labelValue={interestAmount > 0 ? interestAmount + ' ' + principalTokenSymbol : ' - '}
                                                    />
                                                    <SummaryItem
                                                        labelName="Total Repayment Amount"
                                                        labelValue={totalRepaymentAmount > 0 ? totalRepaymentAmount + ' ' + principalTokenSymbol : ' - '}
                                                    />
                                                </ListGroup>

                                                <hr />

                                                <div className="agree-loan-check pt-1 mtb-2 mb-30">
                                                    <label className="checkbox-container">
                                                        <span>I have read and agreed to the <a href="/loan-agreement" target="_blank" className="link-blue">Loan Agreement</a></span>
                                                        <input type="checkbox" id="gridCheck" name="loanAgreement" value="y" onChange={this.handleAgreeChange} />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>

                                    {transactions.map((transaction) => {
                                            const { txHash, description } = transaction;
                                            let onSuccess;
                                            if (description === TRANSACTION_DESCRIPTIONS.fill) {
                                                onSuccess = onFillComplete;
                                            } else {
                                                onSuccess = this.reloadState;
                                            }
                                            return (
                                                <TransactionManager
                                                    key={txHash}
                                                    txHash={txHash}
                                                    dharma={dharma}
                                                    description={description}
                                                    onSuccess={onSuccess}
                                                    tokenAuthorised={tokenAuthorised}
                                                />
                                            );
                                        })
                                    }

                                    {customAlertMsgDisplay === true &&
                                        <CustomAlertMsg
                                            bsStyle={customAlertMsgStyle}
                                            className={customAlertMsgClassname}
                                            title={customAlertMsgTitle}
                                        />
                                    }

                                    <CardBody className="pl-4 pt-1 mtb-2 mt-10">
                                        <div>
                                            <div className="create-loan-buttons-container">
                                                <AuthorizableAction
                                                    canTakeAction={!error && hasSufficientAllowance}
                                                    canAuthorize={!hasSufficientAllowance}
                                                    onAction={this.handleFill}
                                                    onAuthorize={this.handleAuthorize}
                                                    disableSubmitBtn={disableSubmitBtn}
                                                >
                                                    <p>Unlock Tokens</p>
                                                    <p>Fund Loan</p>
                                                </AuthorizableAction>
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