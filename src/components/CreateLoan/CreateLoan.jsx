import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, InputGroup, Input, InputGroupAddon, ListGroup, Form } from 'reactstrap';
import InputRange from 'react-input-range';
import { Dharma } from "@dharmaprotocol/dharma.js";
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import Loading from "../Loading/Loading";
import TransactionManager from "../TransactionManager/TransactionManager";
import TokenSelect from "./TokenSelect/TokenSelect";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import SummaryItem from "./SummaryItem/SummaryItem";
import './CreateLoan.css';
import Api from "../../services/api";
import Error from "../Error/Error";
import { toast } from 'react-toastify';

class CreateLoan extends Component {

    constructor(props) {
        super(props);
        this.toggleSplit = this.toggleSplit.bind(this);
        this.state = {
            principalTokenSymbolDropdownOpen: false,
            collateralTokenSymbolDropdownOpen: false,
            termUnitDropdownOpen: false,
            expirationUnitDropdownOpen: false,
            splitButtonOpen: false,
            principal: 0,
            principalTokenSymbol: "WETH",
            LTVRatioValue: 0,
            collateral: 0,
            relayerFeeAmount: 0,
            relayerAddress: null,
            collateralTokenSymbol: "REP",
            interestRate: 0,
            termLength: 0,
            termUnit: "weeks",
            // Default the expiration to 30 days.
            expirationLength: 30,
            expirationUnit: "days",
            disabled: false,
            error: null,
            hasSufficientAllowance: null,
            txHash: null,
            interest_amount:0,
            total_reapayment_amount:0
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.createLoanRequest = this.createLoanRequest.bind(this);
        this.setHasSufficientAllowance = this.setHasSufficientAllowance.bind(this);
        this.authorizeCollateralTransfer = this.authorizeCollateralTransfer.bind(this);
    }

    async componentDidMount() {
        this.setHasSufficientAllowance();

        const api = new Api();

        const relayer = await api.setToken(this.props.token).get("relayerAddress").catch((error) => {
            if (error.status && error.status === 403) {
                // this.props.redirect(`/login`);
                // return;
            }
        });;
        if (relayer) {
            this.setState({ relayerAddress: relayer.address });
        }
    }


    async getRelayerFee(newPrincipalAmount) {
        const api = new Api();

        return new Promise((resolve) => {
            api.setToken(this.props.token).get("relayerFee", { principalAmount: newPrincipalAmount }).then((response) => {
                resolve(response.fee);
            });
        });
    }

    async createLoanRequest() {
        const api = new Api();
        try {
            const { dharma } = this.props;
            const currentAccount = await dharma.blockchain.getCurrentAccount();
            console.log("createLoanRequest() - currentAccount: ", currentAccount);
            const loanRequest = await this.generateLoanRequest(currentAccount);
            /*const id = await api.setToken(this.props.token).create("loanRequests", loanRequest.toJSON());*/
            const id = await api.setToken(this.props.token).create("loanRequests", {
                ...loanRequest.toJSON(),
                id: loanRequest.getAgreementId(),
            });
            this.props.onCompletion(loanRequest.getAgreementId());
        } catch (e) {
            console.error(e);
            this.setState({ error: e.message });
        }
    }

    async setHasSufficientAllowance(tokenSymbol) {
        const { dharma } = this.props;
        const { collateralTokenSymbol, collateralAmount } = this.state;
        const symbol = tokenSymbol ? tokenSymbol : collateralTokenSymbol;
        /*const { Tokens } = Dharma.Types;*/
        const { Token } = Dharma.Types;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        console.log("setHasSufficientAllowance() - currentAccount: ", currentAccount);
        /*const tokens = new Tokens(dharma, currentAccount);*/
        /*const tokenData = await tokens.getTokenDataForSymbol(symbol);*/
        
        if(typeof currentAccount != "undefined")
        {
            const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);
            const hasSufficientAllowance =
            tokenData.hasUnlimitedAllowance || tokenData.allowance >= collateralAmount;
            this.setState({
                hasSufficientAllowance,
            });
        }
        else
        {
            toast.error("Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured and reload the page.", {
                     autoClose: 8000
            });
        }
    }

    async authorizeCollateralTransfer() {
        /*const { dharma } = this.props;
        const { Allowance } = Dharma.Types;
        const { collateralTokenSymbol } = this.state;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        console.log("authorizeCollateralTransfer() - currentAccount: ", currentAccount);
        const allowance = new Allowance(dharma, collateralTokenSymbol, currentAccount);
        const txHash = await allowance.makeUnlimitedIfNecessary();
        this.setState({
            txHash,
        });*/
        const { dharma } = this.props;

        const { Token } = Dharma.Types;

        const { collateralTokenSymbol } = this.state;

        const currentAccount = await dharma.blockchain.getCurrentAccount();

        if(typeof currentAccount != 'undefined')
        {
             const txHash = await Token.makeAllowanceUnlimitedIfNecessary(
                dharma,
                collateralTokenSymbol,
                currentAccount,
            );

            this.setState({
                txHash,
            });
        }       
    }

    async generateLoanRequest_bk(debtorAddress) {
        const { dharma } = this.props;

        const { LoanRequest } = Dharma.Types;

        const {
            principal,
            principalTokenSymbol,
            collateralTokenSymbol,
            relayerAddress,
            relayerFeeAmount,
            collateral,
            termUnit,
            expirationUnit,
            expirationLength,
            interestRate,
            termLength,
        } = this.state;

        return LoanRequest.create(dharma, {
            principalAmount: principal,
            principalToken: principalTokenSymbol,
            collateralAmount: collateral,
            collateralToken: collateralTokenSymbol,
            interestRate,
            relayerFeeAmount,
            relayerAddress,
            termDuration: termLength,
            termUnit,
            debtorAddress,
            expiresInDuration: expirationLength,
            expiresInUnit: expirationUnit,
            // Here we simplistically make the creditor pay the relayer fee.
            creditorFeeAmount: relayerFeeAmount,
        });
    }

     async generateLoanRequest(debtor) {
        const { dharma } = this.props;

        const { LoanRequest } = Dharma.Types;

        const {
            principal,
            principalTokenSymbol,
            collateralTokenSymbol,
            relayerAddress,
            relayerFeeAmount,
            collateral,
            termUnit,
            expirationUnit,
            expirationLength,
            interestRate,
            termLength,
        } = this.state;

        const terms = {
            principalAmount: principal,
            principalToken: principalTokenSymbol,
            collateralAmount: collateral,
            collateralToken: collateralTokenSymbol,
            interestRate,
            relayerFeeAmount,
            relayerAddress,
            termDuration: termLength,
            termUnit,
            expiresInDuration: expirationLength,
            expiresInUnit: expirationUnit,
            // Here we simplistically make the creditor pay the relayer fee.
            creditorFeeAmount: relayerFeeAmount,
        };

        return LoanRequest.createAndSignAsDebtor(dharma, terms, debtor);
    }

    toggleDropDown(field) {
        field = field + "DropdownOpen";
        this.setState({
            [field]: !this.state[field]
        });
    }
    onDropdownItemClick(field, element) {
        const selectedValue = element.currentTarget.getAttribute('value');
        this.setState({
            [field]: !selectedValue
        });
    }
    toggleSplit() {
        this.setState({
            splitButtonOpen: !this.state.splitButtonOpen
        });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "principal") {
            // When the principal changes, the form becomes disabled until the
            // relayer fee has been updated.
            this.setState({ disabled: true });

            this.getRelayerFee(value).then((relayerFeeAmount) => {
                this.setState({
                    relayerFeeAmount,
                    disabled: false,
                });
            });

            if(this.state.interest_rate > 0 && value > 0)
            {
                let principal = value;
                let interest_rate =  this.state.interest_rate;
                let interest_amount = (principal * interest_rate) / 100;
                let total_reapayment_amount = parseFloat(principal) + parseFloat(interest_amount);
                this.setState({
                    interest_amount: interest_amount.toFixed(2),
                    total_reapayment_amount:total_reapayment_amount.toFixed(2)
                });
            }
        }

        this.setState({
            [name]: value,
        });

        if (name === "collateralTokenSymbol") {
            this.setState({
                setHasSufficientAllowance: null,
            });

            this.setHasSufficientAllowance(value);
        }

        if(name == "interestRate" && value > 0)
        {
            let interest_rate = value;
            let interest_amount = (this.state.principal * interest_rate) / 100;
            let total_reapayment_amount = parseFloat(this.state.principal) + parseFloat(interest_amount);
            this.setState({
                interest_amount: interest_amount.toFixed(2),
                total_reapayment_amount:total_reapayment_amount.toFixed(2)
            });
        }

    }

    componentWillMount() {

    }

    render() {
        const { tokens, dharma } = this.props;

        if (tokens.length === 0) {
            return <Loading />;
        }

        const {
            principalTokenSymbolDropdownOpen,
            collateralTokenSymbolDropdownOpen,
            termUnitDropdownOpen,
            expirationUnitDropdownOpen,
            principal,
            principalTokenSymbol,
            collateral,
            relayerFeeAmount,
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
            interest_amount,
            total_reapayment_amount
        } = this.state;

        return (
            <div>
                <div className="page-title">
                    <Row>
                        <Col sm={6}>
                            <h4 className="mb-0"> <div className="round-icon round-icon-lg orange"><i className="ti-money"></i></div> New Loan</h4>
                        </Col>
                        <Col sm={6}>
                            <Breadcrumb className="float-left float-sm-right">
                                <BreadcrumbItem><a href="/market">Market</a></BreadcrumbItem>
                                <BreadcrumbItem active>New Loan</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>
                </div>

                <div>
                    <Row className="row-eq-height">
                        <Col lg={4} md={4} sm={6} xl={4}>
                            <Card className="card-statistics mb-30 h-100 p-4">
                                <CardBody>
                                    <CardTitle>Create New Loan Request </CardTitle>

                                    {txHash && (
                                        <TransactionManager
                                            key={txHash}
                                            txHash={txHash}
                                            dharma={dharma}
                                            description="Authorize Collateral Transfer"
                                            onSuccess={this.setHasSufficientAllowance}
                                        />
                                    )}

                                    <Form disabled={disabled} onSubmit={this.createLoanRequest}>
                                        <div className="mt-20">
                                            <label>Loan Amount</label>
                                            <TokenSelect
                                                name="principal"
                                                onChange={this.handleInputChange}
                                                defaultValue={principal}
                                                dropdownFieldName="principalTokenSymbol"
                                                dropdownFieldDefaultValue={principalTokenSymbol}
                                                dropdownOpen={principalTokenSymbolDropdownOpen}
                                                toggleDropDown={this.toggleDropDown}
                                                tokens={tokens}
                                            />
                                        </div>
                                        <div className="mt-20 create-loan-slider">
                                            <label>LTV (Loan-to-Value Ratio)</label>
                                            <InputRange
                                                lassName="mt-20"
                                                maxValue={100}
                                                formatLabel={value => `${value} %`}
                                                minValue={0}
                                                value={LTVRatioValue}
                                                onChange={value => this.setState({ "LTVRatioValue": value })} />
                                        </div>
                                        <div className="mt-20">
                                            <label>Collateral Amount</label>
                                            <TokenSelect
                                                name="collateral"
                                                onChange={this.handleInputChange}
                                                defaultValue={collateral}
                                                dropdownFieldName="collateralTokenSymbol"
                                                dropdownFieldDefaultValue={collateralTokenSymbol}
                                                dropdownOpen={collateralTokenSymbolDropdownOpen}
                                                toggleDropDown={this.toggleDropDown}
                                                tokens={tokens}
                                            />
                                        </div>
                                        <div className="mt-20">
                                            <label>Loan Term</label>
                                            <TimeUnitSelect
                                                name="termLength"
                                                onChange={this.handleInputChange}
                                                defaultValue={termLength}
                                                dropdownFieldName="termUnit"
                                                dropdownFieldDefaultValue={termUnit}
                                                dropdownOpen={termUnitDropdownOpen}
                                                toggleDropDown={this.toggleDropDown}
                                            />
                                        </div>
                                        <div className="mt-20">
                                            <label>Interest Rate (% Per Loan Term)</label>
                                            <InputGroup>
                                                <Input onChange={this.handleInputChange}
                                                    type="number"
                                                    placeholder="Interest Rate"
                                                    name="interestRate"
                                                    value={interestRate} />
                                                <InputGroupAddon addonType="append">%</InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                        {/*<div className="mt-20">
                                            <label>Expiration</label>
                                            <TimeUnitSelect
                                                name="expirationLength"
                                                onChange={this.handleInputChange}
                                                defaultValue={expirationLength}
                                                dropdownFieldName="expirationUnit"
                                                dropdownFieldDefaultValue={expirationUnit}
                                                dropdownOpen={expirationUnitDropdownOpen}
                                                toggleDropDown={this.toggleDropDown}
                                            />
                                        </div>*/}
                                    </Form>

                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={4} md={4} sm={6} xl={4}>

                            <Card className="card-statistics mb-30 h-100 p-4">
                                <CardBody>
                                    <CardTitle>Summary </CardTitle>
                                    <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
                                        <ListGroup className="list-unstyled to-do">
                                            <SummaryItem 
                                                labelName = "Loan Amount"
                                                labelValue = { principal > 0 ? principal + ' ' + principalTokenSymbol : 'N/A' }
                                            />
                                            <SummaryItem 
                                                labelName = "Collateral Amount"
                                                labelValue = { collateral > 0 ? collateral + ' ' + collateralTokenSymbol : 'N/A' }
                                            />
                                            <SummaryItem 
                                                labelName = "LTV"
                                                labelValue = { LTVRatioValue > 0 ? LTVRatioValue + "%" : 'N/A' }
                                            />
                                            <SummaryItem 
                                                labelName = "Loan Term"
                                                labelValue = { termLength > 0 ? termLength + " " + termUnit : 'N/A' }
                                            />
                                            <SummaryItem 
                                                labelName = "Interest Rate(Per Loan Term)"
                                                labelValue = { interestRate > 0 ? interestRate + "%" + termUnit : 'N/A' }
                                            />
                                            {/*<SummaryItem 
                                                labelName = "Expiration"
                                                labelValue = { expirationLength + " " + expirationUnit }
                                            />*/}
                                            <SummaryItem 
                                                labelName = "Interest Amount"
                                                labelValue = { interest_amount > 0 ? interest_amount + ' ' + principalTokenSymbol : 'N/A' }
                                            />
                                            <SummaryItem 
                                                labelName = "Total Repayment Amount"
                                                labelValue = { total_reapayment_amount > 0 ? total_reapayment_amount + ' ' + principalTokenSymbol : 'N/A' }
                                            />
                                            {/*<SummaryItem 
                                                labelName = "Relayer Fee"
                                                labelValue = {relayerFeeAmount > 0 ? relayerFeeAmount + ' ' + principalTokenSymbol : '-'}
                                            />*/}
                                        </ListGroup>

                                        <hr />

                                        <div className="mb-30">
                                            <input className="form-check-input" type="checkbox" id="gridCheck" />
                                            <label className="form-check-label" htmlFor="gridCheck">
                                                I have read and agreed to the Loan Agreement
                                          </label>
                                        </div>

                                        <div className="mb-10">
                                            {error && <Error title="Unable to create loan request">{error}</Error>}
                                        </div>

                                        <div className="create-loan-buttons-container">
                                            <AuthorizableAction
                                                canTakeAction={hasSufficientAllowance}
                                                canAuthorize={
                                                    hasSufficientAllowance !== null && !hasSufficientAllowance
                                                }
                                                onAction={this.createLoanRequest}
                                                onAuthorize={this.authorizeCollateralTransfer}>
                                                <p>Unlock Tokens</p>
                                                <p>Submit Application</p>
                                            </AuthorizableAction>
                                        </div>

                                    </div>
                                </CardBody>
                            </Card>

                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}
export default CreateLoan;