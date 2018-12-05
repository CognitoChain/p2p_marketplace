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
import GDPR from "../GDPR/GDPR";
import Disclaimer from "../Disclaimer/Disclaimer";
import CookiePolicy from "../CookiePolicy/CookiePolicy";
import auth from '../../utils/auth';

let currentLocation = '';
let loginCheckInterval;
const PrivateRoute = ({ component: Component, ...rest }) => {
  let messageLoginPage = '', messageClass = '';
  // console.log("PrivateRoute")
  // console.log(messageLoginPage)
  const authToken = auth.getToken();
  if (authToken == null) {
    messageLoginPage = "LOGIN_REQUIRED";
    messageClass = "warning";
  }
  //console.log(messageLoginPage)
  return (
    <div>
      <Route
        {...rest}
        render={(props) => !_.isNull( authToken)
          ? <Component {...rest} {...props} />
          : <Redirect to={{ pathname: '/login', state: { from: props.location, message: messageLoginPage, messageClass } }} />}
      />
    </div>
  )
}
const PublicRoute = ({ component: Component, ...rest }) => {
  const authToken = auth.getToken();
  return (
    <Route
      {...rest}
      render={(props) => _.isNull(authToken)
        ? <Component {...rest} {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
    />
  )
}

class Layout extends Component {
  constructor(props) {
    super(props);
    let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
    currentMetamaskAccount = (!_.isUndefined(currentMetamaskAccount) && currentMetamaskAccount != '' && currentMetamaskAccount != null) ? currentMetamaskAccount : '';

    let isWeb3Enabled = true;
    if (!window.web3) {
      isWeb3Enabled = false
    }
    this.state = {
      currentMetamaskAccount: currentMetamaskAccount,
      oldCurrentMetamaskAccount:'',
      reloadDetails: false,
      isModalMessageOpen: false,
      isWeb3Enabled,
      isUserMetaMaskPermission: false,
      isMetaMaskAuthRised: false,
      isUserMetaMaskPermissionAsked: false,
      networkId: '',
      wrongMetamaskNetwork: false,
      wrongMetamskNetworkMsg: ''      
    };
    this.logout = this.logout.bind(this);
    this.updateMetamaskAccount = this.updateMetamaskAccount.bind(this);
    this.updateMetaMaskLoading = this.updateMetaMaskLoading.bind(this);
    this.metamaskPermission = this.metamaskPermission.bind(this);
    this.updateMetaMaskAuthorized = this.updateMetaMaskAuthorized.bind(this);
    this.updateReloadDetails = this.updateReloadDetails.bind(this);
    this.checkLogin = this.checkLogin.bind(this);
  }
  logout(msg, message_type) {
    auth.clearToken();
    auth.clearUserInfo();
    clearInterval(loginCheckInterval)
    loginCheckInterval = false;
    this.props.history.push({
      pathname: '/login',
      state: { message: msg, messageClass: message_type }
    });
  }
  checkLogin() {
    const authToken = auth.getToken();
    if (!_.isNull(authToken)) {
      console.log("Interval Started")
      loginCheckInterval = setInterval(() => {
        const updatedToken = auth.getToken();
        if (_.isNull(updatedToken)) {
          this.logout("TOKEN_EXPIRED", "warning");
        }
      }, 1500)
    }
  }
  componentDidMount() {
    this.checkNetworkId();
    this.checkLogin()
  }
  componentWillUnmount() {
    console.log("Interval Cleared unmount")
    clearInterval(loginCheckInterval)
    loginCheckInterval = false;
  }
  componentDidUpdate() {
    // window.scroll({
    //   top: 0,
    //   left: 0,
    //   behavior: 'smooth'
    // });
  }
  updateMetaMaskLoading(iscurrentMetamaskAccountLoading) {
    this.setState({
      iscurrentMetamaskAccountLoading
    })
  }
  updateReloadDetails() {
    this.setState({
      reloadDetails:false
    });
  }
  async updateMetamaskAccount(newMetamaskAccount, reloadDetails) {
    newMetamaskAccount = (!_.isUndefined(newMetamaskAccount) && newMetamaskAccount != '' && newMetamaskAccount != null) ? newMetamaskAccount : '';
    this.updateMetamaskAccountData(newMetamaskAccount)
  }
  async updateMetamaskAccountData(newMetamaskAccount) {
    let { isUserMetaMaskPermission,currentMetamaskAccount } = this.state;
    console.log("updateMetamaskAccountData")
    if (newMetamaskAccount) {
      isUserMetaMaskPermission = true;
      localStorage.setItem('currentMetamaskAccount', newMetamaskAccount);
      if (this.state.currentMetamaskAccount != newMetamaskAccount) {
        const authToken = auth.getToken();
        const api = new Api();
        api.setToken(authToken).create("user/wallet", {
          address: newMetamaskAccount
        });
      }
    }
    else {
      isUserMetaMaskPermission = false;
      localStorage.removeItem('currentMetamaskAccount');
    }

    this.setState({ oldCurrentMetamaskAccount:currentMetamaskAccount,currentMetamaskAccount: newMetamaskAccount, updateMetaMaskLoading: false, isUserMetaMaskPermission }, () => {
      this.updateMetaMaskAuthorized();
    });
  }
  updateMetaMaskAuthorized() {
    const { isUserMetaMaskPermission, isUserMetaMaskPermissionAsked,oldCurrentMetamaskAccount,isMetaMaskAuthRised,currentMetamaskAccount } = this.state;
    const isMetaMaskAuthRisedNew = (isUserMetaMaskPermission == true && isUserMetaMaskPermissionAsked == false);
    console.log("Layout jsx isMetaMaskAuthRised");
    console.log(isMetaMaskAuthRisedNew);
    let reloadDetails = false;
    if (isMetaMaskAuthRised != isMetaMaskAuthRisedNew ) {
      reloadDetails = true
    }
    else if (isMetaMaskAuthRised && oldCurrentMetamaskAccount != currentMetamaskAccount ) {
      reloadDetails = true
    }
    this.setState({
      isMetaMaskAuthRised:isMetaMaskAuthRisedNew,
      reloadDetails
    })
  }
  async metamaskPermission() {
    const authToken = auth.getToken();
    if (!authToken) {
      return;
    }
    this.setState({ isUserMetaMaskPermission: false, isUserMetaMaskPermissionAsked: true }, () => {
      this.updateMetaMaskAuthorized();
    })
    if (window.ethereum) {
      try {
        console.log("aaa")
        await window.ethereum.enable();
        this.setState({ isUserMetaMaskPermission: true, isUserMetaMaskPermissionAsked: false }, () => {
          this.updateMetaMaskAuthorized();
        })
      } catch (error) {
        this.setState({ isUserMetaMaskPermission: false, isUserMetaMaskPermissionAsked: false }, () => {
          this.updateMetaMaskAuthorized();
        })
        console.log("User denied account access...");
      }
    }
    else if (window.web3) {
      this.setState({ isUserMetaMaskPermission: true, isUserMetaMaskPermissionAsked: false }, () => {
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
      <Basepages {...this.state} metamaskPermission={this.metamaskPermission} logout={this.logout} currentLocation={currentLocation} updateReloadDetails={this.updateReloadDetails}  updateMetamaskAccount={this.updateMetamaskAccount} updateMetaMaskLoading={this.updateMetaMaskLoading}>
        <PublicRoute {...this.state} path="/login" exact={true} component={Login} urlpath={currentLocation} checkLogin={this.checkLogin} />
        <PublicRoute {...this.state} path="/email-verify/" exact={true} component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/email-verify/:token" exact={true} component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/register" component={Login} urlpath={currentLocation} checkLogin={this.checkLogin} />
        <PublicRoute {...this.state} path="/forgot" component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/password-reset/:token" exact={true} component={Login} urlpath={currentLocation} />
        <PublicRoute {...this.state} path="/email-unsubscribe/:token" exact={true} component={Login} urlpath={currentLocation} />
      </Basepages>
    );
  }
  renderAuthenitcatedRoute() {
    const authToken = auth.getToken();
    const authUserInfo = auth.getUserInfo();
    return (
      <Base metamaskPermission={this.metamaskPermission} logout={this.logout} currentLocation={currentLocation} updateMetamaskAccount={this.updateMetamaskAccount} updateMetaMaskLoading={this.updateMetaMaskLoading} updateReloadDetails={this.updateReloadDetails}  {...this.state}>
        <Switch>
          <Route path='/market'
            render={() =>
              <Market {...this.props} {...this.state} updateReloadDetails={this.updateReloadDetails} />
            }
          />
          <PrivateRoute {...this.state} path='/dashboard' component={DashboardContainer} updateReloadDetails={this.updateReloadDetails} />
          <PrivateRoute {...this.state} path="/wallet" component={WalletContainer} updateReloadDetails={this.updateReloadDetails}/>
          <PrivateRoute {...this.state} path="/loanrequests" component={LoanRequestsContainer} />
          <PrivateRoute path="/createold" {...this.state} component={CreateLoanRequestContainer} />
          <PrivateRoute {...this.state} path="/create" component={Create} updateReloadDetails={this.updateReloadDetails}/>
          <PrivateRoute {...this.state} path="/tokens" component={TokensContainer} />
          <PrivateRoute {...this.state} path="/request/:id" component={LoanRequestContainer} />
          <PrivateRoute {...this.state} path="/detail/:id" component={DetailContainer} updateReloadDetails={this.updateReloadDetails} />
          <PrivateRoute {...this.state} path="/investments" component={InvestmentsContainer} />
          <PrivateRoute {...this.state} path="/success" component={Success} />
          <PrivateRoute {...this.state} path="/fund/:id" component={FundContainer} />
          {
            <PrivateRoute {...this.state} authToken={authToken && authUserInfo.socialLogin == "no"} path="/change-password" component={ChangePassword} logout={this.logout} />
          }
        </Switch>
      </Base>
    )
  }
  renderHomeRoute() {
    return (
      <Basepages {...this.state} metamaskPermission={this.metamaskPermission} logout={this.logout} currentLocation={currentLocation} updateMetamaskAccount={this.updateMetamaskAccount} updateReloadDetails={this.updateReloadDetails}  updateMetaMaskLoading={this.updateMetaMaskLoading}>
        <Route exact={true} path='/'
          render={() =>
            <Login {...this.props} {...this.state} urlpath={currentLocation} checkLogin={this.checkLogin} />
          }
        />
        <Route exact={true} path='/privacy'
          render={() =>
            <Privacy {...this.props} {...this.state} />
          }
        />
        <Route exact={true} path='/gdpr'
          render={() =>
            <GDPR {...this.props} {...this.state} />
          }
        />
        <Route exact={true} path='/terms'
          render={() =>
            <TermsConditions {...this.props} {...this.state} />
          }
        />
        <Route exact={true} path='/disclaimer'
               render={() =>
                   <Disclaimer {...this.props} {...this.state} />
               }
        />
        <Route exact={true} path='/cookie-policy'
               render={() =>
                   <CookiePolicy {...this.props} {...this.state} />
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
    let homeRoutes = ["privacy","gdpr", "terms", "disclaimer", "cookie-policy"];
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