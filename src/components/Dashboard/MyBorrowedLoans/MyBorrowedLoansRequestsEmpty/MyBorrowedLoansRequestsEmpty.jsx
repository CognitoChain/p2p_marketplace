// External libraries
import React from "react";
import { Link } from "react-router-dom";
import CustomAlertMsg from "../../../CustomAlertMsg/CustomAlertMsg";

// Styling
import "./MyBorrowedLoansRequestsEmpty.css";

/**
 * Displays when the loan requests table are in the empty state.
 */
class MyBorrowedLoansRequestsEmpty extends React.Component {
    render() {
        return (
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={['There are no loan requests filled yet. Review your loans under My Loan Requests tab.']} />
        );
    }
}

export default MyBorrowedLoansRequestsEmpty;