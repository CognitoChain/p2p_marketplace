import React from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import Api from "../../../services/api";

class Unsubscribe extends React.Component {
  constructor(props) {
    super(props);
    let token = this.props.token;
    if(_.isUndefined(token)){
      this.props.historyPush.push("/")
    }
    this.state = {
      token: token,
      errorMessage:'',
      successMessage:''
    };
  }
  componentWillMount() {
    if(this.state.token){
      this.emailUnsubscribe()
    }
  }
  async emailUnsubscribe() {
    const api = new Api();
    const response = await api.create("email/unsubscribe", {
      token: this.state.token
    });
    if (response.status == "SUCCESS") {
      toast.success("You've successfully unsubscribed.");
    }
    else {
      toast.error("Something went wrong. Please try again later.");
    }
    this.props.historyPush.push({
      pathname: '/login'
    });
  }

  render() {
      return (
        <div></div>      
      );
  }
}
export default Unsubscribe;