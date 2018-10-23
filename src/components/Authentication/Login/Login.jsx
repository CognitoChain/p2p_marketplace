import React from 'react';
import { Link } from 'react-router-dom';
import { Alert } from "react-bootstrap";
import { Container, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import validators from '../../../validators';
import GoogleLogin from "react-google-login";
import Api from "../../../services/api";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
import _ from 'lodash';
import './Login.css';
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
      processing: false,
      locationState: this.props.location.state || {}
    };
    this.signup = this.signup.bind(this);
    this.validators = validators;
    this.onchange = this.onchange.bind(this);
    this.login = this.login.bind(this);
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
  }
  componentDidMount(){
    const {locationState} = this.state;
    if(!_.isUndefined(locationState)){
      this.props.history.push({
        pathname: '/login',
        state: { }
      });
    }
  }
  async googleSignIn(token) {
    const api = new Api();
    return new Promise((resolve) => {
      api.create("goauthlogin", { token: token }).then((response) => {
        resolve(response);
      });
    });
  }

  signup(res, type) {
    // console.log("have google profile: ", res.w3.U3);
    if (typeof res.tokenId != "undefined") {
      this.googleSignIn(res.tokenId).then(response => {
        console.log("logged-in as '", response.name, "' email: ", response.email);
        const authorization = response.headers.get('Authorization');
        if (authorization && authorization != null) {
          localStorage.setItem('token', authorization);
          this.props.history.push("/");
        }
        else {
          toast.error("Please try again later..");
        }
      });
    }
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
      if (field == 'email' || field == 'password') {
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
  async login(event) {
    event.preventDefault();
    const {
      email,
      password,
    } = this.state;
    const api = new Api();
    const response = await api.create("login", {
      email: email,
      password: password
    });
    //const authorization = response.headers.get('Authorization');
    const authorization = response.headers.get('Authorization');
    console.log(authorization)
    if (authorization && authorization != null) {
      localStorage.setItem('token', authorization);
      this.props.history.push("/");
    }
    else {
      const json = await response.json();
      if (json.ERROR == "USER_DISABLED") {
        this.props.history.push({
          pathname: '/email-verify',
          state: { message: "USER_DISABLED",email }
        });      }
      else {
        toast.error("Invalid email or password.");
      }
    }
  }
  async resendVerificationEmail() {

    const { locationState } = this.state;
    if (!_.isUndefined(this.state.locationState.message)) {
      const email = locationState.email;
      if (email != "") {
        const api = new Api();
        this.setState({ processing: true })
        const response = await api.create("email/send", {
          email: email
        }).catch((error) => {
          if (error.status && error.status === 403) {
            // this.props.redirect(`/login`);
            // return;
          }
        });
        if (response.status == "SUCCESS") {
          this.setState({ processing: false })
          //toast.error("Something went wrong. Please try again later.");
        }
        else {
          this.setState({ processing: false })
          toast.error("Something went wrong. Please try again later.");
        }
      }
    }
  }
  renderMessage() {
    const { locationState, processing } = this.state;
    if (locationState.message == "REGISTER_SUCCESS") {
      const email = locationState.email;
      return (
        <div>
          <p>
            We have sent you an email with an activation link to <b>{email}</b>. It may take a minute to arrive.
            <br />
            <b>Still no email?</b>
            {!processing && <a onClick={this.resendVerificationEmail} className="btn btn-sm btn-link">Click here to Resend it</a>}
            {processing && <i className="btn btn-sm fa-spin fa fa-spinner"></i>}
          </p>
        </div>
      )
    }
    else if (locationState.message == "EMAIL_VERIFICATION_SUCCESS") {

      return (
        <div>
          <p>
            Your account is successfully verified. You can login now.
          </p>
        </div>
      )
    }
    return;
  }
  render() {

    const responseGoogle = response => {
      console.log("google console");
      console.log(response);
      this.signup(response, "google");
    };

    return (
      <section className="height-100vh d-flex align-items-center page-section-ptb login" style={{ backgroundImage: 'url(assets/images/login-bg.png)' }}>
        <Container>
          <Row className="justify-content-center no-gutters vertical-align row">
            <Col lg={4} md={6} className="login-fancy-bg bg" style={{ backgroundImage: 'url(assets/images/login-inner-bg.png)' }}>
              <div className="login-fancy">
                <h2 className="text-white mb-20 text-center">
                  <a href="/"><img src="assets/images/logo-full.svg" alt="Cognito Chain" width="200" /></a>
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
                <h3 className="mb-30">Sign In</h3>
                {
                  console.log(this.state.locationState)}
                {
                  !_.isUndefined(this.state.locationState.message) && <CustomAlertMsg
                    bsStyle={"success"}
                    title={this.renderMessage()}
                  />
                }
                <div className="section-field mb-20">
                  <label className="mb-10" htmlFor="name">Email </label>
                  <input id="email" className="web form-control" type="text" placeholder="Email" value={this.state.email} name="email" onChange={this.onchange} />
                  {this.displayValidationErrors('email')}
                </div>
                <div className="section-field mb-20">
                  <label className="mb-10" htmlFor="Password">Password* </label>
                  <input id="password" className="Password form-control" type="password" placeholder="Password" value={this.state.password} name="password" onChange={this.onchange} />
                  {this.displayValidationErrors('password')}
                </div>
                <div className="section-field">
                  <div className="remember-checkbox mb-30">
                    <input type="checkbox" className="form-control" name="two" id="two" />
                    <label htmlFor="two"> Remember me</label>

                  </div>
                </div>

                <div>
                  <a onClick={this.login} className={`button   ${this.isFormValid() ? '' : 'disabled'}`}>
                    <span className="text-white">Log in</span>
                  </a>

                  <span className="login-buttons-seperator">OR</span>

                  <GoogleLogin
                    clientId="166486140124-jglmk5i5fu0bvk6fh8q2hl25351pfst0.apps.googleusercontent.com"
                    buttonText="Login with Google"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    className="google-login-btn"
                  />

                </div>

                <p className="mt-20 mb-0 remember-checkbox">Don't have an account? <Link to="/register" > Create one here </Link></p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }
}
export default Login;