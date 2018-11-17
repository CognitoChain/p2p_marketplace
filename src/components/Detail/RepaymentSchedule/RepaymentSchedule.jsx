import React, { Component } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import * as moment from "moment-timezone";
import BootstrapTable from "react-bootstrap-table-next";
import Loading from "../../Loading/Loading";

class RepaymentSchedule extends Component {
  render() {
    const {
      repaymentLoans,
      isLoading
    } = this.props;
    const columns = [
      {
        headerClasses: "created-title",
        dataField: "createdDate",
        text: "Repayment Date",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          var date = moment(cell).format("DD/MM/YYYY");
          var time = moment(cell).format("HH:mm:ss");
          return (
            <div>
              <div className="text-left">
                <span className="number-highlight">
                  {date}
                  <br />
                </span>
                <span className="loans-time-label">{time}</span>
              </div>
            </div>
          );
        }
      },
      {
        headerClasses: "amount-title",
        dataField: "principalAmount",
        text: "Principle Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div className="text-right">
              <span className="number-highlight">{cell}</span>
              <br />
              {row.principalSymbol}
            </div>
          );
        }
      },
      {
        headerClasses: "amount-title",
        dataField: "interestAmount",
        text: "Interest Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div className="text-right">
              <span className="number-highlight">{cell}</span> <br />
              {row.principalSymbol}
            </div>
          );
        }
      },
      {
        headerClasses: "amount-title",
        dataField: "totalRepaymentAmount",
        text: "Total Repaymnet Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div className="text-right">
              <span className="number-highlight">{cell}</span> <br />
              {row.principalSymbol}
            </div>
          );
        }
      },
      {
        dataField: "status",
        text: "Status",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          let label = "Due";
          let className = "payment-due";
          let iconName = "fa-check-circle";
          if (row.status == 'paid') {
            label = "Paid";
            className = "payment-success";
          }
          else if (row.status == "partial_paid") {
            label = "Partially Paid";
            className = "payment-partial-paid";
          }
          else if (row.status == "missed") {
            label = "Missed";
            className = "payment-missed";
            iconName = "fa-times-circle"
          }
          return (
            <div className={className}>
              <i className={"fa payment-check-circle " + iconName} />
              <br />
              {label}
            </div>
          );
        }
      }
    ];


    return (
      <div>
        {repaymentLoans.length > 0 && (
          <Card className="card-statistics mb-30 p-4">
            <CardBody>
              <CardTitle>Repayment Schedule</CardTitle>

              {isLoading === true && <Loading />}

              {isLoading === false && (
                <BootstrapTable
                  hover={false}
                  keyField="id"
                  classes={"repayment-schedule"}
                  columns={columns}
                  data={repaymentLoans}
                  headerClasses={"text-center"}
                  bordered={false}
                />
              )}
            </CardBody>
          </Card>
        )}
      </div>
    );
  }
}

export default RepaymentSchedule;
