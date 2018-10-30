import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import logoImg from "../../assets/images/logo.svg";
import {
    Alert
} from "reactstrap";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";
import Api from "../../services/api";
import Avatar from 'react-avatar';
class Header extends Component {

    constructor(props) {
        super(props);
        this.interval = '';
        this.state = {
            toggleactive: false,
            defaultValue: 1,
            metamaskMsg: false
        };
        this.togglebutton = this.togglebutton.bind(this);
    }
    togglebutton(toggleactive) {
        this.props.updateParent();
    };

    async componentWillMount() {
        const { dharma } = this.props;
        const api = new Api();
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        let currentMetamaskAccountLocal = localStorage.getItem('currentMetamaskAccount');

        if (typeof currentAccount === "undefined") {
            this.setState({
                metamaskMsg: true,
            });
        }

        if (!_.isUndefined(currentAccount) && currentMetamaskAccountLocal != currentAccount) {
            const walletResponse = api.setToken(this.props.token).create("user/wallet", {
                address: currentAccount
            });
        }

        localStorage.setItem('currentMetamaskAccount', currentAccount);

        this.interval = setInterval(
            () => {
                this.checkAccount()
            }, 2500);
    }

    // async componentDidMount() {

    // }

    componentWillUnmount() {
        console.log("Clear")
        clearInterval(this.interval);
    }
    async checkAccount() {
        const { dharma } = this.props;
        let currentAccount = await dharma.blockchain.getCurrentAccount();
        let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');

        if (currentMetamaskAccount != String(currentAccount) && (typeof currentMetamaskAccount != "undefined" || typeof String(currentAccount) != "undefined")) {
            /*localStorage.setItem('currentMetamaskAccount', currentAccount);*/
            window.location.reload();
        }
    }
    render() {
        const { metamaskMsg } = this.state;
        const { userEmail } = this.props;
        return (
            <nav className="admin-header navbar navbar-default col-lg-12 col-12 p-0 fixed-top d-flex flex-row">

                <div className="text-left navbar-brand-wrapper">
                    <Link className="navbar-brand brand-logo" to="/"><img src={logoImg} alt="" /></Link>
                    <Link className="navbar-brand brand-logo-mini" to="/"><img src={logoImg} alt="" /></Link>
                </div>
                {/* <!-- Top bar left --> */}
                {/*<ul className="nav navbar-nav mr-auto">
                         <li className="nav-item">
                            <a className="button-toggle-nav inline-block ml-20 pull-left"  onClick={this.togglebutton} href="javascript:void(0);"  ><i className="zmdi zmdi-menu ti-align-right"></i></a>
                        </li>
                    </ul>*/}

                {/* <!-- top bar right --> */}
                <div className="ml-auto header-right-block">
                    {
                        metamaskMsg === true && (
                            <CustomAlertMsg
                                bsStyle='danger'
                                extraClass="d-inline-block header-notice mb-0"
                                title="Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured."
                            />
                        )
                    }

                    <ul className="nav navbar-nav d-inline-block">
                        <li className="nav-item dropdown mr-30">

                            {
                                this.props.authenticated === true && (
                                    <div>
                                        <div className="nav-link nav-pill user-avatar btn btn-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                            <Avatar name={userEmail} size="30px" round={true} />
                                        </div>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <div>
                                                <div className="dropdown-header">
                                                    <div className="media">
                                                        <div className="media-body">
                                                            <h5 className="mt-0 mb-0">Welcome</h5>
                                                            <span>{userEmail}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dropdown-divider"></div>
                                                <a className="dropdown-item" onClick={this.props.logout} href="javascript:void(0);"><i className="text-danger ti-unlock"></i>Logout</a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }



                            {
                                this.props.authenticated === false && (
                                    <div className="header-links">
                                        <a className="btn btn-link cognito" href="/login">Login / Register</a>
                                    </div>

                                )
                            }


                        </li>
                    </ul>
                </div>
            </nav>
            //   End Header

        );
    }
}
export default Header;

