import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from 'react';
import { Card,CardBody,CardTitle, Row, Col,Breadcrumb ,BreadcrumbItem,ListGroup } from 'reactstrap';
import './Detail.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import SummaryItem from "./SummaryItem/SummaryItem";
import * as moment from "moment";
import Api from "../../services/api";

const repayment_loans = [
{
    "created_date": "01/08/2018 \n 00:12:22",
    "priciple_amount": "1666.67 \n REP",
    "interest_amount": "200 \n REP",
    "total_repayment_amount": "1866.67 \n REP",
    "status": "paid"        
},
{
    "created_date": "01/08/2018 \n 00:12:22",
    "priciple_amount": "1666.67 \n REP",
    "interest_amount": "200 REP",
    "total_repayment_amount": "1866.67 REP",
    "status": "paid"        
},
{
    "created_date": "01/08/2018 \n 00:12:22",
    "priciple_amount": "1666.67 REP",
    "interest_amount": "200 REP",
    "total_repayment_amount": "1866.67 REP",
    "status": "paid"        
},
{
    "created_date": "01/08/2018 \n 00:12:22",
    "priciple_amount": "1666.67 REP",
    "interest_amount": "200 REP",
    "total_repayment_amount": "1866.67 REP",
    "status": "paid"        
},
{
    "created_date": "01/08/2018 \n 00:12:22",
    "priciple_amount": "1666.67 REP",
    "interest_amount": "200 REP",
    "total_repayment_amount": "1866.67 REP",
    "status": "paid"        
},
{
    "created_date": "01/08/2018 \n 00:12:22",
    "priciple_amount": "1666.67 REP",
    "interest_amount": "200 REP",
    "total_repayment_amount": "1866.67 REP",
    "status": "paid"        
}       
]

class Detail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            widths:80
        };
    }
    componentWillMount() {

    }

    componentDidMount() {
        const { LoanRequest,Investments, Investment, Debt } = Dharma.Types;
        const { dharma, id } = this.props;

        const api = new Api();
        api.setToken(this.props.token).get(`loanRequests/${id}`).then(async (loanRequestData) => {
            const loanRequest = await LoanRequest.load(dharma, loanRequestData);
            console.log(loanRequest);
            this.setState({ loanRequest });
            var get_terms = loanRequest.getTerms();
            this.setState({
                principal:get_terms.principalAmount,
                principalTokenSymbol:get_terms.principalTokenSymbol,
                collateralAmount:get_terms.collateralAmount,
                collateralTokenSymbol:get_terms.collateralTokenSymbol,
                interestRate:get_terms.interestRate,
                termLength:get_terms.termDuration,
                termUnit:get_terms.termUnit              
            });


            let agreementId = id;


            const investment = await Investment.fetch(dharma, agreementId);
            console.log(investment);

            console.log("-- debt --");
            const debt = await Debt.fetch(dharma, agreementId);
            console.log(debt);

            const outstandingAmount = await debt.getOutstandingAmount();
            /*const txHash = await debt.makeRepayment(outstandingAmount);*/

            const repaymentSchedule =  await dharma.servicing.getRepaymentScheduleAsync(agreementId);

            console.log("-- REPAYMENT SCHEDULE --");
            repaymentSchedule.forEach(ts => {
                var date = new Date(ts * 1000);
                console.log(date);
            });

        });
    }
    
    render() {

        const columns = [
        {
            dataField: "created_date",
            text: "Created Date",
            formatter:function(cell,row,rowIndex,formatExtraData){
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
            formatter:function(cell,row,rowIndex,formatExtraData){
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
        }                       
        ];

        const {
            principal,
            principalTokenSymbol,
            collateralAmount,
            collateralTokenSymbol,
            termUnit,
            termLength,
            interestRate
            } = this.state;


        return (
            <div>
            <div className="page-title">
            <Row>
            <Col sm={6}>
            <h4 className="mb-0"> Loan Detail</h4>
            </Col>
            <Col sm={6}>
            <Breadcrumb className="float-left float-sm-right">
            <BreadcrumbItem><a href="#">My Loans</a></BreadcrumbItem>
            <BreadcrumbItem active>Loan Detail</BreadcrumbItem>
            </Breadcrumb>
            </Col>
            </Row>
            </div>

            <Row className="mb-30">

            <Col lg={4} md={4} sm={6} xl={4}>

            <div>
            <Card className="card-statistics h-100 my-activities-container p-3 loan-detail-card-statistics">
            <CardBody>
            <CardTitle>Overview</CardTitle>

            <Row>
            <Col lg={6} md={6} sm={6} xl={6}>
            <div className="pull-left">
            <span>Loan Amount</span><br />
            <span className="loan-detail-numbers">{ principal > 0 ? principal : ' - ' }</span> { principal > 0 ? principalTokenSymbol : ' - ' }     
            </div>
            </Col>

            <Col lg={6} md={6} sm={6} xl={6}>
            <div className="">
            <span>Outstanding Amount</span><br />
            <span className="loan-detail-numbers">9,333.33</span> REP
            </div>
            </Col>
            </Row>

            <Row className="mt-20">
            <Col lg={6} md={6} sm={6} xl={6}>
            <div className="pull-left">
            <span>Next Repayment</span><br />
            <span className="loan-detail-numbers">1,866.67</span> REP<br />
            01/09/2018 
            </div>
            </Col>
            <Col lg={6} md={6} sm={6} xl={6}>
            <span className="btn cognito repayment-button icon mb-15 btn-make-repayment">Make Repayment</span>
            </Col>
            </Row>
            </CardBody>
            </Card>

            </div>


            <div className="mt-30">

            <Card className="card-statistics mb-30 h-100 p-4">
            <CardBody>
            <CardTitle>More Details </CardTitle>
            <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
            <ListGroup className="list-unstyled to-do">
            <SummaryItem 
            labelName = "Created Date"
            labelValue = "01/07/2018"
            labelValue2 = "00:12:22"
            />
            <SummaryItem 
            labelName = "Collateral Amount"
            labelValue = { collateralAmount > 0 ? collateralAmount : ' - ' }
            labelValue2 = {collateralTokenSymbol}
            />
            <SummaryItem 
            labelName = "Collateral Value"
            labelValue = "222.2"
            labelValue2 = "$"
            />
            <SummaryItem 
            labelName = "LTV"
            labelValue = "68"
            labelValue2 = "%"  
            />
            <SummaryItem 
            labelName = "Loan Term"
            labelValue = { termLength > 0 ? termLength : ' - ' }
            labelValue2 = {termUnit}    
            />
            <SummaryItem 
            labelName = "Interest Rate(Per Loan Term)"
            labelValue = { interestRate > 0 ? interestRate : ' - ' }
            labelValue2 = "%"   
            />
            <SummaryItem 
            labelName = "Interest Amount"
            labelValue = "1200"
            labelValue2 = "REP"     
            />
            <SummaryItem 
            labelName = "Total Repayment Amount"
            labelValue = "11,200"
            labelValue2 = "REP"       
            />
            </ListGroup>
            </div>
            </CardBody>
            </Card>


            </div>

            </Col>

            <Col lg={8} md={8} sm={6} xl={8}>

            <Card className="card-statistics mb-30 p-4">
            <CardBody>
            <CardTitle>Repayment Schedule</CardTitle>
            <BootstrapTable                                               
            columns={columns}
            data={repayment_loans}
            bordered={ false }>
            <TableHeaderColumn width='150' dataField='created_date' isKey className="text-right">Repayment Date</TableHeaderColumn>
            <TableHeaderColumn width='150' dataField='priciple_amount'>Principle Amount</TableHeaderColumn>
            <TableHeaderColumn width='150' dataField='interest_amount'>Interest Amount</TableHeaderColumn>
            <TableHeaderColumn width='200' dataField='total_repayment_amount'>Total Repayment Amount</TableHeaderColumn>
            <TableHeaderColumn width='100' dataField='status'>Status</TableHeaderColumn>
            </BootstrapTable>
            </CardBody>
            </Card>  

            </Col>
            </Row>              
            </div>
            );
}
}
export default Detail;