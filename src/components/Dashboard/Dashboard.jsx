import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
/*import { Dharma } from "@dharmaprotocol/dharma.js";*/
import { Card,CardBody,CardTitle,TabContent, TabPane, Nav, NavItem, NavLink, Row, Col,Breadcrumb ,BreadcrumbItem,Progress,Table } from 'reactstrap';
import './Dashboard.css';
import classnames from 'classnames';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DharmaConsumer from "../../contexts/Dharma/DharmaConsumer";
import MyLoanRequests from "../MyLoanRequests/MyLoanRequests";
import FundedLoanRequests from "../FundedLoanRequests/FundedLoanRequests";

const data = {
    labels: [
        'Assets',
        'Liabilities'
    ],
    datasets: [{
        data: [80, 150],
        backgroundColor: [
            '#00cc99',
            '#ffa31a'
        ],
        hoverBackgroundColor: [
            '#00cc99',
            '#ffa31a'
        ]
    }]
};

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.tabsclick = this.tabsclick.bind(this);
        this.state = {
            activeTab: '1',
            widths:80
        };
        console.log(this.props)
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
                            <h4 className="mb-0"> Dashboard</h4>
                            <div className='delete-button' onClick={(item) => { if (window.confirm('Are you sure you wish to delete this item?')) this.onCancel(item) }} />
                        </Col>
                        <Col sm={6}>
                        <Breadcrumb className="float-left float-sm-right">
                                    <BreadcrumbItem><a href="#">Home</a></BreadcrumbItem>
                                    <BreadcrumbItem active>Dashboard</BreadcrumbItem>
                            </Breadcrumb>
                        </Col>
                    </Row>
                </div>
                {/* <!-- widgets --> */}
                <Row className="mb-30">
                    
                    <Col lg={6} md={6} sm={6} xl={6}>
                        
                        <Card className="h-100">
                            <CardBody>
                                <CardTitle>My Portfolio</CardTitle>
                                <Row>
                                    <Col md={6}>
                                        <div className="chart-wrapper"  style={{height: 200}}>
                                            <Doughnut data={data} options={{maintainAspectRatio: false, legend: {display: false, labels: {fontFamily: "Poppins"}}}}  width={this.state.widths} />
                                        </div>
                                    </Col>
                                    <Col md={1}></Col>
                                    <Col md={5}>
                                        
                                        <div className="assets-container">    
                                            <label>Assets</label>
                                            <Progress value={25} className="mb-10 assets-color" color="success" />
                                            <label className="statistics-label">$120,000</label>
                                        </div>

                                        <div className="liability-container">
                                            <label>Liabilities</label>
                                            <Progress value={50} className="mb-10 liabilities-color" color="warning" />
                                            <label className="statistics-label">$230,000</label>
                                        </div>

                                        <div className="assets-vs-liabilities-container">
                                            <label>Assets vs Liabilities</label><br />
                                            <label className="statistics-label">36%</label>
                                        </div>

                                    </Col>
                                </Row>


                                
                                
                            </CardBody>
                        </Card>

                    </Col>

                    <Col lg={6} md={6} sm={6} xl={6}>
                        

                    <Card className="card-statistics h-100 my-activities-container">
                            <CardBody>
                                <CardTitle>My Activities</CardTitle>
                                <Table responsive borderless className="my-activities-table">
                                    <tbody>
                                        <tr>
                                            <td width="5%"><div className="round-icon round-icon-lg orange"><i className="ti-money"></i></div></td>
                                            <td>
                                                <span className="weight-bolder">Loan repayment due</span>
                                                <div>Loan#1026</div>
                                            </td>
                                            <td>
                                                <span className="weight-bolder">28/09/2018</span>
                                                <div>Due Date</div>
                                            </td>
                                            <td className="text-right">
                                                <span className="number-highlight color-orange">240</span>
                                                <div className="currency-text">DAI</div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td width="5%"><div className="round-icon round-icon-lg orange"><i className="ti-money"></i></div></td>
                                            <td>
                                                <span className="weight-bolder">Loan repayment due</span>
                                                <div>Loan#1297</div>
                                            </td>
                                            <td>
                                                <span className="weight-bolder">06/10/2018</span>
                                                <div>Due Date</div>
                                            </td>
                                            <td className="text-right">
                                                <span className="number-highlight color-orange">2.968</span>
                                                <div className="currency-text">WETH</div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td width="5%"><div className="round-icon round-icon-lg green"><i className="ti-money"></i></div></td>
                                            <td>
                                                <span className="weight-bolder">Loan Settlement</span>
                                                <div>Loan#926</div>
                                            </td>
                                            <td>
                                                <span className="weight-bolder">15/10/2018</span>
                                                <div>Due Date</div>
                                            </td>
                                            <td className="text-right">
                                                <span className="number-highlight color-green">5,250</span>
                                                <div className="currency-text">OMG</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="5%"><div className="round-icon round-icon-lg green"><i className="ti-money"></i></div> </td>
                                            <td>
                                                <span className="weight-bolder">Loan Settlement</span>
                                                <div>Loan#720</div>
                                            </td>
                                            <td>
                                                <span className="weight-bolder">28/09/2018</span>
                                                <div>Due Date</div>
                                            </td>
                                            <td className="text-right">
                                                <span className="number-highlight color-orange">790</span>
                                                <div className="currency-text">DAI</div>
                                            </td>
                                        </tr>
                                        
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>


                    </Col>
                </Row>


                <Row className="mb-30">
                    
                    <Col lg={12} md={12} sm={12} xl={12}>

                            <Card className="card-statistics h-100">
                            <CardBody>
                                <div className="tab nav-border" style={{ position: 'relative' }}>
                                    <div className="d-block d-md-flex justify-content-between">
                                        <div className="d-block w-100">
                                            <CardTitle>My Loans</CardTitle>
                                        </div>
                                        <div className="d-block d-md-flex" style={{ position: 'absolute', left: 100, top: 0 }}>
                                            <Nav tabs>
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({ active: this.state.activeTab === '1' })}
                                                        onClick={() => { this.tabsclick('1'); }}
                                                    >
                                                        Borrowed Loans
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                                                        onClick={() => { this.tabsclick('2'); }}
                                                    >
                                                        Funded Loans
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({ active: this.state.activeTab === '3' })}
                                                        onClick={() => { this.tabsclick('3'); }}
                                                    >
                                                        Archive
                                                    </NavLink>
                                                </NavItem>


                                            </Nav>
                                        </div>
                                    </div>
                                    <TabContent activeTab={this.state.activeTab}>
                                        <TabPane tabId="1" title="Borrowed Loans">
                                            <DharmaConsumer>
                                                {(dharmaProps) => (
                                                    <MyLoanRequests
                                                    authenticated={this.props.authenticated}
                                                    token={this.props.token}
                                                    dharma={dharmaProps.dharma}
                                                    redirect={this.redirect}
                                                    />
                                                    )}
                                            </DharmaConsumer>                                  
                                        </TabPane>

                                        <TabPane tabId="2" title="Funded Loans">
                                            <DharmaConsumer>
                                                {(dharmaProps) => (
                                                    <FundedLoanRequests
                                                    authenticated={this.props.authenticated}
                                                    token={this.props.token}
                                                    dharma={dharmaProps.dharma}
                                                    redirect={this.redirect}
                                                    />
                                                    )}
                                            </DharmaConsumer>      
                                        </TabPane>

                                        <TabPane tabId="3" title="Archive">
                                            
                                        </TabPane>



                                    </TabContent>
                                </div>
                            </CardBody>
                        </Card>

                    </Col>

                </Row>
                
               
              
            </div>



        );
    }
}
export default Dashboard;