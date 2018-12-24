import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';

import Footer from './Footer';
import Header from './Header';

import Sidebar from './Sidebar';
import ModalMessage from './ModalMessage';
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
            toggleactive: value || !prevState.toggleactive
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
                                dharma={dharmaProps.dharma}
                                refreshTokens={dharmaProps.refreshTokens}
                                {...this.props}
                            />
                        );
                    }}
                </DharmaConsumer>
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar {...this.props} updateParent={this.updateValue}/>
                        <div className="content-wrapper">
                            <div className="main-content-container">{this.props.children}</div>
                            <Footer />
                        </div>
                    </div>
                </div>
                <ModalMessage {...this.props}/>
            </div>
        );
    }

}
export default Base;