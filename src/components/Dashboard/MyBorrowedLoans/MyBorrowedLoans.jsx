import React, { Component } from 'react';
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import _ from 'lodash';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Loading from "../../Loading/Loading";
import MyBorrowedLoansRequestsEmpty from "./MyBorrowedLoansRequestsEmpty/MyBorrowedLoansRequestsEmpty";
import { amortizationUnitToFrequency, niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
import "./MyBorrowedLoans.css";
class MyBorrowedLoans extends Component {
    renderShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                From {start} to {to}, totals is {total}&nbsp;&nbsp;(its a customize text)
          </p>
        );
    }
    render() {
        const { myBorrowedRequests, myBorrowedLoading, currentMetamaskAccount } = this.props;
        if (myBorrowedLoading) {
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
                headerClasses: "created-title",
                dataField: "createdDate",
                text: "Created Date",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    let date = '-';
                    let time = '';
                    if (!_.isUndefined(cell) && cell != null) {
                        date = moment(cell).format("DD/MM/YYYY");
                        time = moment(cell).format("HH:mm:ss");
                    }
                    return (
                        <div>
                            <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="loans-time-label">{time}</span></div>
                        </div>
                    )
                }
            },
            {
                headerClasses: "amount-title",
                dataField: "principal",
                text: "Amount",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div className="text-right">
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.principalSymbol)}>{niceNumberDisplay(cell)}</span><br />{row.principalSymbol}
                        </div>
                    )
                },
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
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,"%")}>{niceNumberDisplay(cell,2)}</span> %
                        </div>
                    )
                }
            },
            {
                headerClasses: "amount-title",
                dataField: "collateral",
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
                headerClasses: "amount-title",
                dataField: "repaymentAmount",
                text: "Total Repayment",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div className="text-right">
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.principalSymbol)}>{niceNumberDisplay(cell)}</span><br />{row.principalSymbol}
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
                            {amortizationUnitToFrequency(row.termLengthUnit)}
                        </div>
                    )
                }
            },
            {
                dataField: "actions",
                isDummyField: true,
                text: "Actions",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    let buttonText = '';
                    let buttonClassName = '';
                    if (row.debtorAddress == currentMetamaskAccount) {
                        if (parseFloat(row.repaidAmount) < parseFloat(row.repaymentAmount) && row.isRepaid == false && row.isCollateralSeized == false) {
                            buttonText = 'Pay';
                            buttonClassName = 'orange';
                        }
                        else if (row.isCollateralReturnable == true && row.isRepaid == true && row.isCollateralReturned == false) {
                            buttonText = 'Claim Collateral';
                            buttonClassName = 'green';
                        }
                    }
                    return (
                        <div className="text-center">
                            {buttonText != '' &&
                                <a href="javascript:void(0)" className={"btn cognito x-small " + buttonClassName}>{buttonText}</a>
                            }
                            {buttonText == '' &&
                                <span>-</span>
                            }
                        </div>
                    )
                }
            }
        ];

        const pagination = paginationFactory({
            page: 1,
            /*showTotal:true,*/
            alwaysShowAllBtns: true,
        });
        if (myBorrowedRequests.length == 0) {
            return <MyBorrowedLoansRequestsEmpty />
        }
        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes={"borrowed-request"}
                    columns={columns}
                    data={myBorrowedRequests}
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

export default MyBorrowedLoans;
