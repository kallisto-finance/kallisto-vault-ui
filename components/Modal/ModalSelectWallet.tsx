import React from "react";

const ModalSelectWallet = ({ onChooseMetamask, onChooseWalletConnect }) => {
  // const [val, setVal] = useState("");

  return (
    <div className="modal-select-wallet">
      <span className="modal-view-title">Select a Wallet</span>
      <div className="modal-choose-wallet-list">
        <div className="wallet-choose-item" onClick={(e) => onChooseMetamask()}>
          <img
            src="/assets/wallet/metamask.svg"
            style={{ width: 50, height: 51 }}
          />
          <div className="wallet-choose-item-text">
            <span className="wallet-choose-item-name">Metamask</span>
            <span className="wallet-choose-item-sub">
              Connect with Metamask Extention
            </span>
          </div>
        </div>

        <div
          className="wallet-choose-item"
          onClick={(e) => onChooseWalletConnect()}
        >
          <img
            src="/assets/wallet/walletconnect.svg"
            style={{ width: 59, height: 36 }}
          />
          <div className="wallet-choose-item-text">
            <span className="wallet-choose-item-name">Wallet Connect</span>
            <span className="wallet-choose-item-sub">
              Scan with WalletConnect to connect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSelectWallet;
