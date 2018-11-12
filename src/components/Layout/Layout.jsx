// External libraries
import React, { Component } from "react";
import {Switch, Route, Redirect} from "react-router-dom";

// Components
import Basepages from './Basepages';
import Base from './Base';
import Login from '../Authentication/Login/Login';
import EmailVerify from '../EmailVerify/EmailVerify';
import Unsubscribe from '../Unsubscribe/Unsubscribe';
import Register from '../Authentication/Register/Register';

import Market from '../Market/Market';
/*import Wallet from '../Wallet/Wallet';*/
/*import Create from '../Create/Create';*/
import Create from "../../containers/CreateLoan";
import WalletContainer from "../../containers/Wallet";
import Success from '../Success/Success';
import Privacy from '../Privacy/Privacy';
import TermsConditions from '../TermsConditions/TermsConditions';
import {withRouter} from 'react-router-dom';

import DashboardContainer from '../../containers/Dashboard';
import LoanRequestsContainer from "../../containers/LoanRequests";
import CreateLoanRequestContainer from "../../containers/CreateLoanRequest";
import TokensContainer from "../../containers/Tokens";
import LoanRequestContainer from "../../containers/LoanRequest";
import InvestmentsContainer from "../../containers/Investments";
import DetailContainer from "../../containers/Detail";
import FundContainer from '../../containers/Fund';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import ResetPassword from '../ResetPassword/ResetPassword';
import ChangePassword from '../ChangePassword/ChangePassword';
import _ from "lodash";
import Api from "../../services/api";
const PrivateRoute = ({component: Component, authenticated, ...rest}) => {
    return (
      <Route
        {...rest}
        render={(props) => authenticated === true
          ? <Component {...rest} {...props} />
          : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
      />
    )
}
const PublicRoute = ({component: Component, authenticated, ...rest}) => {
    return (
      <Route
        {...rest}
        render={(props) => authenticated === false
          ? <Component {...rest} {...props} />
          : <Redirect to={{pathname: '/', state: {from: props.location}}} />}
      />
    )
}
class Layout extends Component {
    constructor(props) {
        super(props);
        let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
        currentMetamaskAccount = (currentMetamaskAccount != null && currentMetamaskAccount != '') ? currentMetamaskAccount : '';
        this.state = {
          currentMetamaskAccount: currentMetamaskAccount
        };
        this.logout = this.logout.bind(this);
        this.updateMetamaskAccount = this.updateMetamaskAccount.bind(this);
    }
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        this.updateMetamaskAccount('');
        this.props.history.push("/login");
    }
    componentDidUpdate() {
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
    }
    updateMetamaskAccount(currentMetamaskAccount){
      const api = new Api();
      if(!_.isUndefined(currentMetamaskAccount) && currentMetamaskAccount != '' && currentMetamaskAccount != null)
      {
        localStorage.setItem('currentMetamaskAccount', currentMetamaskAccount);  
        if(this.state.currentMetamaskAccount != currentMetamaskAccount)
        {
          const token = localStorage.getItem('token');
          api.setToken(token).create("user/wallet", {
            address: currentMetamaskAccount
          });
        }
      }
      else
      {
        localStorage.removeItem('currentMetamaskAccount');
      }
      this.setState({ currentMetamaskAccount: currentMetamaskAccount }, () => {});
    }
    render() {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        const {currentMetamaskAccount} = this.state;
        const authenticated = ((token && token !== null) ? true : false)
        const urlString = this.props.location.pathname.substr(1);
        const urlStringArr = urlString.split("/");
        const location = urlStringArr[0];
        let path = ["login", "register", "email-verify", "forgot","password-reset"];
        let networkId = window.web3.version.network;
        let wrongMetamskNetworkMsg = '';
        let wrongMetamaskNetwork = false;
        if(process.env.REACT_APP_METAMASK_NETWORK == "kovan" && networkId != "42" && networkId != null)
        {
            wrongMetamskNetworkMsg = 'Please connect to Kovan Test Network in metamask.';
            wrongMetamaskNetwork = true;
        }
        else if(process.env.REACT_APP_METAMASK_NETWORK == "main" && networkId != "1" && networkId != null) 
        {
          //networkId != "1"
            wrongMetamskNetworkMsg = 'Please connect to Main Ethereum Network in metamask.';
            wrongMetamaskNetwork = true;
        }

        if(path.indexOf(location) > -1){
              return (
                <Basepages>
                    <PublicRoute authenticated={authenticated} path="/login" exact={true} component={Login} /> 
                    <PublicRoute authenticated={authenticated} path="/email-verify/" exact={true} component={EmailVerify} />
                    <PublicRoute authenticated={authenticated} path="/email-verify/:token" exact={true} component={EmailVerify} />
                    <PublicRoute authenticated={authenticated} path="/register" component={Register} />
                    <PublicRoute authenticated={authenticated} path="/forgot" component={ForgotPassword} />
                    <PublicRoute authenticated={authenticated} path="/password-reset/:token" exact={true} component={ResetPassword} />                                    
                </Basepages>
            );
        }
        else if(location ==='email-unsubscribe'){
            return (
              <Basepages>
                  <PublicRoute authenticated={authenticated} path="/email-unsubscribe/:token" exact={true} component={Unsubscribe} />
              </Basepages>
          );
        }
        else{
            return (
                <Base logout={this.logout} authenticated={authenticated} token={token} location={location} userEmail={userEmail} wrongMetamskNetworkMsg={wrongMetamskNetworkMsg} wrongMetamaskNetwork={wrongMetamaskNetwork} updateMetamaskAccount={this.updateMetamaskAccount} currentMetamaskAccount={currentMetamaskAccount}>
                    <Switch>
                        <Route exact={true} path='/' 
                            render={() => 
                              <Market {...this.props} authenticated={authenticated}  token={token} wrongMetamaskNetwork={wrongMetamaskNetwork} />
                            }
                          />

                        <Route path='/market' 
                            render={() => 
                              <Market {...this.props} authenticated={authenticated} token={token} wrongMetamaskNetwork={wrongMetamaskNetwork} />
                            }
                          />  

                        <PrivateRoute authenticated={authenticated} token={token} path='/dashboard' component={DashboardContainer} currentMetamaskAccount={currentMetamaskAccount} networkId={networkId} wrongMetamaskNetwork={wrongMetamaskNetwork} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/wallet" component={WalletContainer} currentMetamaskAccount={currentMetamaskAccount} wrongMetamaskNetwork={wrongMetamaskNetwork} /> 
                        <PrivateRoute authenticated={authenticated} token={token} path="/loanrequests" component={LoanRequestsContainer} />
                        <PrivateRoute path="/createold"  authenticated={authenticated} token={token}  component={CreateLoanRequestContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/create" component={Create} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/tokens" component={TokensContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/request/:id" component={LoanRequestContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/detail/:id" component={DetailContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/investments" component={InvestmentsContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/success" component={Success} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/fund/:id" component={FundContainer} />
                        <Route exact={true} path='/privacy' 
                            render={() => 
                              <Privacy {...this.props} authenticated={authenticated} token={token} />
                            }
                          />
                        <Route exact={true} path='/terms' 
                            render={() => 
                              <TermsConditions {...this.props} authenticated={authenticated} token={token} />
                            }
                          />
                        <PrivateRoute authenticated={authenticated} token={token} path="/change-password" component={ChangePassword} userEmail={userEmail} />
                    </Switch>
                </Base>
            )
        }
    }
}

export default withRouter(Layout);