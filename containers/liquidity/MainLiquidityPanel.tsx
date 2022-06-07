import React from "react";

import APYChaserLogo from "components/APYChaserLogo";
import ConnectionMask from "components/ConnectionMask";

import { useWallet } from "hooks";
import { formatBalance } from "utils/number";

import cn from "classnames";

const MainLiquidityPanel = ({ vaultInfo, onManageLiquidity }) => {
  const { wallet } = useWallet();
  const account = wallet?.account;

  return (
    <div className="main-liquidity-container">
      {!account && <ConnectionMask />}
      <APYChaserLogo />
      <div className="liquidity-view-wrapper mt-2">
        <div className="liquidation-view-content">
          <div className="section-view">
            <div className="section-view-title">My Pool Liquidity</div>
            <div className="section-view-text">{`$${formatBalance(vaultInfo.userLiquidity)}`}</div>
            <div
              className="section-view-button"
              onClick={(e) => onManageLiquidity()}
            >
              Manage Liquidity
              <img src="/assets/arrows/arrow-top-right.svg" />
            </div>
          </div>
          <div className="section-view mt-2">
            <div className="section-view-short">My % of the Pool</div>
            <div className="section-view-text">{`${vaultInfo.sharedPercentage} %`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLiquidityPanel;
