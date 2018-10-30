import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import { Card, CardBody, CardTitle, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Progress, Table } from 'reactstrap';
import './Dashboard.css';
import classnames from 'classnames';
import DharmaConsumer from "../../contexts/Dharma/DharmaConsumer";
import MyBorrowedLoans from "./MyBorrowedLoans/MyBorrowedLoans";
import MyFundedLoans from "./MyFundedLoans/MyFundedLoans";
import MyPortfolio from "./MyPortfolio/MyPortfolio";
import MyActivities from "./MyActivities/MyActivities";
import MyLoanRequests from "./MyLoanRequests/MyLoanRequests";
import Api from "../../services/api";
import _ from 'lodash';
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
            tokenlist: this.props.tokens,
            myBorrowedLoading: true,
            myFundedLoading: true,
            myLoansLoading: true,
            myBorrowedRequestsIsMounted: true,
            myFundedRequestsIsMounted: true,
            myLoanRequestsIsMounted: true,
        };
        this.parseMyLoanRequests = this.parseMyLoanRequests.bind(this);
        this.parseLoanRequest = this.parseLoanRequest.bind(this);
    }

    convertBigNumber(number, decimal) {
        let divider = "1E" + decimal;
        let formatedAmount = number / divider;
        return formatedAmount;
    }

    componentDidMount() {
        this.setPriceFeedData();
        this.getBorrowedLoanRequests();
        this.getFundedLoanRequests();
        this.getMyLoanRequests();
    }
    componentWillUnmount() {
        this.setState({
            myBorrowedRequestsIsMounted: false,
            myLoanRequestsIsMounted: false,
            myFundedRequestsIsMounted: false
        });
    }
    componentWillReceiveProps(nextProps) {
        console.log("nextProps")
        console.log(nextProps)
        if (nextProps.tokens != this.state.tokenlist) {
            this.setState({ tokenlist: nextProps.tokens })
        }
    }
    async getBorrowedLoanRequests() {
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        const { myBorrowedRequestsIsMounted } = this.state;

        api.setToken(this.props.token).get("user/loans", { sort, order })
            .then(myBorrowedRequests => {
                if (myBorrowedRequestsIsMounted) {
                    this.setState({ myBorrowedRequests, myBorrowedLoading: false });
                }
            })
            .catch((error) => {
                if (error.status && error.status === 403) {
                    this.props.redirect(`/login/`);
                }
            });
    }

    async getFundedLoanRequests() {
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        const { myFundedRequestsIsMounted } = this.state;
        api.setToken(this.props.token).get("user/investments", { sort, order })
            .then(myFundedRequests => {
                if (myFundedRequestsIsMounted) {
                    this.setState({ myFundedRequests, myFundedLoading: false });
                }
            })
            .catch((error) => {
                if (error.status && error.status === 403) {
                    this.props.redirect(`/login/`);
                }
            });
    }

    async getMyLoanRequests() {
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        const { myLoanRequestsIsMounted } = this.state;
        api.setToken(this.props.token).get("user/loanRequests", { sort, order })
            .then(this.parseMyLoanRequests)
            .then(myLoanRequests => {
                if (myLoanRequestsIsMounted) {
                    this.setState({ myLoanRequests, myLoansLoading: false });
                }
            })
            .catch((error) => {
                if (error.status && error.status === 403) {
                    this.props.redirect(`/login/`);
                }
            });
    }

    parseMyLoanRequests(loanRequestData) {
        var filteredRequestData = _.filter(loanRequestData, { 'status': "OPEN" });
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
                    loanStatus: datum.status
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
            let princiaplAmount = this.convertBigNumber(request.principalAmount, request.principalNumDecimals);
            let collateralAmount = this.convertBigNumber(request.collateralAmount, request.collateralNumDecimals);
            let repaymentAmount = this.convertBigNumber(request.totalExpectedRepayment, request.principalNumDecimals);
            let repaidAmount = this.convertBigNumber(request.repaidAmount, request.principalNumDecimals);

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
            let princiaplAmount = this.convertBigNumber(investment.principalAmount, investment.principalNumDecimals);
            let collateralAmount = this.convertBigNumber(investment.collateralAmount, investment.collateralNumDecimals);
            let repaymentAmount = this.convertBigNumber(investment.totalExpectedRepayment, investment.principalNumDecimals);
            let repaidAmount = this.convertBigNumber(investment.repaidAmount, investment.principalNumDecimals);

            return {
                ...investment,
                principal: `${princiaplAmount}`,
                collateral: `${collateralAmount}`,
                term: `${investment.termLengthAmount}`,
                repaidAmount: `${repaidAmount} ${investment.principalSymbol}`,
                totalExpectedRepaymentAmount: `${repaymentAmount} ${
                    investment.principalSymbol
                    }`,
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
        const { dharma, currentMetamaskAccount, token } = this.props;
        const { Debt, Investments, LoanRequest, Loan, Debts } = Dharma.Types;
        let priceFeedData = [];
        let totalLiablitiesAmountCount = 0;
        if (typeof currentMetamaskAccount != "undefined") {
            const api = new Api();
            const all_token_price = api
                .setToken(token)
                .get(`priceFeed`)
                .then(async priceFeedData => {
                    this.setState({ priceFeedData: priceFeedData });
                });
        }
    }

    render() {
        const myBorrowedRequests = this.getBorrowedData();
        const myFundedRequests = this.getMyFundedData();
        const myLoanRequests = this.getMyLoansData();
        const { token, dharma, tokens, redirect, currentMetamaskAccount, isTokenLoading, authenticated } = this.props;
        const { highlightRow, myBorrowedLoading, myFundedLoading, myLoansLoading, priceFeedData, tokenlist } = this.state;
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
                {/* <!-- widgets --> */}


                <Row className="mb-30">
                    <MyPortfolio
                        authenticated={authenticated}
                        dharma={dharma}
                        tokens={tokenlist}
                        isTokenLoading={isTokenLoading}
                        myBorrowedLoading={myBorrowedLoading}
                        token={token}
                        myBorrowedRequests={myBorrowedRequests}
                        currentMetamaskAccount={currentMetamaskAccount}
                        priceFeedData={priceFeedData}
                    />
                    <MyActivities
                        authenticated={authenticated}
                        dharma={dharma}
                        token={token}
                        myBorrowedRequests={myBorrowedRequests}
                        myFundedRequests={myFundedRequests}
                        myBorrowedLoading={myBorrowedLoading}
                        myFundedLoading={myFundedLoading}
                        currentMetamaskAccount={currentMetamaskAccount}
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
                                        <TabPane tabId="1" title="Borrowed Loans">

                                            <MyBorrowedLoans
                                                token={token}
                                                dharma={dharma}
                                                redirect={redirect}
                                                myBorrowedLoading={myBorrowedLoading}
                                                myBorrowedRequests={myBorrowedRequests}
                                                highlightRow={highlightRow}
                                                currentMetamaskAccount={currentMetamaskAccount}
                                            />

                                        </TabPane>

                                        <TabPane tabId="2" title="Funded Loans">

                                            <MyFundedLoans
                                                token={token}
                                                dharma={dharma}
                                                redirect={redirect}
                                                myFundedLoading={myFundedLoading}
                                                myFundedRequests={myFundedRequests}
                                                currentMetamaskAccount={currentMetamaskAccount}
                                            />

                                        </TabPane>

                                        <TabPane tabId="3" title="My loan requests">

                                            <MyLoanRequests
                                                token={token}
                                                dharma={dharma}
                                                redirect={redirect}
                                                myLoansLoading={myLoansLoading}
                                                myLoanRequests={myLoanRequests}
                                            />

                                        </TabPane>


                                    </TabContent>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}
export default Dashboard;