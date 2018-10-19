import React, { Component } from "react";
import Layout from "./components/Layout/Layout";
import './Vendor.js';
import {
	Row,
	Col
} from "reactstrap";
import Modal from "react-responsive-modal";


class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			modalOpen: false,
		};
	}

	componentDidMount() {
		if (!window.web3 || !window.web3.currentProvider.isMetaMask) {
			this.setState({ modalOpen: true });
		}
		/*if (typeof window.web3 !== 'undefined') {
		    console.log('web3 is enabled');
		    if (window.web3.currentProvider.isMetaMask === true) {
		      console.log('MetaMask is active')
		    } else {
		      console.log('MetaMask is not available')
		    }
		}
		else 
		{
		    
		}*/
	}

	onCloseModal = () => {
    	
  	};

	render() {
		const { modalOpen } = this.state;
		return (
			<div className="App">
				<Layout />

				<Modal open={modalOpen} center closeOnEsc={false} closeOnOverlayClick={false} showCloseIcon={false} onClose={this.onCloseModal}>
					<div className="web3-header">
						<i className="fa fa-exclamation-triangle web3-exclamation-triangle"></i><br />
						<h2 className="text-center text-bold">
							Your browser isn't Web3-enabled
		              	</h2>
					</div>
					<Row>
						<Col lg={12} md={12} sm={6} xl={12} className="web3-error-description">
							<p className="mt-15 mb-15">
								Cognito Chain is a Web3-enabled application, which is just a fancy way of saying that it needs to be plugged into the Ethereum blockchain.
			                </p>
							<p className="mt-15 mb-15">In order to use Cognito Chain on the web, you will need to install the MetaMask browser extension, available for Chrome, Firefox, Opera, and the new Brave browser.
			              	</p>
							<div className="mt-30 mb-30 text-center">
								<a href="https://metamask.io/" target="_blank" className="btn cognito orange">Download Metamask</a>
							</div>
						</Col>
					</Row>
				</Modal>
			</div>
		);
	}
}

export default App;
