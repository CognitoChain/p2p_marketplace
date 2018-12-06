import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Progress } from 'reactstrap';
import _ from "lodash";
import { Doughnut } from 'react-chartjs-2';
import Loading from "../../Loading/Loading";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
import { niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
import "./MyPortfolio.css";
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
            metaMaskMsg: false,
            totalTokenBalance: 0,
            totalTokenProcessed: false,
            totalEthBalance: 0,
            totalEthProcessed: false,
            totalFundBalance: 0,
            totalFundProcessed: false,
            assetsProcessed: false,
            liabilitiesProcessed: false,
            doughnutDataPrepared: false,
            myEthBalance: 0,
            myFundedRequests: [],
            myBorrowedRequests: [],
            myTokens: [],
            isAssetsTokenLoading:false,
            isMounted:true
        };
    }
    componentDidMount(){
        const { isTokenLoading } = this.props;
        if(!isTokenLoading){
            console.log("Tokens Did mount FOUND");

            this.setState({
                totalTokenProcessed: false,
                assetsProcessed:false,
                doughnutDataPrepared:false,
            }, () => {
                this.calculateTotalTokenBalance()
            })
        }
    }
    async componentDidUpdate(prevProps) {
        const { 
            tokens: prevTokens, 
            myEthBalance: prevEthBalance ,
            myFundedRequests:prevMyFundedRequests,
            myBorrowedRequests:prevMyBorrowedRequests,
            myEthBalanceLoading:prevMyEthBalanceLoading,
            isTokenLoading:prevIsTokenLoading,
            myFundedLoading:prevMyFundedLoading,
            myBorrowedLoading:prevMyBorrowedLoading
        } = prevProps;
        const {
            isMetaMaskAuthRised,
            priceFeedData,
            myEthBalance,
            myEthBalanceLoading,
            tokens,
            isTokenLoading,
            myFundedLoading,
            myFundedRequests,
            myBorrowedRequests,
            myBorrowedLoading
        } = this.props;
        if (!_.isUndefined(priceFeedData) && isMetaMaskAuthRised) {
            /*Counting total assets*/
            console.log("------------------------------------------------")

            //console.log("priceFeedData & isMetaMaskAuthRised")
            //console.log("myEthBalanceLoading + " + myEthBalanceLoading)
            //console.log("prevMyEthBalanceLoading + " + prevMyEthBalanceLoading)

            if (myEthBalanceLoading!=prevMyEthBalanceLoading) {
                console.log("ETH FOUND")
                this.setState({
                    totalEthProcessed: false,
                    assetsProcessed:false,
                    doughnutDataPrepared:false,
                    myEthBalance
                }, () => {
                    this.calculateETHBalance()
                })
            }
            console.log("isTokenLoading + "+isTokenLoading)
            console.log("prevIsTokenLoading + "+prevIsTokenLoading)
            // console.log("prevTokens")
            // console.log(prevTokens)
            // console.log("tokens")
            // console.log(tokens)
            if (isTokenLoading!=prevIsTokenLoading) {
                console.log("Tokens FOUND");

                this.setState({
                    totalTokenProcessed: false,
                    assetsProcessed:false,
                    doughnutDataPrepared:false,
                }, () => {
                    this.calculateTotalTokenBalance()
                })
            }

            // /* chec for all 22 loan*/
            //console.log("myFundedLoading + "+myFundedLoading)
            //console.log("prevMyFundedLoading + "+prevMyFundedLoading)
            // console.log("prevMyFundedRequests")
            // console.log(prevMyFundedRequests)
            // console.log("myFundedRequests")
            // console.log(myFundedRequests)
            // console.log(prevMyFundedRequests != myFundedRequests)
            if (myFundedLoading!=prevMyFundedLoading) {
                console.log("Fund FOUND")

                this.setState({
                    totalFundProcessed: false,
                    assetsProcessed:false,
                    doughnutDataPrepared:false,
                }, () => {
                    this.calculateTotalFundBalance()
                })
            }
            /*Counting total assets ends*/

            // /*Counting total liabilities*/
            //console.log("myBorrowedLoading + "+myBorrowedLoading)
            //console.log("prevMyBorrowedLoading + "+prevMyBorrowedLoading)
            // console.log("prevMyBorrowedRequests")
            // console.log(prevMyBorrowedRequests)
            // console.log("myBorrowedRequests")
            // console.log(myBorrowedRequests)
            if (myBorrowedLoading != prevMyBorrowedLoading) {
                console.log("Borrowed FOUND")

                this.setState({
                    liabilitiesProcessed: false,
                    assetsProcessed:false,
                    doughnutDataPrepared:false,
                }, () => {
                    this.calculateTotalLiablitiesAmount()
                })
            }
            /*Counting total liabilities ends*/
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

    calculateETHBalance() {
        const { myEthBalance, priceFeedData,myEthBalanceLoading } = this.props;
        if(myEthBalanceLoading){
            return;
        }
        let totalEthBalance = 0;
        let ethPrice = (!_.isUndefined(priceFeedData["ETH"])) ? priceFeedData["ETH"].USD : 0;
        if (myEthBalance > 0 && ethPrice) {
            totalEthBalance = myEthBalance * ethPrice;
        }
        this.setState({
            totalEthBalance,
            totalEthProcessed: true
        },() => {
            this.updateAssetsProcessed();
        });

    }
    async calculateTotalTokenBalance() {
        const { tokens, priceFeedData,isTokenLoading } = this.props;
        let totalTokenBalance = 0;
        // console.log("calculateTotalTokenBalance")
        // console.log(isTokenLoading)
        // console.log(tokens)
        if(isTokenLoading){
            return;
        }
        if (tokens.length > 0) {
            await this.asyncForEach(tokens, async ts => {
                if (ts.balance > 0) {
                    let tokenBalance = ts.balance;
                    let tokenSymbol = (ts.symbol == "WETH" && _.isUndefined(priceFeedData[ts.symbol])) ? "ETH" : ts.symbol;
                    if (!_.isUndefined(priceFeedData[tokenSymbol])) {
                        let tokenCurrentPrice = priceFeedData[tokenSymbol].USD;
                        let tokenCurrentAmount = parseFloat(tokenBalance) * parseFloat(tokenCurrentPrice);
                        //console.log(tokenSymbol + " - " + tokenCurrentAmount)

                        totalTokenBalance += tokenCurrentAmount;
                    }
                }
            });
        }
        this.setState({
            totalTokenBalance,
            totalTokenProcessed: true
        }, () => {
            this.updateAssetsProcessed();
        });
    }
    async calculateTotalFundBalance() {
        const { myFundedRequests, priceFeedData,currentMetamaskAccount,myFundedLoading } = this.props;
        if(myFundedLoading){
            return;
        }
        let totalFundBalanceCount = 0;
        if (myFundedRequests.length > 0) {
            await this.asyncForEach(myFundedRequests, async mf => {
                if (mf.creditorAddress == currentMetamaskAccount && mf.isCollateralSeized === false && mf.isCollateralReturned === false) {
                    let tokenSymbol = (mf.principalSymbol == "WETH" && _.isUndefined(priceFeedData[mf.principalSymbol])) ? "ETH" : mf.principalSymbol;
                    if (!_.isUndefined(priceFeedData[tokenSymbol])) {
                        let tokenCurrentPrice = priceFeedData[tokenSymbol].USD;
                        let tokenCurrentAmount = parseFloat(mf.totalExpectedRepaymentAmount) * parseFloat(tokenCurrentPrice);
                        totalFundBalanceCount += tokenCurrentAmount;
                    }
                }
            });
        }
        this.setState({
            totalFundBalance:totalFundBalanceCount,
            totalFundProcessed: true
        }, (async () => {
            this.updateAssetsProcessed();
        }));
    }
    async calculateTotalLiablitiesAmount() {
        const { myBorrowedRequests, priceFeedData,currentMetamaskAccount,myBorrowedLoading } = this.props;
        let totalLiablitiesAmount = 0;
        if(myBorrowedLoading){
            return;
        }
        if (myBorrowedRequests.length > 0) {
            await this.asyncForEach(myBorrowedRequests, async ml => {
                if (ml.debtorAddress == currentMetamaskAccount) {
                    let principal = parseFloat(ml.principal);
                    let principalSymbol = ml.principalSymbol;
                    if (!_.isUndefined(priceFeedData[principalSymbol])) {
                        let principalTokenCurrentPrice = priceFeedData[principalSymbol].USD;
                        let principalCurrentAmount = parseFloat(principal) * parseFloat(principalTokenCurrentPrice);
                        totalLiablitiesAmount += principalCurrentAmount;
                    }
                }
            });
        }
        this.setState({
            totalLiablitiesAmount,
            liabilitiesProcessed: true
        }, () => {
            this.callCalculateValues();
        });
    }
    updateAssetsProcessed() {
        console.log("updateAssetsProcessed")
        
        const { totalTokenProcessed, totalEthProcessed, totalFundProcessed, totalTokenBalance, totalEthBalance, totalFundBalance,myFundedRequests } = this.state;

        console.log("totalTokenProcessed inside updateAssetsProcessed");
        console.log(totalTokenProcessed);

        console.log("totalEthProcessed inside updateAssetsProcessed");
        console.log(totalEthProcessed);

        console.log("totalFundProcessed inside updateAssetsProcessed");
        console.log(totalFundProcessed);

        // if(totalFundProcessed === false)
        // {
        //     console.log("myFundedRequests");
        //     console.log(myFundedRequests);
        // }

        if (totalTokenProcessed === true && totalEthProcessed === true && totalFundProcessed === true) {
            // console.log("totalTokenBalance -- " + totalTokenBalance)
            // console.log("totalEthBalance -- " + totalEthBalance)
            // console.log("totalFundBalance -- " + totalFundBalance)


            let totalAssetAmount = parseFloat(totalTokenBalance) + parseFloat(totalEthBalance) + parseFloat(totalFundBalance);
            this.setState({
                totalAssetAmount,
                assetsProcessed: true
            }, () => {
                this.callCalculateValues();
            });
        }
    }
    callCalculateValues() {
        
        console.log("callCalculateValues")
        const { assetsProcessed, liabilitiesProcessed } = this.state;
        console.log(assetsProcessed)
        console.log(liabilitiesProcessed)
        
        if (assetsProcessed === true && liabilitiesProcessed === true) {
            this.calculateValues();
        }
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
    calculateValues() {
        const { totalAssetAmount, totalLiablitiesAmount, doughnutDataPrepared } = this.state;
        const { myBorrowedLoading, isTokenLoading,myFundedLoading,myEthBalanceLoading } = this.props;
        console.log("Calculate values inside => ");
        console.log(isTokenLoading)
        console.log(myBorrowedLoading)
        console.log(myFundedLoading)
        console.log(myEthBalanceLoading)
        if (isTokenLoading || myBorrowedLoading || myFundedLoading || myEthBalanceLoading) {
            this.setState({
                totalAssetAmount:0
            })
            return;
        }
        /*console.log("totalAssetAmount");
        console.log(totalAssetAmount);
        console.log("totalLiablitiesAmount");
        console.log(totalLiablitiesAmount);*/
        let assetLiabilitiesPercentage = (totalLiablitiesAmount == 0) ? 100 : (totalAssetAmount == 0) ? 0 : ((totalAssetAmount - totalLiablitiesAmount) / totalAssetAmount) * 100;
        assetLiabilitiesPercentage = (assetLiabilitiesPercentage <= 100) ? niceNumberDisplay(assetLiabilitiesPercentage, 2) : 99.99;
        /*console.log("assetLiabilitiesPercentage => 2");
        console.log(assetLiabilitiesPercentage);*/

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
            doughnutDataPrepared: true
        });
    }
    async componentWillMount() {

    }

    render() {
        const { totalAssetAmount, totalLiablitiesAmount, assetLiabilitiesPercentage, doughnutData, metaMaskMsg, assetsProcessed, liabilitiesProcessed, doughnutDataPrepared } = this.state;
        const { myBorrowedLoading, isTokenLoading } = this.props;
        let isLoading = (assetsProcessed === true && liabilitiesProcessed === true && doughnutDataPrepared === true) ? false : true;
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
                            !totalAssetAmount && !isLoading && !metaMaskMsg &&
                            <div className="portfolio-bg-image">
                                <div className="portfolio-empty-image" style={{ backgroundImage: "url('assets/images/portfolio-empty.jpg')" }}>
                                    <div className="portfolio-bg-content">
                                        Looks like you don't have any digital assets <br />
                                        Would you like to buy?<br />
                                        <a
                                            href={`https://www.coinbase.com/`}
                                            target="_blank" className="btn cognito green">
                                            {"Go to Coinbase"}
                                        </a>
                                    </div>
                                </div>
                            </div>

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
                                        <label className="statistics-label custom-tooltip" tooltip-title={tooltipNumberDisplay(totalAssetAmount, "$", "prepend")}>${niceNumberDisplay(totalAssetAmount)}</label>
                                    </div>

                                    <div className="liability-container">
                                        <label>Liabilities</label>
                                        <Progress value={50} className="mb-10 liabilities-color" color="warning" />
                                        <label className="statistics-label custom-tooltip" tooltip-title={tooltipNumberDisplay(totalLiablitiesAmount, "$", "prepend")}>${niceNumberDisplay(totalLiablitiesAmount)}</label>
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