import React, { useState, useEffect, useMemo } from "react";
import { useConnectedWallet, useWallet } from "@terra-money/wallet-provider";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

import MigratePool from "components/MigratePool";
import { LoadingTriple } from "components/LoadingIcon";
import TransactionFeedbackToast from "components/TransactionFeedbackToast";
import MigrateConfirm from "./MigrateConfirm";
import DepositConfirm from "./DepositConfirm";

import { usePool, useLCDClient } from "hooks";

import { addresses } from "utils/constants";
import { compare } from "utils/number";
import { formatBalance } from "utils/wasm";
import { delay } from "utils/date";

import mixpanel from "mixpanel-browser";
import BigNumber from "bignumber.js";
mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

const MigrationHome = () => {
  const lcd = useLCDClient();
  const connectedWallet = useConnectedWallet();
  const { fetchPoolValues, deposit ,withdrawUst, getTxInfo, isTxSuccess } = usePool();

  const [step, setStep] = useState(0);

  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const selectedPool = useMemo(() => {
    const findIndex = pools.findIndex((item) => item.id === selectedPoolId);

    if (findIndex >= 0) {
      return pools[findIndex];
    }

    return null;
  }, [selectedPoolId, pools]);

  const [valueLoading, setValueLoading] = useState(false);

  const getPoolValues = async (poolList, connectedWallet, lcd) => {
    const result = await fetchPoolValues(poolList, connectedWallet, lcd);

    setPools([
      ...result.poolList.filter((item) => compare(item.userCap, 0) === 1),
    ]);
    setValueLoading(true);
  };

  useEffect(() => {
    getPoolValues(addresses.migrations.contracts, connectedWallet, lcd);
  }, [connectedWallet]);
 
  const [depositLoading, setDepositLoading] = useState(false);

  const handleConfirmDeposit = async (newContractAddress, ustAmount) => {
    setDepositLoading(true);
    deposit(
      newContractAddress,
      ustAmount.toString(),
      async (result) => {
        let txHash = "";

        if (result.status === "Success") {
          txHash = result.data.result.txhash;

          let txInfo = null;
          let msg = "";
          let txState = "";

          while (true) {
            try {
              await delay(200);

              txInfo = await getTxInfo(txHash, lcd);
              txState = isTxSuccess(txInfo);
              if (txState === "success") {
                msg = `Succesfully Deposited ${formatBalance(ustAmount)} UST.`;
              } else {
                if (txState.includes("insufficient funds")) {
                  msg =
                    "Error submitting the deposit. Insufficient funds for gas fees.";
                } else {
                  msg = txState;
                }
              }
              break;
            } catch (e) {}
          }

          if (txState === "success") {
            getPoolValues(addresses.migrations.contracts, connectedWallet, lcd);
          }

          toast(
            <TransactionFeedbackToast
              status={txState === "success" ? "success" : "error"}
              msg={msg}
              hash={txHash}
            />
          );
        } else {
          toast(
            <TransactionFeedbackToast
              status="error"
              msg={result.data.message}
              hash={txHash}
            />
          );
        }

        setDepositLoading(false);
      }
    );
  };

  // Withdraw
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleWithdraw = (id, migrate = false) => {
    const findIndex = pools.findIndex((item) => item.id === id);
    if (findIndex < 0) {
      return;
    }

    const pool = pools[findIndex];

    setWithdrawLoading(true);

    withdrawUst(
      pool.address,
      new BigNumber(1).multipliedBy(10 ** 5),
      async (result) => {
        let txHash = "";

        let withdrawnUSTAmount = new BigNumber(0);

        if (result.status === "Success") {
          let txInfo = null;
          let msg = "";
          let txState = "";

          txHash = result.data.result.txhash;

          while (true) {
            try {
              await delay(200);

              txInfo = await getTxInfo(txHash, lcd);
              console.log("withdrawTX", txInfo);
              txState = isTxSuccess(txInfo);
              if (txState === "success") {
                withdrawnUSTAmount = new BigNumber(
                  txInfo.logs[0].eventsByType.coin_received.amount[0].replace(
                    "uusd",
                    ""
                  )
                );
                console.log(
                  "withdraw UST Amount",
                  withdrawnUSTAmount.toString()
                );

                msg = `Succesfully Withdrawn.`;
                mixpanel.track("COMPLETED_WITHDRAW", {
                  balance: `-${formatBalance(pool.userBalance)}`,
                });
                mixpanel.people.set({
                  balance: `-${formatBalance(pool.userBalance)}`,
                });
                mixpanel.people.set({
                  "anchor-bluna-balance": formatBalance(pool.userBalance),
                });
              } else {
                if (txState.includes("insufficient funds")) {
                  msg =
                    "Error submitting the deposit. Insufficient funds for gas fees.";
                } else {
                  msg = txState;
                }
              }
              break;
            } catch (e) {}
          }

          if (txState === "success") {
            // Update Balance and Pool data
            getPoolValues(addresses.migrations.contracts, connectedWallet, lcd);

            // Deposit
            if (migrate) {
              handleConfirmDeposit(pool.newAddress, withdrawnUSTAmount);
            }
          }

          toast(
            <TransactionFeedbackToast
              status="success"
              msg={`Succesfully Withdraw ${formatBalance(
                withdrawnUSTAmount,
                4
              )} UST`}
              hash={txHash}
            />
          );
        } else {
          toast(
            <TransactionFeedbackToast
              status="error"
              msg={result.data.message}
              hash={txHash}
            />
          );
        }

        setWithdrawLoading(false);
      }
    );
  };

  return (
    <div className="migration-container">
      <div className="migration-page-content">
        {step === 0 && (
          <div className="select-liquidity-arrow">
            <span>Select a Liquidation Pool</span>
            <FontAwesomeIcon icon={faArrowDown as IconProp} />
          </div>
        )}
        <div className="migration-pools-list">
          {valueLoading ? (
            <>
              {step === 0 && (
                <div className="pool-list-wrapper">
                  {pools.map((item, index) => (
                    <MigratePool
                      pool={item}
                      key={`migration-pool-${item.name}`}
                      onMigrate={(id) => {
                        // setSelectedPoolId(id);
                        // setStep(1);
                        handleWithdraw(id, true)
                      }}
                      onWithdraw={(id) => handleWithdraw(id)}
                    />
                  ))}
                </div>
              )}
              {step === 1 && (
                <MigrateConfirm
                  pool={selectedPool}
                  onBack={() => {
                    setStep(0);
                  }}
                  onConfirmMigration={() => handleWithdraw(selectedPoolId)}
                  loading={withdrawLoading}
                />
              )}
              {step === 2 && (
                <DepositConfirm
                  pool={selectedPool}
                  onBack={() => {
                    setStep(0);
                  }}
                  onConfirmMigration={() => handleWithdraw(selectedPoolId)}
                  loading={withdrawLoading}
                />
              )}
            </>
          ) : (
            <LoadingTriple
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 234,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationHome;
