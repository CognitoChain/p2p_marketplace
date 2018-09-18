import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import { PostData } from "../services/PostData";
import { Redirect } from "react-router-dom";
import Api from "../services/api";
//import './LoginContainer.css';

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginError: false,
      redirect: false
    };
    this.signup = this.signup.bind(this);
  }

    async googleSignIn(token) {
        const api = new Api();
        return new Promise((resolve) => {
            api.create("goauthlogin", { token: token }).then((response) => {
                resolve(response);
            });
        });
    }

  signup(res, type) {
        let postData;
        if (type === "facebook" && res.email) {
            postData = {
                name: res.name,
                provider: type,
                email: res.email,
                provider_id: res.id,
                token: res.accessToken,
                provider_pic: res.picture.data.url
            };
        }

        if (type === "google") {
            console.log("have google profile: ", res.w3.U3);
            console.log("tokenId: ", res.tokenId)  ;          
            this.googleSignIn(res.tokenId).then(response => {
                console.log("logged-in as '", response.name, "' email: ", response.email);
                this.setState({
                    name: response.name,
                    email: response.email,
                    pictureUrl: response.pictureUrl
                })
            });
        }
        
    }

  render() {
    if (this.state.redirect || sessionStorage.getItem("userData")) {
      return <Redirect to={"/"} />;
    }

    const responseFacebook = response => {
      console.log("facebook console");
      console.log(response);
      this.signup(response, "facebook");
    };

    const responseGoogle = response => {
      console.log("google console");
      console.log(response);
      this.signup(response, "google");
    };

    return (

      <div className="row body">
        <div className="medium-12 columns">
          <div className="medium-12 columns">
            <h2 id="welcomeText" />

            <GoogleLogin
              clientId="166486140124-jglmk5i5fu0bvk6fh8q2hl25351pfst0.apps.googleusercontent.com"
              buttonText="Login with Google"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
            />

            <br /><br /><br /><br />
{/* 
            <FacebookLogin
              appId="334415360637037"
              autoLoad={false}
              fields="name,email,picture"
              callback={responseFacebook}
            />
*/}  

          </div>

        {this.state.name &&  
            <div> 
                <h1> Logged in as: {this.state.name}  </h1>                
                 <br /> Email: {this.state.email}  
                 <br /><br />
                 <img src={this.state.pictureUrl} />
            </div>
        }

        </div>
      </div>
    );
  }
}
export default LoginContainer;
