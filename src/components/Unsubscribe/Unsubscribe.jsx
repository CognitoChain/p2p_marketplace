import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Alert } from "react-bootstrap";
import { Container, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import Api from "../../services/api";
import CustomAlertMsg from '../CustomAlertMsg/CustomAlertMsg';
const login_innner_bg = require("../../assets/images/login-inner-bg.png");
const login_bg = require("../../assets/images/login-bg.png")
const logo_full = require("../../assets/images/logo-full.svg")
class Unsubscribe extends React.Component {
  constructor(props) {
    super(props);
    let locationState = this.props.location.state ;
    let token = this.props.match.params.token;
    if(_.isUndefined(token)){
      this.props.history.push("/")
    }
    this.state = {
      token: token,
      errorMessage:'',
      successMessage:''
    };

  }
  componentWillMount() {
    if(this.state.token){
      this.emailUnsubscribe()
    }
  }
  async emailUnsubscribe() {
    const api = new Api();
    const response = await api.create("email/unsubscribe", {
      token: this.state.token
    });

    if (response.status == "SUCCESS") {
      this.setState({
        successMessage:"You've successfully unsubscribed."
      })
    }
    else {
      this.setState({
        errorMessage:"Something went wrong. Please try again."
      })
    }
  }
  render() {
    const {errorMessage, successMessage,token } = this.state;
    if (token) {
      return (
        <section className="height-100vh d-flex align-items-center page-section-ptb login" style={{ backgroundImage: `url(${login_bg})` }}>
          <Container>
            <Row className="justify-content-center no-gutters vertical-align row">
              <Col lg={4} md={6} className="login-fancy-bg bg" style={{ backgroundImage: `url(${login_innner_bg})` }}>
                <div className="login-fancy">
                  <h2 className="text-white mb-20 text-center">
                    <a href="/"><img src={logo_full} alt="Cognito Chain" width="200" /></a>
                  </h2>
                  <p className="mb-20 text-white">Cognitochain provides access to peer-to-peer digital asset lending on the Ethereum blockchain. We make it easy to get crypto asset-backed loans without selling your favourite crypto holdings.</p>
                  <ul className="list-unstyled  pos-bot pb-30">
                    <li className="list-inline-item"><a className="text-white" href="#"> Terms of Use | </a> </li>
                    <li className="list-inline-item"><a className="text-white" href="privacy" target="_blank"> Privacy Policy</a></li>
                  </ul>
                </div>
              </Col>
              <Col lg={4} md={6} className="bg-white">
                <div className="login-fancy pb-40 clearfix">
                  <h3 className="mb-30">Email Subscription</h3>
                  {
                    errorMessage && <CustomAlertMsg
                      bsStyle={"danger"}
                      title={errorMessage}
                    />
                  }
                  {
                    successMessage && <CustomAlertMsg
                      bsStyle={"success"}
                      title={successMessage}
                    />
                  }
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )
    }
    else {
      return <div></div>;
    }

  }
}
export default Unsubscribe;