import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import logoImg from "../../assets/images/logo.svg?v1";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import Avatar from 'react-avatar';
import auth from '../../utils/auth';

import { ethAddressDisplay } from "../../utils/Util";
class Header extends Component {

    constructor(props) {
        super(props);
        this.interval = '';
        this.state = {
            toggleactive: false,
            defaultValue: 1
        };
        this.togglebutton = this.togglebutton.bind(this);
        this.connectMetaMask = this.connectMetaMask.bind(this);
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
    componentWillReceiveProps(nextProps){
        if(nextProps.isMetaMaskAuthRised && nextProps.isMetaMaskAuthRised != this.props.isMetaMaskAuthRised){
            
        }
    }
    componentDidUpdate(prevProps) {
        // console.log("componentDidUpdate Header")
        // console.log(prevProps.reloadDetails)
        // console.log(this.props.reloadDetails)
        if(prevProps.reloadDetails != this.props.reloadDetails && this.props.reloadDetails == true){
            this.props.refreshTokens();    
            this.props.updateReloadDetails();
        }
    }
    async connectMetaMask() {
        await this.props.metamaskPermission();
    }
    async checkAccount() {
        const { dharma } = this.props;
        let currentAccount = await dharma.blockchain.getCurrentAccount();
        let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
        currentMetamaskAccount = (!_.isUndefined(currentMetamaskAccount) && currentMetamaskAccount != '' && currentMetamaskAccount != null) ? currentMetamaskAccount : '';
        currentAccount = (!_.isUndefined(currentAccount) && currentAccount != '' && currentAccount != null) ? currentAccount : '';
        if ((currentMetamaskAccount == '' && currentAccount != '') || (currentMetamaskAccount != String(currentAccount) & currentMetamaskAccount != '')) {
            this.props.updateMetamaskAccount(currentAccount, true);            
        }
    }
    render() {
        const authUserInfo = auth.getUserInfo();
        const {wrongMetamskNetworkMsg, wrongMetamaskNetwork, currentMetamaskAccount, isMetaMaskAuthRised, currentLocation, isWeb3Enabled } = this.props;
        const authToken = auth.getToken();
        let currentMetamaskAccountDisplay = ethAddressDisplay(currentMetamaskAccount);
        return (    
            <nav className="admin-header navbar navbar-default col-lg-12 col-12 p-0 fixed-top d-flex flex-row">

                <div className="text-left navbar-brand-wrapper">
                    <Link className="navbar-brand brand-logo" to="/"><img src={logoImg} alt="" /></Link>
                    <Link className="navbar-brand brand-logo-mini" to="/"><img src={logoImg} alt="" /></Link>
                </div>
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
                        isWeb3Enabled === false && (currentLocation == '' || currentLocation == 'login') && (
                            <CustomAlertMsg
                                bsStyle='danger'
                                extraClass="d-inline-block header-notice mb-0"
                                title="Your browser isn't Web3-enabled."
                            />
                        )
                    }
                    {
                        !_.isNull(authToken) && wrongMetamaskNetwork == false && !isMetaMaskAuthRised && (
                            // <CustomAlertMsg
                            //     bsStyle='danger'
                            //     extraClass="d-inline-block header-notice mb-0"
                            //     title="Please log in to Metamask and allow Loanbase to access your Metamask Account."
                            // />
                            <button className="btn orange cognito d-inline-block small" onClick={() => { this.connectMetaMask() }}>Connect your MetaMask</button>

                        )
                    }
                    {
                        !_.isNull(authToken) && wrongMetamaskNetwork == false && isMetaMaskAuthRised && (
                            <label className="headerEthAddress">{currentMetamaskAccountDisplay}</label>
                        )
                    }
                    <ul className="nav navbar-nav d-inline-block">
                        <li className="nav-item dropdown mr-30">
                            {
                                !_.isNull(authToken) && (
                                    <div>
                                        <div className="nav-link nav-pill user-avatar btn btn-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                            <Avatar name={authUserInfo.email} size="30px" round={true} />
                                        </div>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <div>
                                                <div className="dropdown-header">
                                                    <div className="media">
                                                        <div className="media-body">
                                                            <h5 className="mt-0 mb-0">Welcome</h5>
                                                            <span>{authUserInfo.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                {
                                                    authUserInfo.socialLogin == "no" && <Link className="dropdown-item" to="/change-password"><i className="text-info ti-settings"></i>Change Password</Link>
                                                }
                                                <a className="dropdown-item" onClick={() => { this.props.logout()}} href="javascript:void(0);"><i className="text-danger ti-unlock"></i>Logout</a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                _.isNull(authToken) && currentLocation != "login" && currentLocation != "" && (
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