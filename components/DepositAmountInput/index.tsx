import React, { useRef, useState, useEffect } from "react";

import Button from "components/Button";
import TokenItem from "components/Tokens/TokenItem";

import { useOutsideAlerter } from "hooks";

import { isNaN } from "utils/number";

import { TOKENS } from "utils/constants";

import cn from "classnames";

const DepositAmountInput = ({
  maxBalance,
  balance,
  onChangeDepositInputAmount,
  theme = "default",
  connectedWallet,
}) => {
  const inputEl = useRef(null);
  useEffect(() => {
    if (inputEl && connectedWallet) {
      setTimeout(() => {
        if (inputEl.current) {
          inputEl.current.focus();
        }
      }, 700);
    }
  }, [inputEl, connectedWallet]);

  const [showTokenList, setShowTokenList] = useState(false);
  const tokenListRef = useRef(null);
  useOutsideAlerter(tokenListRef, () => {
    setShowTokenList(false);
  });

  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);

  return (
    <div
      className={cn("deposit-amount-input-container", theme, {
        border: showTokenList,
      })}
    >
      <div className="input-section">
        <div
          className="selected-token-wrapper"
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
        <div className="input-wrapper">
          <input
            ref={inputEl}
            autoFocus
            className="input-amount"
            type="text"
            placeholder=""
            defaultValue="0.00"
            // value={balance}
            onChange={(e) => {
              if (e.target.value !== "" && isNaN(e.target.value)) return;
              onChangeDepositInputAmount(e.target.value);
            }}
            inputMode="numeric"
            readOnly={!connectedWallet}
          />
        </div>
      </div>
      <div className="balance-section">
        <span>Balance: 320.0212</span>
        <Button
          className="max-button"
          onClick={(e) => onChangeDepositInputAmount(maxBalance)}
          disabled={!connectedWallet}
        >
          MAX
        </Button>
      </div>
    </div>
  );
};

export default DepositAmountInput;
