import React, { Component } from "react";
import { ListGroupItem } from 'reactstrap';
class SummaryItem extends Component {
    render() {
        const { labelName, labelValue, tooltipValue } = this.props;
        return (
            <ListGroupItem className="p-0 mt-15" style={{ border: 'none' }}>
                <div>
                    <label className="pull-left create-summary-label-bold" htmlFor="one">{labelName}</label>
                    {tooltipValue && <label className="pull-right custom-tooltip" tooltip-title={tooltipValue}><b>{labelValue}</b></label>}
                    {!tooltipValue && <label className="pull-right"><b>{labelValue}</b></label>}
                </div>
            </ListGroupItem>
        );
    }
}

export default SummaryItem;
