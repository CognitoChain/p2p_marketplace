// External libraries
import React from "react";

// Styling
import "./Loading.css";

class Loading extends React.Component {
    render() {
        return <div className="indicator"> 
        <svg width="16px" height="12px">
          <polyline id="back" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
          <polyline id="front" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
       
        </svg>
        <span>Loading</span>
      </div>;
    }
}

export default Loading;