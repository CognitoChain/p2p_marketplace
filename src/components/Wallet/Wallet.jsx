import React, { Component } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem,
  Alert,
  Tooltip
} from "reactstrap";
import { Link } from 'react-router-dom';
import { Dharma } from "@dharmaprotocol/dharma.js";
import _ from "lodash";
import Switch from "react-switch";
import Loading from "../Loading/Loading";
import walletLogos from '../../utils/WalletLogo';
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import metamaskConnectionErrorImg from "../../assets/images/metamask_connection_error.png";
import "./Wallet.css";
import { niceNumberDisplay, getTransactionReceipt, tooltipNumberDisplay } from "../../utils/Util";
class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenlist: this.props.tokens,
      isMounted: true,
    };
    this.tooltipTop = this.tooltipTop.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isMounted;
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isTokenLoading != this.props.isTokenLoading) {
      this.setState({ tokenlist: this.props.tokens })
    }
  }
  componentWillUnmount() {
    this.setState({
      isMounted: false
    });
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
        let response = await getTransactionReceipt(txHash);
        if (!_.isUndefined(response)) {
          /*const tokenData = await Token.getDataForSymbol(dharma, symbol, currentAccount);*/
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
  tooltipTop(token) {
    const { tokenlist } = this.state;
    let tootlTipStatus = !token.tootlTipStatus;
    let symbol = token.symbol;
    var tokenKey = _.findKey(tokenlist, ["symbol", symbol]);
    tokenlist[tokenKey].tootlTipStatus = tootlTipStatus;
    this.setState({
      tokenlist
    });
  }
  renderTokenBalances() {

    const { tokenlist } = this.state;
    const { isTokenLoading } = this.props;
    let i = 0;
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
            let tokenSymbol = _.toLower(token.symbol);
            if (token.balance > 0) {
              i++;
              return (
                <Col xl={3} md={6} lg={6} className="mb-30" key={token.symbol}>
                  <Card className="card card-statistics h-100">
                    <CardBody className="pb-0">
                      <div className="token-details-row mb-10 row">
                        <div class="col-md-2">
                          <div className="icon-box rounded-circle">
                            <span className="text-white">
                              <img src={walletLogos[token.symbol.toLowerCase()]} height="30" className="mt-2" alt={token.symbol} />
                            </span>
                          </div>
                        </div>
                        <div class="col-md-10">
                          <div class="row">
                            <div className="col-md-8 text-left">
                              <div className="wallet-token-symbol">
                                {token.symbol}
                              </div>
                              <div>{token.name}</div>
                            </div>
                            <div className="col-md-4 text-right">
                              <p className="card-text text-dark">
                                <span className="wallet-token-balance custom-tooltip" tooltip-title={tooltipNumberDisplay(token.balance, token.symbol)}>
                                  {niceNumberDisplay(token.balance)}
                                </span>{" "}
                                {token.symbol}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row mt-3 ">
                        <div className="col-md-8 text-left">
                          {
                            token.hasUnlimitedAllowance
                              ? <label className="badge badge-success">Unlocked</label>
                              : <label className="badge badge-warning">Locked</label>

                          }
                        </div>
                        <div className="col-md-4 text-right" id={"token" + tokenSymbol} >
                          {
                            token.isLoading && <i className="btn btn-sm token-loading fa-spin fa fa-spinner"></i>
                          }
                          <Switch height={20} width={40} uncheckedIcon={false} disabled={token.isLoading} checkedIcon={false} checked={token.hasUnlimitedAllowance} onChange={() =>
                            this.updateProxyAllowanceAsync(
                              token
                            )
                          } className="react-switch" />
                          <Tooltip placement="top" isOpen={token.tootlTipStatus} target={"token" + tokenSymbol} toggle={() =>
                            this.tooltipTop(
                              token
                            )
                          }>
                            {
                              token.hasUnlimitedAllowance
                                ? "Lock"
                                : "Unlock"
                            }
                          </Tooltip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              );
            }
            else {
              return '';
            }
          })}

          {!isTokenLoading && i == 0 &&
            <Col xl={12} md={12} lg={12} xs={12} sm={12} className="mb-30">
              <Alert color="warning" className="mb-30">
                Please connect to Kovan Test Network in Metamask & get test tokens from <a href="https://wallet.dharma.io/" target="_blank" className="alert-link" rel="noopener noreferrer">https://wallet.dharma.io/</a>.
              </Alert>
            </Col>
          }
        </Row>
      )
    }

  }
  render() {
    const { wrongMetamaskNetwork, currentMetamaskAccount, isMetaMaskAuthRised } = this.props;
    return (
      <div className="wallet-page">

        <div className="page-title">
          <Row>
            <Col>
              <Breadcrumb className="float-left">
                <BreadcrumbItem><Link className="link-blue" to="/market">Market</Link></BreadcrumbItem>
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

        {isMetaMaskAuthRised && wrongMetamaskNetwork == false &&
          <Row className="mb-30 mt-30">
            <Col lg={12} md={12} sm={12} xl={12}>
              <div className="tab nav-border" style={{ position: "relative" }}>
                <div className="mb-30">
                  <div>Ethereum Address</div>
                  <div className="eth-address">{currentMetamaskAccount}</div>
                </div>

                <div>
                  <h5>Token Balances</h5>
                  {this.renderTokenBalances()}
                </div>

              </div>
            </Col>
          </Row>
        }

        {(wrongMetamaskNetwork == true || !isMetaMaskAuthRised) &&
          <div>
            <Row className="mb-30">
              <Col md={3}></Col>
              <Col md={6}>
                <img src={metamaskConnectionErrorImg} className="img-fluid" alt="Metamask Connection Error" />
              </Col>
              <Col md={3}></Col>
            </Row>
          </div>
        }

      </div>
    );
  }
}
export default Wallet;
