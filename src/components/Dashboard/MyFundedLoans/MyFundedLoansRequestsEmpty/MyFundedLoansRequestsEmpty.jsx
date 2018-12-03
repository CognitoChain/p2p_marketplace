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
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={["There are no funded loans yet. Fund a loan from  ",<Link to="/market" className="btn btn-sm btn-link" style={{padding:0}}>Market</Link>," page."]} />
        );
    }
}

export default MyFundedLoansRequestsEmpty;