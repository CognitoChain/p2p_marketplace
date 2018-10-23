import React, { Component } from "react";
import { Alert } from "react-bootstrap";
import './CustomAlertMsg.css';
class CustomAlertMsg extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { bsStyle, className, title, description, extraClass } = this.props;
        return (
            <Alert bsStyle={bsStyle} className={"custom-alert-msg " + (extraClass || "")}>
                {className && <i className={className}></i>}
                <h6 className="pl-2">
                    <small>
                        {title}                        
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