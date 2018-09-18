import React from 'react';
import { ToastContainer } from 'react-toastify';
class Basepages extends React.Component {

    render() {
        return (
            <div className="wrapper">
                <ToastContainer />
                {this.props.children}
            </div>
        );
    }

}

export default Basepages;