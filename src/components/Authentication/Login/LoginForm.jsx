import React from 'react';
import GoogleLogin from "react-google-login";
import { toast } from 'react-toastify';
import _ from 'lodash';
import validators from '../../../validators';
import Api from "../../../services/api";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
      processing: false,
      buttonLoading:false,
      locationState: this.props.locationState || {}
    };
    this.socialSignup = this.socialSignup.bind(this);
    this.validators = validators;
    this.onchange = this.onchange.bind(this);
    this.login = this.login.bind(this);
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this);
    this.renderMessage = this.renderMessage.bind(this);
    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
  }
  componentDidMount() {
    const { locationState } = this.state;
    if (!_.isUndefined(locationState)) {
      this.props.historyPush.push({
        pathname: '/login',
        state: {}
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

  socialSignup(res, type) {
    if (typeof res.tokenId != "undefined") {
      this.googleSignIn(res.tokenId).then((result)=> {
        try{
          const response =  result[0];
          const headers = result[1];
          const authorization = headers.get('Authorization');
          if (authorization && authorization != null) {
            localStorage.setItem('socialLogin', "yes");
            localStorage.setItem('token', authorization);
            localStorage.setItem('userEmail', response.email);
            this.props.historyPush.push("/");
          }
          else {
            toast.error("Please try again later..");
          }
        }
        catch(e){
          toast.error("Please try again later..");
        }
      });
    }
  }

  onchange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
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
    const validationFields = ["email", "password"];
    validationFields.forEach((field) => {
      this.updateValidators(field, this.state[field]);
      if (!this.validators[field].valid) {
        status = false;
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
        <div className="row text-left mt-1">
          <div className="col">
            <div className="s12 ">
              {errors}
            </div>
          </div>
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
    this.setState({
      buttonLoading:true
    })
    const api = new Api();
    const response = await api.create("login", {
      email: email,
      password: password
    });
    this.setState({
      buttonLoading:false
    })
    //const authorization = response.headers.get('Authorization');
    const authorization = response.headers.get('Authorization');

    if (authorization && authorization != null) {
      localStorage.setItem('socialLogin', "no");
      localStorage.setItem('token', authorization);
      localStorage.setItem('userEmail', email);
      this.props.historyPush.push("/");
    }
    else {
      const json = await response.json();
      if (json.ERROR == "USER_DISABLED") {
        this.props.historyPush.push({
          pathname: '/email-verify',
          state: { message: "USER_DISABLED", email }
        });
      }
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
    else if (locationState.message == "EMAIL_VERIFICATION_SUCCESS" || locationState.message == "PASSWORD_RESET_SUCCESS" || locationState.message == "PASSWORD_CHANGED_SUCCESSFULLY") {
      let flag = (locationState.message == "PASSWORD_RESET_SUCCESS" || locationState.message == "PASSWORD_CHANGED_SUCCESSFULLY") ? true : false; 
      return (
        <div>
          {locationState.message == "EMAIL_VERIFICATION_SUCCESS" &&
          <p>
            Your account is successfully verified. You can login now.
          </p>
          }
          {flag === true &&
          <p>
             Password changed successfully.Please login using new passowrd.
          </p>
          }
        </div>
      )
    }
    return;
  }
  render() {
    const responseGoogle = response => {
      this.socialSignup(response, "google");
    };
    const { email, password,buttonLoading } = this.state;
    const isFormValid = this.isFormValid();
    return (
      <div>
        <h3 className="mt-20 mb-20 login-label text-left">Sign In</h3>
        {
          !_.isUndefined(this.state.locationState.message) && <CustomAlertMsg
            bsStyle={"success"}
            title={this.renderMessage()}
          />
        }
        <div className="section-field mb-20">
          <label className="mb-10 text-left" htmlFor="name">Email<span className="red">*</span> </label>
          <input id="email" className="web form-control" type="text" placeholder="Email" value={this.state.email} name="email" onChange={this.onchange} />
          {email && this.displayValidationErrors('email')}
        </div>
        <div className="section-field mb-20">
          <label className="mb-10 text-left" htmlFor="Password">Password<span className="red">*</span> </label>
          <input id="password" className="Password form-control" type="password" placeholder="Password" value={this.state.password} name="password" onChange={this.onchange} />
          {password && this.displayValidationErrors('password')}
        </div>

        <p className="mb-3 remember-checkbox text-right"><a href="Javascript:void(0)" onClick={() => this.props.updateUrlPathProp('forgot')}>Forgot Password?</a></p>

        <div className="d-block text-left">
          <a onClick={this.login} className={`btn cognito btn-theme ${isFormValid ? '' : 'disabled'}`}>
            <span className="text-white">Log in</span>
            {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
          </a>

          <span className="login-buttons-seperator"></span>

          <GoogleLogin
            clientId="166486140124-jglmk5i5fu0bvk6fh8q2hl25351pfst0.apps.googleusercontent.com"
            buttonText="Login with Google"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            className="btn cognito btn-danger"
          />

        </div>
        <p className="mt-20 mb-0 remember-checkbox text-left">Don't have an account? <a href="Javascript:void(0)" onClick={() => this.props.updateUrlPathProp('register')}>Create one here</a></p>
      </div>      
    );
  }
}
export default LoginForm;