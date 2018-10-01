// External libraries
import React from "react";
import { Link } from "react-router-dom";

// Styling
import "./FundedLoanRequestsEmpty.css";

/**
 * Displays when the loan requests table are in the empty state.
 */
class FundedLoanRequestsEmpty extends React.Component {
    render() {
        return (
            <div className="FundedLoanRequestsEmpty">
                <p>There are no funded loans yet. Fill one from the <Link to="/">Fill Loan Request</Link> page.</p>
            </div>
        );
    }
}

export default FundedLoanRequestsEmpty;