// External libraries
import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";

// Components
import Loading from "../../Loading/Loading";

// Styling
import "./MyFundedLoans.css";
import MyFundedLoansRequestsEmpty from "./MyFundedLoansRequestsEmpty/MyFundedLoansRequestsEmpty";
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {amortizationUnitToFrequency} from "../../../utils/Util";
import paginationFactory from 'react-bootstrap-table2-paginator';
class MyFundedLoans extends Component {
    constructor(props) {
        super(props);        
    }

    render() {
        const { myFundedRequests,myFundedLoading } = this.props;
        if (myFundedLoading) {
            return <Loading />;
        }

        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/detail/${row.id}`);
            },
        };

        const rowClasses = (row, rowIndex) => {
            return "loan-request-row1";
        };
        const columns = [
            {
                dataField: "principalAmount",
                text: "Amount",
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
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
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{row.totalExpectedRepaymentAmount}</span></div>
                        </div>
                    )
                }
            },
            {
                dataField: "repaidAmount",
                isDummyField: true,
                text: "Total Earned",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{row.repaidAmount}</span></div>
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
                            {amortizationUnitToFrequency(row.termUnit)}
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
