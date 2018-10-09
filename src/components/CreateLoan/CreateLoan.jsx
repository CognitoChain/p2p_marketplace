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
import validators from '../../validators';

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
            LTVRatioValue: 5,
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
            total_reapayment_amount:0,
            token_authorised:false,
            user_loan_agree:false,
            collateralCurrentBalance:0
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
        const {user_loan_agree,principal,collateral,collateralCurrentBalance} = this.state;
        const form_valid = this.isFormValid();
        if(user_loan_agree === true && principal > 0 && collateral > 0 && collateral < collateralCurrentBalance && collateralCurrentBalance > 0)
        {
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
                console.error(e);
                this.setState({ error: e.message });
            }
        }
        else{
            let msg = (principal == 0) ? 'Pricipal amount must be greater then zero.' : ((collateral == 0) ? 'Collateral amount must be greater then zero.' : ((collateral > collateralCurrentBalance) ? 'You does not have sufficient collateral balance in wallet.' : 'Please accept loan agreement terms.'));
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
        
        if(typeof currentAccount != "undefined")
        {
            const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);
            const hasSufficientAllowance =
            tokenData.hasUnlimitedAllowance || tokenData.allowance >= collateralAmount;
            this.setState({
                hasSufficientAllowance,
                collateralCurrentBalance:tokenData.balance
            });

            if(tokenData.hasUnlimitedAllowance === true)
            {
                this.setState({
                    token_authorised:true,
                });
            }
            else
            {
                this.setState({
                    token_authorised:false,
                });
            }
        }
        else
        {
            toast.error("Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured and reload the page.", {
                     autoClose: 8000
            });
        }
    }

    async authorizeCollateralTransfer() {
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
                token_authorised:true
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
                handleInputChange: null,
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
        if(name == "principal" || name == "collateral" || name == "termLength" || name == "interestRate")
        {
            this.updateValidators(name, value);    
        }
    }

    handleAgreeChange(event){
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if(value == 'y')
        {
            this.setState({
                user_loan_agree:true
            });
        }
        else
        {
            this.setState({
                user_loan_agree:false
            });
        }

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
          if(field == "principal" || field == "collateral" || field == "termLength" || field == "interestRate"){
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
          return <span className="error" key={index}>* {info}<br/></span>
        });
  
        return (
          <div className="col s12 row">
            {errors}
          </div>  
        );
      }
      return result;
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
            total_reapayment_amount,
            token_authorised
        } = this.state;

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
                            <h5 className="mb-0"> <div className="round-icon round-icon-lg orange"><img className="mb-1" src="borrow.png" height="20" /></div> New Loan</h5>
                        </Col>
                    </Row>
                </div>

                <div>
                    <Row className="row-eq-height">
                        <Col lg={4} md={4} sm={6} xl={4}>
                            <Card className="card-statistics mb-30 h-100 p-4">
                                <CardBody>
                                    <CardTitle className="card-title-custom">Create New Loan Request </CardTitle>

                                    {txHash && (
                                        <TransactionManager
                                            key={txHash}
                                            txHash={txHash}
                                            dharma={dharma}
                                            description="Authorize Collateral Transfer"
                                            onSuccess={this.setHasSufficientAllowance}
                                        />
                                    )}

                                    <Form disabled={disabled} onSubmit={this.createLoanRequest} className="create-loan-form">
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
                                            { this.displayValidationErrors('principal') }
                                        </div>
                                        <div className="mt-20 create-loan-slider">
                                            <label>LTV (Loan-to-Value Ratio)</label>
                                            <InputRange
                                                lassName="mt-20"
                                                maxValue={60}
                                                formatLabel={value => `${value} %`}
                                                minValue={5}
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
                                            { this.displayValidationErrors('collateral') }
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
                                            { this.displayValidationErrors('termLength') }
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
                                            { this.displayValidationErrors('interestRate') }
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
                                                    labelValue = { interestRate > 0 ? interestRate + "%"  : 'N/A' }
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

                                            <div className="agree-loan-check pt-1 mtb-2">
                                                <label className="checkbox-container"> I have read and agreed to the <a href="/loan-agreement" target="_blank" className="link-blue">Loan Agreement</a>
                                                  <input type="checkbox" id="loanAgreement" name="loanAgreement" value="y" onChange={this.handleAgreeChange} />
                                                  <span className="checkmark"></span>                   
                                                </label>
                                            </div>

                                        </div>

                                    </div>
                                </CardBody>

                                    <div className="mt-10">
                                        {token_authorised === true &&
                                            <div className="tokens-authorized-container pl-4 pr-4 token-authorised-text pt-3 pb-3">
                                                <i className="fa fa-check"></i> 
                                                <span className="token-authorise-text pl-2">Tokens Authorized.</span>
                                            </div>  
                                        }
                                    </div>
                                    
                                    <CardBody className="pl-4 pt-1 mtb-2 mt-10">
                                        <div>
                                            <div>
                                                {error && <Error title="Unable to create loan request">{error}</Error>}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="create-loan-buttons-container">
                                                <AuthorizableAction
                                                    canTakeAction={hasSufficientAllowance}
                                                    canAuthorize={
                                                        hasSufficientAllowance !== null && !hasSufficientAllowance
                                                    }
                                                    onAction={this.createLoanRequest}
                                                    onAuthorize={this.authorizeCollateralTransfer}
                                                    tokenAuthorised={token_authorised}
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
            </div>
        );
    }
}
export default CreateLoan;