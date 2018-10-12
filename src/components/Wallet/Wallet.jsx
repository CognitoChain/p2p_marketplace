import React, { Component } from "react";
import {
  Card,
  CardBody,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem
} from "reactstrap";
import "./Wallet.css";
import classnames from "classnames";
/*import WalletTokenEmpty from "./WalletTokenEmpty/WalletTokenEmpty";*/
import { Dharma } from "@dharmaprotocol/dharma.js";
import _ from "lodash";
import Loading from "../Loading/Loading";
class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethAddress: "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenlist: this.props.tokens,
      loading: true
    };
    console.log(this.props.tokens);
  }

  async componentWillMount() {
    const { dharma } = this.props;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    if(typeof currentAccount != "undefined")
    {
        localStorage.setItem('currentMetamaskAccount', currentAccount);
        dharma.blockchain.getAccounts().then(accounts => {
        const owner = accounts[0];
          this.setState({
            ethAddress: owner
          });
        });  
    }
  }
  async checkAccount(){
    const { dharma } = this.props;
    let currentAccount = await dharma.blockchain.getCurrentAccount();
    let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');
    if(currentMetamaskAccount != currentAccount)
    {
      window.location.reload();
      localStorage.setItem('currentMetamaskAccount', currentAccount);
    }
  }

  componentDidMount() {
    const intervalId = setInterval(
            () => this.checkAccount(),
            1500,
    );
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.tokens.length !== this.props.tokens.length) {
      this.setState({
        tokenlist: nextProps.tokens,
        loading: false
      });
    }
  }

  async updateProxyAllowanceAsync(symbol) {
    const { dharma } = this.props;
    const { Token } = Dharma.Types;
    const { tokenlist } = this.state;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    if (typeof currentAccount != "undefined") {
      const txHash = await Token.makeAllowanceUnlimitedIfNecessary(
        dharma,
        symbol,
        currentAccount
      );

      if (typeof txHash != "undefined") {
        var TokenKey = _.findKey(tokenlist, ["symbol", symbol]);
        tokenlist[TokenKey].hasUnlimitedAllowance = true;
        this.setState({
          tokenlist
        });
      }
    }
  }

  async RevokeAllowanceAsync(symbol) {
    const { dharma } = this.props;
    const { Token } = Dharma.Types;
    const { tokenlist } = this.state;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    if (typeof currentAccount != "undefined") {
      const txHash = await Token.revokeAllowance(
        dharma,
        symbol,
        currentAccount
      );
      var revokedTokenKey = _.findKey(tokenlist, ["symbol", symbol]);
      tokenlist[revokedTokenKey].hasUnlimitedAllowance = false;
      this.setState({
        tokenlist
      });
    }
  }

  render() {
    let _self = this;
    const { ethAddress, tokenlist, loading } = this.state;

    return (
      <div className="wallet-page">

        <div className="page-title">
            <Row>
                <Col>
                    <Breadcrumb className="float-left">
                        <BreadcrumbItem><a href="/market" className="link-blue">Home</a></BreadcrumbItem>
                        <BreadcrumbItem active>Wallet</BreadcrumbItem>
                    </Breadcrumb>
                </Col>
            </Row>

            <Row className="mt-4 mb-4">
                <Col>
                    <h5 className="mb-0"> My Wallet</h5>
                </Col>
            </Row>
        </div>

        <Row className="mb-30 mt-30">
          <Col lg={12} md={12} sm={12} xl={12}>
            <div className="tab nav-border" style={{ position: "relative" }}>
                  
                  <div className="mb-30">
                    <div>Ethereum Address</div>
                    <div className="eth-address">{ethAddress}</div>
                  </div>

                  <div>
                    <h5>Token Balances</h5>

                    <Row>
                      
                      {tokenlist.map(token => {
                        if (token.balance > 0) {
                          return (
                            <Col
                              xl={3}
                              md={6}
                              lg={6}
                              className="mb-30"
                              key={token.symbol}
                            >
                              <Card className="card card-statistics h-100">
                                <CardBody>
                                  <div className="clearfix mb-10">
                                    <div className="float-left icon-box bg-danger rounded-circle">
                                      <span className="text-white">
                                        <i
                                          className="fa fa-bar-chart-o highlight-icon"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </div>

                                    <div>
                                      <div className="float-left text-left crypto-currency-text">
                                        <div className="wallet-token-symbol">
                                          {token.symbol}
                                        </div>
                                        <div>{token.name}</div>
                                      </div>
                                      <div className="float-right text-right">
                                        <p className="card-text text-dark">
                                          <span className="wallet-token-balance">
                                            {token.balance}
                                          </span>{" "}
                                          {token.symbol}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-right">
                                    {token.hasUnlimitedAllowance === true && (
                                      <a
                                        className="btn btn-danger cognito x-small"
                                        href="javascript:void(0);"
                                        onClick={() =>
                                          _self.RevokeAllowanceAsync(
                                            token.symbol
                                          )
                                        }
                                      >
                                        Lock
                                      </a>
                                    )}

                                    {token.hasUnlimitedAllowance === false && (
                                      <a
                                        className="btn btn-outline-success cognito x-small"
                                        href="javascript:void(0);"
                                        onClick={() =>
                                          _self.updateProxyAllowanceAsync(
                                            token.symbol
                                          )
                                        }
                                      >
                                        Unlock
                                      </a>
                                    )}
                                  </div>
                                </CardBody>
                              </Card>
                            </Col>
                          );
                        }
                      })}

                    </Row>
                  </div>
              
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
export default Wallet;
