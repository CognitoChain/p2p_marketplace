import React, { Component } from "react";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";

const MAX_RETRIES = 10;

const TX_STATES = {
    awaiting: "awaiting",
    timedOut: "timedOut",
    success: "success",
};

const TX_STATE_TO_STYLE = {
    awaiting: "warning",
    timedOut: "danger",
    success: "success",
};

const TX_STATE_TO_TITLE = {
    awaiting: "Awaiting Transaction to be Mined",
    timedOut: "This Transaction seems to be taking a while...",
    success: "Collateral Token Authorised.",    
};

const TX_STATE_TO_ICON = {
    awaiting: "fa fa-info fa-2x pull-left mr-2",
    timedOut: "fa fa-exclamation-triangle fa-2x pull-left mr-2",
    success: "fa fa-check fa-2x pull-left mr-2",
};

class TransactionManager extends Component {
    constructor(props) {
        super(props);
        const { tokenAuthorised } = this.props;
        if(tokenAuthorised === true)
        {
            this.state = {
                txState: TX_STATES.success,
            };
        }
        else{
            this.state = {
                txState: TX_STATES.awaiting,
                numRetries: 0,
            };
        }
        this.retry = this.retry.bind(this);
        this.awaitTransactionMined = this.awaitTransactionMined.bind(this);
    }

    componentDidMount() {
        const { tokenAuthorised } = this.props;
        if(tokenAuthorised === false)
        {
            this.awaitTransactionMined();    
        }
        else if(tokenAuthorised === true)
        {
            this.state = {
                txState: TX_STATES.success,
            };
        }
    }

    awaitTransactionMined() {
        const { dharma, txHash, onSuccess } = this.props;

        dharma.blockchain
            .awaitTransactionMinedAsync(txHash)
            .then(() => {
                this.setState({
                    txState: TX_STATES.success,
                    numRetries: 0,
                });

                onSuccess();
            })
            .catch(this.retry);
    }

    retry() {
        const { numRetries } = this.state;

        if (numRetries === MAX_RETRIES) {
            this.setState({
                txState: TX_STATES.timedOut,
                numRetries: 0,
            });
            return;
        }

        this.awaitTransactionMined();

        this.setState({
            numRetries: numRetries + 1,
        });
    }

    render() {
        const { txState } = this.state;
        const { txHash, description,tokenAuthorised } = this.props;
        return (
            <CustomAlertMsg 
                bsStyle={TX_STATE_TO_STYLE[txState]}
                className={TX_STATE_TO_ICON[txState]}
                title={TX_STATE_TO_TITLE[txState]}
                txHash={txHash}
                description={description}                
            />
        );
    }
}

export default TransactionManager;