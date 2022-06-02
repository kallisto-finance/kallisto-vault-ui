import React from "react";

import { useWallet } from "hooks/useWallet";
import ConnectWalletButton from "components/ConnectWalletButton";

import cn from "classnames";

const ConnectionMask = ({ className = "" }) => {
  const { wallet } = useWallet();
  const account = wallet?.account;

  return account ? null : (
    <div className={cn("connection-mask-container", className)}>
      <img src="/assets/kallistos/kallisto-apy-chaser.svg" />
      <ConnectWalletButton className="connect-wallet-button" />
    </div>
  );
};

export default ConnectionMask;
