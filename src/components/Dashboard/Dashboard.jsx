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
            myloanRequests: [],
            highlightRow: null,
            myBorrowedLoading: true,
            modal: false
        };
        this.parseMyLoanRequests = this.parseMyLoanRequests.bind(this);
        this.parseLoanRequest = this.parseLoanRequest.bind(this);
    }
   
    async componentDidMount() {
        const { highlightRow } = this.props;
        this.setState({
            highlightRow,
        });
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";

        api.setToken(this.props.token).get("user/loanRequests", { sort, order })
            .then(this.parseMyLoanRequests)
            .then((myloanRequests) => this.setState({ myloanRequests, myBorrowedLoading: false }))
            .catch((error) => {
                if(error.status && error.status === 403){
                    this.props.redirect(`/login/`);
                }
        });
    }
    tabsclick(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    
    componentWillMount() {

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
                });
            });
        });
    }

    getData() {
        const { myloanRequests } = this.state;
        if (!myloanRequests) {
            return null;
        }

        return myloanRequests.map((request) => {
            return {
                ...request,
                principal: `${request.principalAmount} ${request.principalTokenSymbol}`,
                collateral: `${request.collateralAmount} ${request.collateralTokenSymbol}`,
                term: `${request.termDuration} ${request.termUnit}`,
                expiration: moment.unix(request.expiresAt).fromNow(),
                requestedDate: moment(request.requestedAt).calendar(),
                authenticated:this.props.authenticated
            };
        });
    }

    render() {
        const { token, dharma, redirect } = this.props;
        const { myloanRequests,highlightRow,  myBorrowedLoading} = this.state;
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
                        myloanRequests={myloanRequests}
                    />
                    <MyActivities
                        authenticated={this.props.authenticated}
                        dharma={this.props.dharma}
                        token={this.props.token}
                        myloanRequests={myloanRequests}
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
                                                myloanRequests={myloanRequests}
                                                highlightRow={highlightRow}
                                            />

                                        </TabPane>

                                        <TabPane tabId="2" title="Funded Loans">

                                            <MyFundedLoans
                                                token={token}
                                                dharma={dharma}
                                                redirect={redirect}
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