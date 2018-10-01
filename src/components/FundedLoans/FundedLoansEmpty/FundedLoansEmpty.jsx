// External libraries
import React from "react";

// Styling
import "./FundedLoansEmpty.css";

/**
 * Displays when the loan requests table are in the empty state.
 */
class FundedLoansEmpty extends React.Component {
    render() {
        return (
            <div className="FundedLoansEmpty">
                <p>There are no funded loans yet.</p>
            </div>
        );
    }
}

export default FundedLoansEmpty;