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
import Api from "../../services/api";

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.tabsclick = this.tabsclick.bind(this);
        this.state = {
            activeTab: '1',
            widths: 80,
            myLoanRequests: [],
            myFundedRequests: [],
            myBorrowedLoading: true,
            myFundedLoading: true,
            myLoanRequestsIsMounted:true,
            myFundedRequestsIsMounted:true
        };
        this.parseMyLoanRequests = this.parseMyLoanRequests.bind(this);
        this.parseLoanRequest = this.parseLoanRequest.bind(this);
    }
   
    componentDidMount() {
        this.getBorrowedLoanRequests();
        this.getFundedLoanRequests();
    }

    async getBorrowedLoanRequests(){
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";
        const { myLoanRequestsIsMounted } = this.state;

        api.setToken(this.props.token).get("user/loanRequests", { sort, order })
            .then(this.parseMyLoanRequests)
            .then(myLoanRequests => {
                if(myLoanRequestsIsMounted)    
                {
                    this.setState({ myLoanRequests, myBorrowedLoading: false });          
                }
            })
            .catch((error) => {
                if(error.status && error.status === 403){
                    this.props.redirect(`/login/`);
                }
        });

        ///////// TEST CODE - REMOVE
        console.log("---- LOADING TOKENS ----")
        const { dharma } = this.props;
        const { Token } = Dharma.Types;
        const owner = "0x8774706FA996Ac8F2D0360447eFF687D8F21B7AA";
        Token.all(dharma, owner).then(result => {
            console.log(result);
        });

    }

    async getFundedLoanRequests(){
        const { dharma } = this.props;
        const { myFundedRequestsIsMounted } = this.state;
        const { Investments } = Dharma.Types;
        const creditor = await dharma.blockchain.getCurrentAccount();
        if(typeof creditor != "undefined")
        {
            const myFundedRequests = await Investments.getExpandedData(dharma, creditor);
            if(myFundedRequestsIsMounted)
            {
                this.setState({
                    myFundedRequests,
                    myFundedLoading: false
                });    
            }
        }
        else
        {
            this.setState({
                myFundedLoading: false
            }); 
        }
    }

    tabsclick(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    
    parseMyLoanRequests(loanRequestData) {
        /*var filteredRequestData = _.filter(loanRequestData, { 'status': "OPEN" });*/
        return Promise.all(loanRequestData.map(this.parseLoanRequest));
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
                    loanStatus:datum.status
                });
            });
        });
    }

    getBorrowedData() {
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

    getMyFundedData() {
        const { myFundedRequests } = this.state;

        if (!myFundedRequests) {
            return null;
        }

        return myFundedRequests.map((investment) => {
            return {
                ...investment,
                principal: `${investment.principalAmount} ${investment.principalTokenSymbol}`,
                collateral: `${investment.collateralAmount} ${investment.collateralTokenSymbol}`,
                term: `${investment.termDuration} ${investment.termUnit}`,
                repaidAmount: `${investment.repaidAmount} ${investment.principalTokenSymbol}`,
                totalExpectedRepaymentAmount: `${investment.totalExpectedRepaymentAmount} ${
                    investment.principalTokenSymbol
                    }`,
            };
        });
    }

    componentWillUnmount(){
        this.setState({
          myLoanRequestsIsMounted: false,
          myFundedRequestsIsMounted:false                
        });
    }

    render() {
        const myLoanRequests = this.getBorrowedData();
        const myFundedRequests = this.getMyFundedData();
        const { token, dharma, redirect } = this.props;
        const { highlightRow,  myBorrowedLoading, myFundedLoading} = this.state;
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
                        authenticated={this.props.authenticated}
                        dharma={this.props.dharma}
                        tokens={this.props.tokens}
                        token={this.props.token}
                        myLoanRequests={myLoanRequests}
                    />
                    <MyActivities
                        authenticated={this.props.authenticated}
                        dharma={this.props.dharma}
                        token={this.props.token}
                        myLoanRequests={myLoanRequests}
                        myFundedRequests={myFundedRequests}
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
                                            </Nav>
                                        </div>
                                    </div>
                                    <TabContent activeTab={this.state.activeTab}>
                                        <TabPane tabId="1" title="Borrowed Loans">

                                            <MyBorrowedLoans
                                                token={token}
                                                dharma={dharma}
                                                redirect={redirect}
                                                myBorrowedLoading = {myBorrowedLoading}
                                                myLoanRequests={myLoanRequests}
                                                highlightRow={highlightRow}
                                            />

                                        </TabPane>

                                        <TabPane tabId="2" title="Funded Loans">

                                            <MyFundedLoans
                                                token={token}
                                                dharma={dharma}
                                                redirect={redirect}
                                                myFundedLoading={myFundedLoading}
                                                myFundedRequests={myFundedRequests}
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