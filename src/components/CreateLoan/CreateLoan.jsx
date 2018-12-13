import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Breadcrumb, BreadcrumbItem, InputGroup, Input, InputGroupAddon, ListGroup, Form } from 'reactstrap';
import InputRange from 'react-input-range';
import { Dharma } from "@dharmaprotocol/dharma.js";
import _ from "lodash";
import { Link } from 'react-router-dom';
import AuthorizableAction from "../AuthorizableAction/AuthorizableAction";
import LoadingFull from "../LoadingFull/LoadingFull";
import TokenSelect from "./TokenSelect/TokenSelect";
import TimeUnitSelect from "./TimeUnitSelect/TimeUnitSelect";
import SummaryItem from "./SummaryItem/SummaryItem";
import Api from "../../services/api";
import Error from "../Error/Error";
import validators from '../../validators';
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import { niceNumberDisplay, getTransactionReceipt, tooltipNumberDisplay } from "../../utils/Util";
import auth from '../../utils/auth';
import borrowImg from "../../assets/images/borrow.png";
import './CreateLoan.css';
import metamaskConnectionErrorImg from "../../assets/images/metamask_connection_error.png";
import ReactGA from 'react-ga';

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
            isBottomButtonLoading: true,
            unlockTokenButtonLoading: false,
            buttonLoading: false,
            userTokens: [],
            unlockError:false,
            principalNumDecimals:0
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
    componentDidUpdate(prevProps) {
        const { tokens, isTokenLoading } = this.props;
        if (prevProps.isTokenLoading != isTokenLoading) {
            let firstToken = '';
            let principalTokenSymbol = this.state.principalTokenSymbol;
            if (tokens.length > 0) {
                _.every(tokens, function (token) {
                    if (token.balance > 0 && firstToken == '' && token.symbol != principalTokenSymbol) {
                        firstToken = token.symbol;
                        return false;
                    }
                    return true;
                })
            }
            this.setState({
                collateralTokenSymbol: firstToken || this.state.collateralTokenSymbol
            }, () => {
                this.setUserTokens();
            })
        }
    }
    setUserTokens() {
        const { tokens } = this.props;
        let userTokens = []
        if (tokens.length > 0) {
            userTokens = _.filter(tokens, (token) => {
                if (token.balance > 0) {
                    return true
                }
                return false;
            })
            this.setState({
                userTokens
            })
        }
    }
    async componentDidMount() {
        this.setHasSufficientAllowance();
        this.setUserTokens();
        const authToken = auth.getToken()
        const api = new Api();

        const relayer = await api.setToken(authToken).get("relayerAddress").catch((error) => {
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
        const authToken = auth.getToken()
        return new Promise((resolve) => {
            api.setToken(authToken).get("relayerFee", { principalAmount: newPrincipalAmount }).then((response) => {
                resolve(response.fee);
            });
        });
    }

    async createLoanRequest() {

        // GA Tracking
        ReactGA.event({
            category: 'User',
            action: 'loan-request-create'
        });

        const api = new Api();
        let { LTVRatioValue,principalTokenSymbol,principalNumDecimals,collateral,collateralTokenSymbol,termLength,termUnit,interestRate } = this.state;
        const authToken = auth.getToken();
        this.setState({ buttonLoading: true });
        if (this.isFormValid() && LTVRatioValue <= 60) {
            try {
                const { dharma } = this.props;
                const currentAccount = await dharma.blockchain.getCurrentAccount();
                const loanRequest = await this.generateLoanRequest(currentAccount);
                api.setToken(authToken).create("loanRequests", {
                    ...loanRequest.toJSON(),
                    id: loanRequest.getAgreementId(),
                    principalSymbol:principalTokenSymbol,
                    principalNumDecimals:principalNumDecimals,
                    collateralAmount:collateral,
                    collateralSymbol:collateralTokenSymbol,
                    termLengthAmount:termLength,
                    termLengthUnit:termUnit,
                    interestRatePercent:interestRate
                });
                this.setState({ buttonLoading: false });
                this.props.onCompletion(loanRequest.getAgreementId());
            } catch (e) {
                let error = new Error(e);
                error = error.props.message.split(".")

                this.setState({
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                    customAlertMsgTitle: error[0],
                    buttonLoading: false
                });
            }
        }
        else {
            this.setState({
                customAlertMsgDisplay: true,
                customAlertMsgStyle: 'danger',
                customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                customAlertMsgTitle: (LTVRatioValue > 60) ? "LTV ratio can not be greater then 60." : "Please complete required fields",
                buttonLoading: false
            });
        }
    }

    async setHasSufficientAllowance(tokenSymbol, status) {
        const { dharma } = this.props;
        const { collateralTokenSymbol, collateralAmount } = this.state;
        const symbol = tokenSymbol ? tokenSymbol : collateralTokenSymbol;
        const isCompleted = status && status == "success" ? true : false;
        const { Token } = Dharma.Types;
        this.setState({ customAlertMsgDisplay: false });
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        let stateObj = {};
        /*const tokens = new Tokens(dharma, currentAccount);*/
        /*const tokenData = await tokens.getTokenDataForSymbol(symbol);*/
        stateObj["hasSufficientAllowance"] = false;
        stateObj["isBottomButtonLoading"] = false;
        if (typeof currentAccount != "undefined") {
            const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);
            let hasSufficientAllowance =
                tokenData.hasUnlimitedAllowance || tokenData.allowance >= collateralAmount || isCompleted;
            stateObj["hasSufficientAllowance"] = hasSufficientAllowance;
            if (tokenData.hasUnlimitedAllowance) {
                stateObj["customAlertMsgDisplay"] = true;
                stateObj["customAlertMsgStyle"] = 'success';
                stateObj["customAlertMsgClassname"] = 'fa fa-check fa-2x pull-left mr-2';
                stateObj["customAlertMsgTitle"] = 'Token Authorised.';
            }
            stateObj["collateralCurrentBalance"] = tokenData.balance;
        }
        this.setState(stateObj);
    }

    async authorizeCollateralTransfer() {
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const { collateralTokenSymbol } = this.state;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        this.setState({ unlockTokenButtonLoading: true, customAlertMsgDisplay: false });
        if (typeof currentAccount != 'undefined') {
            try {
                const txHash = await Token.makeAllowanceUnlimitedIfNecessary(
                    dharma,
                    collateralTokenSymbol,
                    currentAccount,
                );

                this.setState({
                    txHash,
                    unlockError:false,
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'warning',
                    customAlertMsgClassname: 'fa fa-info fa-2x pull-left mr-2',
                    customAlertMsgTitle: 'Mining transaction'
                });

                let response = await getTransactionReceipt(txHash);
                if (!_.isUndefined(response)) {
                    this.props.refreshTokens(false);
                    this.setState({
                        txHash,
                        unlockError:false,
                        unlockTokenButtonLoading: false,
                        hasSufficientAllowance: true,
                        customAlertMsgDisplay: true,
                        customAlertMsgStyle: 'success',
                        customAlertMsgClassname: 'fa fa-check fa-2x pull-left mr-2',
                        customAlertMsgTitle: 'Token Authorised.'
                    });
                }
            }
            catch (e) {
                let error = new Error(e);
                this.setState({
                    unlockError:true,
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2',
                    customAlertMsgTitle: error.props.message,
                    unlockTokenButtonLoading: false
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
            [field]: !this.state[field]/*,
            customAlertMsgDisplay:false*/
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
        if (interestRate >= 0) {
            interestAmount = (interestRate == 0) ? 0 : (principal * interestRate) / 100;
            totalReapaymentAmount = parseFloat(principal) + parseFloat(interestAmount);
            stateObj["interestAmount"] = interestAmount;
            stateObj["totalReapaymentAmount"] = totalReapaymentAmount;
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
        
        if (name === "principalTokenSymbol") {
            const decimals = target.dataset.decimals;
            this.setState({
                principalNumDecimals: decimals
            });
        }
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
        const { collateralCurrentBalance, hasSufficientAllowance, principalTokenSymbol, collateralTokenSymbol, userTokens } = this.state;
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
            this.validators[fieldName].errors.push("You do not have sufficient collateral balance in wallet.");
            this.validators[fieldName].valid = false;
        }

        if (fieldName == "collateralTokenSymbol" && principalTokenSymbol == collateralTokenSymbol) {
            this.validators[fieldName].errors.push("Please choose another token.");
            this.validators[fieldName].valid = false;
        }



        if (fieldName == "collateralTokenSymbol" && userTokens.length == 0) {
            this.validators[fieldName].errors.push("Please add tokens to your wallet to use as collateral");
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

    roundToThree(num) {    
        return +(Math.round(num + "e+3")  + "e-3");
    }

    async countLtv(name) {
        const {
            principal,
            collateral,
            LTVRatioValue
        } = this.state;
        let principalTokenSymbol = this.state.principalTokenSymbol;
        let collateralTokenSymbol = this.state.collateralTokenSymbol;
        const api = new Api();
        const authToken = auth.getToken();
        api.setToken(authToken)
            .get(`priceFeed`)
            .then(async priceFeedData => {
                principalTokenSymbol = (principalTokenSymbol == "WETH" && _.isUndefined(priceFeedData[principalTokenSymbol])) ? "ETH" : principalTokenSymbol;
                collateralTokenSymbol = (collateralTokenSymbol == "WETH" && _.isUndefined(priceFeedData[collateralTokenSymbol])) ? "ETH" : collateralTokenSymbol;

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
                        collateralPurchasable = (collateralPurchasable > 0) ? this.roundToThree(collateralPurchasable) : 0;
                        this.setState({ collateral: collateralPurchasable });
                    }
                    if (name == "collateral" && principal > 0 && collateral > 0) {
                        let collateralMarketValue = parseFloat(collateral) * parseFloat(collateralTokenCurrentPrice);
                        let newLTVRatio = (pricinipalMarketValue / collateralMarketValue) * 100;
                        this.setState({ LTVRatioValue: newLTVRatio });
                    }
                }
            });
    }

    render() {
        const { tokens } = this.props;
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
            isBottomButtonLoading,
            userLoanAgree,
            unlockTokenButtonLoading,
            buttonLoading,
            unlockError
        } = this.state;
        const { wrongMetamaskNetwork, isMetaMaskAuthRised } = this.props;
        const isFormValid = this.isFormValid();
        let sortedTokens = _.orderBy(tokens, ['symbol'], ['asc']);
        let LTVRatio = LTVRatioValue <= 60 ? LTVRatioValue : 60
        let extraTitle = '';
        if (txHash != '' && txHash != null) {
            extraTitle = (<span className="transaction-detail-link"><a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" > Transaction Details</a></span>);
        }
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
                            <h5 className="mb-2"> <div className="round-icon round-icon-lg orange"><img className="mb-1" src={borrowImg} height="20" alt="New Loan" /></div> New Loan</h5>
                        </Col>
                    </Row>
                </div>

                {isMetaMaskAuthRised && wrongMetamaskNetwork == false &&
                    <div>
                        {sortedTokens.length === 0 && <LoadingFull />}
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
                                                                formatLabel={value => `${niceNumberDisplay(value, 2)} %`}
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
                                                    <div>
                                                        <ListGroup className="list-unstyled to-do">
                                                            <SummaryItem
                                                                labelName="Loan Amount"
                                                                labelValue={principal > 0 ? niceNumberDisplay(principal) + ' ' + principalTokenSymbol : '-'}
                                                                tooltipValue={tooltipNumberDisplay(principal, principalTokenSymbol)}
                                                            />
                                                            <SummaryItem
                                                                labelName="Collateral Amount"
                                                                labelValue={collateral > 0 ? niceNumberDisplay(collateral) + ' ' + collateralTokenSymbol : '-'}
                                                                tooltipValue={tooltipNumberDisplay(collateral, collateralTokenSymbol)}
                                                            />
                                                            <SummaryItem
                                                                labelName="LTV"
                                                                labelValue={LTVRatio > 0 ? niceNumberDisplay(LTVRatio, 2) + "%" : '-'}
                                                                tooltipValue={tooltipNumberDisplay(LTVRatio, "%")}
                                                            />
                                                            <SummaryItem
                                                                labelName="Loan Term"
                                                                labelValue={termLength > 0 ? termLength + " " + termUnit : '-'}
                                                            />
                                                            <SummaryItem
                                                                labelName="Interest Rate(Per Loan Term)"
                                                                labelValue={interestRate > 0 ? niceNumberDisplay(interestRate, 2) + "%" : '-'}
                                                                tooltipValue={tooltipNumberDisplay(interestRate, "%")}
                                                            />
                                                            {/*<SummaryItem 
                                                            labelName = "Expiration"
                                                            labelValue = { expirationLength + " " + expirationUnit }
                                                        />*/}
                                                            <SummaryItem
                                                                labelName="Interest Amount"
                                                                labelValue={interestAmount > 0 ? niceNumberDisplay(interestAmount) + ' ' + principalTokenSymbol : '-'}
                                                                tooltipValue={tooltipNumberDisplay(interestAmount, principalTokenSymbol)}
                                                            />
                                                            <SummaryItem
                                                                labelName="Total Repayment Amount"
                                                                labelValue={totalReapaymentAmount > 0 ? niceNumberDisplay(totalReapaymentAmount) + ' ' + principalTokenSymbol : '-'}
                                                                tooltipValue={tooltipNumberDisplay(totalReapaymentAmount, principalTokenSymbol)}
                                                            />
                                                            {/*<SummaryItem 
                                                            labelName = "Relayer Fee"
                                                            labelValue = {relayerFeeAmount > 0 ? relayerFeeAmount + ' ' + principalTokenSymbol : '-'}
                                                        />*/}
                                                        </ListGroup>

                                                        <hr />

                                                        <div className="agree-loan-check pt-1 mtb-2">
                                                            <label className="checkbox-container"> <span>I agree to the <a href="/terms" target="_blank" className="link-blue">Terms & Conditions</a></span>
                                                                <input type="checkbox" id="loanAgreement" name="loanAgreement" value="y" onChange={this.handleAgreeChange} />
                                                                <span className="checkmark"></span>
                                                            </label>
                                                            {userLoanAgree && this.displayValidationErrors('userLoanAgree')}
                                                        </div>

                                                    </div>

                                                </div>
                                            </CardBody>

                                            {customAlertMsgDisplay === true &&
                                                <CustomAlertMsg
                                                    bsStyle={customAlertMsgStyle}
                                                    className={customAlertMsgClassname}
                                                    title={[customAlertMsgTitle, ' ', extraTitle]}
                                                />
                                            }

                                            <CardBody className="pl-4 pt-1 mtb-2 mt-10">
                                                <div>
                                                    <div className="create-loan-buttons-container text-center">
                                                        {
                                                            !isBottomButtonLoading &&
                                                            <AuthorizableAction
                                                                canTakeAction={hasSufficientAllowance && isFormValid && !unlockError}
                                                                canAuthorize={hasSufficientAllowance}
                                                                onAction={this.createLoanRequest}
                                                                onAuthorize={this.authorizeCollateralTransfer}
                                                                buttonLoading={buttonLoading}
                                                                unlockTokenButtonLoading={unlockTokenButtonLoading}>
                                                                <p>Unlock Tokens {unlockTokenButtonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}</p>
                                                                <p>Submit Application {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}</p>
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
                }

                {(wrongMetamaskNetwork == true || !isMetaMaskAuthRised) &&
                    <div>
                        <Row className="mb-30">
                            <Col md={3}></Col>
                            <Col md={6}>
                                <img src={metamaskConnectionErrorImg} className="img-fluid" alt="Metamask Error" />
                            </Col>
                            <Col md={3}></Col>
                        </Row>
                    </div>
                }

            </div>
        );
    }
}
export default CreateLoan;