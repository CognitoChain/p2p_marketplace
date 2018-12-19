import React, { Component } from 'react';
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import Loading from "../../Loading/Loading";
import FundedLoansEmpty from "./FundedLoansEmpty/FundedLoansEmpty";
import { amortizationUnitToFrequency,niceNumberDisplay,tooltipNumberDisplay } from "../../../utils/Util";
import "./FundedLoans.css";
const columns = [
    {
        headerClasses : "created-title",
        dataField: "createdAt",
        text: "Created Date",
        formatter: function (cell, row, rowIndex, formatExtraData) {
            var date = moment(row.createdAt).format("DD/MM/YYYY");
            var time = moment(row.createdAt).format("HH:mm:ss");
            return (
                <div>
                    <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="loans-time-label">{time}</span></div>
                </div>
            )
        },
    },
    {
        headerClasses:"amount-title",
        dataField: "principalAmount",
        text: "Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
            return (
                <div className="text-right">
                    <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.principalSymbol)}>{niceNumberDisplay(cell)}</span> <br />{row.principalSymbol}
                </div>
            )
        }
    },
    {
        dataField: "termLengthAmount",
        text: "Term",
        formatter: function (cell, row, rowIndex, formatExtraData) {
            return (
                <div className="text-center">
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
                <div className="text-center">
                    <span className="number-highlight">{cell}</span> %
                </div>
            )
        }
    },
    {
        headerClasses:"amount-title",
        dataField: "collateralAmount",
        text: "Collateral",
        formatter: function (cell, row, rowIndex, formatExtraData) {
            return (
                <div className="text-right">
                    <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.collateralSymbol)}>{niceNumberDisplay(cell)}</span><br />{row.collateralSymbol}
                </div>
            )
        }
    },
    {
        headerClasses:"amount-title",
        dataField: "repaidAmount",
        isDummyField: true,
        text: "Total Repayment",
        formatter: function (cell, row, rowIndex, formatExtraData) {
            let interest_amount = (row.principalAmount * row.interestRatePercent) / 100;
            let repayment_amount = row.principalAmount + interest_amount;
            return (
                <div className="text-right">
                    <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(repayment_amount,row.principalSymbol)}>{niceNumberDisplay(repayment_amount)}</span><br />{row.principalSymbol}
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
                <div className="text-center">
                    <span className="number-highlight">{amortizationUnitToFrequency(row.termLengthUnit)}</span>
                </div>
            )
        }
    }
];

class FundedLoans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            highlightRow: null,
            myFundedLoansIsMounted:true,
            isMounted:true 
        };
    }
    render() {
        const { highlightRow } = this.state;
        const { isFundedRequestLoading,fundedLoansLists } = this.props;

        if (isFundedRequestLoading) {
            return <Loading />;
        }

        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/detail/${row.id}`);
            },
        };

        const rowClasses = (row, rowIndex) => {
            const rowData = fundedLoansLists[rowIndex];

            if (rowData.id === highlightRow) {
                return "funded-loans-row1 highlight cursor-pointer";
            } else {
                return "funded-loans-row1 cursor-pointer";
            }
        };

        const pagination = paginationFactory({
            page: 1,
            /*showTotal:true,*/
            alwaysShowAllBtns: true
        });
        if (fundedLoansLists.length == 0) {
            return <FundedLoansEmpty />
        }
        return (
            <div className="FundedLoansList">
                <BootstrapTable
                    hover={false}
                    responsive={true}
                    keyField="id"
                    classes={"market-funded-request"}
                    columns={columns}
                    data={fundedLoansLists}
                    headerClasses={"text-center"}
                    rowClasses={rowClasses}
                    bordered={false}
                    rowEvents={rowEvents}
                    pagination={pagination}
                />
            </div>
        );
    }
}

export default FundedLoans;
