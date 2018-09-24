// External libraries
import React, { Component } from "react";

// Components
import LoanRequest from "../components/LoanRequest/LoanRequest";

// Contexts
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";
import Api from "../services/api";

class LoanRequestContainer extends Component {
    constructor(props) {
        super(props);

        this.onFillComplete = this.onFillComplete.bind(this);
    }

    async onFillComplete(id, currentAccount) {
        const api = new Api();
        let data = {'address': currentAccount};
        console.log("updating loan request - data: ", data)
        await api.put("loanRequests", id, data);

        this.props.history.push(`/investments`);
    }

    render() {
        const {id} = this.props.match.params;

        return (
            <DharmaConsumer>
                { (dharmaProps) => {
                    return (
                        <LoanRequest
                            id={ id }
                            dharma={ dharmaProps.dharma }
                            onFillComplete={ async () => {
                                dharmaProps.refreshTokens();
                                const currentAccount = await dharmaProps.dharma.blockchain.getCurrentAccount();
                                await this.onFillComplete(id, currentAccount);
                            } }
                        />
                    )
                } }
            </DharmaConsumer>
        );
    }
}

export default LoanRequestContainer;
