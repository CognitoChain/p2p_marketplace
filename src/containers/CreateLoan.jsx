// External libraries
import React, { Component } from "react";

// Components
import CreateLoan from "../components/CreateLoan/CreateLoan";

// Contexts
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
                            tokens={dharmaProps.supportedTokens}
                            redirect={this.redirect}
                            onCompletion={this.onCompletion}
                            token={this.props.token}
                        />
                    );
                }}
            </DharmaConsumer>
        );
    }
}

export default CreateLoanContainer;
