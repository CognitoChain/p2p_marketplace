import React, { Component } from "react";
import { Dharma, Web3 } from "@dharmaprotocol/dharma.js";

import DharmaContext from "./DharmaContext";
import _ from "lodash";

// Get the host from the current environment. If it is not specified, we will assume we
// are running a testnet or production build and use Metamask.
const HOST = process.env.REACT_APP_BLOCKCHAIN_HOST;

/**
 * This method returns a Web3 provider, which is passed to Dharma.js and used to communicate with an
 * Ethereum blockchain node.
 *
 * For local development purposes, the blockchain node is usually a localhost URL such as
 * localhost:8545. In this case the function should return Web3's HTTP Provider, configured to
 * use localhost:8545. Depending on the deployment context, there may also be a provider on an
 * injected web3 instance (for example when using MetaMask in a browser), in which case that
 * provider is returned.
 *
 * @returns {Web3.Provider}
 */
function getWeb3Provider() {
    if (HOST) {
        return new Web3.providers.HttpProvider(HOST);
    } else if (window.web3) {
        return window.web3.currentProvider;
    } else {
        /*throw new Error("No web3 provider reachable.");*/
        return false;
    }
}
const dharma = new Dharma(getWeb3Provider());
/**
 * Allows any children of this provider to have access to an instance of Dharma.js that is
 * connected to a blockchain.
 */
class DharmaProvider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // The tokens that the user has in their wallet.
            tokens: [],
            isTokenLoading: true,
            dharma: null,
            // The tokens available for lending on Dharma Protocol.
            supportedTokens: [],
        };

        this.refreshUserTokens = this.refreshUserTokens.bind(this);
        this.getUserTokens = this.getUserTokens.bind(this);
    }

    componentDidMount() {
        if (window.web3){
            this.getUserTokens();
            this.getSupportedTokens();
        }
    }

    getSupportedTokens() {
        dharma.token.getSupportedTokens().then((supportedTokens) => {
            this.setState({ supportedTokens });
        });
    }
    refreshUserTokens(flag){
        
        let { isTokenLoading,tokens} = this.state;
        // Assume the tokens are out of date.
        if (_.isUndefined(flag)) {
            tokens = [];
        }
        if(!isTokenLoading){
            isTokenLoading = true;    
        }
        this.setState({
            tokens,
            isTokenLoading
        }, () => {
            this.getUserTokens();
        })
    }
     getUserTokens() {
        const { Token } = Dharma.Types;
        dharma.blockchain.getAccounts().then(async(accounts) => {
            let tokens = [];
            const owner = accounts[0];
            if (!_.isUndefined(owner)) {
                await Token.all(dharma, owner).then((tokenData) => {
                    tokens = tokenData;
                });
            }
            this.setState({
                tokens,
                isTokenLoading: false
            });
        });
    }
    render() {
        const dharmaProps = {
            dharma: dharma,
            tokens: this.state.tokens,
            isTokenLoading: this.state.isTokenLoading,
            supportedTokens: this.state.supportedTokens,
            refreshTokens: this.refreshUserTokens            
        };

        return (
            <DharmaContext.Provider value={dharmaProps}>
                {this.props.children}
            </DharmaContext.Provider>
        );
    }
}

export default DharmaProvider;
