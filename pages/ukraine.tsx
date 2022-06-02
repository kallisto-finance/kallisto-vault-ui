import React, { useEffect, useState } from "react";
import Link from "next/link";
import BigNumber from "bignumber.js";

import { usePool } from "hooks";
import { formatBalance } from "utils/wasm";

const Ukraine = () => {
  const { getUkraineDepositHistory } = usePool();

  const [week, setWeek] = useState(new BigNumber(0));
  const [total, setTotal] = useState(new BigNumber(0));

  useEffect(() => {
    const getValues = async () => {
      const { weeklyRaised, totalRaised } = await getUkraineDepositHistory();
      setWeek(weeklyRaised);
      setTotal(totalRaised);
    }
    getValues();
  }, []);

  return (
    <div className="page-container">
      <div className="ukraine-page-container">
        <Link href="/">
          <div className="ukraine-page-back">
            <img src="/assets/left-arrow-white.png" />
            Go Back
          </div>
        </Link>
        <div className="ukraine-page-banner">
          <div className="ukraine-container">
            <div className="banner-content">
              <h1 className="title">Let’s support Ukraine!</h1>
              <p className="content">
                Kallisto donates <span className="donate">$50</span> to Ukraine
                for every $10,000.00 UST deposited into the Liquidation Pool.
              </p>
            </div>
            <img className="ukraine-icon" src="/assets/ukraine.png" />
          </div>
        </div>
        <div className="ukraine-page-content">
          <h2 className="ukraine-page-title">
            How do I support Ukraine with Kallisto?
          </h2>
          <ol className="ukraine-page-description">
            <li>
              <p>Deposit UST in our bLUNA Liquidation Pool</p>
            </li>
            <li>
              <p>
                Kallisto will donate{" "}
                <span style={{ color: "#efce2b", fontWeight: 500 }}>$50 UST</span>{" "}
                for every <b>$10.000 UST</b> deposited to{` `}
                <a
                  href="https://ukraine.angelprotocol.io/"
                  target="_blank"
                  style={{ color: "#fff" }}
                >
                  https://ukraine.angelprotocol.io/
                </a><br/>
                Angel Protocol is a charity project that supports displaced
                Ukrainians.
              </p>
            </li>
            <li>
              <p>
                <b>Every Wednesday</b> the Kallisto team will deposit the
                collected to Angel Protocol in UST from the wallet address<br/>
                <a
                  href="https://terrasco.pe/mainnet/address/terra1zsm74pnpr508jy02zzxwhrc2gwg2tn87w9fgn9"
                  target="_blank"
                  style={{ color: "#efce2b" }}
                >
                  terra1zsm74pnpr508jy02zzxwhrc2gwg2tn87w9fgn9
                </a>
              </p>
            </li>
          </ol>
          <div className="ukraine-amount-view">
            <div className="ukraine-amount-value">
              <span>{`${formatBalance(week, 0)} UST`}</span>
              <img src="/assets/tokens/ust.png" />
            </div>
            <span>Raised this week</span>
          </div>
          <div className="ukraine-amount-view">
            <div className="ukraine-amount-value">
              <span>{`${formatBalance(total, 0)} UST`}</span>
              <img src="/assets/tokens/ust.png" />
            </div>
            <span>Total Raised</span>
          </div>
        </div>
        <Link href="/">
          <div className="ukraine-page-button">Support Ukraine</div>
        </Link>
      </div>
    </div>
  );
};

export default Ukraine;
