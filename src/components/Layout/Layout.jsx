// External libraries
import React, { Component } from "react";
import {Switch, Route, Redirect} from "react-router-dom";

// Components
import Basepages from './Basepages';
import Base from './Base';
import Login from '../Authentication/Login/Login';
import Register from '../Authentication/Register/Register';
import Dashboard from '../Dashboard/Dashboard';
import Market from '../Market/Market';
import Wallet from '../Wallet/Wallet';
import Create from '../Create/Create';

import {withRouter} from 'react-router-dom';

import LoanRequestsContainer from "../../containers/LoanRequests";
import CreateLoanRequestContainer from "../../containers/CreateLoanRequest";
import TokensContainer from "../../containers/Tokens";
import LoanRequestContainer from "../../containers/LoanRequest";
import InvestmentsContainer from "../../containers/Investments";

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
          : <Redirect to={{pathname: '/dashboard', state: {from: props.location}}} />}
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
    render() {
        const token = localStorage.getItem('token');
        const authenticated = ((token && token !== null) ? true : false)
        const location = this.props.location.pathname.substr(1);
        console.log(authenticated)
        console.log(token)
        if(location ==='login' || location ==='register'){
              return (
                <Basepages>
                    <PublicRoute authenticated={authenticated} path="/" exact={true} component={Login} />
                    <PublicRoute authenticated={authenticated} path="/login" exact={true} component={Login} /> 
                    <PublicRoute authenticated={authenticated} path="/register" component={Register} />
                </Basepages>
            );
        }
        else{
            return (
                <Base logout={this.logout}>
                    <Switch>
                        <PrivateRoute authenticated={authenticated} token={token} path='/dashboard' component={Dashboard}/>
                        <PrivateRoute authenticated={authenticated} token={token} path="/market" component={Market}/> 
                        <PrivateRoute authenticated={authenticated} token={token} path="/wallet" component={Wallet}/> 
                        <PrivateRoute authenticated={authenticated} token={token} path="/loanrequests" component={LoanRequestsContainer} />
                        <PrivateRoute path="/create"  authenticated={authenticated} token={token}  component={CreateLoanRequestContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/createnew" component={Create} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/tokens" component={TokensContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/request/:id" component={LoanRequestContainer} />
                        <PrivateRoute authenticated={authenticated} token={token} path="/investments" component={InvestmentsContainer} />
                    </Switch>
                </Base>
            )
        }
    }
}

export default withRouter(Layout);