import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ScrollArea from 'react-scrollbar';
import './Header';
import marketsidebarImg from "../../assets/images/menu-market.png";
import walletsidebarImg from "../../assets/images/menu-wallet.png";
class Sidebar extends Component {
  constructor(props) {
    super(props);
  }
  getSelectedClass(linkName){
    const { location } = this.props;
    return ((linkName == location) || (linkName=="market" && (location=="/" || location=="")))?"active":"";
  }
  render() {
    return (
      // <!-- Left Sidebar start-->

      //  <Collapse isOpen={this.props.toggerbutton}>
      <div className="side-menu-fixed">
        <ScrollArea speed={0.8} style={{ overflow: 'hidden' }}
          className="scrollbar side-menu-bg"
          contentClassName="saidbar"
          horizontal={false} >
          <div className="saidbar">

            <ul className="nav navbar-nav side-menu" id="sidebarnav">
              {/* <!-- menu item Dashboard--> */}
              <li className={this.getSelectedClass("market")}>
                <Link to="/market"><img src={marketsidebarImg} alt="Image" height="25" /><span className="right-nav-text"> Market</span></Link>
              </li>
              <li className={this.getSelectedClass("dashboard")}>
                <Link to="/dashboard"><img src={marketsidebarImg} alt="Image" height="25" /><span className="right-nav-text"> My Loans</span></Link>
              </li>
              <li className={this.getSelectedClass("wallet")}>
                <Link to="/wallet"><img src={walletsidebarImg} alt="Image" height="25" /><span className="right-nav-text"> My Wallet</span></Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-bottom-section">
            <hr className="grey-hr" />
            <div className="details-container">
              <div>Contact Us</div>
              <div className="support-email"><a href="mailto:support@cognitochain.io">support@cognitochain.io</a></div>
            </div>

            <div>
              <ul className="sidebar-links">
                <li>
                  <a href="/privacy" target="_blank">Privacy Policy</a>
                </li>
                <li>
                  <a href="terms" target="_blank">Terms and Conditions</a>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </div>
      // </Collapse>
    );
  }
}
export default Sidebar;