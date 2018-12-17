import React, { Component } from 'react';
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import { confirmAlert } from 'react-confirm-alert';
import _ from 'lodash';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Loading from "../../Loading/Loading";
import Api from "../../../services/api";
import LoanRequestsEmpty from "./LoanRequestsEmpty/LoanRequestsEmpty";
import { amortizationUnitToFrequency, niceNumberDisplay, tooltipNumberDisplay, convertBigNumber } from "../../../utils/Util";
import auth from '../../../utils/auth';
import "./LoanRequests.css";
class LoanRequests extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loanRequests: [],
            highlightRow: null,
            isLoading: true,
            modal: false,
            isMetaMaskAuthRised: this.props.isMetaMaskAuthRised,
            isMounted:true  
        };
        this.toggle = this.toggle.bind(this);
    }
    async componentDidMount() {
        this.getLoanRequests();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.reloadDetails === true) {
          this.props.updateReloadDetails();
          this.setState({
            isMetaMaskAuthRised: nextProps.isMetaMaskAuthRised
          }, () => {
            this.getLoanRequests();
          });
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

    getLoanRequests() {
        const { highlightRow,currentMetamaskAccount } = this.props;
        const { isLoading,isMetaMaskAuthRised } = this.state;
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
            .then((loanRequestData) => {
                var loanRequests = _.filter(loanRequestData, { 'status': "OPEN" });
            
                loanRequests = loanRequests.map((request) => {
                    request.principalNumDecimals = !_.isNull(request.principalNumDecimals)?request.principalNumDecimals:0;
                    request.collateralNumDecimals = !_.isNull(request.collateralNumDecimals)?request.collateralNumDecimals:0;
                    request.principalAmount = !_.isNull(request.principalAmount)?convertBigNumber(request.principalAmount,request.principalNumDecimals):0;
                    request.principalSymbol = !_.isNull(request.principalSymbol)?request.principalSymbol:" - ";
                    request.collateralAmount = !_.isNull(request.collateralAmount)?request.collateralAmount:0;
                    request.collateralSymbol = !_.isNull(request.collateralSymbol)?request.collateralSymbol:" - ";
                    request.termLengthAmount = !_.isNull(request.termLengthAmount)?request.termLengthAmount:0;
                    request.termLengthUnit = !_.isNull(request.termLengthUnit)?request.termLengthUnit:" - ";
                    request.interestRatePercent = !_.isNull(request.interestRatePercent)?request.interestRatePercent:0;
                    return {
                        ...request,
                        principal: `${request.principalAmount} ${request.principalSymbol}`,
                        collateral: `${request.collateralAmount} ${request.collateralSymbol}`,
                        debtorEthAddress: request.debtor,
                        term: `${request.termLengthAmount} ${request.termLengthUnit}`,
                        expiration: moment.unix(request.expiresAt).fromNow(),
                        requestedDate: moment(request.createdAt).calendar(),
                        authToken: authToken,
                        isMetaMaskAuthRised:isMetaMaskAuthRised,
                        currentMetamaskAccount:currentMetamaskAccount
                    };
                });
                this.setState({ loanRequests, isLoading: false })
            })
            .catch((error) => {
                if (error.status && error.status === 403) {
                    this.props.redirect(`/login/`);
                }
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
        const { highlightRow, isLoading,loanRequests } = this.state;
        if (isLoading) {
            return <Loading />;
        }

        /*const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/request/${row.id}`);
            },
        };*/

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
