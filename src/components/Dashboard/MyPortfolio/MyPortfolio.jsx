// External libraries
import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import "./MyPortfolio.css";
import { amortizationUnitToFrequency } from "../../../utils/Util";
import BootstrapTable from "react-bootstrap-table-next";
import fundLoanImg from "../../../assets/images/fund_loan.png";
import borrowLoanImg from "../../../assets/images/borrow.png";
import _ from "lodash";
import paginationFactory from 'react-bootstrap-table2-paginator';
import Loading from "../../Loading/Loading";
import { Doughnut } from 'react-chartjs-2';
import { Card, CardBody, CardTitle, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Progress, Table } from 'reactstrap';
import Api from "../../../services/api";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
/**
 * Here we define the columns that appear in the table that holds all of the
 * open Loan Requests.
 */
class MyPortfolio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assets: [],
            liabilities: [],
            isLoading: true,
            totalAssetAmount: 0,
            totalLiablitiesAmount: 0,
            assetLiabilitiesPercentage: 0,
            priceFeedData: [],
            doughnutData: [],
            metaMaskMsg: false
        };
    }
    async componentWillReceiveProps(nextProps) {
        let userTokens = nextProps.tokens;
        const { dharma } = this.props;
        const { priceFeedData } = this.state;
        const { myloanRequests } = this.props;
        let totalAssetAmount = 0;
        let totalLiablitiesAmount = 0;
        const CurrentAccount = await dharma.blockchain.getCurrentAccount();
        if (typeof priceFeedData != "undefined" && typeof CurrentAccount != "undefined") {
            if (typeof userTokens != 'undefined') {
                userTokens.forEach(ts => {
                    if (ts.balance > 0) {
                        let tokenBalance = ts.balance;
                        let tokenSymbol = ts.symbol;
                        if (typeof priceFeedData[tokenSymbol] != "undefined") {
                            let tokenCurrentPrice = priceFeedData[tokenSymbol].USD;
                            let tokenCurrentAmount = parseFloat(tokenBalance) * parseFloat(tokenCurrentPrice);
                            totalAssetAmount += tokenCurrentAmount;
                        }
                    }
                });
            }

            this.setState({ totalAssetAmount: totalAssetAmount });

            if (typeof myloanRequests != 'undefined') {
                myloanRequests.forEach(ml => {
                    let principal = ml.principalAmount;
                    let principalTokenSymbol = ml.principalTokenSymbol;
                    if (typeof priceFeedData[principalTokenSymbol] != "undefined") {
                        let principalTokenCurrentPrice = priceFeedData[principalTokenSymbol].USD;
                        let principalCurrentAmount = parseFloat(principal) * parseFloat(principalTokenCurrentPrice);
                        totalLiablitiesAmount += principalCurrentAmount;
                    }
                    this.setState({ totalLiablitiesAmount: totalLiablitiesAmount });
                });
            }



            if (this.state.totalAssetAmount && this.state.totalLiablitiesAmount) {
                let assetLiabilitiesPercentage = (totalAssetAmount / totalLiablitiesAmount) * 100;
                const data = {
                    labels: [
                        'Assets',
                        'Liabilities'
                    ],
                    datasets: [{
                        data: [totalAssetAmount, totalLiablitiesAmount],
                        backgroundColor: [
                            '#00cc99',
                            '#ffa31a'
                        ],
                        hoverBackgroundColor: [
                            '#00cc99',
                            '#ffa31a'
                        ]
                    }]
                };

                this.setState({
                    assetLiabilitiesPercentage: assetLiabilitiesPercentage,
                    doughnutData: data,
                    isLoading: false
                });
            }
        }
        else {
            this.setState({
                isLoading: false,
                metaMaskMsg: true
            });
        }
    }
    async componentWillMount() {
        const { dharma } = this.props;
        const { totalLiablitiesAmount } = this.state;
        const { Debt, Investments, LoanRequest, Loan, Debts } = Dharma.Types;
        const CurrentAccount = await dharma.blockchain.getCurrentAccount();
        let priceFeedData = [];
        let totalLiablitiesAmountCount = 0;
        if (typeof CurrentAccount != "undefined") {
            const api = new Api();
            const all_token_price = api
                .setToken(this.props.token)
                .get(`priceFeed`)
                .then(async priceFeedData => {
                    this.setState({ priceFeedData: priceFeedData });
                });
        }
    }

    render() {
        const { isLoading, totalAssetAmount, totalLiablitiesAmount, assetLiabilitiesPercentage, doughnutData, metaMaskMsg } = this.state;

        return (
            <Col lg={6} md={6} sm={6} xl={6}>
                <Card className="h-100">
                    <CardBody>
                        <CardTitle>My Portfolio</CardTitle>
                        {
                            isLoading && <Loading />
                        }
                        {
                            !isLoading && !metaMaskMsg &&

                            <Row>
                                <Col md={6}>
                                    <div className="chart-wrapper" style={{ height: 200 }}>
                                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, legend: { display: false, labels: { fontFamily: "Poppins" } } }} width={this.state.widths} />
                                    </div>
                                </Col>
                                <Col md={1}></Col>
                                <Col md={5}>

                                    <div className="assets-container">
                                        <label>Assets</label>
                                        <Progress value={25} className="mb-10 assets-color" color="success" />
                                        <label className="statistics-label">${totalAssetAmount}</label>
                                    </div>

                                    <div className="liability-container">
                                        <label>Liabilities</label>
                                        <Progress value={50} className="mb-10 liabilities-color" color="warning" />
                                        <label className="statistics-label">${totalLiablitiesAmount}</label>
                                    </div>

                                    <div className="assets-vs-liabilities-container">
                                        <label>Assets vs Liabilities</label><br />
                                        <label className="statistics-label">{assetLiabilitiesPercentage}%</label>
                                    </div>

                                </Col>
                            </Row>
                        }
                        {
                            metaMaskMsg &&
                            <Row>
                                <Col md={12}>
                                    <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={["Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured."]} />
                                </Col>
                            </Row>
                        }

                    </CardBody>
                </Card>
            </Col>
        );
    }
}
export default MyPortfolio;
