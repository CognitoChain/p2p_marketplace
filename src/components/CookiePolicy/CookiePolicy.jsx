import React, { Component } from "react";
import { Row, Col,Card,CardBody } from "reactstrap";

class CookiePolicy extends Component {

    render() {
        return (
            <div className="p-5">
              <div className="page-title">
                <Row className="mt-4 mb-4">
                  <Col>
                    <h3 className="privacy-header">COOKIE POLICY</h3>
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
                          This cookie policy explains what cookies are and how Loanbase.io and its affiliates (hereinafter, “Loanbase”, “the dapp”, "the Company", "we", "us" or "our") uses them. We encourage you to read the policy in full so that you can understand what information we collect using cookies and how that information is used.
                      </p>
                        <p>
                            By using our sites you are agreeing that we can use cookies in accordance with this policy.
                        </p>
                      <p>
                        <b>What are Cookies?</b>
                      </p>
                      <p>
                          Cookies are text files, containing small amounts of information, which are downloaded to your browsing device (such as a computer or smartphone) when you visit a website. Cookies can be recognized by the website that downloaded them — or other websites that use the same cookies. This helps websites know if the browsing device has visited them before.
                      </p>
                      <p>
                          <b>What are Cookies used for?</b>
                      </p>
                      <p>
                          Cookies do lots of different jobs, like helping us understand how our website is being used, letting you navigate between pages efficiently, remembering your preferences, and generally improving your browsing experience. Cookies can also help ensure marketing you see online is more relevant to you and your interests.
                      </p>
                        <p>
                            <b>What types of Cookies are used by Loanbase?</b>
                        </p>
                        <p>
                            The types of cookies used on our site can generally be put into one of the following categories: strictly necessary; analytics; functionality; advertising; and social media. You can find out more about each of the cookie categories below.
                        </p>

                        <p>
                            <b>Strictly Necessary Cookies</b>
                        </p>
                        <p>
                            These cookies are essential to make our website work. They enable you to move around the site and use its features. Without these cookies, services that are necessary for you to be able to use our site such as accessing secure areas cannot be provided.
                        </p>


                        <p>
                            <b>Analytics Cookies</b>
                        </p>
                        <p>
                            These cookies collect information about how people are using our website, for example, which pages are visited the most often, how people are moving from one link to another and if they get error messages from certain pages. These cookies don't gather information that identifies you. All information these cookies collect is grouped together with information from other people’s use of our site on an anonymous basis. Overall, these cookies provide us with analytical information about how our site is performing and how we can improve it.
                        </p>

                        <p>
                            <b>Functionality Cookies</b>
                        </p>
                        <p>
                            These cookies allow us to remember choices you make and tailor our site to provide enhanced features and content to you. For example, these cookies can be used to remember your username, language choice or country selection, they can also be used to remember changes you've made to text size, font and other parts of pages that you can customise.
                        </p>
                        <p>
                            <b>Social Media Cookies</b>
                        </p>
                        <p>
                            In order to enhance your internet experience and to make the sharing of content easier, some of the pages on our website may contain tools or applications that are linked to third party social media service providers such as Facebook, Twitter or Google+. Through these tools or applications, the social media service provider may set its own cookies on your device. We do not control these cookies and you should check the social media service provider’s website for further details about how they use cookies.
                        </p>
                        <p>
                            <b>How long will cookies stay on my browsing Device?</b>
                        </p>
                        <p>
                            The length of time a cookie will stay on your browsing device depends on whether it is a “persistent” or “session” cookie. Session cookies will only stay on your device until you stop browsing. Persistent cookies stay on your browsing device after you have finished browsing until they expire or are deleted.
                        </p>
                        <p>
                            <b>First and third-party cookies</b>
                        </p>
                        <p>
                            “First party cookies” are cookies that belong to us and that we place on your device. “Third-party cookies” are cookies that another party places on your browsing device when you visit our site.
                        </p>
                        <p>
                            Third parties setting cookies from our website will be providing a service to us or a function of the site but we do not always control how third party cookies are used. You should check the third party’s website for more information about how they use cookies.
                        </p>
                        <p>
                            <b>How to manage cookies from this website</b>
                        </p>
                        <p>
                            You can usually use the browser that you are viewing this website through to enable, disable or delete cookies. To do this, follow the instructions provided by your browser (usually located within the “Help”, “Tools” or “Edit” settings). Please note that if you set your browser to disable cookies, you may not be able to access secure areas of the website and other parts of the website may also not work properly.
                        </p>

                        <p>
                            You can find out more information about how to change your browser cookie settings at <a href={`https://allaboutcookies.org`} target="_blank" rel="noopener noreferrer">{"www.allaboutcookies.org"}</a>
                        </p>
                        <p>
                            Some third parties may use Advertising Cookies to help gather information about your browsing activity so that they can deliver website advertising to you that is relevant to your interests. The advertising industries in EU have developed schemes to help you opt-out of receiving cookies used for these purposes. You can find out more about the EU scheme from <a href={`https://youronlinechoices.eu`} target="_blank" rel="noopener noreferrer" >{"www.youronlinechoices.eu"}</a>
                        </p>

                        <p>
                            <b>Changes</b>
                        </p>
                        <p>
                            Information about the cookies used by us may be updated from time to time, so please check back on a regular basis for any changes.
                        </p>
                        <p>
                            <b>Questions</b>
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
export default CookiePolicy;
