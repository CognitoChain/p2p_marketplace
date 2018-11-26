import React from 'react';
import Api from "../../../services/api";
import validators from '../../../validators';
import CustomAlertMsg from '../../CustomAlertMsg/CustomAlertMsg';

class ResetForm extends React.Component {
  constructor(props) {
    super(props);
    let token = this.props.token;
    let errorMessage = '';
    this.state = {
      token: token,
      password:'',
      confirmPassword: '',
      errorMessage: errorMessage,
      successMessage: "" ,
      buttonLoading:false    
    };
    this.onchange = this.onchange.bind(this);
    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.validators = validators;
  }

  onchange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
    this.updateValidators([event.target.name], event.target.value);
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
    const validationFields = ["password", "confirmPassword"];
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
        <div className="col s12 row text-left mt-1">
          {errors}
        </div>
      );
    }
    return result;
  }
  async resetPassword(event) {
    event.preventDefault();
    const {
      password,
      token
    } = this.state;
    if (password != "") {
      this.setState({
        buttonLoading:true
      })
      const api = new Api();
      const response = await api.create("password-reset", {
        password: password,
        token:token
      })
      this.setState({
        buttonLoading:false
      })
      if (response.status == "SUCCESS") {
        this.props.historyPush.push({
          pathname: '/login',
          state: { message: "PASSWORD_RESET_SUCCESS" }
        });
      }
      else {
        this.setState({
          errorMessage : "Link Broken.Please try again."          
        });
      }
    }
  }

  render() {
    const { errorMessage, successMessage, token, password, confirmPassword,buttonLoading } = this.state;
    const isFormValid = this.isFormValid();
    if (token) {
      return (
        <div>
              <h3 className="mt-20 mb-20 login-label text-left">Reset Password?</h3>
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
                <label className="mb-10 text-left" htmlFor="password">Password<span className="red">*</span> </label>
                <input className="Password form-control" value={this.state.password} id="password" type="password" placeholder="Password" name="password" onChange={this.onchange} />
                {password && this.displayValidationErrors('password')}
              </div>

              <div className="section-field mb-20">
                <label className="mb-10 text-left" htmlFor="password">Confirm Password<span className="red">*</span> </label>
                <input className="Password form-control" value={this.state.confirmPassword} id="confirmPassword" type="password" placeholder="Confirm Password" name="confirmPassword" onChange={this.onchange} />
                {confirmPassword && this.displayValidationErrors('confirmPassword')}
              </div>

              <div className="text-left">
                <a onClick={this.resetPassword} className={`btn cognito btn-theme ${isFormValid ? '' : 'disabled'}`}>
                  <span className="text-white">Update Password</span>
                  {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                </a>
              </div>

              <p className="mt-20 mb-0 remember-checkbox">After Reset Password  <a href="Javascript:void(0)" onClick={() => this.props.updateUrlPathProp('login')}>Login here</a></p>
        </div>      
      );
    }
    else {
      return <div></div>;
    }
  }
}
export default ResetForm;