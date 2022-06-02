import { MsgExecuteContract, TxAPI } from "@terra-money/terra.js";
import { useWallet, useConnectedWallet } from "@terra-money/wallet-provider";
import BigNumber from "bignumber.js";

import { useLCDClient } from "hooks";

import { getContractQuery, getBalance, postMessage } from "utils/wasm";
import { addresses, UKRAINE_WALLET } from "utils/constants";
import { compare } from "utils/number";
import { getTxHistories } from "utils/axios";
import { delay } from "utils/date";
import { leadZero } from "utils/string";

const usePool = () => {
  const { network } = useWallet();
  const connectedWallet = useConnectedWallet();

  const fetchPoolValues = async (pools, connectedWallet, lcd) => {
    const poolList = [];

    for (let i = 0; i < pools.length; i++) {
      const pool = {
        ...pools[i],
        totalCap: new BigNumber(0),
        totalSupply: new BigNumber(0),
        poolUSTBalance: new BigNumber(0),
        poolbLunaBalance: new BigNumber(0),
        userBalance: new BigNumber(0),
        userCap: new BigNumber(0),
        lastDepositedTime: 0,
      };

      if (pool.address === "") {
        poolList.push(pool);
        continue;
      }

      // get total_cap for each pool
      const resTotalCap = await getContractQuery(pool.address, {
        total_cap: {},
      });
      pool.totalCap = new BigNumber(resTotalCap["total_cap"]);

      // get total_supply
      const resPoolInfo = await getContractQuery(pool.address, {
        get_info: {},
      });
      pool.totalSupply = new BigNumber(resPoolInfo["total_supply"]);

      // get bLuna balance
      const resbLunaBalance = await getBalance(
        addresses.contracts.bLuna.address,
        pool.address
      );
      pool.poolbLunaBalance = new BigNumber(resbLunaBalance["balance"]);

      // get pool UST balance
      if (lcd !== null) {
        const vaultBank = await lcd.bank.balance(pool.address);
        pool.poolUSTBalance =
          "uusd" in vaultBank[0]._coins ? vaultBank[0]._coins.uusd.amount : 0;
        pool.poolUSTBalance = new BigNumber(pool.poolUSTBalance);
      }

      // Get My Liquidity for each Pool
      if (connectedWallet) {
        // get my balance
        const resMyBalance = connectedWallet
          ? await getBalance(pool.address, connectedWallet.walletAddress)
          : { balance: 0 };
        pool.userBalance = new BigNumber(resMyBalance["balance"]);

        pool.userCap =
          compare(pool.totalSupply, 0) === 0
            ? new BigNumber(0)
            : pool.userBalance
                .dividedBy(pool.totalSupply)
                .multipliedBy(pool.totalCap);

        // get last deposited time
        const resLastDepositedTime = await getContractQuery(pool.address, {
          last_deposit_timestamp: {
            address: connectedWallet.walletAddress,
          },
        });
        pool.lastDepositedTime = resLastDepositedTime["timestamp"];
      }

      poolList.push(pool);
    }

    let userUSTBalance = new BigNumber(0);
    if (connectedWallet && lcd) {
      const userBank = await lcd.bank.balance(connectedWallet.walletAddress);
      userUSTBalance = new BigNumber(
        "uusd" in userBank[0]._coins ? userBank[0]._coins.uusd.amount : 0
      );
    }

    return {
      poolList,
      userUSTBalance,
    };
  };

  const fetchBLunaPrice = async () => {
    // Get bLuna Price
    const resBLunaPrice = await getContractQuery(
      addresses.contracts.oracle.address,
      {
        price: {
          base: addresses.contracts.bLuna.address,
          quote: "uusd",
        },
      }
    );
    const bLunaPrice = new BigNumber(resBLunaPrice["rate"]);

    return bLunaPrice;
  };

  const deposit = (vaultAddress, amount, callback) => {
    if (!connectedWallet || !network) {
      return;
    }

    console.log(vaultAddress);
    const msg = new MsgExecuteContract(
      connectedWallet.walletAddress,
      vaultAddress,
      {
        deposit: {},
      },
      { uusd: amount }
    );

    postMessage(connectedWallet, msg, callback);
  };

  const withdrawUst = (vaultAddress, amount, callback) => {
    if (!connectedWallet || !network) {
      return;
    }

    const msg = new MsgExecuteContract(
      connectedWallet.walletAddress,
      vaultAddress,
      {
        withdraw_ust: {
          share: amount.toFixed(0),
        },
      }
    );

    console.log(msg);
    postMessage(connectedWallet, msg, callback);
  };

  const getPoolDepositHistory = async (contractAddress, days = 7) => {
    let volume = new BigNumber(0);

    if (contractAddress === "") {
      return volume;
    }

    const currentTime = new Date().getTime();
    const searchDateTime = currentTime - days * 86400 * 1000;
    const searchDateStartTime =
      searchDateTime - (searchDateTime % (86400 * 1000)); // 7 days ago 12:00:00 am

    const historyData = [];

    let offset = 0;
    let limit = 100;

    try {
      while (true) {
        const txHistories = await getTxHistories(
          contractAddress,
          offset,
          limit
        );

        if (txHistories.txs.length === 0) {
          break;
        }

        for (let i = 0; i < txHistories.txs.length; i++) {
          const tx = txHistories.txs[i];

          const txTimestamp = new Date(tx.timestamp).getTime();

          if (txTimestamp < searchDateStartTime) {
            break;
          }

          historyData.push(tx);
        }

        if (!txHistories.next || txHistories.next === undefined) {
          break;
        }

        offset = txHistories.next;

        await delay(1000);
      }
    } catch (e) {}

    for (let i = 0; i < historyData.length; i++) {
      const tx = historyData[i];

      const txTimestamp = new Date(tx.timestamp).getTime();
      if (txTimestamp < searchDateStartTime) {
        continue;
      }

      if (tx.logs.length === 0) {
        continue;
      }

      const msgs = tx.tx.value.msg;

      for (let j = 0; j < msgs.length; j++) {
        const type = msgs[j].type;
        if (type !== "wasm/MsgExecuteContract") {
          continue;
        }

        const coins = msgs[j].value.coins;
        const msgValue = msgs[j].value.execute_msg;

        if ("deposit" in msgValue) {
          for (let k = 0; k < coins.length; k++) {
            if (coins[k].denom === "uusd") {
              volume = volume.plus(coins[k].amount);
            }
          }
        }

        if ("withdraw_ust" in msgValue) {
          volume = volume.plus(msgValue["withdraw_ust"].share);
        }
      }
    }

    return volume;
  };

  const getPool7DayDeposits = async (poolList) => {
    const resList = [];

    for (let i = 0; i < poolList.length; i++) {
      const deposits = await getPoolDepositHistory(poolList[i].address, 7);

      const res = {
        id: poolList[i].id,
        deposits,
      };

      resList.push(res);
    }

    return resList;
  };

  const getUkraineDepositHistory = async () => {
    let weeklyRaised = new BigNumber(0);
    let totalRaised = new BigNumber(0);

    const historyData = [];

    let offset = 0;
    let limit = 100;

    let isWeekly = true;

    try {
      while (true) {
        const txHistories = await getTxHistories(UKRAINE_WALLET, offset, limit);

        if (txHistories.txs.length === 0) {
          break;
        }

        for (let i = 0; i < txHistories.txs.length; i++) {
          historyData.push(txHistories.txs[i]);
        }

        if (!txHistories.next || txHistories.next === undefined) {
          break;
        }

        offset = txHistories.next;

        await delay(1000);
      }
    } catch (e) {}

    for (let i = 0; i < historyData.length; i++) {
      const tx = historyData[i];

      if (tx.logs.length === 0) {
        continue;
      }

      const msgs = tx.tx.value.msg;

      for (let j = 0; j < msgs.length; j++) {
        const type = msgs[j].type;
        if (type !== "bank/MsgSend") {
          continue;
        }

        const toAddress = msgs[j].value.to_address;
        if (toAddress.toString() !== UKRAINE_WALLET.toString()) {
          continue;
        }

        const amounts = msgs[j].value.amount;

        for (let k = 0; k < amounts.length; k++) {
          if (amounts[k].denom === "uusd") {
            totalRaised = totalRaised.plus(amounts[k].amount);

            if (isWeekly) {
              weeklyRaised = weeklyRaised.plus(amounts[k].amount);
              isWeekly = false;
            }
          }
        }
      }
    }

    return {
      weeklyRaised,
      totalRaised,
    };
  };

  const getTxInfo = async (txHash, lcd) => {
    const txAPI = new TxAPI(lcd);
    const txInfo = await txAPI.txInfo(txHash);
    return txInfo;
  };

  const isTxSuccess = (txInfo) => {
    if (txInfo.logs.length === 0) {
      return txInfo.raw_log.toString();
    }

    return "success";
  };

  const fetchDashboardValues = async (pools, lcd) => {
    const dashboardValues = {
      totalCap: new BigNumber(0),
      apy: 0,
      ustBalance: new BigNumber(0),
      bLunaBalance: new BigNumber(0),
    };

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];

      if (pool.address === "") {
        continue;
      }

      // get total_cap for each pool
      const resTotalCap = await getContractQuery(pool.address, {
        total_cap: {},
      });
      dashboardValues.totalCap = dashboardValues.totalCap.plus(
        new BigNumber(resTotalCap["total_cap"])
      );

      // highest apy
      if (pool.apy > dashboardValues.apy) {
        dashboardValues.apy = pool.apy;
      }

      // get bLuna balance
      const resbLunaBalance = await getBalance(
        addresses.contracts.bLuna.address,
        pool.address
      );
      dashboardValues.bLunaBalance = dashboardValues.bLunaBalance.plus(
        new BigNumber(resbLunaBalance["balance"])
      );

      // get pool UST balance
      if (lcd !== null) {
        const vaultBank = await lcd.bank.balance(pool.address);
        const ustBalance =
          "uusd" in vaultBank[0]._coins ? vaultBank[0]._coins.uusd.amount : 0;
        dashboardValues.ustBalance = dashboardValues.ustBalance.plus(
          new BigNumber(ustBalance)
        );
      }
    }

    return dashboardValues;
  };

  const fetchDashboardTransactions = async (poolList) => {
    const txValues = {
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
    };

    for (let poolIndex = 0; poolIndex < poolList.length; poolIndex++) {
      const contractAddress = poolList[poolIndex].address;

      if (contractAddress === "") {
        continue;
      }

      const historyData = [];

      let offset = 0;
      let limit = 100;

      try {
        while (true) {
          const txHistories = await getTxHistories(
            contractAddress,
            offset,
            limit
          );

          if (txHistories.txs.length === 0) {
            break;
          }

          for (let i = 0; i < txHistories.txs.length; i++) {
            historyData.push(txHistories.txs[i]);
          }

          if (!txHistories.next || txHistories.next === undefined) {
            break;
          }

          offset = txHistories.next;

          await delay(1000);
        }
      } catch (e) {}

      const currentTimeStamp = new Date().getTime();

      for (let i = 0; i < historyData.length; i++) {
        const tx = historyData[i];

        if (tx.logs.length === 0) {
          continue;
        }

        const txTimestamp = new Date(tx.timestamp).getTime();
        const msgs = tx.tx.value.msg;

        for (let j = 0; j < msgs.length; j++) {
          const type = msgs[j].type;
          if (type !== "wasm/MsgExecuteContract") {
            continue;
          }

          const msgValue = msgs[j].value.execute_msg;

          const txTimeDate = new Date(tx.timestamp);
          const timeText = `${txTimeDate.getFullYear()}.${leadZero(
            txTimeDate.getMonth() + 1
          )}.${leadZero(txTimeDate.getDate())} ${leadZero(
            txTimeDate.getHours()
          )}:${leadZero(txTimeDate.getMinutes())}:${leadZero(
            txTimeDate.getSeconds()
          )}`;
          const delayedTime = Math.floor(
            (currentTimeStamp - txTimestamp) / 1000
          );

          let agoText = "";

          if (delayedTime >= 365 * 24 * 60 * 60) {
            agoText = `${Math.floor(delayedTime / (365 * 24 * 60 * 60))} year${
              Math.floor(delayedTime / (365 * 24 * 60 * 60)) > 1 ? "s" : ""
            } ago`;
          } else if (delayedTime >= 24 * 60 * 60) {
            agoText = `${Math.floor(delayedTime / (24 * 60 * 60))} day${
              Math.floor(delayedTime / (24 * 60 * 60)) > 1 ? "s" : ""
            } ago`;
          } else if (delayedTime >= 60 * 60) {
            agoText = `${Math.floor(delayedTime / (60 * 60))} hr${
              Math.floor(delayedTime / (60 * 60)) > 1 ? "s" : ""
            } ago`;
          } else if (delayedTime >= 60) {
            agoText = `${Math.floor(delayedTime / 60)} mins${
              Math.floor(delayedTime / 60) > 1 ? "s" : ""
            } ago`;
          } else {
            agoText = "Just now";
          }

          if ("claim_liquidation" in msgValue) {
            txValues.totalClaimedCount += 1;

            if (txTimestamp > txValues.lastClaim.timestamp) {
              txValues.lastClaim.timestamp = txTimestamp;
              txValues.lastClaim.time = timeText;
              txValues.lastClaim.ago = agoText;
            }
          }

          if ("submit_bid" in msgValue) {
            if (txTimestamp > txValues.lastClaim.timestamp) {
              txValues.lastSubmit.timestamp = txTimestamp;
              txValues.lastSubmit.time = timeText;
              txValues.lastSubmit.ago = agoText;
            }
          }
        }
      }
    }

    return txValues;
  };

  return {
    fetchPoolValues,
    fetchBLunaPrice,
    deposit,
    withdrawUst,
    getPool7DayDeposits,
    getUkraineDepositHistory,
    getTxInfo,
    isTxSuccess,
    fetchDashboardValues,
    fetchDashboardTransactions,
  };
};

export default usePool;
