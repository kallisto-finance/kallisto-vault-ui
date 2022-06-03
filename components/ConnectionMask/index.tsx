import React from "react";

import { useWallet } from "hooks/useWallet";
import ConnectWalletButton from "components/ConnectWalletButton";

import cn from "classnames";

const ConnectionMask = ({ className = "" }) => {
  const { wallet } = useWallet();
  const account = wallet?.account;

  return account ? null : (
    <div className={cn("connection-mask-container", className)}>
      <img src="/assets/kallistos/curve-apy-chaser.png" />
      <div className="mask-description">
        <span className="text1">Curve</span>
        <span className="text2">APY Chaser</span>
        <span className="text3">Chases the highest paying low risk Curve pool in a cost effective way.</span>
      </div>
      <ConnectWalletButton className="connect-wallet-button" />
    </div>
  );
};

export default ConnectionMask;
