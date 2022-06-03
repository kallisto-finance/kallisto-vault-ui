import React, { useState, useMemo, useRef } from "react";
import BigNumber from "bignumber.js";

import AmountView from "components/AmountView";
import WithdrawAmountInput from "components/WithdrawAmountInput";
import LiquidityButton from "components/LiquidityButton";
import { LoadingSpinner } from "components/LoadingIcon";
import TokenItem from "components/Tokens/TokenItem";

import { compare, formatBalance } from "utils/number";
import { COLLECT_TYPE, LIQUIDITY_BALANCE_STATUS } from "types";
import { useOutsideAlerter } from "hooks";
import { TOKENS } from "utils/constants";

import cn from "classnames";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY);

const WithdrawConfirm = ({
  onBack,
  withdrawPercentage,
  onChangeWithdrawPercentage,
  onConfirmWithdraw,
  loading,
}) => {
  const [collectType, setCollectType] = useState<COLLECT_TYPE>("UST");

  const [showTokenList, setShowTokenList] = useState(false);
  const tokenListRef = useRef(null);
  useOutsideAlerter(tokenListRef, () => {
    setShowTokenList(false);
  });

  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);

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
          <img
            className="selected-token-icon"
            src={TOKENS[selectedTokenIndex].img}
          />
          <span className="selected-token-symbol">
            {TOKENS[selectedTokenIndex].name}
          </span>
          <img
            className="selected-token-arrow"
            src="/assets/arrows/arrow-down.svg"
          />
          {showTokenList && (
            <div className="token-list-wrapper">
              <div className="token-list-scroll-view">
                {TOKENS.map((token) => (
                  <TokenItem token={token} balance="123.3" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="view-subtitle">Amount available</div>
        <AmountView
          icon="/assets/tokens/ETH.png"
          value={`100 ETH`}
          iconBack={true}
        />
        <div className="view-subtitle">Amount to withdraw</div>
        <WithdrawAmountInput
          myCap={new BigNumber(100000)}
          withdrawPercentage={withdrawPercentage}
          onChangeWithdrawPercentage={(value) =>
            onChangeWithdrawPercentage(value)
          }
          collectType={collectType}
        />
      </div>
      <div
        className="view-footer success"
        onClick={(e) => {
          if (loading) return;
          mixpanel.track("CONFIRM_DEPOSIT");
          onConfirmWithdraw(collectType);
        }}
      >
        Withdraw Liquidity
      </div>
    </div>
  );
};

export default WithdrawConfirm;
