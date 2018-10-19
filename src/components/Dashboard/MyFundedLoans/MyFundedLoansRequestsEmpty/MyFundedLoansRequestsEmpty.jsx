// External libraries
import React from "react";
import { Link } from "react-router-dom";
import CustomAlertMsg from "../../../CustomAlertMsg/CustomAlertMsg";

// Styling
import "./MyFundedLoansRequestsEmpty.css";

/**
 * Displays when the loan requests table are in the empty state.
 */
class MyFundedLoansRequestsEmpty extends React.Component {
    render() {
        return (
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={["There are no funded loans yet. Fill one from the ",<Link to="/" className="btn btn-sm btn-link" style={{padding:0}}>Fill Loan Request</Link>," page."]} />
        );
    }
}

export default MyFundedLoansRequestsEmpty;