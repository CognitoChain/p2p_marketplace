import React, { Component } from 'react';
import { Card,CardBody,CardTitle,Row,Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import DharmaConsumer from "../../contexts/Dharma/DharmaConsumer";
import LoanRequests from "./LoanRequests/LoanRequests";
import FundedLoans from "./FundedLoans/FundedLoans";
import './Market.css';
class Market extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.redirect = this.redirect.bind(this);
        this.parseQueryParams = this.parseQueryParams.bind(this);
    }
    
    redirect(location) {
        this.props.history.push(location);
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

        return (
            <div className="content-with-market-bg">
                    <div className="market-bg-image">
                            <div className="image" style={{backgroundImage:"url('assets/images/loans.jpg')"}}></div>
                            <div className="bg-overlay"></div>
                            <div className="market-bg-content">
                                <h1>EASY LOAN</h1>
                                <div className="row justify-content-center mt-20">
                                    <div className="col-md-2"><p className="market-bg-feature">Secured</p></div>
                                    <div className="col-md-2"><p className="market-bg-feature">Asset Backed</p></div>
                                    <div className="col-md-2"><p className="market-bg-feature">Flexible Terms</p></div>
                                </div>
                                <div className="row mt-30 how-it-works">
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
                                <Link to="/create"><span className="btn cognito orange small icon mb-15 btn-market-borrow"><img src="assets/images/borrow.png" height="20" alt="Borrow" /> Borrow</span></Link>
                            </Col>
                        </Row>
                    </div>
                    {/* <!-- widgets --> */}
                    <Row className="open-request-table">
                            
                        <Col md={12} className="mb-30">
                        <Card className="card-statistics h-100 p-3">
                            
                            <CardBody>
                                <div className="d-block d-md-flex justify-content-between" style={{ position: "relative" }}>
                                    <div className="d-block w-100">
                                        <CardTitle>Open Requests</CardTitle>
                                    </div>
                                </div>
                                <DharmaConsumer>
                                    {(dharmaProps) => (
                                        <LoanRequests
                                            authenticated={this.props.authenticated}
                                            token={this.props.token}
                                            dharma={dharmaProps.dharma}
                                            redirect={this.redirect}
                                            highlightRow={highlightRow}
                                        />
                                    )}
                                </DharmaConsumer>
                            </CardBody>
                        </Card>
                    </Col>

                    </Row>


                    <Row className="recent-funded-loans-table">
                            
                        <Col md={12} className="mb-30">
                        <Card className="card-statistics h-100 p-3">
                            <CardBody>
                                <CardTitle>Recent Funded Loans</CardTitle>
                                <DharmaConsumer>
                                    { (dharmaProps) => {
                                        return <FundedLoans 
                                        dharma={ dharmaProps.dharma }
                                        redirect={this.redirect}
                                        />
                                    } }
                                </DharmaConsumer>
                            </CardBody>
                        </Card>
                    </Col>

                    </Row>
                
            </div>

        );
    }
}
export default Market;