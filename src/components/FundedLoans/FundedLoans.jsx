// External libraries
import React, { Component } from 'react';
import { Dharma } from "@dharmaprotocol/dharma.js";
import * as moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";

// Components
import Loading from "../Loading/Loading";

// Services
import Api from "../../services/api";

// Styling
import "./FundedLoans.css";
import FundedLoansEmpty from "./FundedLoansEmpty/FundedLoansEmpty";
import _ from 'lodash';
import {amortizationUnitToFrequency} from "../../utils/Util";
import paginationFactory from 'react-bootstrap-table2-paginator';
/**
 * Here we define the columns that appear in the table that holds all of the
 * open Loan Requests.
 */
const columns = [
    {
        dataField: "createdAt",
        text: "Created Date",
        formatter:function(cell,row,rowIndex,formatExtraData){
            var date = moment(row.requestedAt).format("DD/MM/YYYY");
            var time = moment(row.requestedAt).format("HH:mm:ss");
            return (
                <div>
                    <div className="text-left"><span className="number-highlight">{date}<br /></span><span className="funded-loans-time-label">{time}</span></div>
                </div>
            )
        },
    },
    {
        dataField: "principalAmount",
        text: "Amount",
        formatter:function(cell,row,rowIndex,formatExtraData){
            return (
                <div>
                    <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span> <br />{row.principalTokenSymbol}</div>
                </div>
            )
        }
    },
    {
        dataField: "termDuration",
        text: "Term",
        formatter:function(cell,row,rowIndex,formatExtraData){
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
        formatter:function(cell,row,rowIndex,formatExtraData){
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
        formatter:function(cell,row,rowIndex,formatExtraData){
            return (
                <div>
                    <div className="text-right dispaly-inline-block"><span className="number-highlight">{cell}</span><br />{row.collateralTokenSymbol}</div>
                </div>
            )
        }
    },
    {
        dataField: "repaidAmount",
        isDummyField: true,
        text: "Total Repayment",
        formatter:function(cell,row,rowIndex,formatExtraData){
            return (
                <div>
                    <div className="text-right dispaly-inline-block"><span className="number-highlight">{row.collateralAmount}</span><br />{row.principalTokenSymbol}</div>
                </div>
            )
        }
    },
    {
        dataField: "repaymentFrequency",
        isDummyField: true,
        text: "Repayment Frequency",
        formatter:function(cell,row,rowIndex,formatExtraData){
            return (
                <div>
                    {amortizationUnitToFrequency(row.termUnit)}
                </div>
            )
        }
    }    
];

class FundedLoans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundedLoansLists: [],
            highlightRow: null,
            isLoading: true,
        };
        this.fundedLoansRequests = this.fundedLoansRequests.bind(this);
        this.parseLoanRequest = this.parseLoanRequest.bind(this);
    }

    /**
     * When the component mounts, use the API to get all of the load requests from the relayer
     * database, and parse those into LoanRequest objects using Dharma.js. Then, set the state of
     * the current component to include those loan requests so that they can be rendered as a table.
     *
     * This function assumes that there is a database with Loan Request data, and that we have
     * access to Dharma.js, which is connected to a blockchain.
     */
    componentDidMount() {
        const { highlightRow } = this.props;

        this.setState({
            highlightRow,
        });

        const api = new Api();

        const sort = "createdAt";
        const order = "desc";

        api.setToken(this.props.token).get("loanRequests", { sort, order })
            .then(this.fundedLoansRequests)
            .then((fundedLoansLists) => this.setState({ fundedLoansLists, isLoading: false }))
            .catch((error) => {
                if(error.status && error.status === 403){
                    this.props.redirect(`/login/`);
                }
            });
    }

    fundedLoansRequests(FundedData) {
        var filteredFundedData = _.filter(FundedData, { 'status': "FILLED" });
        return Promise.all(filteredFundedData.map(this.parseLoanRequest));
    }

    /**
     * Given loan data that comes from the relayer database, `parseLoanRequest` uses Dharma.js to
     * instantiate a `LoanRequest` type, which has access to more information about the loan. It
     * then adds an id and requestedAt (both from the relayer database) to that object.
     *
     * @param datum
     * @returns {Promise<any>}
     */
    parseLoanRequest(datum) {
        const { dharma } = this.props;

        const { LoanRequest } = Dharma.Types;

        return new Promise((resolve) => {
            LoanRequest.load(dharma, datum).then((loanRequest) => {
                resolve({
                    ...loanRequest.getTerms(),
                    id: datum.id,
                    requestedAt: datum.createdAt,
                });
            });
        });
    }

    /**
     * Returns an array of loan requests, which can be rendered in a table.
     *
     * For each `LoanRequest` object from Dharma.js, it adds two human-readable timestamps - one
     * describing when the request was created, and one describing its expiration date.
     */
    getData() {
        const { fundedLoansLists } = this.state;

        if (!fundedLoansLists) {
            return null;
        }

        return fundedLoansLists.map((investment) => {
            return {
                ...investment,
                principal: `${investment.principalAmount} ${investment.principalTokenSymbol}`,
                term: `${investment.termDuration} ${investment.termUnit}`,
                collateral: `${investment.collateralAmount} ${investment.collateralTokenSymbol}`,
                repaidAmount: `${investment.repaidAmount} ${investment.principalTokenSymbol}`,
                totalExpectedRepaymentAmount: `${investment.totalExpectedRepaymentAmount} ${
                    investment.principalTokenSymbol
                }`
            };
        });
    }
    render() {
        const { highlightRow, isLoading } = this.state;

        const data = this.getData();

        if (isLoading) {
            return <Loading/>;
        }

        const rowEvents = {
            onClick: (e, row, rowIndex) => {
                this.props.redirect(`/detail/${row.id}`);
            },
        };

        const rowClasses = (row, rowIndex) => {
            const rowData = data[rowIndex];

            if (rowData.id === highlightRow) {
                return "funded-loans-row1 highlight cursor-pointer";
            } else {
                return "funded-loans-row1 cursor-pointer";
            }
        };
        
        const pagination = paginationFactory({
            page: 1,
            /*showTotal:true,*/
            alwaysShowAllBtns:true
        });

        return (
            <div className="FundedLoansList">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes = {"open-request"}
                    columns={columns}
                    data={data}
                    headerClasses={"text-center"}
                    rowClasses={rowClasses}
                    bordered={ false }
                    rowEvents={rowEvents}
                    pagination={pagination}
                />
            </div>
        );
    }
}

export default FundedLoans;
