import React, { Component } from "react";
import {  Row, Col } from "reactstrap";
import Modal from "react-responsive-modal";
import { niceNumberDisplay } from "../../../utils/Util";
import CustomAlertMsg from "../../CustomAlertMsg/CustomAlertMsg";
class PayModal extends Component {
  render() {
    const {
      loanDetails,
      nextRepaymentAmount,
      nextRepaymentDate,
      modalOpen,
      repaymentButtonLoading,
      repaymentAmount,
      onCloseModal,
      processRepayment,
      handleInputChange,
      unlockToken,
      unlockTokenButtonLoading,
      unlockTokenButtonDisplay,
      modalButtonLoading,
      modalMessageDisplay,
      modalMessage
    } = this.props;
    let {
      principalSymbol,
      outstandingAmount
    } = loanDetails;
    let repaymentButtonDisabled = (repaymentButtonLoading === true || unlockTokenButtonDisplay === true) ? true : false;
    return (
      <Modal open={modalOpen} onClose={onCloseModal} center>
        <Row>
          <Col lg={12} md={12} sm={6} xl={12}>
            <h2 className="text-center text-bold">Make Repayment</h2>

            <p className="repayment-details mt-15 mb-15">
              Your outstanding balance is <span className="text-bold">{niceNumberDisplay(outstandingAmount)} {principalSymbol}</span> in total. You are due <span className="text-bold">{niceNumberDisplay(nextRepaymentAmount)} {principalSymbol}</span> by <span className="text-bold">{nextRepaymentDate}</span>.
            </p>

            <input
              type="text"
              className="form-control"
              name="repaymentAmount"
              id="repayment_amount"
              value={repaymentAmount}
              onChange={handleInputChange}
            />

            <div className="mt-20 text-center">
              {
                modalMessageDisplay &&
                <CustomAlertMsg
                  bsStyle={modalMessageDisplay}
                  className="mb-30 text-left"
                  title={modalMessage} />
              }
              {
                unlockTokenButtonDisplay && !modalButtonLoading &&
                <button className="btn cognito small icon mb-15 mr-10 detail-unlock-tokens-button" onClick={unlockToken} disabled={unlockTokenButtonLoading}>
                  Unlock Token {unlockTokenButtonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                </button>
              }
              {
                !modalButtonLoading &&
                <button
                  className="btn cognito orange small icon mb-15 make-repayment-btn"
                  onClick={processRepayment} disabled={repaymentButtonDisabled}>Make Repayment {repaymentButtonLoading && <i className="fa-spin fa fa-spinner text-white m-1"></i>}
                </button>
              }
              {
                modalButtonLoading &&
                <i className="btn btn-sm fa-spin fa fa-spinner"></i>
              }
              {
                !modalButtonLoading &&
                <button
                  className="btn cognito small icon mb-15 ml-10"
                  onClick={onCloseModal}>Cancel</button>
              }
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default PayModal;
