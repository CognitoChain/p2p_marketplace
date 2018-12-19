import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Row, Col, Alert } from 'reactstrap';
import _ from "lodash";
import './Pageerror.css';
class Pageerror extends Component {
    constructor(props) {
        super(props);
        let pageErrorMessageCode = (!_.isUndefined(this.props.pageErrorMessageCode)) ? this.props.pageErrorMessageCode : 404;
        let message = (pageErrorMessageCode == 500) ? 'An error occurred. Please try again later.' : 'Resource not available. Please try again later.';  
        this.state = {
            pageErrorMessage:message
        };
    }
    render() {
        const {pageErrorMessage} = this.state;
        const {smallsize} = this.props;
        return (
            <Row className="mb-30 mt-30">
              <Col lg={12} md={12} sm={12} xl={12} className="page-error-msg">
                <Alert color="danger" className={(smallsize ? 'p-4' : 'p-5')}>
                    <h3 className="alert-heading text-center">
                        <span className={(smallsize ? 'small-size-page-error-text' : 'page-error-text')}> 
                            {pageErrorMessage}
                        </span>
                    </h3>
                    {
                      !smallsize && (
                        <div className="text-center mt-10">
                            <Link to="/market"><span className="back-to-market-link">Back to market</span></Link>
                        </div>      
                      )
                    }
                </Alert>
              </Col>
            </Row>
        );
    }
}
export default Pageerror;