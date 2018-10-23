import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import logoImg from "../../assets/images/logo.svg";
import {
  Alert
} from "reactstrap";
import CustomAlertMsg from "../CustomAlertMsg/CustomAlertMsg";

class Header extends Component {

    constructor(props) {
        super(props);
        this.interval = '';
        this.state = {
            toggleactive: false,
            defaultValue: 1,
            metamaskMsg:false
        };
        this.togglebutton = this.togglebutton.bind(this);
    }
    togglebutton(toggleactive) {
        this.props.updateParent();
    };
    
    async componentWillMount() {
        const { dharma } = this.props;
        const currentAccount = await dharma.blockchain.getCurrentAccount();
        localStorage.setItem('currentMetamaskAccount', currentAccount);
        if(typeof currentAccount === "undefined")
        {
            this.setState({
                metamaskMsg:true,
            });
        }
        
        this.interval = setInterval(
        () => {
            this.checkAccount()
        },2500);
    }

    // async componentDidMount() {
        
    // }

    componentWillUnmount(){
        console.log("Clear")
        clearInterval(this.interval);
    }
    async checkAccount(){
        const { dharma } = this.props;
        let currentAccount = await dharma.blockchain.getCurrentAccount();
        let currentMetamaskAccount = localStorage.getItem('currentMetamaskAccount');

        if (currentMetamaskAccount != String(currentAccount) && (typeof currentMetamaskAccount != "undefined" || typeof String(currentAccount) != "undefined")) 
        {
            localStorage.setItem('currentMetamaskAccount', currentAccount);
            window.location.reload();
        }
    }
    render() {
        const {metamaskMsg} = this.state;
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
                    metamaskMsg ===true && (
                        <CustomAlertMsg 
                            bsStyle='danger'
                            extraClass="d-inline-block header-notice"
                            title="Unable to find an active account on the Ethereum network you're on. Please check that MetaMask is properly configured and reload the page."
                        />
                    )
                }

                <ul className="nav navbar-nav d-inline-block">
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
                                        <a className="dropdown-item"  href="/login"><i className="text-info fa fa-sign-in"></i>Login</a>
                                        <a className="dropdown-item"  href="/register"><i className="text-info ti-user"></i>Register</a>
                                    </div>
                                )
                            }

                        </div>
                    </li>
                </ul>
                </div>
            </nav>
            //   End Header

        );
    }
}
export default Header;

