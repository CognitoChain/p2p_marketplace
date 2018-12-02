import React,{Component} from 'react';
import { Row, Col} from 'reactstrap';

class FooterBasePages extends Component{
    render(){
        return(
            //<!--================================= footer -->
         
        <footer className="bg-white mt-20 p-4 footer-container footer-full-width">
                        <Row>
                            <Col md={6}>
                                <div className="text-center text-md-left">
                                    <p className="mb-0"> © Copyright <span id="copyright"> 2018</span>.Loanbase All Rights Reserved. </p>
                                </div>
                            </Col>
                            <Col md={6}>
                                <ul className="text-center text-md-right">
                                    <li className="list-inline-item"><a href="terms" target="_blank">Terms &amp; Conditions | </a> </li>
                                    <li className="list-inline-item"><a href="privacy" target="_blank">Privacy Policy | </a> </li>
                                    <li className="list-inline-item"><a href="disclaimer" target="_blank">Legal Disclaimer </a> </li>
                                </ul>
                            </Col>
                        </Row>
        </footer>
      
        
        );
    }
}
export default FooterBasePages;