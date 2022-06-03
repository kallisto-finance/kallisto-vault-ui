import React from "react";

const AttentionBanner = () => (
  <div className="attention-banner-container">
    <img className="attention-banner-icon" src="/assets/danger.png" />
    <span className="attention-banner-text">
      Attention! Kallisto smart contracts are not yet audited and are regularly
      updated for improvements. Withdrawals from deprecated contracts are always
      allowed. Use at your own risk
    </span>
  </div>
);

export { AttentionBanner };
