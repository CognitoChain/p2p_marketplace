
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            toggleactive: false,
            defaultValue: 1
        };
        this.togglebutton = this.togglebutton.bind(this);
    }
    togglebutton(toggleactive) {
        this.props.updateParent();
    };
   
    render() {
        return (
            <nav className="admin-header navbar navbar-default col-lg-12 col-12 p-0 fixed-top d-flex flex-row">

                <div className="text-left navbar-brand-wrapper">
                    <Link className="navbar-brand brand-logo" to="/"><img src="assets/images/logo.svg" alt="" /></Link>
                    <Link className="navbar-brand brand-logo-mini" to="/"><img src="assets/images/logo.svg" alt="" /></Link>
                </div>
                {/* <!-- Top bar left --> */}
                {/*<ul className="nav navbar-nav mr-auto">
                         <li className="nav-item">
                            <a className="button-toggle-nav inline-block ml-20 pull-left"  onClick={this.togglebutton} href="javascript:void(0);"  ><i className="zmdi zmdi-menu ti-align-right"></i></a>
                        </li>
                    </ul>*/}

                {/* <!-- top bar right --> */}
                <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item dropdown mr-30">
                        <a className="nav-link nav-pill user-avatar" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                            <i className="fa fa-user-circle"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            {
                                this.props.authenticated ===true && (
                                    <div>
                                        <a className="dropdown-item" onClick={this.props.logout} href="javascript:void(0);"><i className="text-danger ti-unlock"></i>Logout</a>
                                    </div>
                                )
                            }
                            {
                                this.props.authenticated ===false && (
                                    <div>
                                        <a className="dropdown-item"  href="/login"><i className="text-success fa fa-sign-in"></i>Login</a>
                                        <a className="dropdown-item"  href="/register"><i className="text-info ti-user"></i>Register</a>
                                    </div>
                                )
                            }

                        </div>
                    </li>
                </ul>
            </nav>
            //   End Header

        );
    }
}
export default Header;

