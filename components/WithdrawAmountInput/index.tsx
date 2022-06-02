import React, { useMemo } from "react";
import ReactTooltip from 'react-tooltip';
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import Button from "components/Button";

import { formatBalance } from "utils/wasm";
import { isNaN } from "utils/number";

import cn from "classnames";
import mixpanel from "mixpanel-browser";

mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

const WithdrawAmountInput = ({
  myCap,
  withdrawPercentage,
  onChangeWithdrawPercentage,
  collectType,
}) => {
  const withdrawAmount = useMemo(() => {
    return myCap.multipliedBy(withdrawPercentage).dividedBy(100).toFixed(0)
  }, [myCap, withdrawPercentage])

  return (
    <div className="withdraw-amount-input-container">
      <div className="withdraw-balance-section">
        <div className="balance-input">
          <img
            data-tip="The exact amount may differ depending on<br/>the price of bLuna"
            src="/assets/approx.png"
            style={{ height: 18 }}
          />
          <span className="collect-type">{formatBalance(withdrawAmount, 2)}</span>
          <span className="collect-type">ETH</span>
          <img
            src="/assets/tokens/ETH.png"
            style={{ width: 31, height: 31, marginLeft: 8 }}
          />
        </div>
        <div className="amount-slider-section">
          <Slider
            min={0}
            max={100}
            railStyle={{ backgroundColor: "#B6B2EF", height: 5 }}
            trackStyle={{ backgroundColor: "#B6B2EF", height: 5 }}
            handleStyle={{
              border: "none",
              height: 28,
              width: 28,
              marginTop: -12,
              background: "#B6B2EF",
              opacity: 1,
            }}
            value={withdrawPercentage}
            onChange={(value) => onChangeWithdrawPercentage(value)}
          />
        </div>
        <div className="withdraw-percentage-selector">
        <Button
            className={cn("percent-selector", { selected: withdrawPercentage === 0 })}
            onClick={(e) => onChangeWithdrawPercentage(0)}
          >
            0%
          </Button>
          <Button
            className={cn("percent-selector", { selected: withdrawPercentage === 25 })}
            onClick={(e) => onChangeWithdrawPercentage(25)}
          >
            25%
          </Button>
          <Button
            className={cn("percent-selector", { selected: withdrawPercentage === 50 })}
            onClick={(e) => onChangeWithdrawPercentage(50)}
          >
            50%
          </Button>
          <Button
            className={cn("percent-selector", { selected: withdrawPercentage === 75 })}
            onClick={(e) => onChangeWithdrawPercentage(75)}
          >
            75%
          </Button>
          <Button
            className={cn("percent-selector", { selected: withdrawPercentage === 100 })}
            onClick={(e) => onChangeWithdrawPercentage(100)}
          >
            MAX
          </Button>
        </div>
      </div>
      <ReactTooltip effect="solid" multiline={true} backgroundColor="#B6B2EF" textColor="#262B43" className="withdraw-tooltip" />
    </div>
  );
};

export default WithdrawAmountInput;
