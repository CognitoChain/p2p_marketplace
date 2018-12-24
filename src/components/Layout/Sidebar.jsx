import React, { Component } from 'react';
import ScrollArea from 'react-scrollbar';
import { withRouter } from 'react-router-dom';
import './Header';
import marketsidebarImg from "../../assets/images/menu-market.png";
import walletsidebarImg from "../../assets/images/menu-wallet.png";
import dashboardsidebarImg from "../../assets/images/menu-dashboard.png";
class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.redirectLocation = this.redirectLocation.bind(this);

  }
  getSelectedClass(linkName) {
    const { currentLocation } = this.props;
    return ((linkName == currentLocation) || (linkName == "market" && (currentLocation == "/" || currentLocation == ""))) ? "active" : "";
  }
  redirectLocation(location) {
    if(this.props.isMobileSized){
      this.props.updateParent(false)
    }
    this.props.history.push(location);
    return;
  }
  render() {
    return (
      // <!-- Left Sidebar start-->

      //  <Collapse isOpen={this.props.toggerbutton}>
      <div className="side-menu-fixed">
        <ScrollArea speed={0.8} style={{ overflow: 'hidden' }}
          className="scrollbar side-menu-bg"
          contentClassName="sidebar"
          horizontal={false} >
          <div className="sidebar">

            <ul className="nav navbar-nav side-menu" id="sidebarnav">
              {/* <!-- menu item Dashboard--> */}
              <li className={this.getSelectedClass("market")}>
                <a href="javascript:void(0)" onClick={() => this.redirectLocation("market")}><img src={marketsidebarImg} alt="Market" height="25" /><span className="right-nav-text"> Market</span></a>
              </li>
              <li className={this.getSelectedClass("dashboard")}>
                <a href="javascript:void(0)" onClick={() => this.redirectLocation("dashboard")}><img src={dashboardsidebarImg} alt="My Loans" height="25" /><span className="right-nav-text"> My Loans</span></a>
              </li>
              <li className={this.getSelectedClass("wallet")}>
                <a href="javascript:void(0)" onClick={() => this.redirectLocation("wallet")}><img src={walletsidebarImg} alt="My Wallet" height="25" /><span className="right-nav-text"> My Wallet</span></a>
              </li>
            </ul>
          </div>

          <div className="sidebar-bottom-section">
            <hr className="grey-hr" />
            <div className="details-container">
              <div>Contact Us</div>
              <div className="support-email"><a href="mailto:support@Loanbase.io">support@Loanbase.io</a></div>
            </div>

            <div>
              <ul className="sidebar-links">
                <li>
                  <a href="/privacy" target="_blank">Privacy Policy</a>
                </li>
                <li>
                  <a href="/gdpr" target="_blank">GDPR</a>
                </li>
                <li>
                  <a href="/terms" target="_blank">Terms and Conditions</a>
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
export default withRouter(Sidebar);