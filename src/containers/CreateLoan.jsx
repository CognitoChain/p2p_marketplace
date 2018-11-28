import React, { Component } from "react";
import CreateLoan from "../components/CreateLoan/CreateLoan";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class CreateLoanContainer extends Component {
    constructor(props) {
        super(props);
        this.redirect = this.redirect.bind(this);
        this.onCompletion = this.onCompletion.bind(this);
    }

    /**
     * When the loan request is created, we redirect the user back to the table that includes
     * all of the loan requests, and highlight the newly created request.
     */
    onCompletion(id) {
        /*this.props.history.push(`/requests/${id}`);*/
        this.props.history.push('success');
    }
    redirect(location) {
        this.props.history.push(location);
    }

    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return (
                        <CreateLoan
                            dharma={dharmaProps.dharma}
                            refreshTokens={dharmaProps.refreshTokens}
                            tokens={dharmaProps.tokens}
                            redirect={this.redirect}
                            onCompletion={this.onCompletion}
                            {...this.props}
                        />
                    );
                }}
            </DharmaConsumer>
        );
    }
}
export default CreateLoanContainer;