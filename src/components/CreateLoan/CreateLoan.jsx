import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, InputGroup, Input, InputGroupAddon, ListGroup, Form } from 'reactstrap';
import InputRange from 'react-input-range';
import Dharma from "@dharmaprotocol/dharma.js";
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import Loading from "../Loading/Loading";
import TransactionManager from "../TransactionManager/TransactionManager";
import TokenSelect from "./TokenSelect/TokenSelect";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import SummaryItem from "./SummaryItem/SummaryItem";
import './CreateLoan.css';
import Api from "../../services/api";
import Error from "../Error/Error";

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
            txHash: null
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
            const id = await api.setToken(this.props.token).create("loanRequests", loanRequest.toJSON());
            this.props.onCompletion(id);
        } catch (e) {
            console.error(e);
            this.setState({ error: e.message });
        }
    }

    async setHasSufficientAllowance(tokenSymbol) {
        const { dharma } = this.props;
        const { collateralTokenSymbol, collateralAmount } = this.state;
        const symbol = tokenSymbol ? tokenSymbol : collateralTokenSymbol;
        const { Tokens } = Dharma.Types;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        console.log("setHasSufficientAllowance() - currentAccount: ", currentAccount);
        const tokens = new Tokens(dharma, currentAccount);
        const tokenData = await tokens.getTokenDataForSymbol(symbol);
        const hasSufficientAllowance =
            tokenData.hasUnlimitedAllowance || tokenData.allowance >= collateralAmount;

        this.setState({
            hasSufficientAllowance,
        });
    }

    async authorizeCollateralTransfer() {
        const { dharma } = this.props;

        const { Allowance } = Dharma.Types;

        const { collateralTokenSymbol } = this.state;

        const currentAccount = await dharma.blockchain.getCurrentAccount();
        console.log("authorizeCollateralTransfer() - currentAccount: ", currentAccount);
        const allowance = new Allowance(dharma, currentAccount, collateralTokenSymbol);

        const txHash = await allowance.makeUnlimitedIfNecessary();

        this.setState({
            txHash,
        });
    }

    async generateLoanRequest(debtorAddress) {
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
            LTVRatioValue
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
                                            <label>Principal Amount</label>
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
                                        <div className="mt-20">
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
                                        </div>
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
                                                labelValue = { principal > 0 ? principal + ' ' + principalTokenSymbol : ' - ' }
                                            />
                                            <SummaryItem 
                                                labelName = "Collateral Amount"
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
                                                labelName = "Expiration"
                                                labelValue = { expirationLength + " " + expirationUnit }
                                            />
                                            <SummaryItem 
                                                labelName = "Interest Amount"
                                                labelValue = "-"
                                            />
                                            <SummaryItem 
                                                labelName = "Total Repayment Amount"
                                                labelValue = "-"
                                            />
                                            <SummaryItem 
                                                labelName = "Relayer Fee"
                                                labelValue = {relayerFeeAmount > 0 ? relayerFeeAmount + ' ' + principalTokenSymbol : '-'}
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