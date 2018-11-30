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
            <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={['There are no activities yet. Create a ', <Link to="/create" className="btn btn-sm btn-link" style={{padding:0}}>Loan Request</Link>,' OR ', <Link to="/market" className="btn btn-sm btn-link" style={{padding:0}}>Fund</Link> ,' a loan.']} />
        );
    }
}

export default MyActivitiesEmpty;