// External libraries
import React from "react";

// Styling
import "./FundedLoansEmpty.css";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";

/**
 * Displays when the loan requests table are in the empty state.
 */
class FundedLoansEmpty extends React.Component {
    render() {
        return <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={"There are no funded loans yet."} />
    }
}

export default FundedLoansEmpty;