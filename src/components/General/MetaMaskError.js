import React, { Component } from "react";
import {
  Row,
  Col
} from "reactstrap";
import metamaskConnectionErrorImg from "../../assets/images/metamask_connection_error.png";
class MetamaskError extends Component {
  render() {

    const { wrongMetamaskNetwork, isMetaMaskAuthRised } = this.props;
    console.log("RederMessage")
    console.log(wrongMetamaskNetwork)
    console.log(isMetaMaskAuthRised)
    return (
      <div>
        {(wrongMetamaskNetwork == true || !isMetaMaskAuthRised) &&
          <div>
            <Row className="mb-30">
              <Col md={3}></Col>
              <Col md={6}>
                <img src={metamaskConnectionErrorImg} className="img-fluid" alt="Metamask Error" />
              </Col>
              <Col md={3}></Col>
            </Row>
            <Row className="mb-30">
              <Col md={3}></Col>
              <Col md={6} className="text-center">
                <p>Loanbase is a Web3-enabled application, which is just a fancy way of saying that it needs to be plugged into the Ethereum blockchain.</p><br/>
                <p>In order to use Loanbase on the web, you will need to install the MetaMask browser extension, available for Chrome, Firefox, Opera, and the new Brave browser.</p>
              </Col>
              <Col md={3}></Col>
            </Row>
          </div>
        }
      </div>
    )
  }
}

export default MetamaskError;