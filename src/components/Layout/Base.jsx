import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';

import Footer from './Footer';
import Header from './Header';

import Sidebar from './Sidebar';


class Base extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleactive: false
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
                <Header updateParent={this.updateValue}  logout={this.props.logout} authenticated={this.props.authenticated} token={this.props.token} />
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="content-wrapper">
                            {this.props.children}
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
export default Base;