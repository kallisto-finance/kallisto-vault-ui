import React from "react";
import { LIQUIDITY_BUTTON_STATUS, LIQUIDITY_BUTTON_TEXT } from "types";
import Button from "components/Button";

import cn from "classnames";

const LiquidityButton = ({
  label,
  status = "success",
  className = "",
  onClick,
}: {
  label: any;
  status?: LIQUIDITY_BUTTON_STATUS;
  className: string;
  onClick: () => void;
}) => (
  <Button
    className={cn(className, {
      success: status === "success",
      "enter-amount": status === "enter_amount",
      insufficient: status === "insufficient",
      loading: status === "loading"
    })}
    onClick={(e) => {
      if (status === "success") {
        onClick();
      }
    }}
  >
    {label}
  </Button>
);

export default LiquidityButton;
