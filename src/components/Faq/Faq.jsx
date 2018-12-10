import React, { Component } from "react";
import './Faq.css';
import { Row, Col, Card, CardBody } from 'reactstrap';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import faqJson from '../../faq.json';
class Faq extends Component {
    constructor(props) {
        super(props);
        this.OpenAccordion = this.OpenAccordion.bind(this);
    }
    OpenAccordion(sectionName, Wrapdiv) {
        var CurrentCls = document.getElementById(sectionName).getAttribute("class");
        if (CurrentCls == "acd-des") {
            document.getElementById(sectionName).setAttribute("class", "acd-des show");
            document.getElementById(Wrapdiv).setAttribute("class", "acd-group acd-active");
        }
        else {
            document.getElementById(sectionName).setAttribute("class", "acd-des");
            document.getElementById(Wrapdiv).setAttribute("class", "acd-group");
        }
    }

    renderFaq() {
      let i = 0;
      return (
        <Accordion>
        {faqJson.map(faq => {
              i++;
              return (
                  <AccordionItem>
                    <AccordionItemTitle>
                        <h6 className="u-position-relative"><strong>{i}. {faq.question}</strong>
                            <div className="accordion__arrow" role="presentation"></div></h6>
                    </AccordionItemTitle>
                    <AccordionItemBody>
                        <div dangerouslySetInnerHTML={{__html: faq.answer}}></div>
                    </AccordionItemBody>
                  </AccordionItem>    
              );
          })}
        </Accordion>
      );
    }

    render() {
        return (
            <div className="p-5">
              <div className="page-title">
                <Row className="mt-4 mb-4">
                  <Col>
                    <h3 className="privacy-header">FAQ's</h3>
                  </Col>
                </Row>
              </div>

              <Row>
                <Col md={12}>
                  <Card className="card-statistics h-100 privacy-policy-container">
                    <CardBody>
                        <Row>
                            <Col lg={12} md={12}>
                                <div className="tab nav-center">
                                    <h4 className="mb-20">
                                        Frequently Asked Questions about the platform.
                                    </h4>    
                                    <Accordion>
                                      {this.renderFaq()}
                                    </Accordion>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
        );
    }
}
export default Faq;