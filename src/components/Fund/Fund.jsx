import React, { Component } from "react";
import { Row, Col, Breadcrumb, BreadcrumbItem, Alert } from "reactstrap";
import "./Fund.css";
import { Link } from "react-router-dom";

class Fund extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }

  render() {
    const { id } = this.props;
    return (
      <div>
        <div className="page-title">
          <Row>
            <Col sm={6}>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link to="/market" className="market-link">
                    <span>Market</span>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbItem active>Loan Funded</BreadcrumbItem>
              </Breadcrumb>
            </Col>
            <Col sm={6} />
          </Row>
        </div>

        <Alert color="info" className=" mb-30 mt-70 fund-success-container">
          <Row className="pl-5 pt-2">
            <Col lg={1} md={1} sm={3} xl={1} className="text-right">
              <i className="fa fa-check-circle fund-check-green-color p-4" />
            </Col>

            <Col
              lg={11}
              md={11}
              sm={9}
              xl={11}
              className="loan-success-msg p-5 pl-10 pb-0"
            >
              <div>
                <h3 className="alert-heading">
                  <span className="loan-created-success-text">
                    Congratulations! Your have successfully funded the loan
                    request.
                  </span>
                </h3>
                <p className="mt-15 fund-repaymnet-schedule-text">
                  You can check repayment schedule in{" "}
                  <Link to={`/detail/${id}`}>
                    <span className="link-blue"> Loan Detail </span>
                  </Link>
                  page.
                </p>
                <div className="text-center mt-20">
                  <Link to="/market">
                    <span className="back-to-market-link">Back to Market</span>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Alert>
      </div>
    );
  }
}
export default Fund;
