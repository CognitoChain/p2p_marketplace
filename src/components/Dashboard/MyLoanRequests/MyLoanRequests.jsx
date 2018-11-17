import React, { Component } from 'react';
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Loading from "../../Loading/Loading";
import MyLoanRequestsEmpty from "./MyLoanRequestsEmpty/MyLoanRequestsEmpty";
import { amortizationUnitToFrequency,niceNumberDisplay } from "../../../utils/Util";
import "./MyLoanRequests.css";
class MyLoanRequests extends Component {
    renderShowsTotal(start, to, total) {
        return (
          <p style={ { color: 'blue' } }>
            From { start } to { to }, totals is { total }&nbsp;&nbsp;(its a customize text)
          </p>
        );
    }
    render() {
        const { myLoanRequests,myLoansLoading } = this.props;
        const { currentMetamaskAccount } = this.props;

        if (myLoansLoading) {
            return <Loading/>;
        }
        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/request/${row.id}`);
            },
        };

        const rowClasses = (row, rowIndex) => {
            return "loan-request-row1 cursor-pointer";            
        };
        const columns = [
            {
                headerClasses:"created-title",
                dataField: "createdAt",
                text: "Created Date",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    var date = moment(row.requestedAt).format("DD/MM/YYYY");
                    var time = moment(row.requestedAt).format("HH:mm:ss");
                    return (
                        <div>
                            <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="loans-time-label">{time}</span></div>
                        </div>
                    )
                }
            },
            {
                headerClasses:"amount-title",
                dataField: "principalAmount",
                text: "Amount",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div className="text-right">
                            <span className="number-highlight">{niceNumberDisplay(cell)}</span><br />{row.principalTokenSymbol}
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
                headerClasses:"amount-title",
                dataField: "collateralAmount",
                text: "Collateral",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div className="text-right">
                            <span className="number-highlight">{niceNumberDisplay(cell)}</span><br />{row.collateralTokenSymbol}
                        </div>
                    )
                }
            },
            {
                headerClasses:"amount-title",
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
                        <div className="text-right">
                            <span className="number-highlight">{niceNumberDisplay(totalRepaymentAmount)}</span><br />{row.principalTokenSymbol}
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
            },
            {
                dataField: "fund",
                isDummyField: true,
                text: "Action",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    if (row.creditorAddress == currentMetamaskAccount) {
                        return (
                            <div className="text-center">
                                    <a href="javascript:;" className="btn btn-outline-danger cognito x-small" onClick={() => alert(row.id)}>Cancel Request</a>
                            </div>
                        )
                    }
                    else {
                        return (
                            <div className="text-center">-</div>
                        )
                    }

                }
            }
        ];
        
        const pagination = paginationFactory({
            page: 1,
            /*showTotal:true,*/
            alwaysShowAllBtns:true,            
        });
        if(myLoanRequests.length==0){
            return <MyLoanRequestsEmpty />
        }
        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes = {"open-request"}
                    columns={columns}
                    data={myLoanRequests}
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

export default MyLoanRequests;
