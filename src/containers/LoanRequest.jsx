import React, { Component } from "react";
import LoanRequest from "../components/LoanRequest/LoanRequest";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";
import Api from "../services/api";
import auth from '../utils/auth';

class LoanRequestContainer extends Component {
    constructor(props) {
        super(props);
        this.onFillComplete = this.onFillComplete.bind(this);
    }

    async onFillComplete(id,currentAccount) {
        const api = new Api();
        let data = {'address': currentAccount};
        console.log("updating loan request - data: ", data)
        const authToken = auth.getToken();
        await api.setToken(authToken).put("loanRequests", id, data);
        this.props.history.push(`/fund/${id}`);        
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    render() {
        const {id} = this.props.match.params;

        return (
            <DharmaConsumer>
                { (dharmaProps) => {
                    return (
                        <LoanRequest
                            id={ id }
                            {...this.props}
                            dharma={ dharmaProps.dharma }
                            refreshTokens={dharmaProps.refreshTokens}
                            onFillComplete={ async () => {
                                const currentAccount = await dharmaProps.dharma.blockchain.getCurrentAccount();
                                await this.onFillComplete(id,currentAccount);
                                await this.timeout(2000);
                                dharmaProps.refreshTokens();
                            } }
                        />
                    )
                } }
            </DharmaConsumer>
        );
    }
}
export default LoanRequestContainer;