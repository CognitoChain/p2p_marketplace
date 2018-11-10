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
import { niceNumberDisplay } from "../../../utils/Util";
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
            priceFeedData: this.props.priceFeedData,
            doughnutData: [],
            metaMaskMsg: false
        };
    }
    async componentWillReceiveProps(nextProps) {
        console.log("componentWillReceiveProps")
        console.log(nextProps)
        const { dharma,currentMetamaskAccount } = this.props;
        const { priceFeedData,myBorrowedRequests,tokens } = nextProps;
        let totalAssetAmount = 0;
        let totalLiablitiesAmount = 0;
        let stateObj = {};
        if (!_.isUndefined(priceFeedData) && !_.isUndefined(currentMetamaskAccount)) {
            if (tokens.length>0) {
                tokens.forEach(ts => {
                    if (ts.balance > 0) {
                        let tokenBalance = ts.balance;
                        let tokenSymbol = ts.symbol;
                        if (!_.isUndefined(priceFeedData[tokenSymbol])) {
                            let tokenCurrentPrice = priceFeedData[tokenSymbol].USD;
                            let tokenCurrentAmount = parseFloat(tokenBalance) * parseFloat(tokenCurrentPrice);
                            totalAssetAmount += tokenCurrentAmount;
                        }
                    }
                });
            }
        }
        totalAssetAmount = niceNumberDisplay(totalAssetAmount);
     
        if (myBorrowedRequests.length > 0) {
            myBorrowedRequests.forEach(ml => {
                let principal = parseFloat(ml.principal);
                let principalSymbol = ml.principalSymbol;
                if (!_.isUndefined(priceFeedData[principalSymbol])) {
                    let principalTokenCurrentPrice = priceFeedData[principalSymbol].USD;
                    let principalCurrentAmount = parseFloat(principal) * parseFloat(principalTokenCurrentPrice);
                    totalLiablitiesAmount += principalCurrentAmount;
                }
            });            
        }
        totalLiablitiesAmount = niceNumberDisplay(totalLiablitiesAmount);
        this.setState({ totalAssetAmount: totalAssetAmount,totalLiablitiesAmount: totalLiablitiesAmount }, () => {
            this.calculateValues()
        });
    }
    calculateValues() {
        const { totalAssetAmount, totalLiablitiesAmount } = this.state;
        const { myBorrowedLoading, isTokenLoading } = this.props;
        console.log("isTokenLoading"+isTokenLoading)
        console.log("myBorrowedLoading"+myBorrowedLoading)
        if (isTokenLoading || myBorrowedLoading) {
            return;
        }
        let assetLiabilitiesPercentage = ((totalAssetAmount-totalLiablitiesAmount)/totalAssetAmount)*100;
        assetLiabilitiesPercentage = (assetLiabilitiesPercentage < 100) ? niceNumberDisplay(assetLiabilitiesPercentage) : 99.99;
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
            doughnutData: data
        });
    }
    async componentWillMount() {
      
    }

    render() {
        const { totalAssetAmount, totalLiablitiesAmount, assetLiabilitiesPercentage, doughnutData, metaMaskMsg } = this.state;
        const { myBorrowedLoading, isTokenLoading } = this.props;
        let isLoading = myBorrowedLoading || isTokenLoading;
        return (
            <Col lg={6} md={6} sm={6} xl={6}>
                <Card className="h-100 my-portfolio-container">
                    <CardBody>
                        <CardTitle>My Portfolio</CardTitle>
                        {
                            isLoading &&  
                                <Row className="h-100 position-absolute portfolio-row align-items-center justify-content-center w-100">
                                    <Col md={12}>
                                        <Loading />
                                    </Col>
                                </Row>
                        }
                        {
                            !isLoading && !metaMaskMsg &&

                            <Row className="align-items-center h-100 position-absolute portfolio-row w-100">
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
