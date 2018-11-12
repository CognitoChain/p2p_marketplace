import React, { Component } from "react";
import Wallet from "../components/Wallet/Wallet";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class WalletContainer extends Component {
    render() {
    	const currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return <Wallet isTokenLoading= {dharmaProps.isTokenLoading} tokens={dharmaProps.tokens} dharma={dharmaProps.dharma} currentMetamaskAccount={currentMetamaskAccount} wrongMetamaskNetwork={this.props.wrongMetamaskNetwork} />;
                }}
            </DharmaConsumer>
        );
    }
}
export default WalletContainer;