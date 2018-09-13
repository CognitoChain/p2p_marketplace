// External libraries
import React, { Component } from "react";
import {Switch, Route } from "react-router-dom";

// Components
import Basepages from './Basepages';
import Base from './Base';
import Login from '../Authentication/Login/Login';
import Register from '../Authentication/Register/Register';
import Dashboard from '../Dashboard/Dashboard';

import {withRouter} from 'react-router-dom';

class Layout extends Component {
  
    render() {
        const location = this.props.location.pathname.substr(1);
        if(location ==='login' || location ==='register'){
              return (
                <Basepages>
                    <Route  path="/" exact={true} component={Login} />
                    <Route  path="/login" exact={true} component={Login} />
                    <Route  path="/register" component={Register} />
                </Basepages>
            );
        }
        else{
            return (
                <Base>
                    <Switch>
                        <Route path="/dashboard" component={Dashboard}/> 
                    </Switch>
                </Base>
            )
        }
    }
}

export default withRouter(Layout);