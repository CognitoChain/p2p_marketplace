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
import {withRouter} from 'react-router-dom';

import DashboardContainer from '../../containers/Dashboard';
import LoanRequestsContainer from "../../containers/LoanRequests";
import CreateLoanRequestContainer from "../../containers/CreateLoanRequest";
import TokensContainer from "../../containers/Tokens";
import LoanRequestContainer from "../../containers/LoanRequest";
import InvestmentsContainer from "../../containers/Investments";
import DetailContainer from "../../containers/Detail";
import FundContainer from '../../containers/Fund';


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
        this.logout = this.logout.bind(this);
    }
    logout() {
        localStorage.removeItem('token');
        this.props.history.push("/login");
    }
    componentDidUpdate() {
        window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
    }
    render() {
        const token = localStorage.getItem('token');
        const authenticated = ((token && token !== null) ? true : false)
        const urlString = this.props.location.pathname.substr(1);
        const urlStringArr = urlString.split("/");
        const location = urlStringArr[0];
        if(location ==='login' || location ==='register' || location ==='email-verify'){
              return (
                <Basepages>
                    <PublicRoute authenticated={authenticated} path="/login" exact={true} component={Login} /> 
                    <PublicRoute authenticated={authenticated} path="/email-verify/" exact={true} component={EmailVerify} />
                    <PublicRoute authenticated={authenticated} path="/email-verify/:token" exact={true} component={EmailVerify} />
                    <PublicRoute authenticated={authenticated} path="/register" component={Register} />                    
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
                <Base logout={this.logout} authenticated={authenticated} token={token} location={location}>
                    <Switch>
                        <Route exact={true} path='/' 
                            render={() => 
                              <Market {...this.props} authenticated={authenticated}  token={token} />
                            }
                          />

                        <Route path='/market' 
                            render={() => 
                              <Market {...this.props} authenticated={authenticated} token={token} />
                            }
                          />  

                        <PrivateRoute authenticated={authenticated} token={token} path='/dashboard' component={DashboardContainer}/>
                        <PrivateRoute authenticated={authenticated} token={token} path="/wallet" component={WalletContainer} /> 
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
                    </Switch>
                </Base>
            )
        }
    }
}

export default withRouter(Layout);