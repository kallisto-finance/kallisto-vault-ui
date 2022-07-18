import React, { useState, useEffect } from "react";
import BigNumber from "bignumber.js";

import Button from "components/Button";
import AmountView from "components/AmountView";
import { LoadingSpinner, LoadingTriple } from "components/LoadingIcon";

import { formatBalance } from "utils/number";

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
  calcExpectedPercentage,
}) => {
  const [expectedPoolShare, setExpectedPoolShare] = useState("0");
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const getPoolShare = async () => {
      setCalculating(true);
      const params = await calcExpectedPercentage(
        selectedToken,
        depositAmount,
        1000
      );
      const expectedBalance = params.expectedBalance;

      const newBalance = new BigNumber(vaultInfo.userBalance.toString())
        .plus(expectedBalance.toString())
        .multipliedBy(100)
        .dividedBy(
          new BigNumber(vaultInfo.totalSupply.toString()).plus(
            expectedBalance.toString()
          )
        );

      setExpectedPoolShare(newBalance.toFixed(2));
      setCalculating(false);
    };

    getPoolShare();
  }, [vaultInfo, selectedToken, depositAmount]);

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
          value={formatBalance(depositAmount.value, 2, selectedToken.decimals)}
          icon={selectedToken.img}
          iconBack={true}
          button={
            <Button className="amount-edit-button" onClick={(e) => onBack()}>
              EDIT
            </Button>
          }
          containerStyle={{textAlign: 'center'}}
        />
        <div className="view-subtitle">Your % of the Pool*</div>
        {calculating ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LoadingTriple />
          </div>
        ) : (
          <AmountView value={`${expectedPoolShare} %`} containerStyle={{textAlign: 'center'}} />
        )}
        <div className="view-help mt-2">
          <div className="view-help-text">*This rate is dynamic.</div>
          {/* <div className="view-help-text">
            <img src="/assets/icons/attention.svg" />
            <span>
              Swapping ETH to CRV using best route on curve. Transaction fees
              apply.
            </span>
          </div> */}
        </div>
      </div>
      <div
        className={cn("view-footer", { success: !loading && !calculating, amount: loading || calculating })}
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
