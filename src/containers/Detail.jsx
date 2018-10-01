// External libraries
import React, { Component } from "react";

// Components
import Detail from "../components/Detail/Detail";

// Contexts
import DharmaConsumer from "../contexts/Dharma/DharmaConsumer";
import Api from "../services/api";

class DetailContainer extends Component {
    constructor(props) {
        super(props);
    }

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
                        />
                    )
                } }
            </DharmaConsumer>
        );
    }
}

export default DetailContainer;
