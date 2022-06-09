import React from 'react';
import ReactTooltip from "react-tooltip";

import { addresses } from 'utils/constants';

const PoolInfo = ({ pool, apy }) => {
  return (
    <div className="pool-info-container">
      <div className="pool-name">
        {pool && <img src={`${addresses.curve_pool_icon_base_link}#${pool.name}`} />}
        <span>{pool ? pool.name : ""}</span>
      </div>
      <div className="pool-apy">
        <span data-tip="Estimated based on recent performance">APY</span>
        <span className="apy">{`${apy.toFixed(2)} %`}</span>
      </div>
      <ReactTooltip effect='solid' backgroundColor='#fff' textColor='#20253B'/>
    </div>
  )
}

export default PoolInfo;
