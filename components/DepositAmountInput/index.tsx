import React, { useRef, useState, useEffect, useMemo } from "react";

import Button from "components/Button";
import TokenItem from "components/Tokens/TokenItem";

import { useOutsideAlerter } from "hooks";

import { isNaN, formatBalance, compare } from "utils/number";

import cn from "classnames";

const DepositAmountInput = ({
  selectedToken,
  tokenBalances,
  onSelectToken,
  depositAmount,
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

  const availableTokens = useMemo(() => {
    const res = tokenBalances.filter(
      (token) =>
        token.address.toLowerCase() !== selectedToken.address.toLowerCase() &&
        compare(token.balance, 0) > 0
    );
    console.log(res);
    return res;
  }, [tokenBalances, selectedToken]);

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
          <img className="selected-token-icon" src={selectedToken.img} />
          <span className="selected-token-symbol">{selectedToken.name}</span>
          {selectedToken.name !== "" && (
            <img
              className="selected-token-arrow"
              src="/assets/arrows/arrow-down.svg"
            />
          )}
          {showTokenList && (
            <div className="token-list-wrapper">
              <div className="token-list-scroll-view">
                {availableTokens.map((token) => (
                  <TokenItem
                    token={token}
                    balance={formatBalance(token.balance, 4, token.decimals)}
                    onSelectToken={(token) => onSelectToken(token)}
                    key={`deposit-token-list-${token.symbol}`}
                  />
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
            placeholder="0.00"
            value={depositAmount.format}
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
        <span>{`Balance: ${formatBalance(
          selectedToken.balance,
          4,
          selectedToken.decimals
        )}`}</span>
        <Button
          className="max-button"
          onClick={(e) => onChangeDepositInputAmount("max")}
          disabled={!connectedWallet}
        >
          MAX
        </Button>
      </div>
    </div>
  );
};

export default DepositAmountInput;
