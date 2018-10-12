// External libraries
import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";

// Components
import Loading from "../Loading/Loading";

// Styling
import "./FundedLoanRequests.css";
import FundedLoanRequestsEmpty from "./FundedLoanRequestsEmpty/FundedLoanRequestsEmpty";
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {amortizationUnitToFrequency} from "../../utils/Util";
import paginationFactory from 'react-bootstrap-table2-paginator';
/**
 * Here we define the columns that appear in the table that holds all of the
 * open Loan Requests.
 */

class FundedLoanRequests extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Fundedloans: [],
            highlightRow: null,
            isLoading: true,
            modal: false,
            investments: []
        };
        this.toggle = this.toggle.bind(this);
        /*this.openlink = this.openlink.bind(this);*/
    }

    /**
     * When the component mounts, use the API to get all of the load requests from the relayer
     * database, and parse those into LoanRequest objects using Dharma.js. Then, set the state of
     * the current component to include those loan requests so that they can be rendered as a table.
     *
     * This function assumes that there is a database with Loan Request data, and that we have
     * access to Dharma.js, which is connected to a blockchain.
     */
    async componentDidMount() {
        const { dharma } = this.props;
        const { Investments } = Dharma.Types;
        const creditor = await dharma.blockchain.getCurrentAccount();
        if(typeof creditor != "undefined")
        {
            const investments = await Investments.getExpandedData(dharma, creditor);
            console.log(investments);
            this.setState({
                investments,
                isLoading: false
            }); 
        }
        else
        {
            this.setState({
                isLoading: false
            }); 
        }
    }

    /**
     * Returns an array of loan requests, which can be rendered in a table.
     *
     * For each `LoanRequest` object from Dharma.js, it adds two human-readable timestamps - one
     * describing when the request was created, and one describing its expiration date.
     */
    getData() {
        const { investments } = this.state;

        if (!investments) {
            return null;
        }

        return investments.map((investment) => {
            return {
                ...investment,
                principal: `${investment.principalAmount} ${investment.principalTokenSymbol}`,
                collateral: `${investment.collateralAmount} ${investment.collateralTokenSymbol}`,
                term: `${investment.termDuration} ${investment.termUnit}`,
                repaidAmount: `${investment.repaidAmount} ${investment.principalTokenSymbol}`,
                totalExpectedRepaymentAmount: `${investment.totalExpectedRepaymentAmount} ${
                    investment.principalTokenSymbol
                    }`,
            };
        });
    }
    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    render() {
        /*let _self = this;*/
        const { highlightRow, isLoading } = this.state;
        const data = this.getData();
        if (isLoading) {
            return <Loading />;
        }

        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/detail/${row.id}`);
            },
        };

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

        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes={"open-request"}
                    columns={columns}
                    data={data}
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

export default FundedLoanRequests;
