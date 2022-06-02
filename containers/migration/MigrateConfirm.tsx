import React, { useState, useMemo } from "react";
import BigNumber from "bignumber.js";

import ViewContainer from "components/ViewContainer";
import AmountView from "components/AmountView";
import WithdrawAmountInput from "components/WithdrawAmountInput";
import LiquidityButton from "components/LiquidityButton";
import { LoadingSpinner } from "components/LoadingIcon";

import { formatBalance } from "utils/wasm";
import { compare } from "utils/number";
import { COLLECT_TYPE, LIQUIDITY_BALANCE_STATUS } from "types";

import mixpanel from "mixpanel-browser";
mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

const MigrateConfirm = ({ pool, onBack, onConfirmMigration, loading }) => {
  return (
    <ViewContainer
      title="Confirm Migration"
      navLeft={true}
      onLeft={() => onBack()}
      className="migration-view-container"
    >
       <div className="view-container-row">
        <AmountView value="bLUNA" icon="/assets/tokens/bLuna.png" />
      </div>
      <div className="view-container-row">
        <div className="view-container-subtitle">Amount that will be migrated</div>
      </div>
      <div className="view-container-row">
        <AmountView
          icon="/assets/approx.png"
          value={`${formatBalance(pool.userCap, 4)} UST`}
          iconBack={false}
          containerStyle={{
            height: 91,
            borderRadius: 100,
          }}
        />
      </div>

      <LiquidityButton
        className="view-container-button"
        onClick={() => {
          if (loading) return;
          onConfirmMigration();
        }}
        label={
          loading ? (
            <>
              <LoadingSpinner />
              Withdrawing UST
            </>
          ) : (
            "Confirm Migration"
          )
        }
        status={loading ? "loading" : "success"}
      />
    </ViewContainer>
  );
};

export default MigrateConfirm;
