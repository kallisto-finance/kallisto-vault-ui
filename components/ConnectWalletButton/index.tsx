import React, { useState, useEffect, useRef } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { useWallet, useOutsideAlerter } from "hooks";

import Button from "components/Button";

import { getWalletAddressEllipsis } from "utils/common";

import cn from "classnames";
import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.MIXPANEL_API_KEY);

const ConnectWalletButton = ({ className = "", children = null }) => {
  const { wallet, openConnectionModal, disconnectWallet } = useWallet();
  const account = wallet?.account;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  const [showWalletInfo, setShowWalletInfo] = useState(false);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowWalletInfo(false);
  });

  return (
    <div
      className={cn("connnect-wallet-button-container", className)}
      ref={wrapperRef}
    >
      {!account &&
        (children ? (
          <div
            onClick={(e) => {
              openConnectionModal();
            }}
            style={{ cursor: "pointer", width: "100%" }}
          >
            {children}
          </div>
        ) : (
          <Button
            className="wallet-button not-connected"
            onClick={(e) => openConnectionModal()}
          >
            Connect Wallet
          </Button>
        ))}
      {account && (
        <>
          <Button
            className="wallet-button connected"
            onClick={(e) => setShowWalletInfo(!showWalletInfo)}
          >
            <span>{getWalletAddressEllipsis(account, 10, 5)}</span>
          </Button>
          {showWalletInfo && (
            <div className="wallet-info">
              <div className="wallet-info-address">
                <img className="circle" src="/assets/active.svg" />
                <span className="address">
                  {getWalletAddressEllipsis(account, 5, 10)}
                </span>
              </div>
              <div className="wallet-info-type">Connected with Metamask</div>
              <div className="wallet-info-divider">{` `}</div>
              <CopyToClipboard text={account} onCopy={() => setCopied(true)}>
                <div className="wallet-info-button">
                  <img className="circle" src="/assets/icons/copy.svg" />
                  <span>{copied ? "Copied" : "Copy Adress"}</span>
                </div>
              </CopyToClipboard>
              <a
                className="wallet-info-button"
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
              >
                <img className="circle" src="/assets/icons/open.png" />
                <span>View on Explorer</span>
              </a>

              <Button
                className="wallet-disconnect-button"
                onClick={(e) => {
                  disconnectWallet();
                  mixpanel.track("WALLET_DISCONNECT");
                  setShowWalletInfo(false);
                }}
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConnectWalletButton;
