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
import {amortizationUnitToFrequency,niceNumberDisplay} from "../../../utils/Util";

import paginationFactory from 'react-bootstrap-table2-paginator';
class MyBorrowedLoans extends Component {
    constructor(props) {
        super(props);      
    }
    renderShowsTotal(start, to, total) {
        return (
          <p style={ { color: 'blue' } }>
            From { start } to { to }, totals is { total }&nbsp;&nbsp;(its a customize text)
          </p>
        );
    }
    render() {
        const { myBorrowedRequests,myBorrowedLoading,currentMetamaskAccount } = this.props;
        if (myBorrowedLoading) {
            return <Loading/>;
        }
        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/detail/${row.id}`);
            },
        };

        const rowClasses = (row, rowIndex) => {
            return "loan-request-row1 cursor-pointer";            
        };
        const columns = [
            {
                dataField: "createdDate",
                text: "Created Date",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    if(!_.isUndefined(cell) && cell != null)
                    {
                        var date = moment(cell).format("DD/MM/YYYY");
                        var time = moment(cell).format("HH:mm:ss");    
                    }
                    else
                    {
                        var date = '-';
                        var time = '';
                    }
                    return (
                        <div>
                            <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="funded-loans-time-label">{time}</span></div>
                        </div>
                    )
                }
            },
            {
                dataField: "principal",
                text: "Amount",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.principalSymbol}</div>
                        </div>
                    )
                },
            },
            {
                dataField: "termLengthAmount",
                text: "Term",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <span className="number-highlight">{cell}</span> {row.termLengthUnit}
                        </div>
                    )
                }
            },
            {
                dataField: "interestRatePercent",
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
                dataField: "collateral",
                text: "Collateral",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.collateralSymbol}</div>
                        </div>
                    )
                }
            },
            {
                dataField: "repaymentAmount",
                text: "Total Repayment",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{niceNumberDisplay(cell)}</span><br />{row.principalSymbol}</div>
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
                            {amortizationUnitToFrequency(row.termLengthUnit)}
                        </div>
                    )
                }
            },
            {
                dataField: "actions",
                isDummyField: true,
                text: "Actions",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    let buttonText = '';
                    let buttonClassName = '';
                    if(row.debtorAddress == currentMetamaskAccount)
                    {
                        if(parseFloat(row.repaidAmount) < parseFloat(row.repaymentAmount) && row.isRepaid == false)
                        {
                            buttonText = 'Pay'; 
                            buttonClassName = 'orange';
                        }
                        else if(row.repaidAmount == row.repaymentAmount && row.isRepaid == true){
                            buttonText = 'Request Collateral'; 
                            buttonClassName = 'green';
                        }
                    }
                    else if(row.creditorAddress == currentMetamaskAccount && row.isCollateralSeizable === true && row.isRepaid === false){
                        buttonText = 'Seize Collateral';
                        buttonClassName = 'green';
                    }
                    return (
                        <div>
                        {buttonText != '' && 
                            <a href="javascript:void(0)" className={"btn cognito x-small " + buttonClassName }>{buttonText}</a>
                        }
                        {buttonText == '' && 
                            <span>N/A</span>
                        }
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
        if(myBorrowedRequests.length==0){
            return <MyBorrowedLoansRequestsEmpty />
        }
        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes = {"open-request"}
                    columns={columns}
                    data={myBorrowedRequests}
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
