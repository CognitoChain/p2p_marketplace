import React, { Component } from "react";
import CreateLoanRequest from "../components/CreateLoanRequest/CreateLoanRequest";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class CreateLoanRequestContainer extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.token)
        this.redirect = this.redirect.bind(this);
        this.onCompletion = this.onCompletion.bind(this);
    }

    /**
     * When the loan request is created, we redirect the user back to the table that includes
     * all of the loan requests, and highlight the newly created request.
     */
    onCompletion(id) {
        this.props.history.push(`/?highlightRow=${id}`);
    }
    redirect(location) {
        this.props.history.push(location);
    }

    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return (
                        <CreateLoanRequest
                            token={this.props.token}
                            dharma={dharmaProps.dharma}
                            tokens={dharmaProps.supportedTokens}
                            redirect={this.redirect}
                            onCompletion={this.onCompletion}
                        />
                    );
                }}
            </DharmaConsumer>
        );
    }
}
export default CreateLoanRequestContainer;