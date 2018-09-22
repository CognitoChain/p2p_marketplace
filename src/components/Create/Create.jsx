import React, { Component } from 'react';
import { Card,CardBody,CardTitle,TabContent, TabPane,Nav, NavItem, NavLink, Row, Col,Breadcrumb,BreadcrumbItem,DropdownToggle, DropdownMenu, DropdownItem, InputGroup, Button, InputGroupText,Input,InputGroupButtonDropdown,InputGroupAddon,ListGroup, ListGroupItem} from 'reactstrap';
import './Create.css';
import classnames from 'classnames';
class Create extends Component {

    constructor(props) {
      super(props);
      this.toggleDropDown = this.toggleDropDown.bind(this);
      this.prependtoggleDropDown = this.prependtoggleDropDown.bind(this);
      this.toggleSplit = this.toggleSplit.bind(this);
      this.state = {
            dropdownOpen: false,
            prependdropdownOpen: false,
            splitButtonOpen: false
      };
    }
    
      toggleDropDown() {
          this.setState({
            dropdownOpen: !this.state.dropdownOpen
          });
      }
      prependtoggleDropDown() {
          this.setState({
            prependdropdownOpen: !this.state.prependdropdownOpen
          });
      }

      toggleSplit() {
          this.setState({
            splitButtonOpen: !this.state.splitButtonOpen
          });
      }

    componentWillMount() {

    }
    
    render() {
        return (
            <div>
            <div className="page-title">
                  <Row>
                        <Col sm={6}>
                                <h4 className="mb-0"> <div class="round round-lg orange"><i class="ti-money"></i></div> New Loan</h4>
                        </Col>
                        <Col sm={6}>
                              <Breadcrumb className="float-left float-sm-right">
                              <BreadcrumbItem><a href="#">Home</a></BreadcrumbItem>
                              <BreadcrumbItem active>Wallet</BreadcrumbItem>
                              </Breadcrumb>
                        </Col>
                  </Row>
            </div>
            
           <div>
                 <Row>
                     <Col lg={4} md={4} sm={6} xl={4}>
                        <Card className="card-statistics mb-30 p-4">
                          <CardBody>
                            <CardTitle>Create New Loan Request </CardTitle>
                            
                            <div className="mt-20">
                                  <InputGroup>
                                    <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.prependdropdownOpen} toggle={this.prependtoggleDropDown}>
                                      <DropdownToggle color="info" caret>
                                        WETH
                                    </DropdownToggle>
                                      <DropdownMenu>
                                        <DropdownItem header>WETH</DropdownItem>
                                        <DropdownItem>WETH</DropdownItem>
                                        <DropdownItem>WETH</DropdownItem>
                                        <DropdownItem>Action</DropdownItem>
                                      </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    <Input />
                                    <InputGroupAddon addonType="append">WETH</InputGroupAddon>
                                  </InputGroup>
                            </div>

                            <div className="mt-20">
                                  <label>LTV (Loan-to-Value Ratio)</label>
                                  Range slider will be here
                            </div>

                            <div className="mt-20">
                                  <label>Collateral Amount</label>
                                  <InputGroup>
                                    <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.prependdropdownOpen} toggle={this.prependtoggleDropDown}>
                                      <DropdownToggle color="info" caret>
                                        WETH
                                    </DropdownToggle>
                                      <DropdownMenu>
                                        <DropdownItem header>WETH</DropdownItem>
                                        <DropdownItem>WETH</DropdownItem>
                                        <DropdownItem>WETH</DropdownItem>
                                        <DropdownItem>Action</DropdownItem>
                                      </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    <Input />
                                    <InputGroupAddon addonType="append">WETH</InputGroupAddon>
                                  </InputGroup>
                            </div>


                            <div className="mt-20">
                                  <label>Loan Term</label>
                                  <InputGroup>
                                    <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.prependdropdownOpen} toggle={this.prependtoggleDropDown}>
                                      <DropdownToggle color="info" caret>
                                        Days
                                    </DropdownToggle>
                                      <DropdownMenu>
                                        <DropdownItem header>Days</DropdownItem>
                                        <DropdownItem>Weeks</DropdownItem>
                                        <DropdownItem>Months</DropdownItem>
                                      </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    <Input />
                                    <InputGroupAddon addonType="append">Days</InputGroupAddon>
                                  </InputGroup>
                            </div>

                            <div>
                                  <label>Interest Rate (% Per Loan Term)</label>
                                  <InputGroup>
                                    <Input />
                                    <InputGroupAddon addonType="append">%</InputGroupAddon>
                                  </InputGroup>
                            </div>

                          </CardBody>
                        </Card>
                     </Col>  
                     
                     <Col lg={1} md={1}></Col>

                     <Col lg={4} md={4} sm={6} xl={4}>

                        <Card className="card-statistics h-100 p-4">
                            <CardBody>
                                <CardTitle>To Do List </CardTitle>
                                <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
                                    <ListGroup className="list-unstyled to-do">
                                        <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> Loan Amount</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>

                                        <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> Collateral Amount</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>

                                        <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> LTV</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>

                                        <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> Loan Term</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>

                                        <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> Interest Rate(Per Loan Term)</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>

                                         <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> Interest Amount</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>

                                        <ListGroupItem className="p-0" style={{ border: 'none' }}>
                                            <div className="remember-checkbox mb-20">
                                                <label className="pull-left" htmlFor="one"> Total Repayment Amount</label>
                                                <label className="pull-right"><b>N/A</b></label>
                                            </div>
                                        </ListGroupItem>
                                    </ListGroup>

                                    <hr />

                                    <div className="mb-30">
                                          <input className="form-check-input" type="checkbox" id="gridCheck" />
                                          <label className="form-check-label" htmlFor="gridCheck">
                                                I have read and agreed to the Loan Agreement
                                          </label>
                                    </div>
                                     
                                    <div>
                                          <button className="button btn-block" size="xsmall">Submit Application</button>
                                    </div>

                                </div>
                            </CardBody>
                        </Card>

                     </Col>  
                 </Row>
           </div> 
           

            

            
            
            
            
            
            </div>



            );
}
}
export default Create;