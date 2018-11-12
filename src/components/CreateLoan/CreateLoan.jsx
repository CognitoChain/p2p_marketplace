import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, InputGroup, Input, InputGroupAddon, ListGroup, Form } from 'reactstrap';
import InputRange from 'react-input-range';
import { Dharma } from "@dharmaprotocol/dharma.js";
import _ from "lodash";
import { Link } from 'react-router-dom';
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import LoadingFull from "../LoadingFull/LoadingFull";
import TransactionManager from "../TransactionManager/TransactionManager";
import TokenSelect from "./TokenSelect/TokenSelect";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import SummaryItem from "./SummaryItem/SummaryItem";
import Api from "../../services/api";
import Error from "../Error/Error";
import validators from '../../validators';
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import { niceNumberDisplay } from "../../utils/Util";
import borrowImg from "../../assets/images/borrow.png";
import './CreateLoan.css';
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
            termUnit: "days",
            expirationLength: 30,
            expirationUnit: "days",
            disabled: false,
            error: null,
            hasSufficientAllowance: false,
            txHash: '',
            interestAmount: 0,
            totalReapaymentAmount: 0,
            userLoanAgree: '',
            collateralCurrentBalance: 0,
            customAlertMsgDisplay: false,
            customAlertMsgStyle: '',
            customAlertMsgClassname: '',
            customAlertMsgTitle: '',
            metaMaskMsg: false,
            isBottomButtonLoading: true
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
    componentWillReceiveProps(nextProps) {
        if (nextProps.tokens.length > 0 && this.props.tokens.length == 0) {
            let firstToken = '';
            let principalTokenSymbol = this.state.principalTokenSymbol;
            _.every(nextProps.tokens, function (token) {
                if (token.balance > 0 && firstToken == '' && token.symbol != principalTokenSymbol) {
                    firstToken = token.symbol;
                    return false;
                }
                return true;
            })
            this.setState({
                collateralTokenSymbol: firstToken || this.state.collateralTokenSymbol
            })
        }
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
        if (this.isFormValid()) {
            try {
                const { dharma } = this.props;
                const currentAccount = await dharma.blockchain.getCurrentAccount();
                const loanRequest = await this.generateLoanRequest(currentAccount);
                api.setToken(this.props.token).create("loanRequests", {
                    ...loanRequest.toJSON(),
                    id: loanRequest.getAgreementId(),
                });
                this.props.onCompletion(loanRequest.getAgreementId());
            } catch (e) {
                let error = new Error(e);
                error = error.props.message.split(".")
                
                this.setState({
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                    customAlertMsgTitle: error[0]
                });
            }
        }
        else {
            this.setState({
                customAlertMsgDisplay: true,
                customAlertMsgStyle: 'danger',
                customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                customAlertMsgTitle: "Please complete required fields",
                disableSubmitBtn: true,
            });
        }
    }

    async setHasSufficientAllowance(tokenSymbol, status) {
        const { dharma } = this.props;
        const { collateralTokenSymbol, collateralAmount} = this.state;
        const symbol = tokenSymbol ? tokenSymbol : collateralTokenSymbol;
        const isCompleted = status && status == "success" ? true : false;
        const { Token } = Dharma.Types;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        let stateObj = {};
        /*const tokens = new Tokens(dharma, currentAccount);*/
        /*const tokenData = await tokens.getTokenDataForSymbol(symbol);*/
        stateObj["hasSufficientAllowance"] = false;
        stateObj["isBottomButtonLoading"] = false;
        if (typeof currentAccount != "undefined") {
            const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);
            const hasSufficientAllowance =
                tokenData.hasUnlimitedAllowance || tokenData.allowance >= collateralAmount || isCompleted;
            stateObj["hasSufficientAllowance"] = hasSufficientAllowance;
            stateObj["collateralCurrentBalance"] = tokenData.balance;
        }
        this.setState(stateObj);
    }

    async authorizeCollateralTransfer() {
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const { collateralTokenSymbol } = this.state;
        const currentAccount = await dharma.blockchain.getCurrentAccount();

        if (typeof currentAccount != 'undefined') {
            try {
                const txHash = await Token.makeAllowanceUnlimitedIfNecessary(
                    dharma,
                    collateralTokenSymbol,
                    currentAccount,
                );
                this.setState({
                    customAlertMsgDisplay: false,
                    txHash
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
                });
            }
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
            [field]: !this.state[field],
            customAlertMsgDisplay:false
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
    calculateInterestRate() {
        const { principal, interestRate } = this.state;
        let interestAmount = 0;
        let totalReapaymentAmount = 0;
        let stateObj = {};
        if (interestRate > 0) {
            interestAmount = (principal * interestRate) / 100;
            totalReapaymentAmount = parseFloat(principal) + parseFloat(interestAmount);
            stateObj["interestAmount"] = niceNumberDisplay(interestAmount);
            stateObj["totalReapaymentAmount"] = niceNumberDisplay(totalReapaymentAmount);
        }
        this.setState(stateObj);
    }
    setRelayerFee(principal) {
        if (principal <= 0) {
            return;
        }
        this.setState({ disabled: true });
        this.getRelayerFee(principal).then((relayerFeeAmount) => {
            this.setState({
                relayerFeeAmount,
                disabled: false,
            });
        });
    }
    async handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        if (name === "principal") {
            this.setRelayerFee(value);
        }
        this.setState({ [name]: value }, () => {
            if (name == "principal" || name == "collateral" || name === "collateralTokenSymbol" || name == "principalTokenSymbol") {
                this.countLtv(name);
            }
            if (name == "principal" || name == "interestRate") {
                this.calculateInterestRate();
            }
        });
        if (name === "collateralTokenSymbol") {
            this.setState({
                hasSufficientAllowance: false,
                isBottomButtonLoading: true
            });
            this.setHasSufficientAllowance(value);
        }
    }

    handleLTVChange(NewLTVRatioValue) {
        this.setState({ LTVRatioValue: NewLTVRatioValue }, () => {
            this.countLtv("LTVRatioValue");
        });
    }

    handleAgreeChange(event) {
        let checked = event.target.checked;
        this.setState({ userLoanAgree: checked });
    }

    updateValidators(fieldName, value) {
        const { collateralCurrentBalance, hasSufficientAllowance, principalTokenSymbol, collateralTokenSymbol } = this.state;
        if (!this.validators[fieldName]) {
            this.validators[fieldName] = {}
        }
        this.validators[fieldName].errors = [];
        this.validators[fieldName].state = value;
        this.validators[fieldName].valid = true;
        if (this.validators[fieldName].rules) {
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
        if (fieldName == "collateral" && hasSufficientAllowance && value > collateralCurrentBalance && collateralCurrentBalance > 0) {
            this.validators[fieldName].errors.push("You do not have sufficient collateral balance in wallet.'");
            this.validators[fieldName].valid = false;
        }
        if (fieldName == "collateralTokenSymbol" && principalTokenSymbol == collateralTokenSymbol) {
            this.validators[fieldName].errors.push("Please choose another token.");
            this.validators[fieldName].valid = false;
        }
        if (fieldName == "userLoanAgree" && !value) {
            this.validators[fieldName].errors.push("Please accept loan agreement terms.");
            this.validators[fieldName].valid = false;
        }
        if (fieldName == "LTVRatioValue" && value > 60) {
            this.validators[fieldName].errors.push("LTV ratio can not be greater then 60.");
            this.validators[fieldName].valid = false;
        }
    }

    isFormValid() {
        let status = true;
        const validationFields = ["principal", "collateral", "collateralTokenSymbol", "termLength", "interestRate", "userLoanAgree", "LTVRatioValue"];
        validationFields.forEach((field) => {
            this.updateValidators(field, this.state[field])
            if (!this.validators[field].valid) {
                status = false;
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

        if (typeof currentAccount == "undefined") {
            this.setState({
                metaMaskMsg: true
            });
        }
    }

    async countLtv(name) {
        const {
            principal,
            principalTokenSymbol,
            collateral,
            collateralTokenSymbol,
            LTVRatioValue
        } = this.state;
        const api = new Api();
        api.setToken(this.props.token)
            .get(`priceFeed`)
            .then(async priceFeedData => {
                if (!_.isUndefined(priceFeedData[principalTokenSymbol]) && !_.isUndefined(priceFeedData[collateralTokenSymbol])) {
                    /*stateObj["hasSufficientAllowance"] = true;*/
                    let principalTokenCurrentPrice =
                        priceFeedData[principalTokenSymbol].USD;
                    let collateralTokenCurrentPrice =
                        priceFeedData[collateralTokenSymbol].USD;
                    let pricinipalMarketValue = parseFloat(principal) * parseFloat(principalTokenCurrentPrice);
                    let countCollateral = ["principal", "collateralTokenSymbol", "principalTokenSymbol", "LTVRatioValue"];
                    if (countCollateral.indexOf(name) > -1 && principal > 0 && LTVRatioValue > 0) {
                        let collateralCount = (pricinipalMarketValue / LTVRatioValue) * 100;
                        let collateralPurchasable = parseFloat(collateralCount) / parseFloat(collateralTokenCurrentPrice);
                        collateralPurchasable = niceNumberDisplay(collateralPurchasable);
                        this.setState({ collateral: collateralPurchasable });
                    }
                    if (name == "collateral" && principal > 0 && collateral > 0) {
                        let collateralMarketValue = parseFloat(collateral) * parseFloat(collateralTokenCurrentPrice);
                        let newLTVRatio = (pricinipalMarketValue / collateralMarketValue) * 100;
                        newLTVRatio = niceNumberDisplay(newLTVRatio);
                        this.setState({ LTVRatioValue: newLTVRatio });
                    }
                }
            });
    }

    render() {
        const { tokens, dharma } = this.props;
        const {
            principalTokenSymbolDropdownOpen,
            collateralTokenSymbolDropdownOpen,
            termUnitDropdownOpen,
            principal,
            principalTokenSymbol,
            collateral,
            collateralTokenSymbol,
            termUnit,
            termLength,
            interestRate,
            disabled,
            hasSufficientAllowance,
            txHash,
            LTVRatioValue,
            interestAmount,
            totalReapaymentAmount,
            customAlertMsgDisplay,
            customAlertMsgStyle,
            customAlertMsgClassname,
            customAlertMsgTitle,
            metaMaskMsg,
            isBottomButtonLoading,
            userLoanAgree
        } = this.state;

        let msgDisplay = false;
        if (txHash != '' || hasSufficientAllowance) {
            msgDisplay = true;
        }
        const isFormValid = this.isFormValid();
        let sortedTokens = _.orderBy(tokens, ['symbol'], ['asc']);
        let LTVRatio = LTVRatioValue <= 60 ? LTVRatioValue : 60
        return (
            <div className="create-loan-container">
                <div className="page-title">

                    <Row>
                        <Col>
                            <Breadcrumb className="float-left">
                                <BreadcrumbItem>
                                    <Link className="link-blue" to="/market">Market</Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem active>New Loan</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>

                    <Row className="mt-4 mb-4">
                        <Col>
                            <h5 className="mb-2"> <div className="round-icon round-icon-lg orange"><img className="mb-1" src={borrowImg} height="20" alt="New Loan"/></div> New Loan</h5>
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
                {sortedTokens.length === 0 && !metaMaskMsg && <LoadingFull />}
                {sortedTokens.length > 0 &&
                    <div>
                        <Row className="row-eq-height">
                            <Col lg={4} md={4} sm={6} xl={4}>
                                <Card className="card-statistics mb-30 h-100 p-2">
                                    <CardBody>
                                        <CardTitle className="card-title-custom">Create New Loan Request </CardTitle>

                                        <Form disabled={disabled} onSubmit={this.createLoanRequest} className="create-loan-form">
                                            <div className="mt-30">
                                                <label>Loan Amount<span className="red">*</span></label>
                                                <TokenSelect
                                                    name="principal"
                                                    onChange={this.handleInputChange}
                                                    defaultValue={principal}
                                                    dropdownFieldName="principalTokenSymbol"
                                                    dropdownFieldDefaultValue={principalTokenSymbol}
                                                    dropdownOpen={principalTokenSymbolDropdownOpen}
                                                    toggleDropDown={this.toggleDropDown}
                                                    tokens={sortedTokens}
                                                    allowedTokens={false}
                                                />
                                                {principal && this.displayValidationErrors('principal')}
                                            </div>
                                            <div className="mt-30 create-loan-slider">
                                                <label>LTV (Loan-to-Value Ratio)</label>
                                                <div className="mb-20">
                                                    <InputRange
                                                        className="mt-20"
                                                        maxValue={60}
                                                        formatLabel={value => `${value} %`}
                                                        minValue={5}
                                                        value={LTVRatio}
                                                        onChange={value => this.handleLTVChange(value)} />
                                                </div>
                                                {LTVRatio && this.displayValidationErrors('LTVRatioValue')}

                                            </div>
                                            <div className="mt-30">
                                                <label>Collateral Amount<span className="red">*</span></label>
                                                <TokenSelect
                                                    name="collateral"
                                                    onChange={this.handleInputChange}
                                                    defaultValue={collateral}
                                                    dropdownFieldName="collateralTokenSymbol"
                                                    dropdownFieldDefaultValue={collateralTokenSymbol}
                                                    dropdownOpen={collateralTokenSymbolDropdownOpen}
                                                    toggleDropDown={this.toggleDropDown}
                                                    tokens={sortedTokens}
                                                    allowedTokens={true}
                                                    disableValue={principalTokenSymbol}
                                                />
                                                {collateral && this.displayValidationErrors('collateral')}
                                                {this.displayValidationErrors('collateralTokenSymbol')}
                                            </div>
                                            <div className="mt-30">
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
                                                {termLength && this.displayValidationErrors('termLength')}
                                            </div>
                                            <div className="mt-30">
                                                <label>Interest Rate (% Per Loan Term)<span className="red">*</span></label>
                                                <InputGroup>
                                                    <Input onChange={this.handleInputChange}
                                                        type="number"
                                                        placeholder="Interest Rate"
                                                        name="interestRate"
                                                        value={interestRate} />
                                                    <InputGroupAddon addonType="append">%</InputGroupAddon>
                                                </InputGroup>
                                                {interestRate && this.displayValidationErrors('interestRate')}
                                            </div>
                                        </Form>

                                    </CardBody>
                                </Card>
                            </Col>

                            <Col lg={4} md={4} sm={6} xl={4} className="pl-4">

                                <Card className="card-statistics mb-30 h-100">
                                    <CardBody className="pb-0">

                                        <div className="p-2 pb-0">

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
                                                        labelValue={LTVRatio > 0 ? LTVRatio + "%" : 'N/A'}
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
                                                    {userLoanAgree && this.displayValidationErrors('userLoanAgree')}
                                                </div>

                                            </div>

                                        </div>
                                    </CardBody>

                                    {!isBottomButtonLoading && msgDisplay === true &&
                                        <TransactionManager
                                            key={txHash}
                                            txHash={txHash}
                                            dharma={dharma}
                                            onSuccess={this.setHasSufficientAllowance}
                                            canAuthorize={
                                                hasSufficientAllowance
                                            }
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
                                            <div className="create-loan-buttons-container text-center">
                                                {
                                                    !isBottomButtonLoading &&
                                                    <AuthorizableAction
                                                        canTakeAction={hasSufficientAllowance && isFormValid}
                                                        canAuthorize={hasSufficientAllowance}
                                                        onAction={this.createLoanRequest}
                                                        onAuthorize={this.authorizeCollateralTransfer}>
                                                        <p>Unlock Tokens</p>
                                                        <p>Submit Application</p>
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
export default CreateLoan;