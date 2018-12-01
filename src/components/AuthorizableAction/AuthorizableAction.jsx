import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "./AuthorizableAction.css";

class AuthorizableAction extends Component {
    handleClick(event, callback) {
        event.preventDefault();
        callback();
    }
    render() {
        const { canTakeAction, canAuthorize, onAction, onAuthorize, buttonLoading, unlockTokenButtonLoading } = this.props;
        let unlockButtonDisable = (canAuthorize || unlockTokenButtonLoading) ? true : false;
        let buttonDisable = (!canTakeAction || buttonLoading) ? true : false;
        return (
            <div className="Actions">
            	<Button
                    onClick={(event) => this.handleClick(event, onAuthorize)}
                    disabled={unlockButtonDisable}
                    bsStyle="primary"
                    className={`AuthorizableAction-Button unlock-tokens-button btn btn-success cognito ${canAuthorize ? 'd-none' : ''}`}
                    >
                    {this.props.children[0]}
                </Button>

                <Button
                    onClick={(event) => this.handleClick(event, onAction)}
                    disabled={buttonDisable}
                    bsStyle="primary"
                    className="AuthorizableAction-Button btn btn-primary cognito">
                    {this.props.children[1]}                    
                </Button>
            </div>
        );
    }
}
export default AuthorizableAction;