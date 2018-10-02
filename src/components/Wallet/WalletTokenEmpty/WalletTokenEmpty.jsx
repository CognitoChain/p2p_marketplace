// External libraries
import React from "react";

// Styling
import "./WalletTokenEmpty.css";
import {
  Col
} from "reactstrap";

/**
 * Displays when the loan requests table are in the empty state.
 */
class WalletTokenEmpty extends React.Component {
    render() {
        return (
            <Col md={12} sm={12} xs={12}>
                <p className="alert alert-info">There are no token balances.</p>
            </Col>
        );
    }
}

export default WalletTokenEmpty;