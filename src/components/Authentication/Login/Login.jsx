import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import _ from 'lodash';
import cognitoImg from "../../../assets/images/logo.svg";
import etherImg from "../../../assets/images/eth-image.png";
import dharmaImg from "../../../assets/images/dharma-logo.png";
import loanImg from "../../../assets/images/loans.jpg";
import loanBaselogoImg from "../../../assets/images/loanbase.svg";
import transparencyImg from "../../../assets/images/transparency.svg";
import alertsImg from "../../../assets/images/alerts.svg";
import assetBackedImg from "../../../assets/images/asset_backed.svg";
import easyImg from "../../../assets/images/easy.svg";
import noFeesImg from "../../../assets/images/no_fees.svg";
import peerTopeerImg from "../../../assets/images/peer_to_peer.svg";
import auth from '../../../utils/auth';
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
        let { isWeb3Enabled } = this.props;
        const authToken = auth.getToken();
        let formTemplate = <LoginForm {...this.props} updateUrlPathProp={this.updateUrlPathProp} locationState={this.props.location.state} historyPush={this.props.history} />;

        if (urlPath == "register") {
            formTemplate = <RegisterForm {...this.props} updateUrlPathProp={this.updateUrlPathProp} historyPush={this.props.history} />;
        }
        else if (urlPath == "forgot") {
            formTemplate = <ForgotForm {...this.props} updateUrlPathProp={this.updateUrlPathProp} historyPush={this.props.history} />;
        }
        else if (urlPath == "password-reset") {
            formTemplate = <ResetForm {...this.props} updateUrlPathProp={this.updateUrlPathProp} token={this.props.match.params.token} historyPush={this.props.history} />;
        }
        else if (urlPath == "email-verify") {
            formTemplate = <EmailVerifyForm {...this.props} updateUrlPathProp={this.updateUrlPathProp} token={this.props.match.params.token} historyPush={this.props.history} locationState={this.props.location.state} />;
        }
        else if (urlPath == "email-unsubscribe") {
            formTemplate = <Unsubscribe {...this.props} updateUrlPathProp={this.updateUrlPathProp} token={this.props.match.params.token} historyPush={this.props.history} locationState={this.props.location.state} />;
        }

        return (
            <div className="login-container">
                <section>
                    <div className="login-bg-image min-height-85vh--lg">
                        <div className="image" style={{ backgroundImage: "url('" + loanImg + "')" }}></div>
                        <div className="login-bg-overlay"></div>

                        <div className="row pt-50 pb-50 h-100-lg justify-content-lg-between align-items-lg-center">
                            <div className="col-md-8">
                                <div className="header-image-content text-left">
                                    <div className="row">
                                        <div className="col-md-1"></div>
                                        <div className="col-md-10">
                                            <h1>Tokenized P2P Debt Market Place</h1>
                                            <h4>Leverage your digital assets without losing your position.</h4>
                                            <p className="mt-30 header-image-p">
                                                Loanbase provides access to dharma - universal protocol for credit on the blockchain. Cryptocurrency investors aka HODL’ers can continue holding their favourite cryptocurrencies and release liquidity.
                                            </p>
                                            <p className="mt-30 header-image-p">
                                                <Link to="/market" className="btn btn-theme cognito">Explore Market</Link>

                                            </p>
                                        </div>
                                        <div className="col-md-1"></div>
                                    </div>
                                </div>
                            </div>
                            {
                                _.isNull(authToken) && isWeb3Enabled && (
                                    <div className="col-md-4">

                                        <div className="row">

                                            <div className="col-md-11">
                                                <div className="login-form p-4 mr-30">
                                                    {formTemplate}
                                                </div>
                                                <div className="col-md-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </section>

                <section className="loanbase-container">
                    <div className="pt-50 pb-50 container">
                        <h3 className="text-center mb-50 loan-base-title">Why Loanbase?</h3>
                        <div className="row features-row">
                            <div className="col-md-4 mb-5">
                                <div className="text-center px-lg-3">
                                    <img className="max-width-14 mb-2" src={transparencyImg} alt="Transparency" />
                                    <h3 className="h4">Transparency</h3>
                                    <p className="mb-0">All transactions are broadcasted to ethereum blockchain, Hence highly transparent and instantly auditable.</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-5">
                                <div className="text-center px-lg-3">
                                    <img className="max-width-14 mb-2" src={assetBackedImg} alt="Secured" />
                                    <h3 className="h4">Secured</h3>
                                    <p className="mb-0">Loans are secured against collateral held by smart contracts. No counterparty risk.</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-5">
                                <div className="text-center px-lg-3">
                                    <img className="max-width-14 mb-2" src={easyImg} alt="Easy" />
                                    <h3 className="h4">Easy</h3>
                                    <p className="mb-0">Our Personalised Dashboard gives you instant access to your loan portfolio.</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-5">
                                <div className="text-center px-lg-3">
                                    <img className="max-width-14 mb-2" src={alertsImg} alt="Alerts" />
                                    <h3 className="h4">Alerts</h3>
                                    <p className="mb-0">We will send notification for repayments and alert you if the loan defaults.</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-5">
                                <div className="text-center px-lg-3">
                                    <img className="max-width-14 mb-2" src={noFeesImg} alt="No Fees" />
                                    <h3 className="h4">No Fees</h3>
                                    <p className="mb-0">Zero fee lending while in beta. Pay only gas for processing transactions on the Ethereum blockchain</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-5">
                                <div className="text-center px-lg-3">
                                    <img className="max-width-14 mb-2" src={peerTopeerImg} alt="Peer to Peer" />
                                    <h3 className="h4">Peer to Peer</h3>
                                    <p className="mb-0">Lenders and Borrowers are connected without intermediaries</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-it-works-container">
                    <div className="pt-50 pb-50 container">
                        <div className="mb-50">
                            <h3 className="text-center color-white loan-base-title">How it works?</h3>
                        </div>

                        <div className="login-bg-content pb-50">
                            <h5 className="text-left color-white loan-base-border-left">Borrower</h5>
                            <div className="row mt-20 how-it-works">
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 1</h5>
                                        <p >Login to Loanbase</p>
                                        <h6>Create Loan Request</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 2</h5>
                                        <p>Authorize Smart Contract</p>
                                        <h6>Unlock Collateral</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 3</h5>
                                        <p>Publish in Loanbase Marketplace</p>
                                        <h6>Get Funded</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 4</h5>
                                        <p>Repay Loan</p>
                                        <h6>Get Collateral back in full</h6>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="login-bg-content">
                            <h5 className="text-left color-white loan-base-border-left">Lender</h5>
                            <div className="row mt-20 how-it-works">
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 1</h5>
                                        <p>Login to Loanbase</p>
                                        <h6>Browser MarketPlace</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 2</h5>
                                        <p>Authorize Smart Contract</p>
                                        <h6>Unlock Principle</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 3</h5>
                                        <p>Fund a Loan from Marketplace</p>
                                        <h6>Fund Loan</h6>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="loanbase-step-container">
                                        <h5>Step 4</h5>
                                        <p>Track Repayments in My Loans</p>
                                        <h6>Earn Interest</h6>
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
            </div >
        );
    }
}
export default Login;