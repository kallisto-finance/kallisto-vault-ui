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

const DepositPoolContent = (props) => {
  const {
    vaultInfo,
    selectedToken,
    tokenBalances,
    onSelectToken,
    onDeposit,
    depositAmount,
    volume,
    onChangeDepositInputAmount,
  } = props;

  const [depositChecked, setDepositChecked] = useState(false);

  // const liquidityButtonStatus = useMemo((): LIQUIDITY_BALANCE_STATUS => {
  //   if (isNaN(balance)) {
  //     return {
  //       status: "enter_amount",
  //       text: "Enter an amount",
  //     };
  //   }

  //   if (compare(balance, 0) === 0) {
  //     return {
  //       status: "enter_amount",
  //       text: "Enter an amount",
  //     };
  //   }

  //   if (!depositChecked) {
  //     return {
  //       status: "enter_amount",
  //       text: "Deposit UST",
  //     };
  //   }

  //   return {
  //     status: "success",
  //     text: "Deposit UST",
  //   };
  // }, [balance, depositChecked]);

  return (
    <div className="liquidity-view-wrapper">
      <div className="view-header">
        <img src="/assets/active.svg" />
        <span>Active Pool</span>
      </div>
      <div className="liquidation-view-content">
        <PoolInfo pool={vaultInfo.mainPoolInfo} apy={vaultInfo.apy} />
        {/* <AmountView
          label="7 day Volume"
          value="$0"
          className="mt-2"
        /> */}
        <AmountView label="Total Value Locked" value={`$${formatBalance(vaultInfo.tvl)}`} className="mt-2" />
        <div className="view-subtitle">Select a token and add more liquidity</div>
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
