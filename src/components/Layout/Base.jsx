import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';

import Footer from './Footer';
import Header from './Header';

import Sidebar from './Sidebar';
import DharmaConsumer from "../../contexts/Dharma/DharmaConsumer";

class Base extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleactive: false,
            contentLoading:false
        };
        this.updateValue = this.updateValue.bind(this);
    }
    updateValue(value) {
        this.setState(prevState => ({
            toggleactive: !prevState.toggleactive
        }))
    }
    
    render() {
        return (
            <div className={this.state.toggleactive ? "wrapper  slide-menu" : "wrapper"}>
                <ToastContainer />
                <DharmaConsumer>
                    {(dharmaProps) => {
                        return (
                            <Header
                                updateParent={this.updateValue}
                                logout={this.props.logout}
                                authenticated={this.props.authenticated}
                                dharma={dharmaProps.dharma}
                                token={this.props.token}
                                userEmail={this.props.userEmail}
                                currentMetamaskAccount={this.props.currentMetamaskAccount}
                                wrongMetamskNetworkMsg={this.props.wrongMetamskNetworkMsg}
                                wrongMetamaskNetwork={this.props.wrongMetamaskNetwork}
                                updateMetamaskAccount={this.props.updateMetamaskAccount}
                                refreshTokens={dharmaProps.refreshTokens}
                                socialLogin = {this.props.socialLogin}
                            />
                        );
                    }}
                </DharmaConsumer>
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar {...this.props} />
                        <div className="content-wrapper">
                            <div className="main-content-container">{this.props.children}</div>
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
export default Base;