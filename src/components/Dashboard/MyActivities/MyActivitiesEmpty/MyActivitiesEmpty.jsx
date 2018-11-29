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
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={['There are no activities yet. Add a loan from the ', <Link to="/create" className="btn btn-sm btn-link" style={{padding:0}}>Create Loan Request</Link>,' page OR Fund a loan from ', <Link to="/market" className="btn btn-sm btn-link" style={{padding:0}}>Market</Link> ,' page.']} />
        );
    }
}

export default MyActivitiesEmpty;