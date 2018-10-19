// External libraries
import React from "react";

// Styling
import "./LoadingFull.css";

class LoadingFull extends React.Component {
  render() {
    return <section className="loading">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
         <span className="loading__author"> - Lorem Ipsum</span>

      <div className="indicator">
        <svg width="16px" height="12px">
          <polyline id="back" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>
          <polyline id="front" points="1 6 4 6 6 11 10 1 12 6 15 6"></polyline>

        </svg>
      </div>
    </section>
  }
}

export default LoadingFull;