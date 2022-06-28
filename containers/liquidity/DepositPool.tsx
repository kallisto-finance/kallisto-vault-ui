import React, { useMemo, useState } from "react";

import { useWallet } from "hooks/useWallet";

import AmountView from "components/AmountView";
import DepositAmountInput from "components/DepositAmountInput";
import LiquidityButton from "components/LiquidityButton";
import ConnectWalletButton from "components/ConnectWalletButton";
import PoolInfo from "components/PoolInfo";

import { LIQUIDITY_BALANCE_STATUS } from "types";

import { isNaN, compare, formatBalance, toBalance } from "utils/number";
import mixpanel from "mixpanel-browser";

import cn from "classnames";

mixpanel.init(process.env.MIXPANEL_API_KEY);

const DepositButton = ({ balance, maxBalance, onDeposit }) => {
  const buttonStatus = useMemo(() => {
    const status = {
      class: "success",
      text: "Add Liquidity",
    };
    console.log(balance)

    if (isNaN(balance) || compare(balance, 0) === 0) {
      status.class = "amount";
      status.text = "Enter an amount";
    } else if (compare(balance, maxBalance) > 0) {
      status.class = "insufficient";
      status.text = "Insufficient Balance";
    }

    return status;
  }, [balance, maxBalance]);

  return (
    <div
      className={cn("view-footer", buttonStatus.class)}
      onClick={() => {
        if (buttonStatus.class !== "success") return;
        onDeposit();
      }}
    >
      {buttonStatus.text}
    </div>
  );
};

const DepositPoolContent = (props) => {
  const {
    vaultInfo,
    curveAPY,
    selectedToken,
    tokenBalances,
    onSelectToken,
    onDeposit,
    depositAmount,
    onChangeDepositInputAmount,
  } = props;

  return (
    <div className="liquidity-view-wrapper">
      <div className="view-header">
        <img src="/assets/active.svg" />
        <span>Active Pool</span>
      </div>
      <div className="liquidation-view-content">
        <PoolInfo pool={vaultInfo.mainPoolInfo} apy={curveAPY} />
        {/* <AmountView
          label="7 day Volume"
          value="$0"
          className="mt-2"
        /> */}
        <AmountView
          label="Total Value Locked"
          value={`$${formatBalance(vaultInfo.tvl)}`}
          className="mt-2"
        />
        <div className="view-subtitle">
          Select a token and add more liquidity
        </div>
        <DepositAmountInput
          selectedToken={selectedToken}
          tokenBalances={tokenBalances}
          depositAmount={depositAmount}
          onSelectToken={(token) => onSelectToken(token)}
          onChangeDepositInputAmount={(value) =>
            onChangeDepositInputAmount(value)
          }
          theme={""}
          connectedWallet={() => {}}
        />
      </div>
      <DepositButton
        balance={depositAmount.value}
        maxBalance={selectedToken.balance}
        onDeposit={() => onDeposit()}
      />
    </div>
  );
};

const DepositPool = (props) => {
  const { wallet } = useWallet();
  const account = wallet?.account;

  return (
    <div className="deposit-liquidity-container">
      {account ? (
        <DepositPoolContent {...props} />
      ) : (
        <ConnectWalletButton className="full-width">
          <DepositPoolContent {...props} />
        </ConnectWalletButton>
      )}
    </div>
  );
};

export default DepositPool;
