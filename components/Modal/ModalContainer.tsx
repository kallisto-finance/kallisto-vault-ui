import React from "react";

import ModalMask from "./ModalMask";

const ModalContainer = ({ children, onClose }) => (
  <>
    <ModalMask />
    <div className="modal-container">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-close" onClick={(e) => onClose()}>
            <img src="/assets/icons/close.png" />
          </div>
        </div>
        <div className="modal-view">{children}</div>
      </div>
    </div>
  </>
);

export default ModalContainer;
