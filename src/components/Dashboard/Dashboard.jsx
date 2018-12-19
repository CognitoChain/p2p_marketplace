import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import { Card, CardBody, CardTitle, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import _ from 'lodash';
import MyBorrowedLoans from "./MyBorrowedLoans/MyBorrowedLoans";
import MyFundedLoans from "./MyFundedLoans/MyFundedLoans";
import MyPortfolio from "./MyPortfolio/MyPortfolio";
import MyActivities from "./MyActivities/MyActivities";
import MyLoanRequests from "./MyLoanRequests/MyLoanRequests";
import Api from "../../services/api";
import { convertBigNumber } from "../../utils/Util";
import auth from '../../utils/auth';
// import priceFeedData from '../../priceFeed.json';

import './Dashboard.css';
import metamaskConnectionErrorImg from "../../assets/images/metamask_connection_error.png";
import PageErrorMessage from "../General/Pageerror";

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.tabsclick = this.tabsclick.bind(this);
        this.state = {
            activeTab: '1',
            widths: 80,
            priceFeedData: [],
            myBorrowedRequests: [],
            myFundedRequests: [],
            myLoanRequests: [],
            myEthBalance:0,
            myEthBalanceLoading:true,
            tokenlist: this.props.tokens,
            myBorrowedLoading: true,
            myFundedLoading: true,
            myLoansLoading: true,
            cancelLoanButtonLoading: false,
            myBorrowRequestProcessed:false,
            myFundedRequestProcessed:false,
            isMetaMaskAuthRised: this.props.isMetaMaskAuthRised,
            isMounted:true,
            borrowedLoanPageErrorDisplay:false,
            borrowedLoanPageErrorCode:'',
            fundedLoanPageErrorDisplay:false,
            fundedLoanPageErrorCode:'',
            openLoanPageErrorDisplay:false,
            openLoanPageErrorCode:''  
        };
        this.parseMyLoanRequests = this.parseMyLoanRequests.bind(this);
        this.parseLoanRequest = this.parseLoanRequest.bind(this);
        this.updateMyBorrowRequestProcessed = this.updateMyBorrowRequestProcessed.bind(this);
    }
    componentDidMount() {
        const { isMetaMaskAuthRised } = this.props;
        if(isMetaMaskAuthRised)
        {
            this.setPriceFeedData();
            this.getBorrowedLoanRequests();
            this.getFundedLoanRequests();
            this.getMyLoanRequests();
            this.getETHbalance()
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextState.isMounted;
    }
    componentWillUnmount() {
        this.setState({
            isMounted: false
        });
    }
    componentDidUpdate(prevProps){
        if(prevProps.reloadDetails != this.props.reloadDetails && this.props.reloadDetails == true){
            this.setState({
              isMetaMaskAuthRised: this.props.isMetaMaskAuthRised
            }, () => {
              this.setPriceFeedData();
              this.getBorrowedLoanRequests();
              this.getFundedLoanRequests();
              this.getMyLoanRequests();
              this.getETHbalance()
            });
          }
    }
    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.tokens != this.state.tokenlist) {
    //         this.setState({ tokenlist: nextProps.tokens })
    //     }
        
    //     if (nextProps.reloadDetails === true) {
    //       this.props.updateReloadDetails();
    //       this.setState({
    //         isMetaMaskAuthRised: nextProps.isMetaMaskAuthRised
    //       }, () => {
    //         this.setPriceFeedData();
    //         this.getBorrowedLoanRequests();
    //         this.getFundedLoanRequests();
    //         this.getETHbalance()
    //       });
    //     }
    // }
    async getETHbalance(){
        
        let myEthBalance = 0;
        const { myEthBalanceLoading } = this.state;
        const { currentMetamaskAccount,isMetaMaskAuthRised } = this.props;
        if(!isMetaMaskAuthRised){
            return;
        }
        if(!myEthBalanceLoading){
            this.setState({ myEthBalanceLoading: true,myEthBalance:0 });
        }
        await window.web3.eth.getBalance(currentMetamaskAccount, (err, balance) => {
            let ethBalance = window.web3.fromWei(balance, "ether");
            myEthBalance = (ethBalance > 0) ? parseFloat(ethBalance) : 0;
            this.setState({
                myEthBalance,
                myEthBalanceLoading: false
            });
        });
    }
    updateMyBorrowRequestProcessed(stateName = '',flag = false){
        /*myFundedRequestProcessed*/
        this.setState({ [stateName]: flag });
    }
    async getBorrowedLoanRequests() {
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        const { myBorrowedLoading } = this.state;

        if(!myBorrowedLoading){
            this.setState({ myBorrowedLoading: true,myBorrowedRequests:[] });
        }
        const authToken =  auth.getToken();

        api.setToken(authToken).get("user/loans", { sort, order })
            .then(myBorrowedRequests => {
                this.setState({ myBorrowedRequests, myBorrowedLoading: false });
            })
            .catch((error) => {
                if (error) {
                    this.setState({
                        borrowedLoanPageErrorDisplay: true,
                        borrowedLoanPageErrorCode:error.status,
                        myBorrowedLoading:false
                    });
                }
            });
    }

    async getFundedLoanRequests() {
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        const { myFundedLoading } = this.state;

        if(!myFundedLoading){
            this.setState({ myFundedLoading: true,myFundedRequests:[] });
        }
        const authToken =  auth.getToken();

        api.setToken(authToken).get("user/investments", { sort, order })
            .then(myFundedRequests => {
                this.setState({ myFundedRequests, myFundedLoading: false });
            })
            .catch((error) => {
                if (error) {
                    this.setState({
                        fundedLoanPageErrorDisplay: true,
                        fundedLoanPageErrorCode:error.status,
                        myFundedLoading:false
                    });
                }
            });
    }

    async getMyLoanRequests() {
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        
        const authToken =  auth.getToken();
        api.setToken(authToken).get("user/loanRequests", { sort, order })
            .then(this.parseMyLoanRequests)
            .then(myLoanRequests => {
                this.setState({ myLoanRequests, myLoansLoading: false });
            })
            .catch((error) => {
                if (error) {
                    this.setState({
                        openLoanPageErrorDisplay: true,
                        openLoanPageErrorCode:error.status
                    });
                }
            });
    }

    parseMyLoanRequests(loanRequestData) {
        var filteredRequestData =  loanRequestData.filter(function(loan) {
            return (loan.status == "OPEN" || loan.status == "DELETED");
        });
        return Promise.all(filteredRequestData.map(this.parseLoanRequest));
    }

    parseLoanRequest(datum) {
        const { dharma } = this.props;
        const { LoanRequest } = Dharma.Types;
        return new Promise((resolve) => {
            LoanRequest.load(dharma, datum).then((loanRequest) => {
                resolve({
                    ...loanRequest.getTerms(),
                    id: datum.id,
                    requestedAt: datum.createdAt,
                    loanStatus: datum.status,
                    debtor:datum.debtor,
                    creditor:datum.creditor
                });
            });
        });
    }

    tabsclick(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    getBorrowedData() {
        const { myBorrowedRequests } = this.state;
        if (!myBorrowedRequests) {
            return null;
        }

        return myBorrowedRequests.map((request) => {
            let princiaplAmount = convertBigNumber(request.principalAmount, request.principalNumDecimals);
            let collateralAmount = convertBigNumber(request.collateralAmount, request.collateralNumDecimals);
            let repaymentAmount = convertBigNumber(request.totalExpectedRepayment, request.principalNumDecimals);
            let repaidAmount = convertBigNumber(request.repaidAmount, request.principalNumDecimals);

            return {
                ...request,
                principal: `${princiaplAmount}`,
                collateral: `${collateralAmount}`,
                requestedDate: moment(request.createdDate).calendar(),
                repaymentAmount: `${repaymentAmount}`,
                repaidAmount: `${repaidAmount}`
            };
        });
    }

    getMyFundedData() {
        const { myFundedRequests } = this.state;

        if (!myFundedRequests) {
            return null;
        }

        return myFundedRequests.map((investment) => {
            let princiaplAmount = convertBigNumber(investment.principalAmount, investment.principalNumDecimals);
            let collateralAmount = convertBigNumber(investment.collateralAmount, investment.collateralNumDecimals);
            let repaymentAmount = convertBigNumber(investment.totalExpectedRepayment, investment.principalNumDecimals);
            let repaidAmount = convertBigNumber(investment.repaidAmount, investment.principalNumDecimals);

            return {
                ...investment,
                principal: `${princiaplAmount}`,
                collateral: `${collateralAmount}`,
                term: `${investment.termLengthAmount}`,
                repaidAmount: `${repaidAmount}`,
                totalExpectedRepaymentAmount: `${repaymentAmount}`,
            };
        });
    }

    getMyLoansData() {
        const { myLoanRequests } = this.state;

        if (!myLoanRequests) {
            return null;
        }
        return myLoanRequests.map((request) => {
            return {
                ...request,
                principal: `${request.principalAmount} ${request.principalTokenSymbol}`,
                collateral: `${request.collateralAmount} ${request.collateralTokenSymbol}`,
                term: `${request.termDuration} ${request.termUnit}`,
                expiration: moment.unix(request.expiresAt).fromNow(),
                requestedDate: moment(request.requestedAt).calendar()
            };
        });
    }



    setPriceFeedData() {
        const { isMetaMaskAuthRised } = this.state;
        const authToken =  auth.getToken();
        if (isMetaMaskAuthRised) {
            const api = new Api();
            api.setToken(authToken)
                .get(`priceFeed`)
                .then(async priceFeedData => {
                    this.setState({ priceFeedData: priceFeedData });
                });
            //this.setState({ priceFeedData: priceFeedData });
        }
    }

    cancelLoanRequest(row){
       let agreementId = row.id;
       let debtorEthAddress = row.debtor;
        let { myLoanRequests, isMetaMaskAuthRised } = this.state;
        const { currentMetamaskAccount} = this.props;
        const authToken =  auth.getToken();

        if(isMetaMaskAuthRised && !_.isUndefined(agreementId) && debtorEthAddress == currentMetamaskAccount)
        {
            this.setState({ cancelLoanButtonLoading: true })
            const api = new Api();
            api.setToken(authToken)
            .delete('loanRequests',agreementId)
            .then(async cancelResponse => {
                if(cancelResponse.status == "SUCCESS")
                {
                    var loanKey = _.findKey(myLoanRequests, ["id", agreementId]);
                    myLoanRequests[loanKey].loanStatus = 'DELETED';
                    this.setState({ myLoanRequests,cancelLoanButtonLoading: false },()=>{
                        toast.success("You have successfully cancelled loan request.");
                    });
                }
            });
        }
    }

    render() {
        const myBorrowedRequests = this.getBorrowedData();
        const myFundedRequests = this.getMyFundedData();
        const myLoanRequests = this.getMyLoansData();
        const { isMetaMaskAuthRised, borrowedLoanPageErrorDisplay, borrowedLoanPageErrorCode, fundedLoanPageErrorDisplay, fundedLoanPageErrorCode, openLoanPageErrorDisplay, openLoanPageErrorCode } = this.state;
        const { wrongMetamaskNetwork } = this.props;
        return (
            <div>
                <div className="page-title mb-20">
                    <Row>
                        <Col>
                            <h4 className="mb-0"> Dashboard</h4>
                            <div className='delete-button' onClick={(item) => { if (window.confirm('Are you sure you wish to delete this item?')) this.onCancel(item) }} />
                        </Col>
                    </Row>
                </div>

                {isMetaMaskAuthRised && wrongMetamaskNetwork == false &&
                    <div>
                        <Row className="mb-30">
                            <MyPortfolio
                                {...this.props}
                                {...this.state}
                                myBorrowedRequests={myBorrowedRequests}
                                myFundedRequests={myFundedRequests}
                                updateMyBorrowRequestProcessed={this.updateMyBorrowRequestProcessed}
                            />
                            <MyActivities
                                {...this.props}
                                {...this.state}
                                myBorrowedRequests={myBorrowedRequests}
                                myFundedRequests={myFundedRequests}
                                updateMyBorrowRequestProcessed={this.updateMyBorrowRequestProcessed}
                            />
                        </Row>

                        <Row className="mb-30">
                            <Col lg={12} md={12} sm={12} xl={12}>
                                <Card className="card-statistics h-100">
                                    <CardBody>
                                        <div className="tab nav-border" style={{ position: 'relative' }}>
                                            <div className="d-block d-md-flex justify-content-between">
                                                <div className="d-block w-100">
                                                    <CardTitle>My Loans</CardTitle>
                                                </div>
                                                <div className="d-block d-md-flex" style={{ position: 'absolute', left: 100, top: 0 }}>
                                                    <Nav tabs>
                                                        <NavItem>
                                                            <NavLink
                                                                className={classnames({ active: this.state.activeTab === '1' })}
                                                                onClick={() => { this.tabsclick('1'); }}
                                                            >
                                                                Borrowed Loans
                                                        </NavLink>
                                                        </NavItem>
                                                        <NavItem>
                                                            <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                                                                onClick={() => { this.tabsclick('2'); }}
                                                            >
                                                                Funded Loans
                                                        </NavLink>
                                                        </NavItem>
                                                        <NavItem>
                                                            <NavLink className={classnames({ active: this.state.activeTab === '3' })}
                                                                onClick={() => { this.tabsclick('3'); }}
                                                            >
                                                                My Loan Requests
                                                        </NavLink>
                                                        </NavItem>
                                                    </Nav>
                                                </div>
                                            </div>
                                            <TabContent activeTab={this.state.activeTab}>
                                                <TabPane tabId="1">
                                                    <MyBorrowedLoans
                                                        {...this.props}
                                                        {...this.state}
                                                        myBorrowedRequests={myBorrowedRequests}
                                                    />
                                                </TabPane>
                                                <TabPane tabId="2">
                                                    <MyFundedLoans
                                                        {...this.props}
                                                        {...this.state}
                                                        myFundedRequests={myFundedRequests}
                                                    />

                                                </TabPane>

                                                <TabPane tabId="3">

                                                    <MyLoanRequests
                                                        {...this.props}
                                                        {...this.state}
                                                        myLoanRequests={myLoanRequests}
                                                        cancelLoanRequest={(row) => this.cancelLoanRequest(row)}
                                                    />

                                                </TabPane>


                                            </TabContent>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                }

                {(wrongMetamaskNetwork == true || !isMetaMaskAuthRised) &&
                    <div>
                        <Row className="mb-30">
                            <Col md={3}></Col>
                            <Col md={6}>
                                <img src={metamaskConnectionErrorImg} className="img-fluid" alt="Metamask Error"/>
                            </Col>
                            <Col md={3}></Col>
                        </Row>
                    </div>
                }


            </div>
        );
    }
}
export default Dashboard;