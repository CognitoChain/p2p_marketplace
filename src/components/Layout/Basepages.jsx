import React from 'react';
import { ToastContainer } from 'react-toastify';
import Header from './Header';
import FooterBasePages from './FooterBasePages';
import ModalMessage from './ModalMessage';
import DharmaConsumer from "../../contexts/Dharma/DharmaConsumer";
class Basepages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleactive: false,
            contentLoading: false
        };
        this.updateValue = this.updateValue.bind(this);
    }
    updateValue(value) {
        this.setState(prevState => ({
            toggleactive: !prevState.toggleactive
        }))
    }

    render() {
        return (
            <div className="wrapper">
                <ToastContainer />
                <DharmaConsumer>
                    {(dharmaProps) => {
                        return (
                            <Header
                                updateParent={this.updateValue}
                                dharma={dharmaProps.dharma}
                                refreshTokens={dharmaProps.refreshTokens}
                                {...this.props}
                            />
                        );
                    }}
                </DharmaConsumer>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12 p-0">
                            <div className="main-content-container pb-0">
                                {this.props.children}
                            </div>
                            <FooterBasePages />
                        </div>
                    </div>
                </div>
                <ModalMessage {...this.props} />
            </div>
        );
    }

}

export default Basepages;