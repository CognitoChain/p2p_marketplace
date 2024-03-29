import React, { Component } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import * as moment from "moment-timezone";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from 'react-bootstrap-table2-paginator';
import _ from "lodash";
import Loading from "../../Loading/Loading";
import { niceNumberDisplay,tooltipNumberDisplay } from "../../../utils/Util";
class Transactions extends Component {
  render() {
    const {
      transationHistory,
      isLoading
    } = this.props;

    const pagination = paginationFactory({
      page: 1,
      alwaysShowAllBtns: true
    });

    const transactionColumns = [
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
        dataField: "amount",
        text: "Amount",
        formatter: function (cell, row, rowIndex, formatExtraData) {
          return (
            <div className="text-right">
              <span className="number-highlight custom-tooltip" tooltip-title={tooltipNumberDisplay(cell,row.principalSymbol)}>{niceNumberDisplay(cell)}</span>
              <br />
              {row.principalSymbol}
            </div>
          );
        }
      }
    ];
    let transationHistorySorted = _.reverse(_.sortBy(transationHistory, ['createdDate']));

    return (
      <div>
        {transationHistory.length > 0 && (
         
              <Card className="card-statistics p-4">
                <CardBody>
                  <CardTitle>Transaction History</CardTitle>

                  {isLoading === true && <Loading />}

                  {isLoading === false && (
                    <BootstrapTable
                      hover={false}
                      keyField="id"
                      classes={"transaction-history"}
                      columns={transactionColumns}
                      data={transationHistorySorted}
                      bordered={false}
                      pagination={pagination}
                    />
                  )}
                </CardBody>
              </Card>
        )}
      </div>
    );
  }
}

export default Transactions;
