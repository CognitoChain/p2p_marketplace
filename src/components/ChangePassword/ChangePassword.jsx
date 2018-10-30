import React, { Component } from 'react';
import { Card, CardBody, CardTitle, Row, Col, ListGroup, Form } from 'reactstrap';
import InputRange from 'react-input-range';
import './ChangePassword.css';
import validators from '../../validators';
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import Api from "../../services/api";
import _ from "lodash";
class ChangePassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            customAlertMsgDisplay: false,
            customAlertMsgStyle: '',
            customAlertMsgClassname: '',
            customAlertMsgTitle: '',
            currentPassword:'',
            password:'',
            confirmPassword:'',
        };
        this.onchange = this.onchange.bind(this);
        this.validators = validators;
        this.displayValidationErrors = this.displayValidationErrors.bind(this);
        this.updateValidators = this.updateValidators.bind(this);
        this.changePassword = this.changePassword.bind(this);
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
        const validationFields = ["password","confirmPassword","currentPassword"];
        validationFields.forEach((field) => {
            this.updateValidators(field, this.state[field])
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
                <div className="col s12 row">
                    {errors}
                </div>
            );
        }
        return result;
    }

    async changePassword(event) {
        event.preventDefault();
        const {
          currentPassword,
          password          
        } = this.state;
        if (currentPassword != "" && password != '') {
          const api = new Api();
          let data = {'currentPassword': currentPassword,'newPassword':password};
          const response = await api.setToken(this.props.token).put("user/password", null, data).catch((error) => {
            if (error.status && error.status === 500) {
                this.setState({
                    customAlertMsgDisplay: true,
                    customAlertMsgStyle: 'danger',
                    customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2', 
                    customAlertMsgTitle:error.message       
                })
            }
          });;

          if (!_.isUndefined(response) && response.status == "SUCCESS") {
            localStorage.removeItem('token');
            localStorage.removeItem('currentMetamaskAccount');
            localStorage.removeItem('userEmail');
            this.props.history.push({
              pathname: '/login',
              state: { message: "PASSWORD_CHANGED_SUCCESSFULLY" }
            });
          }
          else {
            this.setState({
                customAlertMsgDisplay: true,
                customAlertMsgStyle: 'danger',
                customAlertMsgClassname: 'fa fa-exclamation-triangle fa-2x pull-left mr-2', 
                customAlertMsgTitle:response.message         
            })
          }
        }
    }

    render() {
        const { tokens,userEmail } = this.props;
        const {
            customAlertMsgDisplay,
            customAlertMsgStyle,
            customAlertMsgClassname,
            customAlertMsgTitle,
            currentPassword,
            password,
            confirmPassword
        } = this.state;
        const isFormValid = this.isFormValid();
        return (
            <div className="create-loan-container">
                <div>
                    <Row className="row-eq-height">
                        <Col lg={4} md={4} sm={6} xl={4}>
                            <Card className="card-statistics mb-30 h-100 p-2">
                                <CardBody>
                                    <CardTitle className="card-title-custom">Change Password </CardTitle>
                                    <label className="mt-10 mb-10 user-email"><i className="fa fa-envelope"></i> {userEmail}</label>

                                    {customAlertMsgDisplay === true &&
                                        <CustomAlertMsg
                                            bsStyle={customAlertMsgStyle}
                                            className={customAlertMsgClassname}
                                            title={customAlertMsgTitle}
                                        />
                                    }

                                    <Form className="create-loan-form">
                                        <div className="mt-30">
                                            <label>Current Password<span className="red">*</span></label>
                                            <input type="password" value={this.state.currentPassword} placeholder="Old Password" id="currentPassword" className="form-control" name="currentPassword" onChange={this.onchange} />
                                            {currentPassword && this.displayValidationErrors('currentPassword')}
                                        </div>
                                        
                                        <div className="mt-30">
                                            <label>New Password<span className="red">*</span></label>
                                            <input type="password" value={this.state.password} placeholder="New Password" id="password" className="form-control" name="password" onChange={this.onchange} />
                                            {password && this.displayValidationErrors('password')}
                                        </div>
                                            
                                        <div className="mt-30">
                                            <label>Confirm New Password<span className="red">*</span></label>
                                            <input type="password" value={this.state.confirmPassword} placeholder="Confirm New Password" id="confirmPassword" className="form-control" name="confirmPassword" onChange={this.onchange} />
                                            {confirmPassword && this.displayValidationErrors('confirmPassword')}
                                        </div>    

                                        <div className="mt-30">
                                            <a onClick={this.changePassword} className={`btn cognito btn-theme pull-md-left ${isFormValid ? '' : 'disabled'}`}>
                                                <span className="text-white">Change</span>
                                            </a>
                                        </div>                                        
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={4} md={4} sm={6} xl={4} className="pl-4">

                            <Card className="card-statistics mb-30 h-100">
                                <CardBody className="pb-0">
                                    <div className="p-2 pb-0">
                                        <CardTitle className="card-title-custom">Please Note</CardTitle>
                                        <div className="scrollbar" tabIndex={2} style={{ overflowY: 'hidden', outline: 'none' }}>
                                            <ListGroup className="list-unstyled to-do password-details">
                                                <li>Changing your email password regularly can protect your account from hackers and possible identity theft.</li>
                                                <li>When changing your password, you should choose a new, strong password that is not used with any other online account, and that contains a minimum of 6 characters comprised of letters, numbers, and symbols.</li>
                                                <li>To make your password even more difficult for others to guess, you should avoid including personal information in your password that you often share with others; such as your birth date, phone number, and the name of your pet or child.</li>
                                            </ListGroup>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}
export default ChangePassword;