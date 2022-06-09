import React from "react";

const AttentionBanner = () => (
  <div className="attention-banner-container">
    <img className="attention-banner-icon" src="/assets/danger.png" />
    <span className="attention-banner-text">
      Attention! Kallisto smart being audited. Withdrawals from deprecated
      contracts are always allowed. Use at your own risk.
    </span>
  </div>
);

export { AttentionBanner };
