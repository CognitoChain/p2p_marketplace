import React, { Component } from "react";
import Dashboard from "../components/Dashboard/Dashboard";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class DashboardContainer extends Component {
    constructor(props) {
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
                    return (
                        <Dashboard
                            {...this.props}
                            isTokenLoading={dharmaProps.isTokenLoading}
                            tokens={dharmaProps.tokens} dharma={dharmaProps.dharma}
                            redirect={this.redirect} />
                    );
                }}
            </DharmaConsumer>
        );
    }
}
export default DashboardContainer;