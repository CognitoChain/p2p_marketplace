import React from 'react';
import { Link } from 'react-router-dom';
import Api from "../../../services/api";
import validators from '../../../validators';
import CustomAlertMsg from '../../CustomAlertMsg/CustomAlertMsg';
class ForgotForm extends React.Component {
  constructor(props) {
    super(props);
    let errorMessage = '';
    let email = '';
    this.state = {
      email:email,
      errorMessage: errorMessage,
      buttonLoading:false,
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
        <div className="col s12 row text-left mt-1">
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
      this.setState({
        buttonLoading:true
      })
      const api = new Api();
      const response = await api.create("password-reset-request", {
        email: email
      })
      this.setState({
        buttonLoading:false
      })
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
    const { errorMessage, successMessage, email,buttonLoading } = this.state;
    const isFormValid = this.isFormValid();
    return (
      <div>
            <h3 className="mt-20 mb-20 login-label text-left">Forgot Password?</h3>
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
              {email && this.displayValidationErrors('email')}
            </div>

            <div className="text-left">
              <a onClick={this.sendPasswordLink} className={`btn cognito btn-theme ${isFormValid ? '' : 'disabled'}`}>
                <span className="text-white">Submit</span>
                {buttonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
              </a>
            </div>
            <p className="mt-20 mb-0 remember-checkbox text-left">Already have password? <Link to="/login" >Login</Link></p>
      </div>      
    );
  }
}
export default ForgotForm;