import React from "react";

import { getWalletAddressEllipsis } from "utils/common";

type ToastStatus = "success" | "error" | "wait";

const TransactionFeedbackToast = ({
  status,
  msg,
  hash = "",
  linkText = "",
}: {
  status: ToastStatus;
  msg: string;
  hash?: string;
  linkText?: string;
}) => (
  <div className="transaction-toast-container">
    {status === "wait" ? (
      <img className="transaction-toast-icon" src={`/assets/loader.gif`} />
    ) : (
      <img className="transaction-toast-icon" src={`/assets/${status}.png`} />
    )}
    <div className="transaction-toast-text">
      <div className="text">{msg}</div>
      {hash && hash !== "" && (
        <div className="link">
          <a
            href={`https://etherscan.io/tx/${hash}`}
            className={status}
            target="_blank"
          >
            {linkText !== "" ? linkText : getWalletAddressEllipsis(hash, 8, 8)}
          </a>
        </div>
      )}
    </div>
  </div>
);

export default TransactionFeedbackToast;
