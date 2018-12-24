import React, { Component } from "react";
import { Dharma, Web3 } from "@dharmaprotocol/dharma.js";
import DharmaContext from "./DharmaContext";
import _ from "lodash";
import tokensList from '../../tokens.json';

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
let wrongMetamaskNetwork = false;
const isWeb3Enabled = window.web3;
const networkId = isWeb3Enabled ? window.web3.version.network : null;
class DharmaProvider extends Component {
    constructor(props) {
        super(props);
        this.interval = '';
        this.state = {
            // The tokens that the user has in their wallet.
            tokens: [],
            isTokenLoading: true,
            isAllTokensChecked:false,
            dharma: null,
            // The tokens available for lending on Dharma Protocol.
            supportedTokens: [],
            wrongMetamaskNetwork: false
        };

        this.refreshUserTokens = this.refreshUserTokens.bind(this);
        this.getUserTokens = this.getUserTokens.bind(this);
    }

    componentDidMount() {
        if (window.web3) {
            this.checkNetworkId();
            if (!wrongMetamaskNetwork) {
                this.getUserTokens();
                //this.getSupportedTokens();
                this.interval = setInterval(() => {
                    if (this.state.isTokenLoading) {
                        this.getUserTokens()
                    }
                }, 5000);
            }
        }
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    getSupportedTokens() {
        if (!dharma || wrongMetamaskNetwork) {
            this.setState({ supportedTokens: [] });
            return;
        }
        try {
            dharma.token.getSupportedTokens().then((supportedTokens) => {
                this.setState({ supportedTokens });
            });
        } catch (e) {
            console.log(e)
        }

    }
    checkNetworkId() {
        if (isWeb3Enabled) {
            if (process.env.REACT_APP_METAMASK_NETWORK == "kovan" && networkId != "42" && networkId != null) {
                wrongMetamaskNetwork = true;
            }
            else if (process.env.REACT_APP_METAMASK_NETWORK == "main" && networkId != "1" && networkId != null) {
                wrongMetamaskNetwork = true;
            }
        }
    }
    refreshUserTokens(flag) {
        if (!dharma || wrongMetamaskNetwork) {
            this.setState({
                tokens: [],
                isTokenLoading: false
            });
            return;
        }
        let { tokens } = this.state;
        // Assume the tokens are out of date.
        if (_.isUndefined(flag)) {
            tokens = [];
        }
        this.setState({
            tokens,
            isTokenLoading: true
        }, () => {
            this.getUserTokens();
        })
    }
    async getUserTokens() {
        if (!dharma || wrongMetamaskNetwork) {
            this.setState({
                tokens: [],
                isTokenLoading: false
            });
            return;
        }
        const { Token } = Dharma.Types;
        let tokens = [];
        await dharma.blockchain.getAccounts().then(async (accounts) => {
            const owner = accounts[0];
            if (!_.isUndefined(owner)) {
                tokens = await Promise.all(
                    await tokensList.map(async (tokenSymbol) => {
                        console.log(tokenSymbol)
                        try {
                            const token = await Token.getDataForSymbol(dharma, tokenSymbol, owner)
                            console.log(token)
                            return token;
                        }
                        catch (e) {
                            console.log("e")
                            console.log(e)
                        }

                    }),
                );
                _.compact(tokens);
                console.log("tokens")
                console.log(tokens)
            }
        });

        this.setState({
            tokens,
            isTokenLoading: false
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
