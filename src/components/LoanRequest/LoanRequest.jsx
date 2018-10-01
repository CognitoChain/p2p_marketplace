import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, InputGroup, Input, InputGroupAddon, ListGroup, Form } from 'reactstrap';
import Api from "../../services/api";

import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import Terms from "./Terms/Terms";
import NotFillableAlert from "./Alert/NotFillableAlert";

import TransactionManager from "../TransactionManager/TransactionManager";
import Loading from "../Loading/Loading";

import "./LoanRequest.css";

import { LinkContainer } from "react-router-bootstrap";

import {Panel } from "react-bootstrap";
import SummaryItem from "./SummaryItem/SummaryItem";
import Error from "../Error/Error";

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
            txHash: null
        };

        // handlers
        this.handleFill = this.handleFill.bind(this);
        this.handleAuthorize = this.handleAuthorize.bind(this);

        // setters
        this.reloadState = this.reloadState.bind(this);
        this.setHasSufficientAllowance = this.setHasSufficientAllowance.bind(this);
        this.assertFillable = this.assertFillable.bind(this);
    }

    componentDidMount() {
        const { LoanRequest,Debt } = Dharma.Types;

        const { dharma, id } = this.props;

        const api = new Api();

        api.setToken(this.props.token).get(`loanRequests/${id}`).then(async (loanRequestData) => {
            const loanRequest = await LoanRequest.load(dharma, loanRequestData);
            console.log(loanRequest);
            
            /*const repaymentAmount = await loan.getTotalExpectedRepaymentAmount();*/
            /*console.log(repaymentAmount);*/
            /*const debt = await Debt.fetch(dharma, id);
            console.log(debt);
            const outstandingAmount = await debt.getOutstandingAmount();
            console.log(outstandingAmount);
            */


            this.setState({ loanRequest });
            var get_terms = loanRequest.getTerms();
            this.setState({
                principal:get_terms.principalAmount,
                principalTokenSymbol:get_terms.principalTokenSymbol,
                collateralAmount:get_terms.collateralAmount,
                collateralTokenSymbol:get_terms.collateralTokenSymbol,
                interestRate:get_terms.interestRate,
                termLength:get_terms.termDuration,
                termUnit:get_terms.termUnit              
            });
            this.reloadState();
        });
    }

    reloadState() {
        this.setHasSufficientAllowance();
        this.assertFillable();
    }

    async handleFill() {
        const { loanRequest } = this.state;

        loanRequest
        .fillAsCreditor()
        .then((txHash) => {
            const { transactions } = this.state;
            transactions.push({ txHash, description: TRANSACTION_DESCRIPTIONS.fill });

            this.setState({
                transactions,
            });
        })
        .catch((error) => {
            this.setState({
                error,
            });
        });
    }

    async handleAuthorize() {
        const { loanRequest, transactions } = this.state;
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const owner = await dharma.blockchain.getCurrentAccount();
        const terms = loanRequest.getTerms();
        const txHash = await Token.makeAllowanceUnlimitedIfNecessary(dharma, terms.principalTokenSymbol, owner);
        if (txHash) {
            transactions.push({ txHash, description: TRANSACTION_DESCRIPTIONS.allowance });

            this.setState({
                transactions,
            });
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

        const tokenData = await Token.getDataForSymbol(dharma, terms.principalTokenSymbol, currentAccount);

        const hasSufficientAllowance =
        tokenData.hasUnlimitedAllowance || tokenData.allowance >= terms.principalAmount;

        this.setState({
            hasSufficientAllowance,
        });
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
        } = this.state;

        const { dharma, onFillComplete } = this.props;

        if (!loanRequest || hasSufficientAllowance === null) {
            return <Loading />;
        }

        return (
            <div>

            <div className="page-title">
                    <Row>
                        <Col sm={6}>
                            <h4 className="mb-0"> <div className="round-icon round-icon-lg olivegreen"><i className="ti-money"></i></div> Fund Loan</h4>
                        </Col>
                        <Col sm={6}>
                            <Breadcrumb className="float-left float-sm-right">
                                <BreadcrumbItem><a href="/market">Market</a></BreadcrumbItem>
                                <BreadcrumbItem active>Fund Loan</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>
            </div>

            <Row>
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
                    />
                    );
            })
        }

        <Col lg={6} md={6} sm={6} xl={4} className="mb-30">
        <Card className="card-statistics h-100 p-3">
        <CardBody>
        <CardTitle>Summary </CardTitle>
        <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
        <ListGroup className="list-unstyled to-do">
        <SummaryItem 
        labelName = "Loan Amount"
        labelValue = { principal > 0 ? principal + ' ' + principalTokenSymbol : ' - ' }
        />
        <SummaryItem 
        labelName = "Created Date"
        labelValue = ""
        />
        <SummaryItem 
        labelName = "Collateral Amount"
        labelValue = { collateral > 0 ? collateral + ' ' + collateralTokenSymbol : ' - ' }
        />
        <SummaryItem 
        labelName = "Collateral Value"
        labelValue = { collateral > 0 ? collateral + ' ' + collateralTokenSymbol : ' - ' }
        />
        <SummaryItem 
        labelName = "LTV"
        labelValue = { LTVRatioValue > 0 ? LTVRatioValue + "%" : ' - ' }
        />
        <SummaryItem 
        labelName = "Loan Term"
        labelValue = { termLength > 0 ? termLength + " " + termUnit : ' - ' }
        />
        <SummaryItem 
        labelName = "Interest Rate(Per Loan Term)"
        labelValue = { interestRate + "%" }
        />
        <SummaryItem 
        labelName = "Interest Amount"
        labelValue = "-"
        />
        <SummaryItem 
        labelName = "Total Repayment Amount"
        labelValue = "-"
        />
        </ListGroup>

        <hr />

        <div className="mb-30">
        <input className="form-check-input" type="checkbox" id="gridCheck" />
        <label className="form-check-label" htmlFor="gridCheck">
        I have read and agreed to the Loan Agreement
        </label>
        </div>

        <div className="mb-10">
        {error && <NotFillableAlert>{error.message}</NotFillableAlert>}
        </div>

        <div className="create-loan-buttons-container">
        <AuthorizableAction
        canTakeAction={!error && hasSufficientAllowance}
        canAuthorize={!hasSufficientAllowance}
        onAction={this.handleFill}
        onAuthorize={this.handleAuthorize}>
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
        );
    }
}
export default LoanRequest;