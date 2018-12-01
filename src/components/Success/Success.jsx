import React, { Component } from 'react';
import { Row, Col,Breadcrumb ,BreadcrumbItem,Alert } from 'reactstrap';
import './Success.css';
import { Link } from 'react-router-dom';

class Success extends Component {

    constructor(props) {
        super(props);
        this.tabsclick = this.tabsclick.bind(this);
        this.state = {
            activeTab: '1',
            widths:80
        };
    }
    tabsclick(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    componentWillMount() {

    }
    
    render() {
        return (
            <div>
                <div className="page-title">
                    <Row>
                        <Col sm={6}>
                            <Breadcrumb>
                                    <BreadcrumbItem>
                                        <Link to="/market" className="market-link"><span>Market</span></Link>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem active>Loan Created</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                        <Col sm={6}>
                        </Col>
                    </Row>
                </div>
                <Row className="mb-30 mt-80">
                    
                    <Col lg={12} md={12} sm={12} xl={12} className="loan-success-msg">
                            <Alert color="info" className="p-5">
                                <h3 className="alert-heading  text-center">
                                    <i className="fa fa-check-circle check-green-color"></i>  
                                    <span className="loan-created-success-text"> Congratulations! Your loan request has been submitted successfully.</span>
                                </h3>
                                <div className="text-center mt-10">
                                    <Link to="/market"><span className="back-to-market-link">Back to market</span></Link>
                                </div>
                            </Alert>
                    </Col>
                </Row>
            </div>
        );
    }
}
export default Success;