import { Dharma } from "@dharmaprotocol/dharma.js";
import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem,
  ListGroup
} from "reactstrap";
import "./Detail.css";
import SummaryItem from "./SummaryItem/SummaryItem";
import * as moment from "moment";
import Api from "../../services/api";
import BootstrapTable from "react-bootstrap-table-next";
import Loading from "../Loading/Loading";

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      widths: 80,
      principal: 0,
      principalTokenSymbol: "",
      collateralAmount: 0,
      collateralTokenSymbol: "",
      interestRate: "",
      termLength: "",
      termUnit: "",
      createdDate: null,
      createdTime: null,
      interestAmount: 0,
      totalRepaymentAmount: 0,
      repaymentLoans: [],
      isLoading: true
    };
  }
  componentWillMount() {}

  componentDidMount() {
    const { LoanRequest, Investments, Investment, Debt } = Dharma.Types;
    const { dharma, id } = this.props;
    const api = new Api();
    api
      .setToken(this.props.token)
      .get(`loanRequests/${id}`)
      .then(async loanRequestData => {
        const loanRequest = await LoanRequest.load(dharma, loanRequestData);
        console.log(loanRequest);
        this.setState({ loanRequest });
        var get_terms = loanRequest.getTerms();

        let principal = get_terms.principalAmount;
        let interest_rate = get_terms.interestRate;
        let interest_amount = (principal * interest_rate) / 100;
        let total_repayment_amount =
          parseFloat(principal) + parseFloat(interest_amount);

        this.setState({
          principal: get_terms.principalAmount,
          principalTokenSymbol: get_terms.principalTokenSymbol,
          collateralAmount: get_terms.collateralAmount,
          collateralTokenSymbol: get_terms.collateralTokenSymbol,
          interestRate: get_terms.interestRate,
          termLength: get_terms.termDuration,
          termUnit: get_terms.termUnit,
          createdDate: moment(loanRequest.data.createdAt).format("DD/MM/YYYY"),
          createdTime: moment(loanRequest.data.createdAt).format("HH:mm:ss"),
          interestAmount: interest_amount,
          totalRepaymentAmount: total_repayment_amount
        });
        let agreementId = id;
        const repaymentSchedule = await dharma.servicing.getRepaymentScheduleAsync(
          agreementId
        );
        const repaymentLoanstemp = [];
        let i = 1;
        repaymentSchedule.forEach(ts => {
          var date = new Date(ts * 1000);
          repaymentLoanstemp.push({
            id: i,
            createdDate: moment(date).format("DD/MM/YYYY HH:mm:ss"),
            principalAmount: get_terms.principalAmount,
            principalTokenSymbol: get_terms.principalTokenSymbol,
            interestAmount: 0,
            totalRepaymentAmount: 0,
            status: ""
          });
          i++;
        });
        this.setState({ repaymentLoans: repaymentLoanstemp, isLoading: false });
      });
  }

  getData() {
    const { repaymentLoans } = this.state;
    return repaymentLoans.map(request => {
      return {
        ...request,
        requestedDate: ""
      };
    });
  }

  render() {
    const data = this.getData();

    const columns = [
      {
        dataField: "createdDate",
        text: "Repayment Date",
        formatter: function(cell, row, rowIndex, formatExtraData) {
          var date = moment(cell).format("DD/MM/YYYY");
          var time = moment(cell).format("HH:mm:ss");
          return (
            <div>
              <div className="text-left">
                <span className="number-highlight">
                  {date}
                  <br />
                </span>
                <span className="funded-loans-time-label">{time}</span>
              </div>
            </div>
          );
        }
      },
      {
        dataField: "principalAmount",
        text: "Principle Amount",
        formatter: function(cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <div className="text-right dispaly-inline-block">
                <span className="number-highlight">{cell}</span>
                <br />
                {row.principalTokenSymbol}
              </div>
            </div>
          );
        }
      },
      {
        dataField: "interestAmount",
        text: "Interest Amount",
        formatter: function(cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <span className="number-highlight">{cell}</span> <br />
              {row.principalTokenSymbol}
            </div>
          );
        }
      },
      {
        dataField: "totalRepaymentAmount",
        text: "Total Repaymnet Amount",
        formatter: function(cell, row, rowIndex, formatExtraData) {
          return (
            <div>
              <span className="number-highlight">{cell}</span> <br />
              {row.principalTokenSymbol}
            </div>
          );
        }
      },
      {
        dataField: "status",
        text: "Status",
        formatter: function(cell, row, rowIndex, formatExtraData) {
          return <div className="payment-due">
                <i className="fa fa-check-circle"></i><br />
                Due
          </div>;
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
      interestRate,
      createdDate,
      createdTime,
      interestAmount,
      totalRepaymentAmount,
      repaymentLoans,
      isLoading
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
                <BreadcrumbItem>
                  <a href="#">My Loans</a>
                </BreadcrumbItem>
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
                        <span>Loan Amount</span>
                        <br />
                        <span className="loan-detail-numbers">
                          {principal > 0 ? principal : " - "}
                        </span>{" "}
                        {principal > 0 ? principalTokenSymbol : " - "}
                      </div>
                    </Col>

                    <Col lg={6} md={6} sm={6} xl={6}>
                      <div className="">
                        <span>Outstanding Amount</span>
                        <br />
                        <span className="loan-detail-numbers">
                          9,333.33
                        </span>{" "}
                        REP
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-20">
                    <Col lg={6} md={6} sm={6} xl={6}>
                      <div className="pull-left">
                        <span>Next Repayment</span>
                        <br />
                        <span className="loan-detail-numbers">
                          1,866.67
                        </span>{" "}
                        REP
                        <br />
                        01/09/2018
                      </div>
                    </Col>
                    <Col lg={6} md={6} sm={6} xl={6}>
                      <span className="btn cognito repayment-button icon mb-15 btn-make-repayment">
                        Make Repayment
                      </span>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </div>

            <div className="mt-30">
              <Card className="card-statistics mb-30 h-100 p-4">
                <CardBody>
                  <CardTitle>More Details </CardTitle>
                  <div
                    className="scrollbar"
                    tabIndex={2}
                    style={{ overflowY: "hidden", outline: "none" }}
                  >
                    <ListGroup className="list-unstyled to-do">
                      <SummaryItem
                        labelName="Created Date"
                        labelValue={createdDate != "" ? createdDate : "N/A"}
                        labelValue2={createdTime != "" ? createdTime : "N/A"}
                      />
                      <SummaryItem
                        labelName="Collateral Amount"
                        labelValue={
                          collateralAmount > 0 ? collateralAmount : " - "
                        }
                        labelValue2={collateralTokenSymbol}
                      />
                      <SummaryItem
                        labelName="Collateral Value"
                        labelValue="222.2"
                        labelValue2="$"
                      />
                      <SummaryItem
                        labelName="LTV"
                        labelValue="68"
                        labelValue2="%"
                      />
                      <SummaryItem
                        labelName="Loan Term"
                        labelValue={termLength > 0 ? termLength : "N/A"}
                        labelValue2={termUnit}
                      />
                      <SummaryItem
                        labelName="Interest Rate(Per Loan Term)"
                        labelValue={interestRate > 0 ? interestRate : "N/A"}
                        labelValue2="%"
                      />
                      <SummaryItem
                        labelName="Interest Amount"
                        labelValue={interestAmount > 0 ? interestAmount : "N/A"}
                        labelValue2={
                          interestAmount > 0 ? principalTokenSymbol : "N/A"
                        }
                      />
                      <SummaryItem
                        labelName="Total Repayment Amount"
                        labelValue={
                          totalRepaymentAmount > 0
                            ? totalRepaymentAmount
                            : "N/A"
                        }
                        labelValue2={
                          totalRepaymentAmount > 0
                            ? principalTokenSymbol
                            : "N/A"
                        }
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

                {isLoading === true && <Loading />}

                {isLoading === false && (
                  <BootstrapTable
                    hover={false}
                    keyField="id"
                    classes={"open-request"}
                    columns={columns}
                    data={data}
                    headerClasses={"text-center"}
                    bordered={false}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}
export default Detail;
