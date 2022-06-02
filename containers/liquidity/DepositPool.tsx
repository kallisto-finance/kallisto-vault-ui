import React, { useMemo, useState } from "react";

import { useWallet } from "hooks/useWallet";

import ViewContainer from "components/ViewContainer";
import AmountView from "components/AmountView";
import DepositAmountInput from "components/DepositAmountInput";
import LiquidityButton from "components/LiquidityButton";
import ConnectWalletButton from "components/ConnectWalletButton";
import PoolInfo from "components/PoolInfo";

import { LIQUIDITY_BALANCE_STATUS } from "types";

import { isNaN, compare } from "utils/number";
import { formatBalance } from "utils/wasm";
import mixpanel from "mixpanel-browser";

import cn from "classnames";

mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

const DepositPoolContent = (props) => {
  const {
    pool,
    onDeposit,
    ustBalance,
    balance,
    volume,
    onChangeDepositInputAmount,
  } = props;

  const [depositChecked, setDepositChecked] = useState(false);

  const liquidityButtonStatus = useMemo((): LIQUIDITY_BALANCE_STATUS => {
    if (isNaN(balance)) {
      return {
        status: "enter_amount",
        text: "Enter an amount",
      };
    }

    if (compare(balance, 0) === 0) {
      return {
        status: "enter_amount",
        text: "Enter an amount",
      };
    }

    if (compare(balance, ustBalance) === 1) {
      return {
        status: "insufficient",
        text: "Insufficient Balance",
      };
    }

    if (!depositChecked) {
      return {
        status: "enter_amount",
        text: "Deposit UST",
      };
    }

    return {
      status: "success",
      text: "Deposit UST",
    };
  }, [balance, ustBalance, depositChecked]);

  return (
    <div className="liquidity-view-wrapper">
      <div className="view-header">
        <img src="/assets/active.svg" />
        <span>
          Active Pool since <strong>3 hrs 4 min 0 sec</strong>{" "}
        </span>
      </div>
      <div className="liquidation-view-content">
        <PoolInfo />
        <AmountView
          label="7 day Volume"
          value="6.946,19 ETH"
          className="mt-2"
        />
        <AmountView label="Liquidity" value="6.946,19 ETH" className="mt-2" />
        <div className="view-subtitle">Add more Liquidity</div>
        <DepositAmountInput
          maxBalance={ustBalance}
          balance={balance}
          onChangeDepositInputAmount={(value) =>
            onChangeDepositInputAmount(value)
          }
          theme={""}
          connectedWallet={() => {}}
        />
      </div>
      <div className={cn("view-footer", "success")} onClick={() => onDeposit()}>
        Add Liquidity
      </div>
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
