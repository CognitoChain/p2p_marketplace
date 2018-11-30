import React, { Component } from "react";
import { Row, Col,Card,CardBody } from "reactstrap";
import "./GDPR.css";

class GDPR extends Component {
  
  render() {
    return (
      <div className="p-5">
        <div className="page-title">
          <Row className="mt-4 mb-4">
              <Col>
                  <h3 className="privacy-header">General Information Regarding GDPR Policies and Data Protection</h3>
              </Col>
          </Row>
        </div>  

         <Row>
            <Col md={12}>
                <Card className="card-statistics h-100 privacy-policy-container">
                    <CardBody>
                        <p>
                            In relation to the GDPR provisions, the personal data is the personal information of our clients that we gather for the purpose of our lawful business activities and legitimate interests in connection to the operation of the platform and our relevant AML and KYC policies.
                        </p>

                        <p>
                          <b>We gather and process the following information:</b>
                        </p>

                        <ul>
                            <li>Identification data of our Clients, including name, email id, etc.</li>
                            <li>Personal information of individuals acting as representatives of legal persons.</li>
                            <li>Other personal data that is required for the operation of the platform.</li>
                          </ul>

                        <p>
                            For the purpose of data control, we’ve appointed a Data Controller within the structure of the company. You may contact Data Controller at <a href="mailto:contact@Loanbase.io" rel="noopener noreferrer" className="contact-mail">contact@Loanbase.io</a>.Data Controller shall provide information only to the data subject or his legal representative and may demand information and documentation that allow to identify the data subject prior to disclosure of information or providing access to the information.
                        </p>

                        <p>
                          <b>Data Controller gathers and processes data for the following purposes:</b>
                          
                        </p>

                        <ul>
                            <li>The execution of the AML and KYC policies in accordance with the money laundering prevention legislation, including the procedure of risk assessment for the purpose of money laundering prevention.</li>
                            <li>Conclusion of an agreement with the Client.</li>
                            <li>Regular control of the provided information.</li>
                            <li>Marketing purposes.</li>
                          </ul>

                        <p>
                          <b>Processing shall be lawful only if and to the extent that at least one of the following applies:</b>
                          
                        </p>

                        <ul>
                            <li>The data subject has given consent to the processing of his or her personal data for one or more specific purposes;</li>
                            <li>Processing is necessary for the performance of a contract to which the data subject is party or in order to take steps at the request of the data subject prior to entering into a contract.</li>
                            <li>Processing is necessary for compliance with a legal obligation to which the controller is subject</li>
                            <li>Processing is necessary in order to protect the vital interests of the data subject or of another physical person.</li>
                            <li>Processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller</li>
                            <li>Processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject which require protection of personal data, in particular where the data subject is a child.</li>
                          </ul>

                        <p>
                          <b>For the fulfilment of the data collection purposes the gathered data may be provided to the following data recipients:</b>

                           

                        </p>

                         <ul>
                            <li>Our partners and affiliates, for the purpose of marketing or data processing. We ensure that our partners and affiliates have the valid Privacy Policies drawn up in accordance with the GDPR.</li>
                            <li>State regulatory authorities, including the Financial Inspection of Estonia and the Estonian Police and Customs board.</li>
                            </ul>

                        <p>
                          The gathered data is processed for the period that is reasonably necessary for the set purpose for which it was initially obtained. The overall processing period is determined by the length of the relationship with the Clients, the specifics of the provided data, the presence of any specific circumstance or obligations or whether the relation with the client is possible in light of the applicable legislation.

                          NB! Any persons, whose data was gathered and processed has the right to request access to their personal data, the right for rectification, erasure or restriction of processing of such data, the right to object to data processing in the events and cases as stated by GDPR and the right to form and present a complaint to the state supervisory authority.

                          

                        </p>

                        <p>
                          Any client understands, that should he demand the restriction of his personal data processing, Data Controller may terminate any cooperation with the agreement if such a demand makes it impossible for Data Controller to carry out its legal obligations, including obligations in the field of money laundering prevention.

                          Any client who gave his consent to data gathering and processing may withdraw his consent at any time by sending the message with the withdrawal at <a href="mailto:contact@Loanbase.io" rel="noopener noreferrer" className="contact-mail">contact@Loanbase.io</a>.
                          Any data processing that was carried out prior to the withdrawal shall be deemed lawful.
                        </p>

                        <h3 className="mt-20">What is GDPR?</h3>

                        <p>
                          GDPR is the EU General Data Protection Regulation that replaces the old Data protection directive 95/46/EC. GDPR came into force 25.05.2018.

                          <b>The GDPR introduces the following obligations for the companies that gather and process personal data:</b>
                        </p>

                        <ul>
                            <li>Implement measure to ensure the compliance with GDPR.</li>
                            <li>Implement the necessary security measures to protect the rights of the data subjects when gathering and processing data.</li>
                            <li>Conduct data protection impact assessments of high risk processing activities.</li>
                            <li>Implement privacy by default design.</li>
                            <li>Implement the valid data breach notification.</li>
                        </ul>

                        <p>
                          Data Controller implements the up to date Privacy Policy and compliance procedures to ensure that the personal data is kept safe and is processed in accordance with the applicable laws.

                          The company employees and other personnel receive the necessary training. All processed data is under review.

                          Implementation of GDPR may require changes to the existing agreements and policies. Should that take place, the clients shall be promptly notified and their consent requested.

                        </p>

                    </CardBody>
                </Card>
            </Col>
        </Row>


      </div>
    );
  }
}
export default GDPR;
