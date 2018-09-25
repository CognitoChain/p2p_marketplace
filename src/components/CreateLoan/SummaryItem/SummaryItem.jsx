import React, { Component } from "react";
import {ListGroupItem} from 'reactstrap';
class SummaryItem extends Component {
    render() {
        const { labelName, labelValue } = this.props;
        return (
            <ListGroupItem className="p-0 mt-20" style={{ border: 'none' }}>
                <div>
                    <label className="pull-left" htmlFor="one">{labelName}</label>
                    <label className="pull-right"><b>{labelValue}</b></label>
                </div>
            </ListGroupItem>
        );
    }
}

export default SummaryItem;
