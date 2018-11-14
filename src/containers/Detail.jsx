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
                            token={this.props.token}
                            dharma={ dharmaProps.dharma }
                            refreshTokens={ dharmaProps.refreshTokens }
                            reloadDetails={this.props.reloadDetails}
                            isTokenLoading={ dharmaProps.isTokenLoading }
                        />
                    )
                } }
            </DharmaConsumer>
        );
    }
}
export default DetailContainer;