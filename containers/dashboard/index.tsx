import React, { useState, useEffect } from "react";
import Link from "next/link";
import BigNumber from "bignumber.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import { LoadingTriple } from "components/LoadingIcon";

import { useLCDClient, usePool } from "hooks";
import { formatBalance } from "utils/wasm";
import { moveScrollToTop } from "utils/document";
import { delay } from "utils/date";
import { addresses } from "utils/constants";
import { compare } from "utils/number";

import cn from "classnames";

const DashboardContainer = () => {
  const lcd = useLCDClient();
  const { fetchBLunaPrice, fetchDashboardValues, fetchDashboardTransactions } =
    usePool();

  const [isDashboardValueLoaded, setDashboardValueLoaded] = useState(false);
  const [isbLunaPriceLoaded, setBLunaPriceLoaded] = useState(false);
  const [isTransactionValueLoaded, setTransactionValueLoaded] = useState(false);

  // Dashboard Values
  const [dashboardValues, setDashboardValues] = useState({
    totalCap: new BigNumber(0),
    apy: 0,
  });
  const [ustInBid, setUSTInBid] = useState(new BigNumber(0));
  const [bLunaPrice, setBLunaPrice] = useState({
    price: new BigNumber(0),
    increase: "",
  });
  const [txValues, setTxValues] = useState({
    totalClaimedCount: 0,
    lastClaim: {
      ago: "",
      time: "",
      timestamp: 0,
    },
    lastSubmit: {
      ago: "",
      time: "",
      timestamp: 0,
    },
  });

  const getDashboardValues = async (poolList, lcd) => {
    const result = await fetchDashboardValues(poolList, lcd);

    setDashboardValues({ ...result });

    const bLunaPrice = localStorage.getItem("bLunaPrice")
      ? localStorage.getItem("bLunaPrice")
      : 0;
    const ustInBid = result.totalCap
      .minus(result.bLunaBalance.multipliedBy(bLunaPrice))
      .minus(result.ustBalance);
    setUSTInBid(ustInBid);

    setDashboardValueLoaded(true);
  };

  const getBLunaPrice = async () => {
    const fetchedPrice = await fetchBLunaPrice();

    const bPrice = {
      price: new BigNumber(0),
      increase: "",
    };

    const prevBLunaPrice = localStorage.getItem("bLunaPrice")
      ? new BigNumber(localStorage.getItem("bLunaPrice"))
      : new BigNumber(0);

    if (compare(fetchedPrice, 0) === 0 || compare(prevBLunaPrice, 0) === 0) {
      bPrice.increase = "";
    } else {
      const increase = prevBLunaPrice
        .minus(fetchedPrice)
        .dividedBy(prevBLunaPrice)
        .multipliedBy(100);
      bPrice.increase = compare(increase, 0) !== 0 ? increase.toFixed(2) : "";
    }

    if (compare(bLunaPrice.price, 0) !== 0) {
      localStorage.setItem("bLunaPrice", fetchedPrice.toString());
    }

    bPrice.price = fetchedPrice;

    await delay(500);

    setBLunaPrice({ ...bPrice });
    setBLunaPriceLoaded(true);
  };

  const getTransactionValues = async (poolList) => {
    const result = await fetchDashboardTransactions(poolList);
    setTxValues({ ...result });
    setTransactionValueLoaded(true);
  };

  useEffect(() => {
    // Initial
    getDashboardValues(addresses.contracts.vaultList, lcd);
    getBLunaPrice();
    getTransactionValues(addresses.contracts.vaultList);

    let interval = null;
    let interval2 = null;

    interval = setInterval(() => {
      getDashboardValues(addresses.contracts.vaultList, lcd);
    }, 10000);

    interval2 = setInterval(() => {
      getBLunaPrice();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(interval2);
    };
  }, [lcd]);

  return (
    <div className="dashboard-container">
      <Link href="/">
        <div className="back-to-pools" style={{ width: 208 }}>
          <FontAwesomeIcon icon={faArrowLeft as IconProp} />
          <span>Landing Page</span>
        </div>
      </Link>
      {isDashboardValueLoaded &&
      isbLunaPriceLoaded &&
      isTransactionValueLoaded ? (
        <>
          <div className="dashboard-bg">
            <img
              src="/assets/dashboard/logo.png"
              className="dashboard-bg-logo"
            />
            <img
              src="/assets/dashboard/text.png"
              className="dashboard-bg-text"
            />
          </div>
          <div className="dashboard-panel">
            <div className="dashboard-total-ust">
              <div className="dashboard-item-title">
                Total Kallisto Value in UST
              </div>
              <div className="dashboard-item-value">
                <span>{formatBalance(dashboardValues.totalCap, 2)}</span>
                <span className="small">UST</span>
              </div>
            </div>
            <div className="dashboard-other-values">
              <div className="dashboard-item">
                <div className="dashboard-item-title">
                  Total Number of
                  <br />
                  Claimed Liquidations
                </div>
                <div className="dashboard-item-value">
                  <span>{txValues.totalClaimedCount}</span>
                </div>
              </div>

              <div className="dashboard-item">
                <div className="dashboard-item-title">
                  Last Liquidation Claim
                </div>
                <div className="dashboard-item-value">
                  <span>{txValues.lastClaim.ago}</span>
                </div>
                <div className="dashboard-item-time">
                  <span>{txValues.lastClaim.time}</span>
                </div>
              </div>

              <div className="dashboard-item">
                <div className="dashboard-item-title">Amount in Bids</div>
                <div className="dashboard-item-value">
                  <span>{formatBalance(ustInBid, 2)}</span>
                  <span className="small">UST</span>
                </div>
              </div>

              <div className="dashboard-item mt">
                <div className="dashboard-item-title">Highest APY</div>
                <div className="dashboard-item-value apy">
                  <span>{dashboardValues.apy}%</span>
                  <span className="small">APY</span>
                </div>
              </div>

              <div className="dashboard-item mt">
                <div className="dashboard-item-title">Last Bid Submission</div>
                <div className="dashboard-item-value">
                  <span>{txValues.lastSubmit.ago}</span>
                </div>
                <div className="dashboard-item-time">
                  <span>{txValues.lastSubmit.time}</span>
                </div>
              </div>

              <div className="dashboard-item mt">
                <div className="dashboard-item-title">bLUNA Price</div>
                <div className="dashboard-item-value">
                  {bLunaPrice.price.toFixed(2)}
                </div>
                {bLunaPrice.increase !== "" && bLunaPrice.increase !== "0" && (
                  <div
                    className={cn("dashboard-item-price", {
                      up: Number(bLunaPrice.increase) > 0,
                      down: Number(bLunaPrice.increase) < 0,
                    })}
                  >
                    {Math.abs(Number(bLunaPrice.increase))}%
                    {Number(bLunaPrice.increase) > 0 ? (
                      <FontAwesomeIcon icon={faChevronUp as IconProp} />
                    ) : (
                      <FontAwesomeIcon icon={faChevronDown as IconProp} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard-loader">
          <LoadingTriple />
        </div>
      )}
    </div>
  );
};

export default DashboardContainer;
