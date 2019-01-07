import React, { Component } from 'react';
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import { confirmAlert } from 'react-confirm-alert';
import _ from 'lodash';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Loading from "../../Loading/Loading";
import LoanRequestsEmpty from "./LoanRequestsEmpty/LoanRequestsEmpty";
import { amortizationUnitToFrequency, niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
import auth from '../../../utils/auth';
import "./LoanRequests.css";
class LoanRequests extends Component {
    constructor(props) {
        super(props);
        this.state = {
            highlightRow: null,
            modal: false
        };
        this.toggle = this.toggle.bind(this);
    }
    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    openlink(row_id) {
        const authToken = auth.getToken();
        if (!_.isNull(authToken)) {
            this.props.redirect(`/request/${row_id}`);
        }
        else {
            confirmAlert({
                title: 'Login to fund',
                buttons: [
                    {
                        label: 'Login',
                        onClick: () => this.props.redirect(`/login`)
                    },
                    {
                        label: 'Cancel'
                    }
                ]
            });
        }
    }
    render() {
        let _self = this;
        const { highlightRow } = this.state;
        const { isLoanRequestLoading,loanRequests } = this.props;
        if (isLoanRequestLoading) {
            return <Loading />;
        }

        const rowClasses = (row, rowIndex) => {
            const rowData = loanRequests[rowIndex];

            if (rowData.id === highlightRow) {
                return "loan-request-row1 highlight";
            } else {
                return "loan-request-row1";
            }
        };
        const columns = [
            {
                headerClasses: "created-title",
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
                headerClasses: "amount-title",
                dataField: "principalAmount",
                text: "Loan Amount",
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
                            <span className="number-highlight">{cell}</span> %
                        </div>
                    )
                }
            },
            {
                headerClasses: "amount-title",
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
                headerClasses: "amount-title",
                dataField: "repayment",
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
            },
            {
                dataField: "fund",
                isDummyField: true,
                text: "Action",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    if (row.isMetaMaskAuthRised && row.debtorEthAddress != row.currentMetamaskAccount) {
                        return (
                            <div className="text-center">
                                    <a href="javascript:;" className="btn btn-outline-success cognito x-small" onClick={() => _self.openlink(row.id)}>Fund</a>
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
            alwaysShowAllBtns: true
        });
        if (loanRequests.length == 0) {
            return <LoanRequestsEmpty />
        }
        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    ref='LoanRequestsTable' 
                    keyField="id"
                    classes={"market-open-request"}
                    columns={columns}
                    data={loanRequests}
                    headerClasses={"text-center"}
                    rowClasses={rowClasses}
                    bordered={false}
                    pagination={pagination}
                />
            </div>
        );
    }
}

export default LoanRequests;
