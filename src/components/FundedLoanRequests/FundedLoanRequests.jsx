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

        this.renderShowsTotal = this.renderShowsTotal.bind(this);
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
        const { Investments, Investment, Debt } = Dharma.Types;
        const creditor = await dharma.blockchain.getCurrentAccount();

        const investments = await Investments.getExpandedData(dharma, creditor);
        console.log("-- investments --");
        console.log(investments);

        // Test loading a Debt and an Investment by id (agreementId)
        
        /*let agreementId = "0x885df2ccdaee227b67c3fb0fc99028c5e33eef74686fee618872ad8c83fdbcf1";

        console.log("-- investment --");
        const investment = await Investment.fetch(dharma, agreementId);
        console.log(investment);

        console.log("-- debt --");
        const debt = await Debt.fetch(dharma, agreementId);
        console.log(debt);

        const outstandingAmount = await debt.getOutstandingAmount();*/
        
        /*const txHash = await debt.makeRepayment(outstandingAmount);*/

        /*const repaymentSchedule =  await dharma.servicing.getRepaymentScheduleAsync(agreementId);
        
        console.log("-- REPAYMENT SCHEDULE --");
        repaymentSchedule.forEach(ts => {
            var date = new Date(ts * 1000);
            console.log(date);
        });*/
        /* const repayment_schdeule = await adapter.getRepaymentSchedule(debt)
         console.log(repayment_schdeule);*/

        this.setState({
            investments,
            isLoading: false
        });
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
    renderShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'blue' }}>
                From {start} to {to}, totals is {total}&nbsp;&nbsp;(its a customize text)
      </p>
        );
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
                dataField: "createdAt",
                text: "Created Date",
                formatter: function (cell, row, rowIndex, formatExtraData) {
                    var date = moment(cell).format("DD/MM/YYYY");
                    var time = moment(cell).format("HH:mm:ss");
                    return (
                        <div>
                            <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="funded-loans-time-label">{time}</span></div>
                        </div>
                    )
                }
            },
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
                            One-time
                </div>
                    )
                }
            }
        ];

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
                />

                {
                    data.length === 0 && <FundedLoanRequestsEmpty />
                }
            </div>
        );
    }
}

export default FundedLoanRequests;
