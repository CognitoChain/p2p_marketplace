// External libraries
import React from "react";
import { Link } from "react-router-dom";
import CustomAlertMsg from "../../../CustomAlertMsg/CustomAlertMsg";

// Styling
import "./MyLoanRequestsEmpty.css";

/**
 * Displays when the loan requests table are in the empty state.
 */
class MyLoanRequestsEmpty extends React.Component {
    render() {
        return (
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={['There are no loan requests yet. Add one from the ', <Link to="/create" className="btn btn-sm btn-link" style={{padding:0}}>Create Loan Request</Link>,' page.']} />
        );
    }
}

export default MyLoanRequestsEmpty;