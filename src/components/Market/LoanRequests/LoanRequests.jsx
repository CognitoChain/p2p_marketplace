import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import { confirmAlert } from 'react-confirm-alert';
import _ from 'lodash';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Loading from "../../Loading/Loading";
import Api from "../../../services/api";
import LoanRequestsEmpty from "./LoanRequestsEmpty/LoanRequestsEmpty";
import { amortizationUnitToFrequency, niceNumberDisplay, tooltipNumberDisplay } from "../../../utils/Util";
import auth from '../../../utils/auth';
import "./LoanRequests.css";
class LoanRequests extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loanRequests: [],
            highlightRow: null,
            isLoading: true,
            modal: false
        };
        this.parseLoanRequests = this.parseLoanRequests.bind(this);
        this.parseLoanRequest = this.parseLoanRequest.bind(this);
        this.toggle = this.toggle.bind(this);
        /*this.openlink = this.openlink.bind(this);*/
    }
    async componentDidMount() {
        this.getLoanRequests();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.reloadDetails === true) {
            this.props.updateReloadDetails();
            this.getLoanRequests();
        }
    }

    getLoanRequests() {
        const { highlightRow } = this.props;
        const { isLoading } = this.state;
        this.setState({
            highlightRow,
        });
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";

        if(!isLoading)
        {
            this.setState({ isLoading: true });
        }

        const authToken = auth.getToken();
        api.setToken(authToken).get("loanRequests", { sort, order })
            .then(this.parseLoanRequests)
            .then((loanRequests) => this.setState({ loanRequests, isLoading: false }))
            .catch((error) => {
                if (error.status && error.status === 403) {
                    this.props.redirect(`/login/`);
                }
            });
    }

    parseLoanRequests(loanRequestData) {
        var filteredRequestData = _.filter(loanRequestData, { 'status': "OPEN" });
        return Promise.all(filteredRequestData.map(this.parseLoanRequest));
    }
    parseLoanRequest(datum) {
        const { dharma } = this.props;

        const { LoanRequest } = Dharma.Types;

        return new Promise((resolve) => {
            LoanRequest.load(dharma, datum).then((loanRequest) => {
                resolve({
                    ...loanRequest.getTerms(),
                    id: datum.id,
                    requestedAt: datum.createdAt,
                    status: datum.status,
                    debtorEthAddress: datum.debtor
                });
            });
        });
    }
    getData() {
        const { loanRequests } = this.state;
        const { isMetaMaskAuthRised,currentMetamaskAccount } = this.props;
        const authToken = auth.getToken();
        return loanRequests.map((request) => {
            return {
                ...request,
                principal: `${request.principalAmount} ${request.principalTokenSymbol}`,
                collateral: `${request.collateralAmount} ${request.collateralTokenSymbol}`,
                term: `${request.termDuration} ${request.termUnit}`,
                expiration: moment.unix(request.expiresAt).fromNow(),
                requestedDate: moment(request.requestedAt).calendar(),
                authToken: authToken,
                isMetaMaskAuthRised:isMetaMaskAuthRised,
                currentMetamaskAccount:currentMetamaskAccount
            };
        });
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
        const { highlightRow, isLoading } = this.state;
        const data = this.getData();

        if (isLoading) {
            return <Loading />;
        }

        /*const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/request/${row.id}`);
            },
        };*/

        const rowClasses = (row, rowIndex) => {
            const rowData = data[rowIndex];

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
                    var date = moment(row.requestedAt).format("DD/MM/YYYY");
                    var time = moment(row.requestedAt).format("HH:mm:ss");
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
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.principalTokenSymbol)}>{niceNumberDisplay(cell)}</span><br />{row.principalTokenSymbol}
                        </div>
                    )
                },
            },
            {
                dataField: "termDuration",
                text: "Term",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    return (
                        <div className="text-center">
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
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.collateralTokenSymbol)}>{niceNumberDisplay(cell)}</span><br />{row.collateralTokenSymbol}
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
                    let interest_amount = (row.principalAmount * row.interestRate) / 100;
                    let repayment_amount = row.principalAmount + interest_amount;
                    return (
                        <div className="text-right">
                            <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(repayment_amount,row.principalTokenSymbol)}>{niceNumberDisplay(repayment_amount)}</span><br />{row.principalTokenSymbol}
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
                            <span className="number-highlight">{amortizationUnitToFrequency(row.termUnit)}</span>
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
        if (data.length == 0) {
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
                    data={data}
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
