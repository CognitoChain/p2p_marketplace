import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Alert } from "react-bootstrap";
import { Container, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import Api from "../../services/api";
import validators from '../../validators';
import CustomAlertMsg from '../CustomAlertMsg/CustomAlertMsg';
const login_innner_bg = require("../../assets/images/login-inner-bg.png");
const login_bg = require("../../assets/images/login-bg.png")
const logo_full = require("../../assets/images/logo-full.svg")
class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    let errorMessage = '';
    let email = '';
    this.state = {
      email:email,
      errorMessage: errorMessage,
      successMessage: ""
    };
    this.onchange = this.onchange.bind(this);
    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
    this.sendPasswordLink = this.sendPasswordLink.bind(this);
    this.validators = validators;
  }
  onchange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
    this.updateValidators([event.target.name], event.target.value);
  }
  updateValidators(fieldName, value) {
    this.validators[fieldName].errors = [];
    this.validators[fieldName].state = value;
    this.validators[fieldName].valid = true;
    this.validators[fieldName].rules.forEach((rule) => {
      if (rule.test instanceof RegExp) {
        if (!rule.test.test(value)) {
          this.validators[fieldName].errors.push(rule.message);
          this.validators[fieldName].valid = false;
        }
      } else if (typeof rule.test === 'function') {
        if (!rule.test(value)) {
          this.validators[fieldName].errors.push(rule.message);
          this.validators[fieldName].valid = false;
        }
      }
    });
  }
  isFormValid() {
    let status = true;
    Object.keys(this.validators).forEach((field) => {
      if (field == 'email') {
        if (!this.validators[field].valid) {
          status = false;
        }
      }
    });
    return status;
  }
  displayValidationErrors(fieldName) {
    const validator = this.validators[fieldName];
    const result = '';
    if (validator && !validator.valid) {
      const errors = validator.errors.map((info, index) => {
        return <span className="error" key={index}>* {info}<br /></span>
      });
      return (
        <div className="col s12 row">
          {errors}
        </div>
      );
    }
    return result;
  }
  async sendPasswordLink(event) {
    event.preventDefault();
    const {
      email
    } = this.state;
    if (email != "") {
      const api = new Api();
      const response = await api.create("password-reset-request", {
        email: email
      }).catch((error) => {
        if (error.status && error.status === 403) {
          // this.props.redirect(`/login`);
          // return;
        }
      });
      if (response.status == "SUCCESS") {
        this.setState({
          errorMessage : "",
          email:"",
          successMessage : ['We have sent you an email with an reset password link to ', <b>{email}</b>, '. It may take a minute to arrive.']
        })
      }
      else {
        this.setState({
          errorMessage : "Something went wrong. Please try again later."          
        })
      }
    }
  }
  render() {
    const { errorMessage, successMessage, email } = this.state;
    const isFormValid = this.isFormValid();
      return (
        <section className="height-100vh d-flex align-items-center page-section-ptb login" style={{ backgroundImage: `url(${login_bg})` }}>
          <Container>
            <Row className="justify-content-center no-gutters vertical-align row">
              <Col lg={4} md={6} className="login-fancy-bg bg" style={{ backgroundImage: `url(${login_innner_bg})` }}>
                <div className="login-fancy login-left">
                  <h2 className="text-white mb-20 text-center">
                    <a href="/"><img src={logo_full} alt="Cognito Chain" width="200" /></a>
                  </h2>
                  <p className="mb-20 text-white">Cognitochain provides access to peer-to-peer digital asset lending on the Ethereum blockchain. We make it easy to get crypto asset-backed loans without selling your favourite crypto holdings.</p>
                  <ul className="list-unstyled  pos-bot pb-30">
                    <li className="list-inline-item"><a className="text-white" href="terms" target="_blank"> Terms of Use | </a> </li>
                    <li className="list-inline-item"><a className="text-white" href="privacy" target="_blank"> Privacy Policy</a></li>
                  </ul>
                </div>
              </Col>
              <Col lg={4} md={6} className="bg-white">
                <div className="login-fancy pb-40 clearfix">
                  <h3 className="mb-30">Forgot Password?</h3>
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

                  <div className="section-field mb-20">
                    <label className="mb-10" htmlFor="name">Email<span className="red">*</span> </label>
                    <input id="email" className="web form-control" type="text" placeholder="Email" value={this.state.email} name="email" onChange={this.onchange} />
                    {email && this.displayValidationErrors('email')}
                  </div>

                  <div>
                    <a onClick={this.sendPasswordLink} className={`btn cognito btn-theme ${isFormValid ? '' : 'disabled'}`}>
                      <span className="text-white">Submit</span>
                    </a>
                  </div>
                  <p className="mt-20 mb-0 remember-checkbox">Already have password? <Link to="/login" >Login</Link></p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )
  }
}
export default ForgotPassword;