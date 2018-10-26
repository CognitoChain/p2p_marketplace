// External libraries
import React, { Component } from "react";

// Components
import Dashboard from "../components/Dashboard/Dashboard";

// Contexts
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class DashboardContainer extends Component {
    constructor(props){
        super(props);
        this.redirect = this.redirect.bind(this);
    }
    redirect(location) {
        this.props.history.push(location);
    }
    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return <Dashboard token = {this.props.token} isTokenLoading= {dharmaProps.isTokenLoading}  tokens={dharmaProps.tokens} dharma={dharmaProps.dharma} redirect={this.redirect} currentMetamaskAccount={this.props.currentMetamaskAccount} />;
                }}
            </DharmaConsumer>
        );
    }
}

export default DashboardContainer;