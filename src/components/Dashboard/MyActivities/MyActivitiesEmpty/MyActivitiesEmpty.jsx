// External libraries
import React from "react";
import { Link } from "react-router-dom";
import CustomAlertMsg from "../../../CustomAlertMsg/CustomAlertMsg";

// Styling
import "./MyActivitiesEmpty.css";

/**
 * Displays when the loan requests table are in the empty state.
 */
class MyActivitiesEmpty extends React.Component {
    render() {
        return (
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={['There are no any activities. Add one loan from the ', <Link to="/create" className="btn btn-sm btn-link" style={{padding:0}}>Create Loan Request</Link>,' page OR Fill one from the ', <Link to="/">Fill Loan Request</Link> ,' page.']} />
        );
    }
}

export default MyActivitiesEmpty;