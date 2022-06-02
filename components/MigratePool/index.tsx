import React from "react";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

import Button from "components/Button";

import { formatBalance } from "utils/wasm";
import { getWalletAddressEllipsis } from "utils/common";

import cn from "classnames";

const MigratePool = ({ pool, onWithdraw, onMigrate }) => {
  const { id, name, category, icon, theme, userCap, address, updated } = pool;

  return (
    <div
      className={cn("vault-pool-container", theme, {
        disabled: address === "",
      })}
      style={{ maxWidth: 500 }}
    >
      <div className={cn("pool-updated-wrapper", theme)}>
        <div className={cn("pool-updated-text", theme)}>Updated on</div>
        <div className={cn("pool-updated-date", theme)}>{updated}</div>
      </div>
      <div className={cn("pool-name-wrapper", theme)}>
        <img src={icon} data-tip={pool.address} />
        <div className="pool-name">
          <div className="pool-name-text">{name}</div>
          <div className={cn("pool-name-category", theme)}>{category}</div>
        </div>
      </div>
      <div className={cn("pool-buttons-wrapper", theme)}>
        <Button
          className="pool-migrate-button migrate"
          onClick={(e) => onMigrate(id)}
        >
          <span>Migrate</span>
          <FontAwesomeIcon icon={faArrowUp as IconProp} />
        </Button>
        <Button
          className="pool-migrate-button withdraw"
          onClick={(e) => onWithdraw(id)}
        >
          <span>Withdraw</span>
          <FontAwesomeIcon icon={faArrowUp as IconProp} />
        </Button>
      </div>
      <div className="pool-active-wrapper">
        <img src="/assets/active.png" />
        Active Pool
        <span>{`${formatBalance(userCap, 2)} UST`}</span>
      </div>
      <ReactTooltip
        effect="solid"
        multiline={true}
        backgroundColor="#FFF"
        delayHide={1000}
        clickable={true}
        isCapture={true}
        getContent={(dataTip) =>
          dataTip ? (
            <div
              className="pool-tooltip"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <img src="/assets/link.svg" />
              <a
                href={`https://terrasco.pe/mainnet/address/${dataTip}`}
                target="_blank"
              >
                {getWalletAddressEllipsis(dataTip, 15, 15)}
              </a>
            </div>
          ) : null
        }
      ></ReactTooltip>
    </div>
  );
};

export default MigratePool;
