import React, { Component } from "react";
import Detail from "../components/Detail/Detail";
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";

class DetailContainer extends Component {
    render() {
        const {id} = this.props.match.params;
        return (
            <DharmaConsumer>
                { (dharmaProps) => {
                    return (
                        <Detail
                            id={ id }
                            {...this.props}
                            dharma={ dharmaProps.dharma }
                            refreshTokens={ dharmaProps.refreshTokens }
                            isTokenLoading={ dharmaProps.isTokenLoading }
                        />
                    )
                } }
            </DharmaConsumer>
        );
    }
}
export default DetailContainer;