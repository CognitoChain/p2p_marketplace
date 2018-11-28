import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import logoImg from "../../assets/images/logo.svg?v1";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import Avatar from 'react-avatar';
class Header extends Component {

    constructor(props) {
        super(props);
        this.interval = '';
        this.state = {
            toggleactive: false,
            defaultValue: 1
        };
        this.togglebutton = this.togglebutton.bind(this);
    }
    togglebutton(toggleactive) {
        this.props.updateParent();
    };
    async componentWillMount() {
        const { dharma } = this.props;
    
        let currentAccount = await dharma.blockchain.getCurrentAccount();

        if (_.isUndefined(currentAccount)) {
            currentAccount = '';
        }
        this.props.updateMetamaskAccount(currentAccount, false);
        this.interval = setInterval(
            () => {
                this.checkAccount()
            }, 2500);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    async checkAccount() {
        const { dharma } = this.props;
        let currentAccount = await dharma.blockchain.getCurrentAccount();
        let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
        currentMetamaskAccount = (!_.isUndefined(currentMetamaskAccount) && currentMetamaskAccount != '' && currentMetamaskAccount != null) ? currentMetamaskAccount : '';
        if ((currentMetamaskAccount == '' && !_.isUndefined(currentAccount)) || (currentMetamaskAccount != String(currentAccount) & currentMetamaskAccount != '')) {
            this.props.refreshTokens();
            this.props.updateMetamaskAccount(currentAccount, true);
        }
    }
    render() {

        const { userEmail, wrongMetamskNetworkMsg, wrongMetamaskNetwork, currentMetamaskAccount, socialLogin, isUserMetaMaskPermission, authenticated, isUserMetaMaskPermissionLoading,iscurrentMetamaskAccountLoading } = this.props;
        return (
            <nav className="admin-header navbar navbar-default col-lg-12 col-12 p-0 fixed-top d-flex flex-row">

                <div className="text-left navbar-brand-wrapper">
                    <Link className="navbar-brand brand-logo" to="/"><img src={logoImg} alt="" /></Link>
                    <Link className="navbar-brand brand-logo-mini" to="/"><img src={logoImg} alt="" /></Link>
                </div>
                {/* <!-- Top bar left --> */}
                {/*<ul className="nav navbar-nav mr-auto">
                         <li className="nav-item">
                            <a className="button-toggle-nav inline-block ml-20 pull-left"  onClick={this.togglebutton} href="javascript:void(0);"  ><i className="zmdi zmdi-menu ti-align-right"></i></a>
                        </li>
                    </ul>*/}

                {/* <!-- top bar right --> */}
                <div className="ml-auto header-right-block">
                    {
                        wrongMetamaskNetwork === true && (
                            <CustomAlertMsg
                                bsStyle='danger'
                                extraClass="d-inline-block header-notice mb-0"
                                title={wrongMetamskNetworkMsg}
                            />
                        )
                    }
                    {
                        authenticated === true && wrongMetamaskNetwork == false && !isUserMetaMaskPermission && (
                            <CustomAlertMsg
                                bsStyle='danger'
                                extraClass="d-inline-block header-notice mb-0"
                                title="Please log in to Metamask and allow Loanbase to access your Metamask Account."
                            />
                        )
                    }
                    {
                        authenticated === true && wrongMetamaskNetwork == false &&  isUserMetaMaskPermission && currentMetamaskAccount != null && (
                            <label className="headerEthAddress">{currentMetamaskAccount}</label>
                        )
                    }
                    <ul className="nav navbar-nav d-inline-block">
                        <li className="nav-item dropdown mr-30">
                            {
                                authenticated === true && (
                                    <div>
                                        <div className="nav-link nav-pill user-avatar btn btn-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                            <Avatar name={userEmail} size="30px" round={true} />
                                        </div>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <div>
                                                <div className="dropdown-header">
                                                    <div className="media">
                                                        <div className="media-body">
                                                            <h5 className="mt-0 mb-0">Welcome</h5>
                                                            <span>{userEmail}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                {
                                                    socialLogin == "no" && <Link className="dropdown-item" to="/change-password"><i className="text-info ti-settings"></i>Change Password</Link>
                                                }
                                                <a className="dropdown-item" onClick={this.props.logout} href="javascript:void(0);"><i className="text-danger ti-unlock"></i>Logout</a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                authenticated === false && (
                                    <div className="header-links">
                                        <Link to="/login" className="btn btn-link cognito">Login / Register</Link>
                                    </div>
                                )
                            }
                        </li>
                    </ul>
                </div>
            </nav>
            //   End Header

        );
    }
}
export default Header;