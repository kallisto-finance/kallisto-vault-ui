import React, { useState, useMemo, useRef } from "react";
import BigNumber from "bignumber.js";

import AmountView from "components/AmountView";
import WithdrawAmountInput from "components/WithdrawAmountInput";
import LiquidityButton from "components/LiquidityButton";
import { LoadingSpinner } from "components/LoadingIcon";
import TokenItem from "components/Tokens/TokenItem";

import { compare, formatBalance } from "utils/number";
import { useOutsideAlerter } from "hooks";

import cn from "classnames";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY);

const WithdrawButton = ({ isLoading, percentage, onConfirmWithdraw }) => {
  const buttonStatus = useMemo(() => {
    const status = {
      class: "success",
      text: "Withdraw Liquidity",
    };

    if (isLoading) {
      status.class = "amount";
      status.text = "Withdrawing Liquidity...";
    } else if (Number(percentage) <= 0) {
      status.class = "amount";
      status.text = "Select an amount";
    }

    return status;
  }, [percentage, isLoading]);

  return (
    <div
      className={cn("view-footer", buttonStatus.class)}
      onClick={() => {
        if (buttonStatus.class !== "success") return;
        mixpanel.track("CONFIRM_WITHDRAWAL");
        onConfirmWithdraw();
      }}
    >
      {isLoading && <LoadingSpinner />}
      {buttonStatus.text}
    </div>
  );
};

const WithdrawConfirm = ({
  vaultInfo,
  tokenBalances,
  withdrawPercentage,
  selectedToken,
  onSelectToken,
  onBack,
  onChangeWithdrawPercentage,
  onConfirmWithdraw,
  loading,
}) => {
  const [showTokenList, setShowTokenList] = useState(false);
  const tokenListRef = useRef(null);
  useOutsideAlerter(tokenListRef, () => {
    setShowTokenList(false);
  });

  return (
    <div className="liquidity-view-wrapper withdraw-confirm">
      <div className="view-navigator">
        <img
          className="nav-button"
          src="/assets/arrows/circle-back.svg"
          onClick={(e) => onBack()}
        />
        <span className="nav-text">Confirm Withdrawal</span>
      </div>
      <div className="liquidation-view-content">
        <div className="view-subtitle">Token</div>
        <div
          className={cn("selected-token-wrapper", { border: showTokenList })}
          onClick={(e) => setShowTokenList(!showTokenList)}
          ref={tokenListRef}
        >
          <img className="selected-token-icon" src={selectedToken.img} />
          <span className="selected-token-symbol">{selectedToken.name}</span>
          <img
            className="selected-token-arrow"
            src="/assets/arrows/arrow-down.svg"
          />
          {showTokenList && (
            <div className="token-list-wrapper">
              <div className="token-list-scroll-view">
                {tokenBalances.map((token) =>
                  token.address.toLowerCase() ===
                  selectedToken.address.toLowerCase() ? null : (
                    <TokenItem
                      token={token}
                      balance={formatBalance(token.balance, 2, token.decimals)}
                      onSelectToken={(token) => onSelectToken(token)}
                      key={`withdraw-token-list-${token.symbol}`}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
        <div className="view-subtitle">Amount available</div>
        <AmountView value={`$ ${formatBalance(vaultInfo.userLiquidity)}`} />
        <div className="view-subtitle">Amount to withdraw</div>
        <WithdrawAmountInput
          myCap={vaultInfo.userLiquidity}
          withdrawPercentage={withdrawPercentage}
          onChangeWithdrawPercentage={(value) =>
            onChangeWithdrawPercentage(value)
          }
        />
      </div>
      <WithdrawButton
        percentage={withdrawPercentage}
        isLoading={loading}
        onConfirmWithdraw={() => onConfirmWithdraw()}
      />
    </div>
  );
};

export default WithdrawConfirm;
