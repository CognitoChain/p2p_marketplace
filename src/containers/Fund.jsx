import React, { Component } from "react";
import Fund from "../components/Fund/Fund";
class FundContainer extends Component {
  render() {
    const { id } = this.props.match.params;
    return <Fund id={id} />;
  }
}
export default FundContainer;
