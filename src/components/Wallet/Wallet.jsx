import React, { Component } from 'react';
import { Card,CardBody,TabContent, TabPane,Nav, NavItem, NavLink, Row, Col,Breadcrumb,BreadcrumbItem} from 'reactstrap';
import './Wallet.css';
import classnames from 'classnames';
/*import Loading from "../Loading/Loading";*/
class Wallet extends Component {

    constructor(props) {
        super(props);
        this.tabsclick = this.tabsclick.bind(this);
        this.state = {
            activeTab: '1',
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
      console.log(this.props.tokens);
      const { tokens } = this.props;

     /* if (tokens.length === 0) {
            return <Loading/>;
      }*/

      return (
            <div>
            <div className="page-title">
            <Row>
            <Col sm={6}>
            <h4 className="mb-0"> My Wallet</h4>
            </Col>
            <Col sm={6}>
            <Breadcrumb className="float-left float-sm-right">
            <BreadcrumbItem><a href="#">Home</a></BreadcrumbItem>
            <BreadcrumbItem active>Wallet</BreadcrumbItem>
            </Breadcrumb>
            </Col>
            </Row>
            </div>
            
            
            <Row className="mb-30">
            
            <Col lg={12} md={12} sm={12} xl={12}>

            <div className="tab nav-border" style={{ position: 'relative' }}>
            <div className="d-block d-md-flex justify-content-between">
            
            <div className="d-block d-md-flex">
            <Nav tabs>
            <NavItem>
            <NavLink className={classnames({ active: this.state.activeTab === '1' })}
            onClick={() => { this.tabsclick('1'); }}
            >
            My Wallet
            </NavLink>
            </NavItem>
            <NavItem>
            <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.tabsclick('2'); }}
            >
            Transactions History
            </NavLink>
            </NavItem>

            <NavItem>
            <NavLink
            className={classnames({ active: this.state.activeTab === '3' })}
            onClick={() => { this.tabsclick('3'); }}
            >
            Deposits & Withdrawals
            </NavLink>
            </NavItem>


            </Nav>
            </div>
            </div>
            <TabContent activeTab={this.state.activeTab}>
            
            <TabPane tabId="1" title="">
            
            <div className="mb-30">
            <div>Ethereum Address</div>
            <div className="eth-address">0xfd170e8f0525098d3036b0f8dc72663e6bad580d</div>
            </div>

            <div>
            <h5>Token Balances</h5>

            <Row>


            {tokens.map((token) => {

                  if(token.balance > 0)
                  {
                       return (

                        <Col xl={3} md={6} lg={6} className="mb-30" key={token.symbol}>
                        <Card className="card card-statistics h-100">
                        <CardBody>
                        <div className="clearfix mb-10">
                        <div className="float-left icon-box bg-danger rounded-circle">
                        <span className="text-white">
                        <i className="fa fa-bar-chart-o highlight-icon" aria-hidden="true" />
                        </span>
                        </div>

                        <div>
                        <div className="float-left text-left crypto-currency-text">
                        <div className="wallet-token-symbol">{token.symbol}</div>
                        <div>{token.name}</div>
                        </div>
                        <div className="float-right text-right">
                        <p className="card-text text-dark"><span className="wallet-token-balance">{token.balance}</span> {token.symbol}</p>
                        </div>
                        </div>



                        </div>
                        <div className="mt-3">
                        <a className="btn btn-success cognito x-small" href="javascript:void(0);">Deposit</a>
                        <a className="btn btn-outline-success cognito x-small pull-right" href="javascript:void(0);">Withdrawal</a>
                        </div>
                        </CardBody>
                        </Card>
                        </Col>

                        );
                  }

                  
            })}
            
            </Row>

           

            </div>

            </TabPane>

            <TabPane tabId="2" title="Borrowed Loans">
            
            </TabPane>

            <TabPane tabId="3" title="Archive">
            
            </TabPane>



            </TabContent>
            </div>
            
            </Col>

            </Row>
            
            
            
            
            </div>



            );
}
}
export default Wallet;