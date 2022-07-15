import React from "react";
import { formatBalance } from "utils/number";

const ManageLiquidity = ({ onBack, onWithdrawLiquidity, vaultInfo }) => {
  return (
    <div className="liquidity-view-wrapper manage-liquidity">
      <div className="view-navigator">
        <img
          className="nav-button"
          src="/assets/arrows/circle-back.svg"
          onClick={(e) => onBack()}
        />
        <span className="nav-text">Manage Liquiity</span>
      </div>
      <div className="liquidation-view-content">
        <div className="my-liquidity-panel">
          <span className="panel-title">My Pool Liquidity</span>
          <span className="panel-value">{`$${formatBalance(vaultInfo.userLiquidity)}`}</span>
          <div className="panel-buttons">
            {/* <div className="panel-button" onClick={(e) => onBack()}>
              Add more Liquidity
              <img src="/assets/arrows/arrow-top-right.svg" />
            </div> */}
            <div
              className="panel-button"
              onClick={(e) => onWithdrawLiquidity()}
            >
              Withdraw Liquidity
              <img src="/assets/arrows/arrow-top-right.svg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLiquidity;
