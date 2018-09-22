import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import validators from '../../../validators';
import Api from "../../../services/api";
import './Login.css';
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null,
    };
    this.validators = validators;
    this.onchange = this.onchange.bind(this);
    this.login = this.login.bind(this);

    this.displayValidationErrors = this.displayValidationErrors.bind(this);
    this.updateValidators = this.updateValidators.bind(this);
    var user_authorization_token = localStorage.getItem('user_authorization_token');
    if (user_authorization_token != '' && user_authorization_token != null) {
      this.props.history.push("/dashboard");
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
      username: email,
      password: password
    });
    //const authorization = response.headers.get('Authorization');
    const authorization = response.headers.get('Authorization');
    console.log(authorization)
    if (authorization != null) {
      localStorage.setItem('token', authorization);
      this.props.history.push("/dashboard");
    }
    else {
      toast.error("Failed");
    }
  }
  render() {
    return (
      <section className="height-100vh d-flex align-items-center page-section-ptb login" style={{ backgroundImage: 'url(assets/images/login-bg.png)' }}>
        <Container>
          <Row className="justify-content-center no-gutters vertical-align">
            <Col lg={4} md={6} className="login-fancy-bg bg" style={{ backgroundImage: 'url(assets/images/login-inner-bg.png)' }}>
              <div className="login-fancy">
                <h2 className="text-white mb-20 text-center"><img src="assets/images/logo-full.svg" alt="Cognito Chain" width="200" /></h2>
                <p className="mb-20 text-white">Create tailor-cut websites with the exclusive multi-purpose responsive template along with powerful features.</p>
                <ul className="list-unstyled  pos-bot pb-30">
                  <li className="list-inline-item"><a className="text-white" href="#"> Terms of Use</a> </li>
                  <li className="list-inline-item"><a className="text-white" href="#"> Privacy Policy</a></li>
                </ul>
              </div>
            </Col>
            <Col lg={4} md={6} className="bg-white">
              <div className="login-fancy pb-40 clearfix">
                <h3 className="mb-30">Sign In</h3>
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
                <a onClick={this.login} className={`button   ${this.isFormValid() ? '' : 'disabled'}`}>
                  <span className="text-white">Log in</span>
                  <i className="fa fa-check text-white" />
                </a>
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