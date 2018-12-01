import React from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import Api from "../../../services/api";
import validators from '../../../validators';
import CustomAlertMsg from '../../CustomAlertMsg/CustomAlertMsg';

class EmailVerifyForm extends React.Component {
  constructor(props) {
    super(props);
    let locationState = this.props.locationState;
    let token = this.props.token;
    let errorMessage = '';
    let isEmailVerifiedFailed = false;
    let email = '';
    if(!_.isUndefined(locationState))
    {
      email = locationState.email || "";
      let message = locationState.message || "";
      if(message == "EMAIL_VERIFICATION_FAILED"){
        errorMessage = "Link is expired.";
      } else if(message == "USER_DISABLED"){
        errorMessage = "Your email is not verified. Please enter your email to verifiy your account.";
      }
      isEmailVerifiedFailed = true;
    }
    this.state = {
      token: token,
      email:email,
      buttonLoading:false,
      locationState:locationState,
      errorMessage: errorMessage,
      successMessage: "",
      isEmailVerifiedFailed : isEmailVerifiedFailed
    };
    this.onchange = this.onchange.bind(this);
    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this);
    this.validators = validators;
  }

  componentWillMount() {
    if(this.state.token){
      this.emailVerify()
    }
  }
  componentDidMount(){
    const {locationState} = this.state;
    if(!_.isUndefined(locationState)){
      this.props.historyPush.push({
        pathname: '/email-verify',
        state: { }
      });
    }
  }
  async emailVerify() {
    const api = new Api();
    const response = await api.create("email/verify", {
      token: this.state.token
    });

    if (response.status == "SUCCESS") {
      this.props.historyPush.push({
        pathname: '/login',
        state: { message: "EMAIL_VERIFICATION_SUCCESS" }
      });
    }
    else {
      this.props.historyPush.push({
        pathname: '/email-verify',
        state: { message: "EMAIL_VERIFICATION_FAILED" }
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
        <div className="col s12 row text-left mt-1">
          {errors}
        </div>
      );
    }
    return result;
  }
  async resendVerificationEmail(event) {
    event.preventDefault();
    const {
      email
    } = this.state;
    if (email != "") {
      this.setState({
        buttonLoading:true
      })
      const api = new Api();
      const response = await api.create("email/send", {
        email: email
      })
      this.setState({
        buttonLoading:false
      })
      if (response.status == "SUCCESS") {
        this.setState({
          errorMessage : "",
          successMessage : ['We have sent you an email with an activation link to ', <b>{email}</b>, '. It may take a minute to arrive.']
        })
        //toast.error("Something went wrong. Please try again later.");
      }
      else {
        toast.error("Something went wrong. Please try again later.");
      }
    }
  }

  render() {
    const {  errorMessage, successMessage,token,buttonLoading } = this.state;
    if (!token) {
      return (
        <div>
              <h3 className="mt-20 mb-20 login-label text-left">Email Verification</h3>
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
                <label className="mb-10 text-left" htmlFor="name">Email<span className="red">*</span> </label>
                <input id="email" className="web form-control" type="text" placeholder="Email" value={this.state.email} name="email" onChange={this.onchange} />
                {this.displayValidationErrors('email')}
              </div>
              <div className="text-left">
                <a onClick={this.resendVerificationEmail} className={`btn cognito btn-theme ${this.isFormValid() ? '' : 'disabled'}`}>
                  <span className="text-white">Send verification link</span>
                  {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                </a>
              </div>
              <p className="mt-20 mb-0 remember-checkbox text-left">After Verification <a href="Javascript:void(0)" onClick={() => this.props.updateUrlPathProp('login')}>Login here</a></p>
        </div>      
      );
    }
    else {
      return <div></div>;
    }
  }
}
export default EmailVerifyForm;