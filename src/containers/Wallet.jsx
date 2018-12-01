import React, { Component } from "react";
import Wallet from "../components/Wallet/Wallet";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class WalletContainer extends Component {
    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return (
                        <Wallet
                            isTokenLoading={dharmaProps.isTokenLoading}
                            {...this.props}
                            tokens={dharmaProps.tokens}
                            dharma={dharmaProps.dharma}
                        />
                    );
                }}
            </DharmaConsumer>
        );
    }
}
export default WalletContainer;