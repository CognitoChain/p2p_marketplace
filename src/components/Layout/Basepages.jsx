import React from 'react';
import { ToastContainer } from 'react-toastify';
import ModalMessage from './ModalMessage';
class Basepages extends React.Component {

    render() {
        return (
            <div className="wrapper">
                <ToastContainer />
                {this.props.children}
                <ModalMessage {...this.props}/>
            </div>
        );
    }

}

export default Basepages;