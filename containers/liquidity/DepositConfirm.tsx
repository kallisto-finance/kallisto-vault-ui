import React, { useState, useMemo } from "react";
import BigNumber from "bignumber.js";

import Button from "components/Button";
import AmountView from "components/AmountView";
import { LoadingSpinner } from "components/LoadingIcon";

import { isNaN } from "utils/number";

import cn from "classnames";
import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.MIXPANEL_API_KEY);

const DepositConfirm = ({
  // pool,
  onBack,
  // balance,
  onConfirmDeposit,
  loading,
}) => {
  const expectedPoolShare = useMemo(() => {
    return "11.11";
  }, []);

  return (
    <div className="liquidity-view-wrapper deposit-confirm">
      <div className="view-navigator">
        <img
          className="nav-button"
          src="/assets/arrows/circle-back.svg"
          onClick={(e) => onBack()}
        />
        <span className="nav-text">Confirm Add Liquidity</span>
      </div>
      <div className="liquidation-view-content">
        <div className="view-subtitle">Amount</div>
        <AmountView
          value={`23 CRV`}
          icon="/assets/tokens/CRV.png"
          iconBack={true}
          button={
            <Button className="amount-edit-button" onClick={(e) => onBack()}>
              EDIT
            </Button>
          }
        />
        <div className="view-subtitle">Your % of the Pool*</div>
        <AmountView value={`${expectedPoolShare} %`} />
        <div className="view-help mt-2">
          <div className="view-help-text">*This rate is dynamic.</div>
          <div className="view-help-text">
            <img src="/assets/icons/attention.svg" />
            <span>
              Swapping ETH to CRV using best route on curve. Transaction fees
              apply.
            </span>
          </div>
        </div>
      </div>
      <div
        className="view-footer success"
        onClick={(e) => {
          if (loading) return;
          mixpanel.track("CONFIRM_DEPOSIT");
          onConfirmDeposit();
        }}
      >
        Add Liquidity
      </div>
    </div>
  );
};

export default DepositConfirm;
