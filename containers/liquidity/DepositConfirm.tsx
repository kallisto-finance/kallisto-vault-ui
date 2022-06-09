import React, { useState, useMemo } from "react";
import BigNumber from "bignumber.js";

import Button from "components/Button";
import AmountView from "components/AmountView";
import { LoadingSpinner } from "components/LoadingIcon";

import { formatBalance, isNaN } from "utils/number";

import cn from "classnames";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY);

const DepositConfirm = ({
  vaultInfo,
  depositAmount,
  selectedToken,
  onBack,
  onConfirmDeposit,
  loading,
}) => {
  const expectedPoolShare = useMemo(() => {
    return vaultInfo.sharedPercentage;
  }, [vaultInfo, depositAmount]);

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
          value={formatBalance(depositAmount.value, 4, selectedToken.decimals)}
          icon={selectedToken.img}
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
        className={cn("view-footer", { success: !loading, amount: loading })}
        onClick={(e) => {
          if (loading) return;
          mixpanel.track("CONFIRM_DEPOSIT");
          onConfirmDeposit();
        }}
      >
        {loading && <LoadingSpinner />}
        {loading ? "Adding Liquidity..." : "Add Liquidity"}
      </div>
    </div>
  );
};

export default DepositConfirm;
