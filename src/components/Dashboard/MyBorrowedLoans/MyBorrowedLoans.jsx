// External libraries
import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";

// Components
import Loading from "../../Loading/Loading";

// Services
import Api from "../../../services/api";

// Styling
import "./MyBorrowedLoans.css";
import MyBorrowedLoansRequestsEmpty from "./MyBorrowedLoansRequestsEmpty/MyBorrowedLoansRequestsEmpty";
import _ from 'lodash';
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {amortizationUnitToFrequency} from "../../../utils/Util";
import paginationFactory from 'react-bootstrap-table2-paginator';
/**
 * Here we define the columns that appear in the table that holds all of the
 * open Loan Requests.
 */

class MyBorrowedLoans extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        /*this.openlink = this.openlink.bind(this);*/
    }
    renderShowsTotal(start, to, total) {
        return (
          <p style={ { color: 'blue' } }>
            From { start } to { to }, totals is { total }&nbsp;&nbsp;(its a customize text)
          </p>
        );
    }
    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    render() {
        /*let _self=this;*/
        const { myloanRequests,highlightRow,myBorrowedLoading } = this.props;
      
        if (myBorrowedLoading) {
            return <Loading/>;
        }

        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/detail/${row.id}`);
            },
        };

        const rowClasses = (row, rowIndex) => {
            const rowData = myloanRequests[rowIndex];

            if (rowData.id === highlightRow) {
                return "loan-request-row1 highlight cursor-pointer";
            } else {
                return "loan-request-row1 cursor-pointer";
            }
        };
        const columns = [
            {
                dataField: "createdAt",
                text: "Created Date",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    var date = moment(row.requestedAt).format("DD/MM/YYYY");
                    var time = moment(row.requestedAt).format("HH:mm:ss");
                    return (
                        <div>
                            <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="funded-loans-time-label">{time}</span></div>
                        </div>
                    )
                }
            },
            {
                dataField: "principalAmount",
                text: "Amount",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.principalTokenSymbol}</div>
                        </div>
                    )
                },
            },
            {
                dataField: "termDuration",
                text: "Term",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <span className="number-highlight">{cell}</span> {row.termUnit}
                        </div>
                    )
                }
            },
            {
                dataField: "interestRate",
                text: "Interest Rate",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <span className="number-highlight">{cell}</span> %
                        </div>
                    )
                }
            },
            {
                dataField: "collateralAmount",
                text: "Collateral",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.collateralTokenSymbol}</div>
                        </div>
                    )
                }
            },
            {
                dataField: "repayment",
                isDummyField: true,
                text: "Total Repayment",
                formatter:function(cell,row,rowIndex,formatExtraData){

                    let principal = row.principalAmount;
                    let interest_rate = row.interestRate;
                    let interestAmount = (principal * interest_rate) / 100;
                    let totalRepaymentAmount =
                      parseFloat(principal) + parseFloat(interestAmount);

                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{totalRepaymentAmount}</span><br />{row.principalTokenSymbol}</div>
                        </div>
                    )
                }
            },
            {
                dataField: "repaymentFrequency",
                isDummyField: true,
                text: "Repayment Frequency",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            {amortizationUnitToFrequency(row.termUnit)}
                        </div>
                    )
                }
            }            
        ];
        
        const pagination = paginationFactory({
            page: 1,
            /*showTotal:true,*/
            alwaysShowAllBtns:true,            
        });
        if(myloanRequests.length==0){
            return <MyBorrowedLoansRequestsEmpty />
        }
        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes = {"open-request"}
                    columns={columns}
                    data={myloanRequests}
                    headerClasses={"text-center"}
                    rowClasses={rowClasses}
                    bordered={ false }
                    rowEvents={rowEvents}
                    pagination={ pagination }
                />                
            </div>
        );
    }
}

export default MyBorrowedLoans;
