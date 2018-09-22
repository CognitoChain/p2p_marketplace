import React, { Component } from 'react';
import {Card,CardBody,CardTitle,Row,Col,Table} from 'reactstrap';
import { Link } from 'react-router-dom';
import './Market.css';
class Market extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {};
    }
    componentWillMount() {        
    }
    render() {
        return (
            <div className="content-with-market-bg">
                    <div className="market-bg-image">
                            <div className="image" style={{backgroundImage:"url('assets/images/loans.jpg')"}}></div>
                            <div className="bg-overlay"></div>
                            <div className="market-bg-content">
                                <h1>EASY LOAN</h1>
                                <div className="row justify-content-center mt-10">
                                    <div className="col-md-2"><p className="market-bg-feature">Secured</p></div>
                                    <div className="col-md-2"><p className="market-bg-feature">Asset Backed</p></div>
                                    <div className="col-md-2"><p className="market-bg-feature">Flexible Terms</p></div>
                                </div>
                                <div className="row mt-20 how-it-works">
                                    <div className="col-md-3">
                                        <h5 className="text-muted">Step 1</h5>
                                        <p>Login to Cognitochain Marketplace</p>
                                        <h6>Create Loan Request</h6>
                                    </div>
                                    <div className="col-md-3">
                                        <h5 className="text-muted">Step 2</h5>
                                        <p>Authorize Smart Contract</p>
                                        <h6>Unlock Collateral</h6>
                                    </div>
                                    <div className="col-md-3">
                                        <h5 className="text-muted">Step 3</h5>
                                        <p>Publish in Cognitochain Marketplace</p>
                                        <h6>Get Funded</h6>
                                    </div>
                                    <div className="col-md-3">
                                        <h5 className="text-muted">Step 4</h5>
                                        <p>Repay Loan</p>
                                        <h6>Get Collateral back in full</h6>
                                    </div>
                                </div>
                            </div>
                    </div>
                    <div className="page-title">
                        <Row>
                            <Col sm={6}>
                                <h4 className="mb-0"> Market</h4>
                                <div className='delete-button' onClick={(item) => { if (window.confirm('Are you sure you wish to delete this item?')) this.onCancel(item) }} />
                            </Col>
                            <Col sm={6} className="pull-right text-right">
                                <Link to="/create"><span className="btn cognito orange small icon mb-15"><i className="fa fa-envelope-o" /> Borrow</span></Link>
                            </Col>
                        </Row>
                    </div>
                    {/* <!-- widgets --> */}
                    <Row className="open-request-table">
                            
                        <Col md={12} className="mb-30">
                        <Card className="card-statistics h-100">
                            <div className="btn-group info-drop">
                                <a className="btn btn-outline-info cognito x-small mb-15" href="javascript:void(0);">Filter</a>
                            </div>
                            <CardBody>
                                <CardTitle>Open Requests</CardTitle>
                                <Table responsive className="open-request">
                                    <thead>
                                        <tr>
                                            <th width="15%" className="text-center">Request Type</th>
                                            <th width="15%" className="text-center">Loan Amount</th>
                                            <th width="10%" className="text-center">Term</th>
                                            <th width="15%" className="text-center">Interest Rate</th>
                                            <th width="10%" className="text-center">Collateral</th>
                                            <th width="10%" className="text-center">Total Repayment</th>
                                            <th width="10%" className="text-center">Repayment Frequency</th>
                                            <th width="15%" className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><div className="round round-lg orange"><i className="ti-money"></i></div></td>
                                            <td><span className="number-highlight">5,000</span><br />DAI</td>
                                            <td><span className="number-highlight">1</span> Month</td>
                                            <td><span className="number-highlight">5</span> %</td>
                                            <td><span className="number-highlight">33</span><br />WETH</td>
                                            <td><span className="number-highlight">5,250</span><br />DAI</td>
                                            <td>One-time</td>
                                            <td><a className="btn btn-outline-success cognito x-small" href="javascript:void(0);">Fund</a></td>
                                        </tr>

                                        <tr>
                                            <td><div className="round round-lg orange"><i className="ti-money"></i></div></td>
                                            <td><span className="number-highlight">5,000</span><br />OMG</td>
                                            <td><span className="number-highlight">1</span> Week</td>
                                            <td><span className="number-highlight">3</span> %</td>
                                            <td><span className="number-highlight">12</span><br />WETH</td>
                                            <td><span className="number-highlight">5,150</span><br />OMG</td>
                                            <td>One-time</td>
                                            <td><a className="btn btn-outline-success cognito x-small" href="javascript:void(0);">Fund</a></td>
                                        </tr>

                                        <tr>
                                            <td><div className="round round-lg orange"><i className="ti-money"></i></div></td>
                                            <td><span className="number-highlight">10,000</span><br />REP</td>
                                            <td><span className="number-highlight">6</span> Months</td>
                                            <td><span className="number-highlight">12</span> %</td>
                                            <td><span className="number-highlight">1</span><br />WETH</td>
                                            <td><span className="number-highlight">10,000</span><br />REP</td>
                                            <td>One-time</td>
                                            <td><a className="btn btn-outline-success cognito x-small" href="javascript:void(0);">Fund</a></td>
                                        </tr>

                                        <tr>
                                            <td><div className="round round-lg orange"><i className="ti-money"></i></div></td>
                                            <td><span className="number-highlight">5,000</span><br />ZRX</td>
                                            <td><span className="number-highlight">1</span> Month</td>
                                            <td><span className="number-highlight">6</span> %</td>
                                            <td><span className="number-highlight">3</span><br />WETH</td>
                                            <td><span className="number-highlight">5,300</span><br />DAI</td>
                                            <td>One-time</td>
                                            <td><a className="btn btn-outline-success cognito x-small" href="javascript:void(0);">Fund</a></td>
                                        </tr>
                                        
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>

                    </Row>


                    <Row className="recent-funded-loans-table">
                            
                        <Col md={12} className="mb-30">
                        <Card className="card-statistics h-100">
                            <CardBody>
                                <CardTitle>Recent Funded Loans</CardTitle>
                                <Table responsive className="open-request">
                                    <thead>
                                        <tr>
                                            <th width="20%" className="text-center">Created Date</th>
                                            <th width="15%" className="text-center">Amount</th>
                                            <th width="15%" className="text-center">Term</th>
                                            <th width="15%" className="text-center">Interest Rate</th>
                                            <th width="10%" className="text-center">Collateral</th>
                                            <th width="15%" className="text-center">Total Repayment</th>
                                            <th width="10%" className="text-center">Repayment Frequency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span className="number-highlight">12/08/2018</span><br />00:12:22</td>
                                            <td><span className="number-highlight">5,000</span><br /> DAI</td>
                                            <td><span className="number-highlight">1</span> Month</td>
                                            <td><span className="number-highlight">5</span>%</td>
                                            <td><span className="number-highlight">53</span><br />WETH</td>
                                            <td><span className="number-highlight">5,250</span><br />DAI</td>
                                            <td>One-time</td>
                                        </tr>

                                        <tr>
                                            <td><span className="number-highlight">07/08/2018</span><br />00:12:22</td>
                                            <td><span className="number-highlight">5,000</span><br /> OMG</td>
                                            <td><span className="number-highlight">1</span> Week</td>
                                            <td><span className="number-highlight">3</span>%</td>
                                            <td><span className="number-highlight">12</span><br />WETH</td>
                                            <td><span className="number-highlight">5,150</span><br />OMG</td>
                                            <td>One-time</td>
                                        </tr>

                                        <tr>
                                            <td><span className="number-highlight">01/08/2018</span><br />00:12:22</td>
                                            <td><span className="number-highlight">10,000</span><br /> REP</td>
                                            <td><span className="number-highlight">6</span> Months</td>
                                            <td><span className="number-highlight">12</span>%</td>
                                            <td><span className="number-highlight">1</span><br />WETH</td>
                                            <td><span className="number-highlight">12,000</span><br />REP</td>
                                            <td>One-time</td>
                                        </tr>


                                        <tr>
                                            <td><span className="number-highlight">10/07/2018</span><br />00:12:22</td>
                                            <td><span className="number-highlight">5000</span><br /> ZRX</td>
                                            <td><span className="number-highlight">1</span> Month</td>
                                            <td><span className="number-highlight">6</span>%</td>
                                            <td><span className="number-highlight">3</span><br />WETH</td>
                                            <td><span className="number-highlight">5,300</span><br />ZRX</td>
                                            <td>One-time</td>
                                        </tr>
                                        
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>

                    </Row>
                
            </div>

        );
    }
}
export default Market;