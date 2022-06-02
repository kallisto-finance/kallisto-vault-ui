import React, { useState } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const faPropIcon = faTimes as IconProp;

const AttentionBanner = () => (
  <div className="attention-banner-container">
    <img className="attention-banner-icon" src="/assets/danger.png" />
    <span className="attention-banner-text">
      Attention! Kallisto smart contracts are not yet audited and are regularly
      updated for improvements. Withdrawals from deprecated contracts are always
      allowed. Use at your own risk
    </span>
  </div>
);

const UkraineBanner = () => {
  const [show, setShow] = useState(true);
  return show ? (
    <div className="ukraine-banner-container-wrapper">
      <div className="ukraine-banner-close" onClick={(e) => setShow(false)}>
        <FontAwesomeIcon icon={faPropIcon} />
      </div>

      <div className="ukraine-banner-container">
        <Link href="/ukraine" passHref>
          <a target="_blank" rel="noreferrer">
            <div className="banner-content">
              <p className="title">Let’s support Ukraine!</p>
              <p className="content">
                Kallisto donates <span className="donate">$50</span> to Ukraine
                for every $10,000 deposited into the Liquidation Pool.{` `}
                <span style={{ textDecoration: "underline" }}>Learn more</span>
              </p>
            </div>
          </a>
        </Link>
        {/* <img className="ukraine-icon" src="/assets/ukraine.png" /> */}
      </div>
    </div>
  ) : null;
};

const DeFiBanner = () => (
  <div className="defi-banner-container">
    <img className="defi-banner-defi" src="/assets/defi.png" />
    <span className="defi-banner-text">
      <b>Liquidation Pools</b>
      <br />
      for <b>Collateral Markets</b>
    </span>
    <img className="defi-banner-bear" src="/assets/logo-fish.png" />
  </div>
);

export { AttentionBanner, DeFiBanner, UkraineBanner };
