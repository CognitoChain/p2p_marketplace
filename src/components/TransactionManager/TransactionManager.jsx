import React, { Component } from "react";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import _ from "lodash";
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
    success: "Token Authorised.",
};

const TX_STATE_TO_ICON = {
    awaiting: "fa fa-info fa-2x pull-left mr-2",
    timedOut: "fa fa-exclamation-triangle fa-2x pull-left mr-2",
    success: "fa fa-check fa-2x pull-left mr-2",
};

class TransactionManager extends Component {
    constructor(props) {
        super(props);
        const { canAuthorize } = this.props;
        console.log("canAuthorizeTransactionManager");
        console.log(canAuthorize);

        this.state = {
            txState: (canAuthorize) ? TX_STATES.success : TX_STATES.awaiting,
            numRetries: 0,
            canAuthorize: canAuthorize
        };

        this.retry = this.retry.bind(this);
        this.awaitTransactionMined = this.awaitTransactionMined.bind(this);
    }

    componentDidMount() {
        const { txHash } = this.props;
        if(txHash){
            this.awaitTransactionMined();
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

                onSuccess(null, "success");
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
        const { txHash, description, tokenAuthorised } = this.props;
        let extraTitle = '';

        if (txHash != '' && txHash != null) {
            extraTitle = (<span className="transaction-detail-link"><a href={`https://etherscan.io/tx/${txHash}`} target="_blank"> Transaction Details</a></span>);
        }
        console.log("this.state.canAuthorize")
        console.log(this.state.canAuthorize)

        return (

            <CustomAlertMsg
                bsStyle={TX_STATE_TO_STYLE[txState]}
                className={TX_STATE_TO_ICON[txState]}
                title={[TX_STATE_TO_TITLE[txState], ' ', extraTitle]}
                description={description}
            />
        );
    }
}

export default TransactionManager;