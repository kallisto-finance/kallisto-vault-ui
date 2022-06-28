import React from "react";

import { LoadingTriple } from "components/LoadingIcon";

import cn from "classnames";

const AmountView = ({
  label = "",
  value = "",
  highlight = false,
  icon = "",
  background = false,
  vertical = false,
  iconBack = false,
  containerStyle = {},
  button = null,
  theme = "default",
  className = "",
  loading = false,
  ...props
}) => (
  <div
    className={cn("amount-view-container", className, theme, {
      vertical,
      background,
      icon: icon !== "",
    })}
    style={{ ...containerStyle }}
  >
    {!loading && (
      <>
        {label !== "" && (
          <div className={cn("amount-view-label", theme)}>{label}</div>
        )}
        {icon !== "" && !iconBack && (
          <img className="amount-view-icon" src={icon} />
        )}
        <span
          className={cn("amount-view-value", { highlight, vertical })}
          style={{ ...props.style }}
        >
          {value}
        </span>
        {icon !== "" && iconBack && (
          <img className="amount-view-icon" src={icon} />
        )}
        {button}
      </>
    )}
    {loading && <LoadingTriple /> }
  </div>
);

export default AmountView;
