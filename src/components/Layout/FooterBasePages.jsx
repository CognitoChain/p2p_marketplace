import React,{Component} from 'react';
import { Row, Col } from 'reactstrap';

class FooterBasePages extends Component{
    render(){
        return(
            <footer className="pt-40 footer-container footer-full-width position-relative basepage-footer-container">
                <div className="container">
                    <Row>
                        <Col md={4}>
                            <h5 className="mb-20 mt-20">Disclaimer</h5>
                            <p>The Loanbase decentralized application (hereinafter, 'dApp') is an Beta release and due to this may contain some bugs. By using dApp users acknowledge this and accept that Loanbase does not take any responsibility for lost funds or any other kind of direct or indirect damages or loss. Some technical skills and knowledge are required to use our dApp and first-time users are highly encouraged first to use Testnet dAPP of the dApp to get acquinted with the process.</p>
                        </Col>

                        <Col md={4}>
                            <h5 className="mb-20 mt-20">Contact Us</h5>
                            <p>
                                Cognito Technologies Ltd,
                                86-90 Paul Street,<br />
                                London,
                                England, EC2A 4NE
                            </p>
                            <div className="social-icons mt-20">
                              <ul>
                                <li className="social-rss"><a href="javascript:void(0);"><i className="fa fa-rss fa-2x" /></a></li>
                                <li className="social-medium"><a href="https://medium.com/@cognitochain" target="_blank" rel="noopener noreferrer" ><i className="fa fa-medium fa-2x" /></a></li>
                                <li className="social-twitter"><a href="https://twitter.com/Loanbase1" target="_blank" rel="noopener noreferrer" ><i className="fa fa-twitter fa-2x" /></a></li>
                                <li className="social-github"><a href="https://github.com/CognitoChain" target="_blank" rel="noopener noreferrer" ><i className="fa fa-github fa-2x" /></a></li>
                                <li className="social-telegram"><a href="https://t.me/Loanbase" target="_blank" rel="noopener noreferrer" ><i className="fa fa-telegram fa-2x" /></a></li>
                              </ul>
                            </div>

                            <p className="mt-10">For any query drop us email <a href="mailto:support@Loanbase.io">support@Loanbase.io</a></p>

                        </Col>

                        <Col md={4}>
                           <h5 className="mb-20 mt-20">Useful Links</h5>
                           <ul className="useful-links">
                                <li>
                                    <a href="/market" target="_blank">Market</a> 
                                </li>    
                                <li>
                                    <a href="/terms" target="_blank">Terms &amp; Conditions</a> 
                                </li>
                                <li>
                                    <a href="/privacy" target="_blank">Privacy Policy </a> 
                                </li>
                                <li>
                                    <a href="/disclaimer" target="_blank">Legal Disclaimer</a>
                                </li>
                                <li>
                                    <a href="/cookie-policy" target="_blank">Cookie Policy </a> 
                                </li>
                                <li>
                                    <a href="/faq" target="_blank">FAQ </a> 
                                </li>
                            </ul>
                        </Col>
                    </Row>  

                    <Row className="mt-30 mb-20">
                        <Col md={12}>
                            <div className="text-center">
                                <p className="mb-0"> © Copyright <span id="copyright"> 2018</span>.Loanbase All Rights Reserved. </p>
                            </div>
                        </Col>
                    </Row>

                </div>
                    
            </footer>
        );
    }
}
export default FooterBasePages;