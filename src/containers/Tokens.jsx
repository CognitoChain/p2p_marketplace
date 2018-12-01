import React, { Component } from "react";
import Tokens from "../components/Tokens/Tokens";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class TokensContainer extends Component {
    render() {
        return (
            <DharmaConsumer>
                {(dharmaProps) => {
                    return <Tokens tokens={dharmaProps.tokens} />;
                }}
            </DharmaConsumer>
        );
    }
}
export default TokensContainer;