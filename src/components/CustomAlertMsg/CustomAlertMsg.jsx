import React, { Component } from "react";
import { Alert } from "react-bootstrap";
import './CustomAlertMsg.css';
class CustomAlertMsg extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { bsStyle, className, title, txHash, description, extraClass } = this.props;
        return (
            <Alert bsStyle={bsStyle} className={"custom-alert-msg " + (extraClass || "")}>
                {className && <i className={className}></i>}
                <h6 className="pl-2">
                    <small>
                        {title}
                        {
                            txHash != '' && txHash != null && 
                            <span className="transaction-detail-link">
                                <a href={`https://etherscan.io/tx/${txHash}`} target="_blank"> Transaction Details</a>
                            </span> 
                        }
                    </small>
                </h6>

                <div>
                    <p>{description}</p>

                </div>
            </Alert>
        );
    }
}

export default CustomAlertMsg;