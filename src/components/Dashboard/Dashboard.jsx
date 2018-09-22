import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card,CardBody,CardTitle,TabContent, TabPane, Nav, NavItem, NavLink, Row, Col,Breadcrumb ,BreadcrumbItem,Progress,Table } from 'reactstrap';
import './Dashboard.css';
import classnames from 'classnames';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const funded_loans = [
    {
        "created_date": "12/08/2018 00:12:22",
        "amount": "5000 DAI",
        "term": "1 Month",
        "interest_rate": "5%",
        "collateral": "53 WETH",
        "total_repayment": "5,250 DAI",
        "repayment_frequency": "One Time"
    },
    {
        "created_date": "07/08/2018 \n 00:12:22",
        "amount": "5000 OMG",
        "term": "1 Week",
        "interest_rate": "3%",
        "collateral": "12 WETH",
        "total_repayment": "5,150 OMG",
        "repayment_frequency": "One Time"
    },
    {
        "created_date": "01/08/2018 \n 00:12:22",
        "amount": "10,000 REP",
        "term": "6 Month",
        "interest_rate": "12%",
        "collateral": "1 WETH",
        "total_repayment": "12,000 REP",
        "repayment_frequency": "One Time"
    },
    {
        "created_date": "10/07/2018 00:12:22",
        "amount": "5000 ZRX",
        "term": "1 Month",
        "interest_rate": "6%",
        "collateral": "3 WETH",
        "total_repayment": "5,300 ZRX",
        "repayment_frequency": "One Time"
    }    
]

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
                                            <td width="5%"><div className="round round-lg orange"><i className="ti-money"></i></div></td>
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
                                            <td width="5%"><div className="round round-lg orange"><i className="ti-money"></i></div></td>
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
                                            <td width="5%"><div className="round round-lg green"><i className="ti-money"></i></div></td>
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
                                            <td width="5%"><div className="round round-lg green"><i className="ti-money"></i></div> </td>
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
                                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })}
                                                        onClick={() => { this.tabsclick('1'); }}
                                                    >
                                                        Funded Loans
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({ active: this.state.activeTab === '2' })}
                                                        onClick={() => { this.tabsclick('2'); }}
                                                    >
                                                        Borrowed Loans
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
                                        
                                        <TabPane tabId="1" title="Funded Loans">
                                            <BootstrapTable
                                                data={funded_loans}
                                               bordered={ false }
                                                >
                                                <TableHeaderColumn width='100' dataField='created_date' isKey>Created Date</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='amount'>Amount</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='term'>Term</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='interest_rate'>Interest Rate</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='collateral'>Collateral</TableHeaderColumn>
                                                <TableHeaderColumn width='200' dataField='total_repayment'>Total Repayment</TableHeaderColumn>
                                                <TableHeaderColumn width='150' dataField='repayment_frequency'>Repayment Frequency</TableHeaderColumn>
                                            </BootstrapTable>
                                        </TabPane>

                                        <TabPane tabId="2" title="Borrowed Loans">
                                            <BootstrapTable
                                                data={funded_loans}
                                                bordered={ false }
                                                >
                                                <TableHeaderColumn width='100' dataField='created_date' isKey>Created Date</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='amount'>Amount</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='term'>Term</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='interest_rate'>Interest Rate</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='collateral'>Collateral</TableHeaderColumn>
                                                <TableHeaderColumn width='200' dataField='total_repayment'>Total Repayment</TableHeaderColumn>
                                                <TableHeaderColumn width='150' dataField='repayment_frequency'>Repayment Frequency</TableHeaderColumn>
                                            </BootstrapTable>
                                        </TabPane>

                                        <TabPane tabId="3" title="Archive">
                                            <BootstrapTable
                                                data={funded_loans}
                                                bordered={ false }
                                                >
                                                <TableHeaderColumn width='100' dataField='created_date' isKey>Created Date</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='amount'>Amount</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='term'>Term</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='interest_rate'>Interest Rate</TableHeaderColumn>
                                                <TableHeaderColumn width='100' dataField='collateral'>Collateral</TableHeaderColumn>
                                                <TableHeaderColumn width='200' dataField='total_repayment'>Total Repayment</TableHeaderColumn>
                                                <TableHeaderColumn width='150' dataField='repayment_frequency'>Repayment Frequency</TableHeaderColumn>
                                            </BootstrapTable>
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