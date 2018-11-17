import React, { Component } from "react";
import {ListGroupItem} from 'reactstrap';
class SummaryItem extends Component {
    render() {
        const { labelName, labelValue,labelValue2 } = this.props;
        return (
            <ListGroupItem className="p-0 mt-1" style={{ border: 'none' }}>
                <div>
                    <label className="pull-left" htmlFor="one">{labelName}</label>
                    <label className="pull-right text-right"><span className="number-highlight">{labelValue}</span> <br /><span className="detail-sumary-second-label">{labelValue2}</span></label>
                </div>
            </ListGroupItem>
        );
    }
}

export default SummaryItem;
