// External libraries
import React, { Component } from 'react';
import BootstrapTable from "react-bootstrap-table-next";

// Components
import Loading from "../../Loading/Loading";

// Styling
import "./MyFundedLoans.css";
import MyFundedLoansRequestsEmpty from "./MyFundedLoansRequestsEmpty/MyFundedLoansRequestsEmpty";
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {amortizationUnitToFrequency,niceNumberDisplay} from "../../../utils/Util";
import paginationFactory from 'react-bootstrap-table2-paginator';
import * as moment from "moment";
import _ from 'lodash';
class MyFundedLoans extends Component {
    constructor(props) {
        super(props);        
    }

    render() {
        const { myFundedRequests,myFundedLoading,currentMetamaskAccount } = this.props;
        if (myFundedLoading) {
            return <Loading />;
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.principalSymbol}</div>
                        </div>
                    )
                },
            },
            {
                dataField: "term",
                text: "Term",
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.collateralSymbol}</div>
                        </div>
                    )
                }
            },
            {
                dataField: "repayment",
                isDummyField: true,
                text: "Total Repayment",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{niceNumberDisplay(row.totalExpectedRepaymentAmount)} {row.principalSymbol}</span></div>
                        </div>
                    )
                }
            },
            {
                dataField: "repaidAmount",
                text: "Total Earned",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{niceNumberDisplay(cell)} {row.principalSymbol}</span></div>
                        </div>
                    )
                }
            },
            {
                dataField: "repaymentFrequency",
                isDummyField: true,
                text: "Repayment Frequency",
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                    if(row.creditorAddress == currentMetamaskAccount)
                    {
                        buttonText = (parseFloat(row.repaidAmount) < parseFloat(row.repaymentAmount) && row.isCollateralSeizable == true) ? 'Seize Collateral' : '';
                    }
                    return (
                        <div>
                        {buttonText != '' && 
                            <a href={`detail/${row.id}`} target="_blank" className="btn cognito x-small orange">{buttonText}</a>
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
            alwaysShowAllBtns:true            
        });

        if(myFundedRequests.length==0){
            return <MyFundedLoansRequestsEmpty />
        }

        return (
            <div className="LoanRequests">
                
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes={"open-request"}
                    columns={columns}
                    data={myFundedRequests}
                    headerClasses={"text-center"}
                    rowClasses={rowClasses}
                    bordered={false}
                    rowEvents={rowEvents}
                    pagination={ pagination }
                />
            </div>
        );
    }
}

export default MyFundedLoans;
