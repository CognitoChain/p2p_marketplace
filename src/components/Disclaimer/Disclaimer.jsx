import React, { Component } from "react";
import { Row, Col,Card,CardBody } from "reactstrap";

class Disclaimer extends Component {

    render() {
        return (
            <div className="p-5">
              <div className="page-title">
                <Row className="mt-4 mb-4">
                  <Col>
                    <h3 className="privacy-header">LEGAL DISCLAIMER</h3>
                  </Col>
                </Row>
              </div>

              <Row>
                <Col md={12}>
                  <Card className="card-statistics h-100 privacy-policy-container">
                    <CardBody>

                      <p>
                        <b>Introduction</b>
                      </p>
                      <p>
                          The Loanbase decentralized application (hereinafter, 'dApp') is an Beta release and due to this may contain some bugs. By using dApp users acknowledge this and accept that ETHLend does not take any responsibility for lost funds or any other kind of direct or indirect damages or loss. Some technical skills and knowledge are required to use our dApp and first-time users are highly encouraged first to use Testnet dAPP of the dApp to get acquinted with the process. First time users are also encouraged to go through our FAQ.
                      </p>

                      <p>
                        <b>Changes</b>
                      </p>
                      <p>
                          Our policies, content, information, promotions, disclosures, disclaimers and features may be revised, modified, updated, and/or supplemented at any time and without prior notice at the sole and absolute discretion of the Company. If we change this Legal Disclaimer, we will take steps to notify all Users by a notice on our website and will post the amended Legal Disclaimer on the website.
                      </p>

                      <p>
                        <b>Contacting Us</b>
                      </p>
                      <p>
                        Should you have any question about these Terms, or wish to contact us for any reason whatsoever, please do so by sending us an email at <a href="mailto:support@Loanbase.io" rel="noopener noreferrer" className="contact-mail">support@Loanbase.io</a>
                      </p>

                    </CardBody>
                  </Card>
                </Col>
              </Row>


            </div>
        );
    }
}
export default Disclaimer;
