import React from 'react';
import { toast } from 'react-toastify';
import _ from "lodash";
import GoogleLogin from "react-google-login";
import validators from '../../../validators';
import Api from "../../../services/api";
class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      error: null,
      buttonLoading:false,
      apiError: ""
    };
    this.validators = validators;
    this.onchange = this.onchange.bind(this);
    this.register = this.register.bind(this);
    this.socialSignup = this.socialSignup.bind(this);
    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
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
            this.props.setLoginData();
            this.props.history.push("/market");
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
    const { password, confirmPassword } = this.state;
    if (!this.validators[fieldName]) {
      this.validators[fieldName] = {}
    }
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
    if ((fieldName == "confirmPassword" || fieldName == "password") && password != confirmPassword) {
      this.validators["confirmPassword"].errors = [];
      this.validators["confirmPassword"].errors.push("Password and Confirm Password should match.");
      this.validators["confirmPassword"].valid = false;
    }
  }
  isFormValid() {
    let status = true;
    const validationFields = ["email", "password", "confirmPassword"];
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
  async register(event) {
    event.preventDefault();
    const {
      email,
      password,
    } = this.state;
    this.setState({
      buttonLoading:true
    })
    const api = new Api();
    const response = await api.create("sign-up", {
      email: email,
      password: password
    });
    this.setState({
      buttonLoading:false
    })
    if (response.status === "SUCCESS") {
      this.props.historyPush.push({
        pathname: '/login',
        state: { message: "REGISTER_SUCCESS", email }
      });
      // toast.success()
    }
    else {
      let error_msg = response.status;
      if (_.isUndefined(response.msg) && response.status == "ERROR_REGISTRATION_USER_EXISTS") {
        error_msg = 'User already exist with this Email Address.';
      }
      toast.error(error_msg);
    }
  }
  render() {
    const responseGoogle = response => {
      this.socialSignup(response, "google");
    };
    const { email, password, confirmPassword,buttonLoading } = this.state;
    const isFormValid = this.isFormValid();
    return (
      <div>
          <h3 className="mt-20 mb-20 login-label text-left">Signup</h3>
          <div className="section-field mb-20">
                  <label className="mb-10 text-left" htmlFor="email">Email<span className="red">*</span> </label>
                  <input type="email" value={this.state.email} placeholder="Email" id="email" className="form-control" name="email" onChange={this.onchange} />
                  {email && this.displayValidationErrors('email')}
                </div>
                <div className="section-field mb-20">
                  <label className="mb-10 text-left" htmlFor="password">Password<span className="red">*</span> </label>
                  <input className="Password form-control" value={this.state.password} id="password" type="password" placeholder="Password" name="password" onChange={this.onchange} />
                  {password && this.displayValidationErrors('password')}
                </div>
                <div className="section-field mb-20">
                  <label className="mb-10 text-left" htmlFor="password">Confirm Password<span className="red">*</span> </label>
                  <input className="Password form-control" value={this.state.confirmPassword} id="confirmPassword" type="password" placeholder="Confirm Password" name="confirmPassword" onChange={this.onchange} />
                  {confirmPassword && this.displayValidationErrors('confirmPassword')}
                </div>

                <div className="d-block text-left">
                  {
                    <a onClick={this.register} className={`btn cognito btn-theme pull-md-left  ${isFormValid ? '' : 'disabled'}`}>
                      <span className="text-white">Signup</span>
                      {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                    </a>
                  }
                  <span className="login-buttons-seperator"></span>

                  <GoogleLogin
                    clientId="166486140124-jglmk5i5fu0bvk6fh8q2hl25351pfst0.apps.googleusercontent.com"
                    buttonText="Signup with Google"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    className="btn cognito btn-danger"
                  />
                </div>

                <p className="mt-20 mb-0 remember-checkbox text-left">You have an account? <a href="Javascript:void(0)" onClick={() => this.props.updateUrlPathProp('login')}>Login here</a></p>
      </div>      
    );
  }
}
export default RegisterForm;