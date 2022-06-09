import React from "react";

const TokenItem = ({ token, balance, onSelectToken }) => (
  <div className="token-item-container" onClick={(e) => onSelectToken(token)}>
    <img className="token-image" src={token.img} />
    <div className="token-info">
      <div className="token-symbol">{token.symbol}</div>
      <div className="token-balance">{balance}</div>
    </div>
  </div>
);

export default TokenItem;
