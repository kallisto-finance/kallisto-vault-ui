import React from 'react';
import ReactTooltip from "react-tooltip";

const PoolInfo = () => {
  return (
    <div className="pool-info-container">
      <div className="pool-name">
        <img src="/assets/tokens/CRV.png" />
        <span>crveth</span>
      </div>
      <div className="pool-apy">
        <span data-tip="Estimated based on recent performance">APY</span>
        <span className="apy">25.54%</span>
      </div>
      <ReactTooltip effect='solid' backgroundColor='#fff' textColor='#20253B'/>
    </div>
  )
}

export default PoolInfo;
