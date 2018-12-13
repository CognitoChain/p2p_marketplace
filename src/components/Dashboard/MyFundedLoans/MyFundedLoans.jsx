import React, { Component } from 'react';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import * as moment from "moment";
import _ from 'lodash';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Loading from "../../Loading/Loading";
import MyFundedLoansRequestsEmpty from "./MyFundedLoansRequestsEmpty/MyFundedLoansRequestsEmpty";
import { amortizationUnitToFrequency, niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
import "./MyFundedLoans.css";
class MyFundedLoans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMounted:true
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextState.isMounted;
    }
    componentWillUnmount() {
        this.setState({
          isMounted: false
        });
    }
    render() {
        const { myFundedRequests, myFundedLoading, currentMetamaskAccount,isMetaMaskAuthRised } = this.props;
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
                dataField: "term",
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
                dataField: "repayment",
                isDummyField: true,
                text: "Total Repayment",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div className="text-right">
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(row.totalExpectedRepaymentAmount,row.principalSymbol)}>{niceNumberDisplay(row.totalExpectedRepaymentAmount)}</span><br /> {row.principalSymbol}
                        </div>
                    )
                }
            },
            {
                headerClasses: "amount-title",
                dataField: "repaidAmount",
                text: "Total Earned",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div className="text-right">
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.principalSymbol)}>{niceNumberDisplay(cell)}</span> <br /> {row.principalSymbol}
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
                    if (isMetaMaskAuthRised && row.isCollateralSeizable == true && row.creditorAddress == currentMetamaskAccount) {
                        buttonText = 'Seize Collateral';
                    }
                    return (
                        <div className="text-center">
                            {buttonText != '' &&
                                <a href='javascript:void(0)' target="_blank" className="btn cognito icon x-small seize-collateral-btn">{buttonText}</a>
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
            alwaysShowAllBtns: true
        });

        if (myFundedRequests.length == 0) {
            return <MyFundedLoansRequestsEmpty />
        }

        return (
            <div className="LoanRequests">

                <BootstrapTable
                    hover={false}
                    responsive={true}
                    keyField="id"
                    classes={"funded-request"}
                    columns={columns}
                    data={myFundedRequests}
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

export default MyFundedLoans;
