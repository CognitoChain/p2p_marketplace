import React, { Component } from 'react';
import CookieConsent from "react-cookie-consent";
class CookieConsentBlock extends Component {
    render() {
        return (
            <div>
                <CookieConsent
                    location="bottom"
                    buttonText="I Accept"
                    cookieName="cookieAccept"
                    style={{ background: "#2B373B" }}
                    buttonStyle={{ background:"#3699dc",color: "#fff", fontSize: "13px",cursor:'pointer' }}
                    expires={150} >
                    This website uses cookies to ensure you get the best experience on our website.
                </CookieConsent>
            </div>

        );
    }
}
export default CookieConsentBlock;