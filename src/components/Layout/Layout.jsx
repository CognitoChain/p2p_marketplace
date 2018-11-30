// External libraries
import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
// Components
import Basepages from './Basepages';
import Base from './Base';
import Login from '../Authentication/Login/Login';
import Market from '../Market/Market';
import Create from "../../containers/CreateLoan";
import WalletContainer from "../../containers/Wallet";
import Success from '../Success/Success';
import Privacy from '../Privacy/Privacy';
import TermsConditions from '../TermsConditions/TermsConditions';
import { withRouter } from 'react-router-dom';
import DashboardContainer from '../../containers/Dashboard';
import LoanRequestsContainer from "../../containers/LoanRequests";
import CreateLoanRequestContainer from "../../containers/CreateLoanRequest";
import TokensContainer from "../../containers/Tokens";
import LoanRequestContainer from "../../containers/LoanRequest";
import InvestmentsContainer from "../../containers/Investments";
import DetailContainer from "../../containers/Detail";
import FundContainer from '../../containers/Fund';
import ChangePassword from '../ChangePassword/ChangePassword';
import _ from "lodash";
import Api from "../../services/api";
const PrivateRoute = ({ component: Component, authenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => authenticated === true
        ? <Component {...rest} {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />}
    />
  )
}
const PublicRoute = ({ component: Component, authenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => authenticated === false
        ? <Component {...rest} {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
    />
  )
}
let currentLocation;
class Layout extends Component {
  constructor(props) {
    super(props);
    let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
    currentMetamaskAccount = (!_.isUndefined(currentMetamaskAccount) && currentMetamaskAccount != '' && currentMetamaskAccount != null) ? currentMetamaskAccount : '';
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const socialLogin = localStorage.getItem('socialLogin');
    const authenticated = ((token && token !== null) ? true : false);
    let isWeb3Enabled = true;
    if (!window.web3) {
      isWeb3Enabled = false
    }
    this.state = {
      currentMetamaskAccount: currentMetamaskAccount,
      reloadDetails: false,
      isModalMessageOpen: false,
      isWeb3Enabled,
      isUserMetaMaskPermission: false,
      isMetaMaskAuthRised :false,
      isUserMetaMaskPermissionAsked:false,
      token,
      userEmail,
      socialLogin,
      authenticated,
      networkId: '',
      wrongMetamaskNetwork: false,
      wrongMetamskNetworkMsg: ''
    };
    this.logout = this.logout.bind(this);
    this.updateMetamaskAccount = this.updateMetamaskAccount.bind(this);
    this.updateMetaMaskLoading = this.updateMetaMaskLoading.bind(this);
    this.metamaskPermission = this.metamaskPermission.bind(this);
    this.updateMetaMaskAuthorized = this.updateMetaMaskAuthorized.bind(this);
    this.setLoginData = this.setLoginData.bind(this);
  }
  logout(msg) {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.updateMetamaskAccount('', false);
    this.setLoginData();
    if(!_.isUndefined(msg))
    {
      this.props.history.push({
        pathname: '/login',
        state: { message: msg }
      });
    }
    else{
      this.props.history.push("/login");
    }
  }
  setLoginData(){
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    const socialLogin = localStorage.getItem('socialLogin');
    const authenticated = ((token && token !== null) ? true : false);
    this.setState({
      token,
      userEmail,
      socialLogin,
      authenticated
    })
  }
  componentDidMount() {
    this.checkNetworkId();
  }
  componentDidUpdate() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  updateMetaMaskLoading(iscurrentMetamaskAccountLoading) {
    this.setState({
      iscurrentMetamaskAccountLoading
    })
  }
  async updateMetamaskAccount(newMetamaskAccount, reloadDetails) {
    newMetamaskAccount = (!_.isUndefined(newMetamaskAccount) && newMetamaskAccount != '' && newMetamaskAccount != null) ? newMetamaskAccount : '';
    this.updateMetamaskAccountData(newMetamaskAccount, reloadDetails)
  }
  async updateMetamaskAccountData(newMetamaskAccount, reloadDetails) {
    let { token, isUserMetaMaskPermission } = this.state;
    console.log("updateMetamaskAccountData")
    if (newMetamaskAccount) {
      isUserMetaMaskPermission = true;
      localStorage.setItem('currentMetamaskAccount', newMetamaskAccount);
      if (this.state.currentMetamaskAccount != newMetamaskAccount) {
        const api = new Api();
        api.setToken(token).create("user/wallet", {
          address: newMetamaskAccount
        });
      }
    }
    else {
      isUserMetaMaskPermission = false;
      localStorage.removeItem('currentMetamaskAccount');
    }
    this.setState({ currentMetamaskAccount: newMetamaskAccount, reloadDetails, updateMetaMaskLoading: false, isUserMetaMaskPermission }, () => {
      this.updateMetaMaskAuthorized();
     });
    
  }
  updateMetaMaskAuthorized(){
    const { isUserMetaMaskPermission,isUserMetaMaskPermissionAsked } = this.state;
    const isMetaMaskAuthRised = (isUserMetaMaskPermission == true && isUserMetaMaskPermissionAsked==false);
    this.setState({
      isMetaMaskAuthRised
    })
  }
  async metamaskPermission() {
    const { authenticated } = this.state;
    if (!authenticated) {
      return;
    }
    this.setState({ isUserMetaMaskPermission: false,isUserMetaMaskPermissionAsked:true }, () => {
      this.updateMetaMaskAuthorized();
     })
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
        this.setState({ isUserMetaMaskPermission: true ,isUserMetaMaskPermissionAsked:false}, () => {
          this.updateMetaMaskAuthorized();
         })
      } catch (error) {
        this.setState({ isUserMetaMaskPermission: false,isUserMetaMaskPermissionAsked:false }, () => {
          this.updateMetaMaskAuthorized();
         })
        console.log("User denied account access...");
      }
    }
    else if (window.web3) {
      this.setState({ isUserMetaMaskPermission: true,isUserMetaMaskPermissionAsked:false }, () => {
        this.updateMetaMaskAuthorized();
       })
    }
  }
  checkNetworkId() {
    const { isWeb3Enabled } = this.state;
    let networkId = isWeb3Enabled ? window.web3.version.network : null;
    let wrongMetamskNetworkMsg = '';
    let wrongMetamaskNetwork = false;
    if (isWeb3Enabled) {
      if (process.env.REACT_APP_METAMASK_NETWORK == "kovan" && networkId != "42" && networkId != null) {
        wrongMetamskNetworkMsg = 'Please connect to Kovan Test Network in metamask.';
        wrongMetamaskNetwork = true;
      }
      else if (process.env.REACT_APP_METAMASK_NETWORK == "main" && networkId != "1" && networkId != null) {
        //networkId != "1"
        wrongMetamskNetworkMsg = 'Please connect to Main Ethereum Network in metamask.';
        wrongMetamaskNetwork = true;
      }
    }
    this.setState({
      networkId,
      wrongMetamaskNetwork,
      wrongMetamskNetworkMsg
    })
  }
  renderAuthenticationRoute() {
    return (
      <Basepages {...this.state} metamaskPermission={this.metamaskPermission} logout={this.logout} currentLocation={currentLocation} updateMetamaskAccount={this.updateMetamaskAccount} updateMetaMaskLoading={this.updateMetaMaskLoading}>
        <PublicRoute {...this.state} path="/login" exact={true} component={Login} urlpath={currentLocation} setLoginData={this.setLoginData} />
        <PublicRoute {...this.state} path="/email-verify/" exact={true} component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/email-verify/:token" exact={true} component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/register" component={Login} urlpath={currentLocation} setLoginData={this.setLoginData} />
        <PublicRoute {...this.state} path="/forgot" component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/password-reset/:token" exact={true} component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/email-unsubscribe/:token" exact={true} component={Login} urlpath={currentLocation} />
      </Basepages>
    );
  }
  renderAuthenitcatedRoute() {
    const { authenticated, socialLogin } = this.state;
    return (
      <Base metamaskPermission = {this.metamaskPermission} logout={this.logout} currentLocation={currentLocation} updateMetamaskAccount={this.updateMetamaskAccount} updateMetaMaskLoading={this.updateMetaMaskLoading} {...this.state}>
        <Switch>
          <Route path='/market'
            render={() =>
              <Market {...this.props} {...this.state} />
            }
          />
          <PrivateRoute {...this.state} path='/dashboard' component={DashboardContainer} />
          <PrivateRoute {...this.state} path="/wallet" component={WalletContainer} />
          <PrivateRoute {...this.state} path="/loanrequests" component={LoanRequestsContainer} />
          <PrivateRoute path="/createold" {...this.state} component={CreateLoanRequestContainer} />
          <PrivateRoute {...this.state} path="/create" component={Create} />
          <PrivateRoute {...this.state} path="/tokens" component={TokensContainer} />
          <PrivateRoute {...this.state} path="/request/:id" component={LoanRequestContainer} />
          <PrivateRoute {...this.state} path="/detail/:id" component={DetailContainer} />
          <PrivateRoute {...this.state} path="/investments" component={InvestmentsContainer} />
          <PrivateRoute {...this.state} path="/success" component={Success} />
          <PrivateRoute {...this.state} path="/fund/:id" component={FundContainer} />
          {
            <PrivateRoute {...this.state} authenticated={authenticated && socialLogin == "no"} path="/change-password" component={ChangePassword} logout={this.logout} />
          }
        </Switch>
      </Base>
    )
  }
  renderHomeRoute() {
    return (
      <Basepages {...this.state} metamaskPermission={this.metamaskPermission} logout={this.logout} currentLocation={currentLocation} updateMetamaskAccount={this.updateMetamaskAccount} updateMetaMaskLoading={this.updateMetaMaskLoading}>
        <Route exact={true} path='/'
          render={() =>
            <Login {...this.props} {...this.state} urlpath={currentLocation} />
          }
        />
        <Route exact={true} path='/privacy'
          render={() =>
            <Privacy {...this.props} {...this.state} />
          }
        />
        <Route exact={true} path='/terms'
          render={() =>
            <TermsConditions {...this.props} {...this.state} />
          }
        />
      </Basepages>
    )
  }
  render() {
    const urlString = this.props.location.pathname.substr(1);
    const urlStringArr = urlString.split("/");
    currentLocation = urlStringArr[0];
    let path = ["login", "register", "email-verify", "forgot", "password-reset", "email-unsubscribe"];
    let homeRoutes = ["privacy", "terms"];
    return (
      <div>
        {path.indexOf(currentLocation) > -1 && this.renderAuthenticationRoute()}
        {(currentLocation == '' || homeRoutes.indexOf(currentLocation) > -1) && this.renderHomeRoute()}
        {path.indexOf(currentLocation) === -1 && currentLocation != '' && homeRoutes.indexOf(currentLocation) == -1 && this.renderAuthenitcatedRoute()}

      </div>
    )

  }
}

export default withRouter(Layout);