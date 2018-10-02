// External libraries
import React, { Component } from "react";

// Components
import Wallet from "../components/Wallet/Wallet";

// Contexts
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class WalletContainer extends Component {
    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return <Wallet tokens={dharmaProps.tokens} dharma={dharmaProps.dharma} />;
                }}
            </DharmaConsumer>
        );
    }
}
export default WalletContainer;