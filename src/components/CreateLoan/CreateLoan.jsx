import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, InputGroup, Input, InputGroupAddon, ListGroup, Form } from 'reactstrap';
import InputRange from 'react-input-range';
import { Dharma } from "@dharmaprotocol/dharma.js";
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import Loading from "../Loading/Loading";
import LoadingFull from "../LoadingFull/LoadingFull";
import TransactionManager from "../TransactionManager/TransactionManager";
import TokenSelect from "./TokenSelect/TokenSelect";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import SummaryItem from "./SummaryItem/SummaryItem";
import './CreateLoan.css';
import Api from "../../services/api";
import Error from "../Error/Error";
import { toast } from 'react-toastify';
import validators from '../../validators';
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import borrowImg from "../../assets/images/borrow.png";

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
            principal: '',
            principalTokenSymbol: "WETH",
            LTVRatioValue: 60,
            collateral: '',
            relayerFeeAmount: 0,
            relayerAddress: null,
            collateralTokenSymbol: "REP",
            interestRate: '',
            termLength: '',
            termUnit: "weeks",
            expirationLength: 30,
            expirationUnit: "days",
            disabled: false,
            error: null,
            hasSufficientAllowance: null,
            txHash: '',
            interestAmount: 0,
            totalReapaymentAmount: 0,
            tokenAuthorised: false,
            userLoanAgree: false,
            collateralCurrentBalance: 0,
            customAlertMsgDisplay: false,
            customAlertMsgStyle: '',
            customAlertMsgClassname: '',
            customAlertMsgTitle: '',
            disableSubmitBtn: true,
            metaMaskMsg:false
        };
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleAgreeChange = this.handleAgreeChange.bind(this);
        this.createLoanRequest = this.createLoanRequest.bind(this);
        this.setHasSufficientAllowance = this.setHasSufficientAllowance.bind(this);
        this.authorizeCollateralTransfer = this.authorizeCollateralTransfer.bind(this);

        this.validators = validators;
        this.displayValidationErrors = this.displayValidationErrors.bind(this);
        this.updateValidators = this.updateValidators.bind(this);
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
        const { userLoanAgree, principal, collateral, collateralCurrentBalance, termLength } = this.state;
        const form_valid = this.isFormValid();
        if (userLoanAgree === true && principal > 0 && collateral > 0 && collateral < collateralCurrentBalance && collateralCurrentBalance > 0 && termLength > 0) {
            try {
                const { dharma } = this.props;
                const currentAccount = await dharma.blockchain.getCurrentAccount();
                console.log("createLoanRequest() - currentAccount: ", currentAccount);
                const loanRequest = await this.generateLoanRequest(currentAccount);
                const id = api.setToken(this.props.token).create("loanRequests", {
                    ...loanRequest.toJSON(),
                    id: loanRequest.getAgreementId(),
                });
                console.log("Get agreement ID");
                console.log(loanRequest.getAgreementId());
                this.props.onCompletion(loanRequest.getAgreementId());
            } catch (e) {
                let msg = (e.message.length > 3000) ? 'Transaction cancelled successfully.' : e.message; 
                this.setState({
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                    customAlertMsgTitle: msg,
                    disableSubmitBtn: false,
                });
            }
        }
        else {
            let msg = (principal == 0) ? 'Pricipal amount must be greater then zero.' : ((collateral == 0) ? 'Collateral amount must be greater then zero.' : ((collateral > collateralCurrentBalance) ? 'You does not have sufficient collateral balance in wallet.' : ((termLength == 0) ? 'Please enter valid loan term.' : 'Please accept loan agreement terms.')));
            toast.error(msg);
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

        if (typeof currentAccount != "undefined") {
            const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);
            const hasSufficientAllowance =
                tokenData.hasUnlimitedAllowance || tokenData.allowance >= collateralAmount;
            this.setState({
                hasSufficientAllowance,
                collateralCurrentBalance: tokenData.balance
            });

            if (tokenData.hasUnlimitedAllowance === true) {
                this.setState({
                    tokenAuthorised: true,
                });
            }
            else {
                this.setState({
                    tokenAuthorised: false,
                });
            }
        }
    }

    async authorizeCollateralTransfer() {
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const { collateralTokenSymbol } = this.state;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        if (typeof currentAccount != 'undefined') {
            const txHash = await Token.makeAllowanceUnlimitedIfNecessary(
                dharma,
                collateralTokenSymbol,
                currentAccount,
            );

            this.setState({
                txHash,
                /*tokenAuthorised:true*/
            });
        }
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

    async handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        console.log(value);
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

            if (this.state.interest_rate > 0 && value > 0) {
                let principal = value;
                let interest_rate = this.state.interest_rate;
                let interestAmount = (principal * interest_rate) / 100;
                let totalReapaymentAmount = parseFloat(principal) + parseFloat(interestAmount);
                this.setState({
                    interestAmount: interestAmount.toFixed(2),
                    totalReapaymentAmount: totalReapaymentAmount.toFixed(2)
                });
            }
        }

        this.setState({ [name]: value }, () => {
            if (name == "principal" || name == "collateral" || name === "collateralTokenSymbol" || name == "principalTokenSymbol") {
                this.countLtv(name);
            }

            if (this.state.principal > 0 && this.state.collateral > 0 && this.state.LTVRatioValue <= 60 && this.state.interestRate > 0 && this.state.termLength > 0 && this.state.userLoanAgree === true) {
                this.setState({
                    disableSubmitBtn: false
                });
            }
            else {
                this.setState({
                    disableSubmitBtn: true
                });
            }
        });

        if (name === "collateralTokenSymbol") {
            this.setState({
                handleInputChange: null,
            });
            this.setHasSufficientAllowance(value);
        }

        if (name == "interestRate" && value > 0) {
            let interest_rate = value;
            let interestAmount = (this.state.principal * interest_rate) / 100;
            let totalReapaymentAmount = parseFloat(this.state.principal) + parseFloat(interestAmount);
            this.setState({
                interestAmount: interestAmount.toFixed(2),
                totalReapaymentAmount: totalReapaymentAmount.toFixed(2)
            });
        }
        if (name == "principal" || name == "collateral" || name == "termLength" || name == "interestRate") {
            this.updateValidators(name, value);
        }
    }

    handleLTVChange(NewLTVRatioValue) {
        let stateObj = {};
        this.setState({ LTVRatioValue: NewLTVRatioValue }, () => {
            this.countLtv("LTVRatioValue");
        });
    }

    handleAgreeChange(event) {
        let checked = event.target.checked;
        let stateObj = {};
        const {
            principal,
            principalTokenSymbol,
            collateral,
            collateralTokenSymbol,
            LTVRatioValue,
            interestRate,
            termLength
        } = this.state;

        if (checked === true) {
            stateObj["userLoanAgree"] = true;
            if (principal > 0 && collateral > 0 && LTVRatioValue <= 60 && interestRate > 0 && termLength > 0) {
                stateObj["disableSubmitBtn"] = false;
            }
        }
        else {
            stateObj["userLoanAgree"] = false;
            stateObj["disableSubmitBtn"] = true;
        }
        this.setState(stateObj);
    }

    updateValidators(fieldName, value) {
        this.validators[fieldName].errors = [];
        this.validators[fieldName].state = value;
        this.validators[fieldName].valid = true;
        this.validators[fieldName].rules.forEach((rule) => {
            if (rule.test instanceof RegExp) {
                if (!rule.test.test(value)) {
                    this.validators[fieldName].errors.push(rule.message);
                    this.validators[fieldName].valid = false;
                }
            } else if (typeof rule.test === 'function') {
                if (!rule.test(value)) {
                    this.validators[fieldName].errors.push(rule.message);
                    this.validators[fieldName].valid = false;
                }
            }
        });
    }

    isFormValid() {
        let status = true;
        Object.keys(this.validators).forEach((field) => {
            if (field == "principal" || field == "collateral" || field == "termLength" || field == "interestRate") {
                if (!this.validators[field].valid) {
                    status = false;
                }
            }
        });
        return status;
    }

    displayValidationErrors(fieldName) {
        const validator = this.validators[fieldName];
        const result = '';
        if (validator && !validator.valid) {
            const errors = validator.errors.map((info, index) => {
                return <span className="error" key={index}>* {info}<br /></span>
            });

            return (
                <div className="col s12 row">
                    {errors}
                </div>
            );
        }
        return result;
    }

    async componentWillMount() {
        const { dharma } = this.props;
        const currentAccount = await dharma.blockchain.getCurrentAccount();

        if(typeof currentAccount == "undefined")
        {
            this.setState({ 
                metaMaskMsg:true
            });
        }
    }

    async countLtv(name) {
        const {
            principal,
            principalTokenSymbol,
            collateral,
            collateralTokenSymbol,
            LTVRatioValue,
            interestRate,
            termLength,
            userLoanAgree
        } = this.state;
        let stateObj = {};
        let ltv = 0;
        let userCollateral = 0;
        const api = new Api();
        const all_token_price = api
            .setToken(this.props.token)
            .get(`priceFeed`)
            .then(async priceFeedData => {
                if (typeof priceFeedData[principalTokenSymbol] != "undefined" && typeof priceFeedData[collateralTokenSymbol] != "undefined") {
                    stateObj["hasSufficientAllowance"] = true;
                    let principalTokenCurrentPrice =
                        priceFeedData[principalTokenSymbol].USD;
                    let collateralTokenCurrentPrice =
                        priceFeedData[collateralTokenSymbol].USD;
                    let pricinipalMarketValue = parseFloat(principal) * parseFloat(principalTokenCurrentPrice);
                    let countCollateral = ["principal", "collateralTokenSymbol", "principalTokenSymbol", "LTVRatioValue"];
                    if (countCollateral.indexOf(name) > -1 && principal > 0 && LTVRatioValue > 0) {
                        let collateralCount = (pricinipalMarketValue / LTVRatioValue) * 100;
                        let collateralPurchasable = parseFloat(collateralCount) / parseFloat(collateralTokenCurrentPrice);
                        /*console.log(collateralPurchasable);*/
                        stateObj["collateral"] = (collateralPurchasable > 0) ? collateralPurchasable.toFixed(2) : 0;
                        stateObj["customAlertMsgDisplay"] = false;
                        stateObj["customAlertMsgStyle"] = stateObj["customAlertMsgClassname"] = stateObj["customAlertMsgTitle"] = '';
                        stateObj["disableSubmitBtn"] = false;
                    }

                    if (name == "collateral" && principal > 0 && collateral > 0) {
                        let collateralMarketValue = parseFloat(collateral) * parseFloat(collateralTokenCurrentPrice);
                        let newLTVRatio = (pricinipalMarketValue / collateralMarketValue) * 100;
                        if (newLTVRatio > 60) {
                            stateObj["customAlertMsgDisplay"] = true;
                            stateObj["customAlertMsgStyle"] = 'danger';
                            stateObj["customAlertMsgClassname"] = 'fa fa-exclamation-triangle fa-2x pull-left mr-2';
                            stateObj["customAlertMsgTitle"] = 'LTV ratio can not be greater then 60.';
                            
                            if(principal > 0 && collateral > 0 && LTVRatioValue <= 60 && interestRate > 0 && termLength > 0 && userLoanAgree === true)
                            {
                                stateObj["disableSubmitBtn"] = false;
                            }
                        }
                        else {
                            stateObj["LTVRatioValue"] = (newLTVRatio > 0) ? newLTVRatio.toFixed(2) : 0;
                            stateObj["customAlertMsgDisplay"] = false;
                            stateObj["customAlertMsgStyle"] = stateObj["customAlertMsgClassname"] = stateObj["customAlertMsgTitle"] = '';
                            stateObj["disableSubmitBtn"] = false;
                        }
                    }
                }

                if (typeof stateObj != "undefined") {
                    this.setState(stateObj);
                }
            });
    }

    render() {
        const { tokens, dharma } = this.props;


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
            interestAmount,
            totalReapaymentAmount,
            tokenAuthorised,
            customAlertMsgDisplay,
            customAlertMsgStyle,
            customAlertMsgClassname,
            customAlertMsgTitle,
            disableSubmitBtn,
            metaMaskMsg
        } = this.state;

        let msgDisplay = false;
        if (txHash != '' || tokenAuthorised === true) {
            msgDisplay = true;
        }

        if (customAlertMsgDisplay === true) {
            msgDisplay = false;
        }
        return (
            <div className="create-loan-container">
                <div className="page-title">

                    <Row>
                        <Col>
                            <Breadcrumb className="float-left">
                                <BreadcrumbItem><a href="/market" className="link-blue">Market</a></BreadcrumbItem>
                                <BreadcrumbItem active>New Loan</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-4">
                        <Col>
                            <h5 className="mb-2"> <div className="round-icon round-icon-lg orange"><img className="mb-1" src={borrowImg} height="20" /></div> New Loan</h5>
                        </Col>
                    </Row>
                </div>
                {
                    metaMaskMsg &&
                    <Row>
                        <Col md={12}>
                            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={["Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured."]} />
                        </Col>
                    </Row>
                }
                {tokens.length === 0 && !metaMaskMsg && <LoadingFull />}
                {tokens.length > 0 &&
                    <div>
                        <Row className="row-eq-height">
                            <Col lg={4} md={4} sm={6} xl={4}>
                                <Card className="card-statistics mb-30 h-100 p-4">
                                    <CardBody>
                                        <CardTitle className="card-title-custom">Create New Loan Request </CardTitle>

                                        <Form disabled={disabled} onSubmit={this.createLoanRequest} className="create-loan-form">
                                            <div className="mt-20">
                                                <label>Loan Amount<span className="red">*</span></label>
                                                <TokenSelect
                                                    name="principal"
                                                    onChange={this.handleInputChange}
                                                    defaultValue={principal}
                                                    dropdownFieldName="principalTokenSymbol"
                                                    dropdownFieldDefaultValue={principalTokenSymbol}
                                                    dropdownOpen={principalTokenSymbolDropdownOpen}
                                                    toggleDropDown={this.toggleDropDown}
                                                    tokens={tokens}
                                                    allowedTokens={false}
                                                />
                                                {this.displayValidationErrors('principal')}
                                            </div>
                                            <div className="mt-20 create-loan-slider">
                                                <label>LTV (Loan-to-Value Ratio)</label>
                                                <InputRange
                                                    lassName="mt-20"
                                                    maxValue={60}
                                                    formatLabel={value => `${value} %`}
                                                    minValue={5}
                                                    value={LTVRatioValue}
                                                    onChange={value => this.handleLTVChange(value)} />
                                            </div>
                                            <div className="mt-20">
                                                <label>Collateral Amount<span className="red">*</span></label>
                                                <TokenSelect
                                                    name="collateral"
                                                    onChange={this.handleInputChange}
                                                    defaultValue={collateral}
                                                    dropdownFieldName="collateralTokenSymbol"
                                                    dropdownFieldDefaultValue={collateralTokenSymbol}
                                                    dropdownOpen={collateralTokenSymbolDropdownOpen}
                                                    toggleDropDown={this.toggleDropDown}
                                                    tokens={tokens}
                                                    allowedTokens={true}
                                                />
                                                {this.displayValidationErrors('collateral')}
                                            </div>
                                            <div className="mt-20">
                                                <label>Loan Term<span className="red">*</span></label>
                                                <TimeUnitSelect
                                                    name="termLength"
                                                    onChange={this.handleInputChange}
                                                    defaultValue={termLength}
                                                    dropdownFieldName="termUnit"
                                                    dropdownFieldDefaultValue={termUnit}
                                                    dropdownOpen={termUnitDropdownOpen}
                                                    toggleDropDown={this.toggleDropDown}
                                                />
                                                {this.displayValidationErrors('termLength')}
                                            </div>
                                            <div className="mt-20">
                                                <label>Interest Rate (% Per Loan Term)<span className="red">*</span></label>
                                                <InputGroup>
                                                    <Input onChange={this.handleInputChange}
                                                        type="number"
                                                        placeholder="Interest Rate"
                                                        name="interestRate"
                                                        value={interestRate} />
                                                    <InputGroupAddon addonType="append">%</InputGroupAddon>
                                                </InputGroup>
                                                {this.displayValidationErrors('interestRate')}
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

                                <Card className="card-statistics mb-30 h-100">
                                    <CardBody className="pb-0">

                                        <div className="p-4 pb-0">

                                            <CardTitle className="card-title-custom">Summary </CardTitle>
                                            <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
                                                <ListGroup className="list-unstyled to-do">
                                                    <SummaryItem
                                                        labelName="Loan Amount"
                                                        labelValue={principal > 0 ? principal + ' ' + principalTokenSymbol : 'N/A'}
                                                    />
                                                    <SummaryItem
                                                        labelName="Collateral Amount"
                                                        labelValue={collateral > 0 ? collateral + ' ' + collateralTokenSymbol : 'N/A'}
                                                    />
                                                    <SummaryItem
                                                        labelName="LTV"
                                                        labelValue={LTVRatioValue > 0 ? LTVRatioValue + "%" : 'N/A'}
                                                    />
                                                    <SummaryItem
                                                        labelName="Loan Term"
                                                        labelValue={termLength > 0 ? termLength + " " + termUnit : 'N/A'}
                                                    />
                                                    <SummaryItem
                                                        labelName="Interest Rate(Per Loan Term)"
                                                        labelValue={interestRate > 0 ? interestRate + "%" : 'N/A'}
                                                    />
                                                    {/*<SummaryItem 
                                                    labelName = "Expiration"
                                                    labelValue = { expirationLength + " " + expirationUnit }
                                                />*/}
                                                    <SummaryItem
                                                        labelName="Interest Amount"
                                                        labelValue={interestAmount > 0 ? interestAmount + ' ' + principalTokenSymbol : 'N/A'}
                                                    />
                                                    <SummaryItem
                                                        labelName="Total Repayment Amount"
                                                        labelValue={totalReapaymentAmount > 0 ? totalReapaymentAmount + ' ' + principalTokenSymbol : 'N/A'}
                                                    />
                                                    {/*<SummaryItem 
                                                    labelName = "Relayer Fee"
                                                    labelValue = {relayerFeeAmount > 0 ? relayerFeeAmount + ' ' + principalTokenSymbol : '-'}
                                                />*/}
                                                </ListGroup>

                                                <hr />

                                                <div className="agree-loan-check pt-1 mtb-2">
                                                    <label className="checkbox-container"> <span>I have read and agreed to the <a href="/loan-agreement" target="_blank" className="link-blue">Loan Agreement</a></span>
                                                        <input type="checkbox" id="loanAgreement" name="loanAgreement" value="y" onChange={this.handleAgreeChange} />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                </div>

                                            </div>

                                        </div>
                                    </CardBody>

                                    {msgDisplay === true &&
                                        <TransactionManager
                                            key={txHash}
                                            txHash={txHash}
                                            dharma={dharma}
                                            onSuccess={this.setHasSufficientAllowance}
                                            tokenAuthorised={tokenAuthorised}
                                        />
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
                                                    canTakeAction={hasSufficientAllowance}
                                                    canAuthorize={
                                                        hasSufficientAllowance !== null && !hasSufficientAllowance
                                                    }
                                                    onAction={this.createLoanRequest}
                                                    onAuthorize={this.authorizeCollateralTransfer}
                                                    tokenAuthorised={tokenAuthorised}
                                                    disableSubmitBtn={disableSubmitBtn}
                                                >
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
                }
            </div>
        );
    }
}
export default CreateLoan;