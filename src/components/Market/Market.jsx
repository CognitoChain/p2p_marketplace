import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import * as moment from "moment";
import _ from 'lodash';
import Api from "../../services/api";
import LoanRequests from "./LoanRequests/LoanRequests";
import FundedLoans from "./FundedLoans/FundedLoans";
import './Market.css';
import MetamaskError from "../General/MetaMaskError";
import { convertBigNumber } from "../../utils/Util";
import auth from '../../utils/auth';
import PageErrorMessage from "../General/Pageerror";
class Market extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loanRequests: [],
            fundedLoansLists:[],
            isLoanRequestLoading:true,
            isMetaMaskAuthRised:this.props.isMetaMaskAuthRised,
            isFundedRequestLoading:true,
            isMounted:true,
            pageErrorMessageDisplay:false,
            pageErrorMessageCode:'' 
        };
        this.redirect = this.redirect.bind(this);
        this.parseQueryParams = this.parseQueryParams.bind(this);
    }

    redirect(location) {
        this.props.history.push(location);
    }


    componentDidMount() {
        this.getLoanRequests();
    }
    
    componentDidUpdate(prevProps){
        if(prevProps.reloadDetails != this.props.reloadDetails && this.props.reloadDetails == true){
            this.setState({
              isMetaMaskAuthRised: this.props.isMetaMaskAuthRised
            }, () => {
              this.getLoanRequests();
            });
          }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.isMounted;
    }

    componentWillUnmount(){
        this.setState({
          isMounted: false                
        });
    }

    parseLoanRequests(loanRequests,authToken){
        let response = '';
        if(!_.isUndefined(loanRequests))
        {
            const { isMetaMaskAuthRised } = this.state;
            const { currentMetamaskAccount } = this.props;
            let response = loanRequests.map((request) => {
                request.principalNumDecimals = !_.isNull(request.principalNumDecimals)?request.principalNumDecimals:0;
                request.collateralNumDecimals = !_.isNull(request.collateralNumDecimals)?request.collateralNumDecimals:0;
                request.principalAmount = !_.isNull(request.principalAmount)?convertBigNumber(request.principalAmount,request.principalNumDecimals):0;
                request.principalSymbol = !_.isNull(request.principalSymbol)?request.principalSymbol:" - ";
                request.collateralAmount = !_.isNull(request.collateralAmount)?request.collateralAmount:0;
                request.collateralSymbol = !_.isNull(request.collateralSymbol)?request.collateralSymbol:" - ";
                request.termLengthAmount = !_.isNull(request.termLengthAmount)?request.termLengthAmount:0;
                request.termLengthUnit = !_.isNull(request.termLengthUnit)?request.termLengthUnit:" - ";
                request.interestRatePercent = !_.isNull(request.interestRatePercent)?request.interestRatePercent:0;
                return {
                    ...request,
                    principal: `${request.principalAmount} ${request.principalSymbol}`,
                    collateral: `${request.collateralAmount} ${request.collateralSymbol}`,
                    debtorEthAddress: request.debtor,
                    term: `${request.termLengthAmount} ${request.termLengthUnit}`,
                    expiration: moment.unix(request.expiresAt).fromNow(),
                    requestedDate: moment(request.createdAt).calendar(),
                    authToken: authToken,
                    isMetaMaskAuthRised:isMetaMaskAuthRised,
                    currentMetamaskAccount:currentMetamaskAccount
                };
            });    
            return response;
        }
        else{
            return response;
        }
    }

    parseFundedRequests(fundedLoansLists,authToken){
        let response = '';
        if(!_.isUndefined(fundedLoansLists)){
            const { isMetaMaskAuthRised } = this.state;
            const { currentMetamaskAccount } = this.props;
            response = fundedLoansLists.map((investment) => {
                investment.principalNumDecimals = !_.isNull(investment.principalNumDecimals)?investment.principalNumDecimals:0;
                investment.collateralNumDecimals = !_.isNull(investment.collateralNumDecimals)?investment.collateralNumDecimals:0;
                investment.principalAmount = !_.isNull(investment.principalAmount)?convertBigNumber(investment.principalAmount,investment.principalNumDecimals):0;
                investment.principalSymbol = !_.isNull(investment.principalSymbol)?investment.principalSymbol:" - ";
                investment.collateralAmount = !_.isNull(investment.collateralAmount)?investment.collateralAmount:0;
                investment.collateralSymbol = !_.isNull(investment.collateralSymbol)?investment.collateralSymbol:" - ";
                investment.termLengthAmount = !_.isNull(investment.termLengthAmount)?investment.termLengthAmount:0;
                investment.termLengthUnit = !_.isNull(investment.termLengthUnit)?investment.termLengthUnit:" - ";
                investment.interestRatePercent = !_.isNull(investment.interestRatePercent)?investment.interestRatePercent:0;
                return {
                    ...investment,
                    principal: `${investment.principalAmount} ${investment.principalSymbol}`,
                    collateral: `${investment.collateralAmount} ${investment.collateralSymbol}`,
                    debtorEthAddress: investment.debtor,
                    term: `${investment.termLengthAmount} ${investment.termLengthUnit}`,
                    expiration: moment.unix(investment.expiresAt).fromNow(),
                    requestedDate: moment(investment.createdAt).calendar(),
                    authToken: authToken,
                    isMetaMaskAuthRised:isMetaMaskAuthRised,
                    currentMetamaskAccount:currentMetamaskAccount,
                    repaidAmount: `${investment.repaidAmount} ${investment.principalSymbol}`,
                    totalExpectedRepaymentAmount: `${investment.totalExpectedRepaymentAmount} ${investment.principalSymbol}`
                };
            });    
            return response;
        }
        else{
            return response;
        }
    }

    async getLoanRequests() {
        const { highlightRow } = this.props;
        const { isLoanRequestLoading } = this.state;
        this.setState({
            highlightRow,
        });
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";

        if(!isLoanRequestLoading)
        {
            this.setState({ isLoanRequestLoading: true });
        }

        const authToken = auth.getToken();
        api.setToken(authToken).get("loanRequests", { sort, order })
            .then(async (loanRequestData) => {

                /* Open loan request */
                var loanRequests = _.filter(loanRequestData, { 'status': "OPEN" });
                loanRequests = await this.parseLoanRequests(loanRequests,authToken);
                this.setState({ loanRequests, isLoanRequestLoading: false })
                /* Open loan request ends*/

                /* Recent funded loan request */
                var fundedLoansLists = _.filter(loanRequestData, { 'status': "FILLED" });
                fundedLoansLists = this.parseFundedRequests(fundedLoansLists,authToken);
                this.setState({ fundedLoansLists, isFundedRequestLoading: false })
                /* Recent funded loan request */
            })
            .catch((error) => {
                if (error) {
                    if(error.status === 403)
                    {
                        this.props.redirect(`/login/`);    
                    }
                    else
                    {
                        this.setState({
                            pageErrorMessageDisplay: true,
                            pageErrorMessageCode:error.status
                        });
                    }
                }
            });
    }

    /**
     * Returns the id of the LoanRequest that should be highlighted.
     *
     * @returns {number||null}
     */
    parseQueryParams() {
        /*const search = this.props.location.search;*/
        const search = '';
        const params = new URLSearchParams(search);
        const rowToHighlight = params.get("highlightRow");

        if (rowToHighlight) {
            return parseInt(rowToHighlight, 10);
        } else {
            return null;
        }
    }
    render() {
        const highlightRow = this.parseQueryParams();
        const { wrongMetamaskNetwork } = this.props;
        const {loanRequests,isLoanRequestLoading,fundedLoansLists,isFundedRequestLoading,pageErrorMessageDisplay,pageErrorMessageCode} = this.state;
        return (
            <div className="content-with-market-bg">
                <div className="market-bg-image d-none d-sm-block">
                    <div className="image" style={{ backgroundImage: "url('assets/images/loans.jpg')" }}></div>
                    <div className="bg-overlay"></div>
                    <div className="market-bg-content">
                        <h5>Digital assets backed loans got much easier. Here is how</h5>
                        <div className="row mt-30 how-it-works">
                            <div className="col-md-3 col-sm-3 col-xs-12 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 1</h5>
                                    <p className="title-text">Login to Loanbase</p>
                                    <h6>Create Loan Request</h6>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-3 col-xs-12 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 2</h5>
                                    <p className="title-text">Authorize Smart Contract</p>
                                    <h6>Unlock Collateral</h6>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-3 col-xs-12 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 3</h5>
                                    <p className="title-text">Publish in Loanbase Marketplace</p>
                                    <h6>Get Funded</h6>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-3 col-xs-12 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 4</h5>
                                    <p className="title-text">Repay Loan</p>
                                    <h6>Get Collateral back in full</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-title">
                    <Row>
                        <Col sm={6} xs={6}>
                            <h4 className="mb-0"> Market</h4>
                            <div className='delete-button' onClick={(item) => { if (window.confirm('Are you sure you wish to delete this item?')) this.onCancel(item) }} />
                        </Col>
                        <Col sm={6} xs={6} className="pull-right text-right">
                            <Link to="/create"><span className="btn cognito orange small icon mb-15 btn-market-borrow"><img src="assets/images/borrow.png" height="20" alt="Borrow" /> Borrow</span></Link>
                        </Col>
                    </Row>
                </div>

                {
                    pageErrorMessageDisplay && (
                        <PageErrorMessage pageErrorMessageCode={pageErrorMessageCode} smallsize={true} />
                    )
                }

                {!wrongMetamaskNetwork && !pageErrorMessageDisplay &&
                    <Row className="open-request-table">

                        <Col md={12} className="mb-30">
                            <Card className="card-statistics h-100 p-3">
                                <CardBody>
                                    <div className="d-block d-md-flex justify-content-between" style={{ position: "relative" }}>
                                        <div className="d-block w-100">
                                            <CardTitle>Open Requests</CardTitle>
                                        </div>
                                    </div>
                                    <LoanRequests
                                        redirect={this.redirect}
                                        highlightRow={highlightRow}
                                        loanRequests={loanRequests} 
                                        isLoanRequestLoading={isLoanRequestLoading}
                                        {...this.props}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                }
                {!wrongMetamaskNetwork && !pageErrorMessageDisplay &&
                    <Row className="recent-funded-loans-table">
                        <Col md={12} className="mb-30">
                            <Card className="card-statistics h-100 p-3">
                                <CardBody>
                                    <CardTitle>Recent Funded Loans</CardTitle>
                                    <FundedLoans
                                        redirect={this.redirect}
                                        fundedLoansLists={fundedLoansLists} 
                                        isFundedRequestLoading={isFundedRequestLoading}
                                        {...this.props}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                }
                <MetamaskError wrongMetamaskNetwork={wrongMetamaskNetwork} isMetaMaskAuthRised={true} />

            </div>

        );
    }
}
export default Market;