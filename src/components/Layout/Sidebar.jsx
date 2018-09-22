import React,{Component} from 'react';
import { Link } from 'react-router-dom';
import ScrollArea  from 'react-scrollbar';
import './Header';
class Sidebar extends Component{
   constructor(props)
   {
     super(props);
    
     this.dashboard=this.dashboard.bind(this);
     this.elements=this.elements.bind(this);
     this.calendarmenu=this.calendarmenu.bind(this);
     this.form=this.form.bind(this);
     this.sidebarnav=this.sidebarnav.bind(this);
     this.table=this.table.bind(this);
     this.custompage=this.custompage.bind(this);
     this.authentication=this.authentication.bind(this);
     this.multilevel=this.multilevel.bind(this);
     this.auth=this.auth.bind(this);
     this.login=this.login.bind(this);
     this.invoice=this.invoice.bind(this);
     this.error=this.error.bind(this);
     
     this.state={
       dashboard:false,
       elements:false,
       calendarmenu:false,
       form:false,
       sidebarnav:false,
       table:false,
       custompage:false,
       authentication:false,
       multilevel:false,
       auth:false,
       login:false,
       invoice:false,
       error:false,
       plussignele:false,
       plussignform:false,
       plussigndata:false,
       plussigncustome:false,
       plussignauthentic:false,
       plussignmulti:false,
       plussignauth:false,
       plussignlogin:false,
       plussigninvo:false,
       plussignerror:false
     }
   }

   dashboard()
   {
      this.setState({
        dashboard:!this.state.dashboard
      })
   }
   elements()
   {
     this.setState({
       elements:!this.state.elements,
       plussignele:!this.state.plussignele
     })
   }
   calendarmenu()
   {
     this.setState({
        calendarmenu:!this.state.calendarmenu
     })
   }
   sidebarnav()
   {
     this.setState({
      sidebarnav:!this.state.sidebarnav
     })
   }
   form()
   {
     this.setState({
      form:!this.state.form,
      plussignform:!this.state.plussignform
     })
   }
   table()
   {
     this.setState({
       table:!this.state.table,
       plussigndata:!this.state.plussigndata
     })
   }
   custompage(){
     this.setState({
       custompage:!this.state.custompage,
       plussigncustome:!this.state.plussigncustome
     })
   }
   authentication(){
     this.setState({
       authentication:!this.state.authentication,
       plussignauthentic:!this.state.plussignauthentic
     })
   }
   multilevel(){
     this.setState({
      multilevel:!this.state.multilevel,
      plussignmulti:!this.state.plussignmulti
     })
   }

   auth(){
    this.setState({
      auth:!this.state.auth,
      plussignauth:!this.state.plussignauth
    })
  }
  login(){
    this.setState({
      login:!this.state.login,
      plussignlogin:!this.state.plussignlogin
    })
  }
  invoice(){
    this.setState({
      invoice:!this.state.invoice,
      plussigninvo:!this.state.plussigninvo
    })
  }
  error(){
    this.setState({
      error:!this.state.error,
      plussignerror:!this.state.plussignerror
    })
  }
 render(){
        return(
           // <!-- Left Sidebar start-->
          
          //  <Collapse isOpen={this.props.toggerbutton}>
            <div className="side-menu-fixed">
            <ScrollArea speed={0.8} style={{overflow: 'hidden'}}
                                    className="scrollbar side-menu-bg"
                                    contentClassName="saidbar"
                                    horizontal={false} > 
              <div className="saidbar"> 
            
              <ul className="nav navbar-nav side-menu" id="sidebarnav">
                {/* <!-- menu item Dashboard--> */}
                <li className="">
                  <Link to="/market"><i className="ti-home"></i><span className="right-nav-text">Market</span></Link>
                </li>  
                <li className="">
                  <Link to="/dashboard"><i className="ti-home"></i><span className="right-nav-text">My Loans</span></Link>  
                </li>
                <li className="">
                  <Link to="/wallet"><i className="ti-wallet"></i><span className="right-nav-text">My Wallet</span></Link>  
                </li>
              </ul>
            </div>

            <div className="sidebar-bottom-section">
              <hr className="grey-hr" />
              <div className="details-container">
                <div>Contact Us</div>
                <div className="support-email">support@cognitochain.io</div>
              </div>

              <div>
                <ul className="sidebar-links">
                  <li>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                  </li>  
                  <li>
                    <Link to="/terms-and-conditions">Terms and conditions</Link>  
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