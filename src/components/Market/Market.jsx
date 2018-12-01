import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import DharmaConsumer from "../../contexts/Dharma/DharmaConsumer";
import LoanRequests from "./LoanRequests/LoanRequests";
import FundedLoans from "./FundedLoans/FundedLoans";
import './Market.css';
import metamaskConnectionErrorImg from "../../assets/images/metamask_connection_error.png";
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
        const { wrongMetamaskNetwork } = this.props;
        return (
            <div className="content-with-market-bg">
                <div className="market-bg-image">
                    <div className="image" style={{ backgroundImage: "url('assets/images/loans.jpg')" }}></div>
                    <div className="bg-overlay"></div>
                    <div className="market-bg-content">
                        <h5>Digital assets backed loans got much easier. Here is how</h5>
                        <div className="row mt-30 how-it-works">
                            <div className="col-md-3 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 1</h5>
                                    <p className="title-text">Login to Loanbase</p>
                                    <h6>Create Loan Request</h6>
                                </div>
                            </div>
                            <div className="col-md-3 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 2</h5>
                                    <p className="title-text">Authorize Smart Contract</p>
                                    <h6>Unlock Collateral</h6>
                                </div>
                            </div>
                            <div className="col-md-3 p-2">
                                <div className="step-container p-2">
                                    <h5 className="text-muted">Step 3</h5>
                                    <p className="title-text">Publish in Loanbase Marketplace</p>
                                    <h6>Get Funded</h6>
                                </div>
                            </div>
                            <div className="col-md-3 p-2">
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
                        <Col sm={6}>
                            <h4 className="mb-0"> Market</h4>
                            <div className='delete-button' onClick={(item) => { if (window.confirm('Are you sure you wish to delete this item?')) this.onCancel(item) }} />
                        </Col>
                        <Col sm={6} className="pull-right text-right">
                            <Link to="/create"><span className="btn cognito orange small icon mb-15 btn-market-borrow"><img src="assets/images/borrow.png" height="20" alt="Borrow" /> Borrow</span></Link>
                        </Col>
                    </Row>
                </div>
                {!wrongMetamaskNetwork &&
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
                                                currentMetamaskAccount={this.props.currentMetamaskAccount}
                                                isTokenLoading={dharmaProps.isTokenLoading}
                                                reloadDetails={this.props.reloadDetails}
                                                updateReloadDetails={this.props.updateReloadDetails}
                                            />
                                        )}
                                    </DharmaConsumer>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                }
                {!wrongMetamaskNetwork &&
                    <Row className="recent-funded-loans-table">
                        <Col md={12} className="mb-30">
                            <Card className="card-statistics h-100 p-3">
                                <CardBody>
                                    <CardTitle>Recent Funded Loans</CardTitle>
                                    <DharmaConsumer>
                                        {(dharmaProps) => {
                                            return <FundedLoans
                                                dharma={dharmaProps.dharma}
                                                redirect={this.redirect}
                                            />
                                        }}
                                    </DharmaConsumer>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                }
                {wrongMetamaskNetwork &&
                    <div>
                        <Row className="mb-30">
                            <Col md={3}></Col>
                            <Col md={6}>
                                <img src={metamaskConnectionErrorImg} className="img-fluid" alt="Metamask Connection Error" />
                            </Col>
                            <Col md={3}></Col>
                        </Row>
                    </div>
                }
            </div>

        );
    }
}
export default Market;