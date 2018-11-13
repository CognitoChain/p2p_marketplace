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
import { amortizationUnitToFrequency,niceNumberDisplay } from "../../../utils/Util";
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
        const { highlightRow } = this.props;
        this.setState({
            highlightRow,
        });
        const api = new Api();
        const sort = "createdAt";
        const order = "desc";

        api.setToken(this.props.token).get("loanRequests", { sort, order })
            .then(this.parseLoanRequests)
            .then((loanRequests) => this.setState({ loanRequests, isLoading: false }))
            .catch((error) => {
                if(error.status && error.status === 403){
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
                    status:datum.status
                });
            });
        });
    }
    getData() {
        const { loanRequests } = this.state;
        return loanRequests.map((request) => {
            return {
                ...request,
                principal: `${request.principalAmount} ${request.principalTokenSymbol}`,
                collateral: `${request.collateralAmount} ${request.collateralTokenSymbol}`,
                term: `${request.termDuration} ${request.termUnit}`,
                expiration: moment.unix(request.expiresAt).fromNow(),
                requestedDate: moment(request.requestedAt).calendar(),
                authenticated:this.props.authenticated
            };
        });
    }
    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    openlink(row_id){
        if(this.props.authenticated)
        {
            this.props.redirect(`/request/${row_id}`);            
        }
        else
        {
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
        let _self=this;
        const { highlightRow, isLoading } = this.state;

        const data = this.getData();

        if (isLoading) {
            return <Loading/>;
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
                text: "Loan Amount",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{niceNumberDisplay(cell)}</span><br />{row.principalTokenSymbol}</div>
                        </div>
                    )
                },
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
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{niceNumberDisplay(cell)}</span><br />{row.collateralTokenSymbol}</div>
                        </div>
                    )
                }
            },
            {
                dataField: "repayment",
                isDummyField: true,
                text: "Total Repayment",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    let interest_amount = (row.principalAmount * row.interestRate) / 100;
                    let repayment_amount = row.principalAmount + interest_amount;
                    return (
                        <div>
                            <div className="text-right dispaly-inline-block"><span className="number-highlight">{niceNumberDisplay(repayment_amount)}</span><br />{row.principalTokenSymbol}</div>
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
                            <span className="number-highlight">{amortizationUnitToFrequency(row.termUnit)}</span>
                        </div>
                    )
                }
            },
            {
                dataField: "fund",
                isDummyField: true,
                text: "Action",
                formatter:function(cell,row,rowIndex,formatExtraData){
                    return (
                        <div className="d-inline-block">
                            <a href="javascript:;" className="btn btn-outline-success cognito x-small" onClick={() => _self.openlink(row.id)}>Fund</a>
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
        if(data.length==0){
            return <LoanRequestsEmpty />
        }
        return (
            <div className="LoanRequests">
                <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes = {"open-request"}
                    columns={columns}
                    data={data}
                    headerClasses={"text-center"}
                    rowClasses={rowClasses}
                    bordered={ false }
                    pagination={pagination}                    
                />
            </div>
        );
    }
}

export default LoanRequests;
