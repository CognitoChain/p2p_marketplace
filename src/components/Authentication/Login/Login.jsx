import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import _ from 'lodash';
import logoImg from "../../../assets/images/logo.svg";
import cognitoImg from "../../../assets/images/cognito_logo.svg";
import etherImg from "../../../assets/images/eth-image.png";
import dharmaImg from "../../../assets/images/dharma-logo.png";
import loanImg from "../../../assets/images/loans.jpg";
import loanBaselogoImg from "../../../assets/images/loanbase.svg";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotForm from "./ForgotForm";
import ResetForm from "./ResetForm";
import EmailVerifyForm from "./EmailVerifyForm";
import Unsubscribe from "./Unsubscribe";

import './Login.css';
class Login extends React.Component {
    constructor(props) {
        super(props);
        let urlPath = (this.props.urlpath != '' && this.props.urlpath != null) ? this.props.urlpath : '';
        this.state = {
            urlPath: urlPath
        };
        this.updateUrlPathProp = this.updateUrlPathProp.bind(this);
    }

    updateUrlPathProp(urlPathValue) {
        if (!_.isUndefined(urlPathValue)) {
            this.setState({ urlPath: urlPathValue });
            this.props.history.push('/' + urlPathValue);
        }
    }

    render() {
        let { urlPath } = this.state;
        const { authenticated } = this.props;
        let formTemplate = <LoginForm updateUrlPathProp={this.updateUrlPathProp} locationState={this.props.location.state} historyPush={this.props.history} />;

        if (urlPath == "register") {
            formTemplate = <RegisterForm updateUrlPathProp={this.updateUrlPathProp} />;
        }
        else if (urlPath == "forgot") {
            formTemplate = <ForgotForm updateUrlPathProp={this.updateUrlPathProp} />;
        }
        else if (urlPath == "password-reset") {
            formTemplate = <ResetForm updateUrlPathProp={this.updateUrlPathProp} token={this.props.match.params.token} historyPush={this.props.history} />;
        }
        else if (urlPath == "email-verify") {
            formTemplate = <EmailVerifyForm updateUrlPathProp={this.updateUrlPathProp} token={this.props.match.params.token} historyPush={this.props.history} locationState={this.props.location.state} />;
        }
        else if (urlPath == "email-unsubscribe") {
            formTemplate = <Unsubscribe updateUrlPathProp={this.updateUrlPathProp} token={this.props.match.params.token} historyPush={this.props.history} locationState={this.props.location.state} />;
        }

        return (
            <div className="login-container">
                <section className="header">
                    <nav className="admin-header navbar navbar-default col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                        <div className="text-left navbar-brand-wrapper">
                            <Link className="navbar-brand brand-logo" to="/"><img src={logoImg} alt="" /></Link>
                            <Link className="navbar-brand brand-logo-mini" to="/"><img src={logoImg} alt="" /></Link>
                        </div>
                    </nav>
                </section>

                <section>
                    <div className="login-bg-image">
                        <div className="image" style={{ backgroundImage: "url('" + loanImg + "')" }}></div>
                        <div className="login-bg-overlay"></div>

                        <div className="container-fluid">
                            <div className="login-bg-content">
                                <div className="outer-container">
                                    <div className="inner-container">
                                        <div className="centered-content">
                                            <div className="row mt-70 how-it-works mb-70">
                                                <div className={authenticated ?"col-md-12":"col-md-8"}>
                                                    <div className="header-image-content text-left">
                                                        <div className="row">
                                                            <div className="col-md-1"></div>
                                                            <div className="col-md-10">
                                                                <h1>Tokenized P2P Debt Market Place</h1>
                                                                <h4>Leverage your digital assets without losing your position.</h4>
                                                                <p className="mt-30 header-image-p">
                                                                    Loanbase provides access to dharma - universal protocol for credit on the blockchain. Cryptocurrency investors aka HODL’ers can continue holding their favourite cryptocurrencies and release liquidity.
                                                  </p>
                                                            </div>
                                                            <div className="col-md-1"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {
                                                    !authenticated && (
                                                        <div className="col-md-4">
                                                            <div className="login-form p-4 mr-30">
                                                                {formTemplate}
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="loanbase-container">
                    <div className="pt-50 pb-50 container">
                        <h3 className="text-center mb-30">Why Loanbase?</h3>
                        <div className="row">
                            <div className="col-md-4 text-center row-eq-height">
                                <div className="loanbase-step-container pt-3 pb-5 pl-5 pr-5">
                                    <span className="color-circle"></span>
                                    <h6>Transparency</h6>
                                    <p>All transactions are broadcasted to ethereum blockchain, Hence highly transparent and instantly auditable.</p>
                                </div>
                            </div>
                            <div className="col-md-4 text-center row-eq-height">
                                <div className="loanbase-step-container pt-3 pb-5 pl-5 pr-5">
                                    <span className="color-circle"></span>
                                    <h6>Asset Backed</h6>
                                    <p>Loans are secured against collateral held by smart contracts.</p>
                                </div>
                            </div>
                            <div className="col-md-4 text-center row-eq-height">
                                <div className="loanbase-step-container pt-3 pb-5 pl-5 pr-5">
                                    <span className="color-circle"></span>
                                    <h6>Easy</h6>
                                    <p>Relax! Our Personalised Dashboard gives you instant access to your loan portfolio. We will send notification for repayments and alert you if the loan is defaulted.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-it-works-container">
                    <div className="pt-50 pb-50 container">
                        <div className="mb-20">
                            <h3 className="text-center color-white">How it works?</h3>
                        </div>

                        <div className="login-bg-content">
                            <h5 className="text-left color-white">Borrower</h5>
                            <div className="row mt-20 how-it-works">
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 1</h5>
                                        <p>Login to Cognitochain Marketplace</p>
                                        <h6>Create Loan Request</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 2</h5>
                                        <p>Authorize Smart Contract</p>
                                        <h6>Unlock Collateral</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 3</h5>
                                        <p>Publish in Cognitochain Marketplace</p>
                                        <h6>Get Funded</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 4</h5>
                                        <p>Repay Loan</p>
                                        <h6>Get Collateral back in full</h6>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="login-bg-content">
                            <h5 className="text-left color-white">Lender</h5>
                            <div className="row mt-20 how-it-works">
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 1</h5>
                                        <p>Login to Cognitochain Marketplace</p>
                                        <h6>Create Loan Request</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 2</h5>
                                        <p>Authorize Smart Contract</p>
                                        <h6>Unlock Collateral</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 3</h5>
                                        <p>Publish in Cognitochain Marketplace</p>
                                        <h6>Get Funded</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="step-container p-1">
                                        <h5 className="text-muted">Step 4</h5>
                                        <p>Repay Loan</p>
                                        <h6>Get Collateral back in full</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="powered-by-container">
                    <div className="container pt-50 pb-50">
                        <div className="row text-center h-100 justify-content-center align-items-center">
                            <div className="col-md-3">
                                <h2>Powered By</h2>
                            </div>
                            <div className="col-md-3">
                                <img src={cognitoImg} alt="" />
                            </div>
                            <div className="col-md-3">
                                <img src={etherImg} alt="" />
                            </div>
                            <div className="col-md-3">
                                <img src={dharmaImg} alt="" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="loanbase-logo-container">
                    <div className="container pt-20 pb-20 text-center">
                        <img src={loanBaselogoImg} alt="Loan Base" height={150} />
                    </div>
                </section>

                <section className="bg-white">
                    <footer className="p-4 container-fluid">
                        <Row>
                            <Col md={6}>
                                <div className="text-center text-md-left">
                                    <p className="mb-0"> © Copyright <span id="copyright"> 2018</span>.Cognitochain All Rights Reserved. </p>
                                </div>
                            </Col>
                            <Col md={6}>
                                <ul className="text-center text-md-right">
                                    <li className="list-inline-item"><a href="terms" target="_blank">Terms &amp; Conditions | </a> </li>
                                    <li className="list-inline-item"><a href="privacy" target="_blank">Privacy Policy </a> </li>
                                </ul>
                            </Col>
                        </Row>
                    </footer>
                </section>
            </div>
        );
    }
}
export default Login;