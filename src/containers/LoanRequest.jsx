import React, { Component } from "react";
import LoanRequest from "../components/LoanRequest/LoanRequest";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";
import Api from "../services/api";
import auth from '../utils/auth';

class LoanRequestContainer extends Component {
    constructor(props) {
        super(props);
        this.interval = '';
        this.attempts = 0;
        this.maxAttemps = 5;
        this.newTokenBalance = 0;
        this.onFillComplete = this.onFillComplete.bind(this);
    }

    async onFillComplete(id,currentAccount) {
        const api = new Api();
        let data = {'address': currentAccount};
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
                            onFillComplete={ async (principalTokenSymbol,currentTokenBalance) => {
                                const currentAccount = await dharmaProps.dharma.blockchain.getCurrentAccount();
                                await this.onFillComplete(id,currentAccount);
                                
                                this.interval = setInterval(async () => {
                                    this.newTokenBalance = await dharmaProps.getTokenBalance(principalTokenSymbol);    
                                    if (currentTokenBalance == this.newTokenBalance && this.attempts < this.maxAttemps) {
                                      this.attempts++;  
                                      console.log("Token Balance Update Attempt => "+this.attempts);
                                    }
                                    else if(currentTokenBalance != this.newTokenBalance || this.attempts == this.maxAttemps)
                                    {
                                        clearInterval(this.interval);
                                        dharmaProps.refreshTokens();
                                    }
                                }, 5000);
                            } }
                        />
                    )
                } }
            </DharmaConsumer>
        );
    }
}
export default LoanRequestContainer;