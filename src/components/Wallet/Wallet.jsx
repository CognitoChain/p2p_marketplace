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
  BreadcrumbItem,
  Alert
} from "reactstrap";
import "./Wallet.css";
import classnames from "classnames";
/*import WalletTokenEmpty from "./WalletTokenEmpty/WalletTokenEmpty";*/
import { Dharma } from "@dharmaprotocol/dharma.js";
import _ from "lodash";
import Loading from "../Loading/Loading";
import walletLogos from '../../utils/WalletLogo';
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import { BLOCKCHAIN_API } from "../../common/constants";
import Switch from "react-switch";
let timer;
class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethAddress: "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      tokenlist: this.props.tokens,
      isWalletMounted: true
    };
  }

  componentWillMount() {
    this.getETH();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tokens != this.props.tokenlist) {
      this.setState({ tokenlist: nextProps.tokens })
    }
  }
  componentWillUnmount() {
    this.setState({
      isWalletMounted: false
    });
  }
  async getETH() {
    const { dharma } = this.props;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    if (typeof currentAccount != "undefined") {
      dharma.blockchain.getAccounts().then(accounts => {
        const owner = accounts[0];
        this.setState({
          ethAddress: owner
        });
      });
    }
  }
  handleLoading(token, isLoading) {
    const { tokenlist } = this.state;
    let symbol = token.symbol;
    var tokenKey = _.findKey(tokenlist, ["symbol", symbol]);
    tokenlist[tokenKey].isLoading = isLoading;
    this.setState({
      tokenlist
    });
  }
  async updateProxyAllowanceAsync(token) {

    const { dharma } = this.props;
    const { Token } = Dharma.Types;
    const { tokenlist } = this.state;
    const currentAccount = await dharma.blockchain.getCurrentAccount();
    let symbol = token.symbol;
    let tokenAddress = token.address;
    if (token.isLoading == true) {
      return true;
    }
    this.handleLoading(token, true);
    let status = !token.hasUnlimitedAllowance;
    if (typeof currentAccount != "undefined") {
      try {
        let txHash;
        if (status == true) {
          txHash = await Token.makeAllowanceUnlimitedIfNecessary(
            dharma,
            symbol,
            currentAccount
          );
        }
        else {
         
          txHash = await Token.revokeAllowance(
            dharma,
            symbol,
            currentAccount
          );
        }


        if (typeof txHash != "undefined") {
          await dharma.blockchain.awaitTransactionMinedAsync(
            txHash,
            BLOCKCHAIN_API.POLLING_INTERVAL,
            BLOCKCHAIN_API.TIMEOUT,
          );

          // const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);
          // console.log("tokenData")

          //console.log(tokenData)
          var tokenKey = _.findKey(tokenlist, ["symbol", symbol]);
          tokenlist[tokenKey].hasUnlimitedAllowance = status;
          this.setState({
            tokenlist
          });

        }
      } catch (e) {
        console.log(e)
      }
    }
    this.handleLoading(token, false)

  }
  renderTokenBalances() {

    const { tokenlist } = this.state;
    const { isTokenLoading } = this.props;
    console.log(this.props)
    console.log(this.state)
    if (isTokenLoading) {
      return <Loading />
    }
    else if (tokenlist.length == 0) {
      return <CustomAlertMsg bsStyle={"warning"} extraClass={"text-center"} title={"Could not find tokens in your wallet."} />
    }
    else {
      const tokensSorted = _.orderBy(tokenlist, ['symbol'], ['asc']);
      return (
        <Row>

          {tokensSorted.map(token => {
            if (token.balance > 0) {
              return (
                <Col xl={3} md={6} lg={6} className="mb-30" key={token.symbol}>
                  <Card className="card card-statistics h-100">
                    <CardBody className="pb-0">
                      <div className="clearfix mb-10">
                        <div className="float-left icon-box rounded-circle">
                          <span className="text-white">
                            <img src={walletLogos[token.symbol.toLowerCase()]} height="30" className="mt-2" />
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
                      <div className="mt-3 pull-left text-left d-inline-block">
                      {
                        token.hasUnlimitedAllowance 
                        ? <label className="badge badge-success">Unlocked</label>
                        : <label className="badge badge-warning">Locked</label>

                      }
                      </div>
                      <div className="mt-3 pull-right text-right d-inline-block">
                        {
                          token.isLoading && <i className="btn btn-sm token-loading fa-spin fa fa-spinner"></i>
                        }
                        <Switch height={20} width={40} uncheckedIcon={false} disabled = {token.isLoading} checkedIcon={false} checked={token.hasUnlimitedAllowance} onChange={() =>
                              this.updateProxyAllowanceAsync(
                                token
                              )
                            } className="react-switch" id="normal-switch" />                       
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            }
          })}

        </Row>
      )
    }

  }
  render() {
    let _self = this;
    const { ethAddress, tokenlist } = this.state;
    const { isTokenLoading } = this.props;

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
              {!isTokenLoading && tokenlist.length == 0 && (
              <Alert color="warning" className="mb-30">
                Please connect to Kovan Test Network in Metamask & get test tokens from <a href="https://wallet.dharma.io/" target="_blank" className="alert-link">https://wallet.dharma.io/</a>.
                  </Alert>
              )}    
              <div className="mb-30">
                <div>Ethereum Address</div>
                <div className="eth-address">{ethAddress}</div>
              </div>

              <div>
                <h5>Token Balances</h5>
                {this.renderTokenBalances()}
              </div>

            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
export default Wallet;
