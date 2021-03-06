import React, { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";

import MainLiquidityPanel from "./MainLiquidityPanel";
import ManageLiquidity from "./ManageLiquidity";
import DepositPool from "./DepositPool";
import DepositConfirm from "./DepositConfirm";
import WithdrawConfirm from "./WithdrawConfirm";
import { LoadingTriple } from "components/LoadingIcon";
import TransactionFeedbackToast from "components/TransactionFeedbackToast";

import { useWallet, usePool, useBalance } from "hooks";

import { moveScrollToTop } from "utils/document";
import { VETH } from "utils/constants";
import {formatBalance, formatBalanceNumber, toBalance} from "utils/number";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY);

const Liquidity = ({ router, curvePoolAPY, sevenDayVolume, onConfettiStart, onConfettiStop }) => {
  const { wallet } = useWallet();

  const getQueryParam = (url, param) => {
    // Expects a raw URL
    param = param.replace(/[[]/, "[").replace(/[]]/, "]");
    let regexS = "[?&]" + param + "=([^&#]*)",
      regex = new RegExp(regexS),
      results = regex.exec(url);
    if (
      results === null ||
      (results && typeof results[1] !== "string" && results[1]["length"])
    ) {
      return "";
    } else {
      return decodeURIComponent(results[1]).replace(/\W/gi, " ");
    }
  };

  const getCampaignParams = async () => {
    let campaign_keywords =
        "utm_source utm_medium utm_campaign utm_content utm_term".split(" "),
      kw = "",
      params = {},
      first_params = {},
      index;
    //console.log(router.asPath)

    for (index = 0; index < campaign_keywords.length; ++index) {
      kw = getQueryParam(router.asPath, campaign_keywords[index]);
      if (kw.length) {
        params[campaign_keywords[index] + " [last touch]"] = kw;
      }
    }
    for (index = 0; index < campaign_keywords.length; ++index) {
      kw = getQueryParam(router.asPath, campaign_keywords[index]);
      if (kw.length) {
        first_params[campaign_keywords[index] + " [first touch]"] = kw;
      }
    }

    mixpanel.people.set(params);
    mixpanel.people.set_once(first_params);
    mixpanel.register(params);
  };

  /**
   * Init
   */
  getCampaignParams();
  const [step, setStep] = useState(0);

  const {
    vaultInfo,
    addLiquidity,
    withdrawLiquidity,
    fetchVaultInfo,
    calculateDepositParams,
  } = usePool();
  const { tokenBalances, fetchTokenBalances } = useBalance();

  const [dataLoading, setDataLoading] = useState(false);

  // Deposit
  const [depositTokenAddress, setDepositTokenAddress] = useState(VETH); // ETH
  // const [depositTokenAddress, setDepositTokenAddress] = useState(
  //   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  // ); // USDC
  const [depositAmount, setDepositAmount] = useState({
    value: new BigNumber(0),
    format: "",
  });
  const [depositLoading, setDepositLoading] = useState(false);

  const depositToken = useMemo(() => {
    const findIndex = tokenBalances.findIndex(
      (item) => item.address === depositTokenAddress
    );
    if (findIndex < 0) {
      return {
        address: "",
        balance: new BigNumber(0),
        decimals: 1,
        img: "",
        name: "",
        symbol: "",
      };
    }
    return tokenBalances[findIndex];
  }, [depositTokenAddress, tokenBalances]);

  const handleSelectDepositToken = (token) => {
    setDepositTokenAddress(token.address);
    handleChangeDepositAmount(0);
  };

  const handleChangeDepositAmount = (value) => {
    // console.log(value)
    if (value === "max") {
      const amount = depositToken.balance;
      const format = toBalance(amount, 2, depositToken.decimals);
      setDepositAmount({
        value: amount,
        format,
      });
    } else {
      const amount = new BigNumber(value.toString()).multipliedBy(
        10 ** depositToken.decimals
      );
      setDepositAmount({
        value: amount,
        format: value,
      });
    }
  };

  const handleAddLiquidity = async () => {
    setDepositLoading(true);

    await addLiquidity(
      depositToken,
      depositAmount,
      (res) => {
        toast.dismiss();

        const { token, amount, txHash } = res;

        setDepositLoading(false);
        fetchVaultInfo();
        fetchTokenBalances();

        setStep(0);
        setDepositAmount({
          value: new BigNumber(0),
          format: "0.00",
        });

        try {
          let balance_amount = formatBalanceNumber(amount);
          mixpanel.track("COMPLETED_DEPOSIT", {balance: balance_amount});
          mixpanel.people.set({balance: balance_amount});
          mixpanel.people.set({amount: balance_amount});
          mixpanel.people.set({"curve-apy-chaser-balance": balance_amount});
        }
        catch(err) {
          console.log(err);
        }

        toast(
          <TransactionFeedbackToast
            status="success"
            msg={`Succesfully Deposited ${formatBalance(
              amount,
              4,
              token.decimals
            )} ${token.symbol}`}
            hash={txHash}
          />
        );

        // Show Confetti
        onConfettiStart();
        setTimeout(() => {
          onConfettiStop();
        }, 5000);
      },
      (e) => {
        toast.dismiss();

        console.log("error", e);
        mixpanel.track("FAILED_DEPOSIT", {error: e});
        if (e?.code === 4001) {
          toast(<TransactionFeedbackToast status="error" msg={e.message} />);
        } else {
          toast(
            <TransactionFeedbackToast
              status="error"
              msg="Transaction failed."
            />
          );
        }
        setDepositLoading(false);
      },
      (res) => {
        toast.dismiss();

        const { estimateTime, txHash } = res;

        const minutes = Math.ceil(Number(estimateTime) / 60);

        toast(
          <TransactionFeedbackToast
            status="wait"
            msg={`Your transaction is being confirmed...`}
            hash={txHash}
            linkText={`Estimated Duration: < ${minutes} min${
              minutes > 1 ? "s" : ""
            }`}
          />,
          {
            autoClose: false,
            closeButton: false,
          }
        );
      }
    );
  };

  // Withdraw
  const [withdrawTokenAddress, setWithdrawTokenAddress] = useState("");
  const [withdrawPercentage, setWithdrawPercentage] = useState(50);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const withdrawToken = useMemo(() => {
    const findIndex = tokenBalances.findIndex(
      (item) => item.address === withdrawTokenAddress
    );
    if (findIndex < 0) {
      return {
        address: "",
        balance: new BigNumber(0),
        decimals: 1,
        img: "",
        name: "",
        symbol: "",
      };
    }
    return tokenBalances[findIndex];
  }, [withdrawTokenAddress, tokenBalances]);

  const handleSelectWithdrawToken = (token) => {
    setWithdrawTokenAddress(token.address);
  };

  const handleWithdrawLiquidity = () => {
    console.log(withdrawToken);
    console.log(withdrawPercentage);

    if (withdrawToken.name === "") {
      toast(
        <TransactionFeedbackToast
          status="error"
          msg="Select a token you want to withdraw please"
        />
      );
      return;
    }

    setWithdrawLoading(true);

    withdrawLiquidity(
      withdrawToken,
      withdrawPercentage,
      (res) => {
        toast.dismiss();

        const { token, amount, txHash } = res;

        setWithdrawLoading(false);
        fetchVaultInfo();
        fetchTokenBalances();
        setStep(0);
        setWithdrawPercentage(50);
        mixpanel.track("COMPLETED_WITHDRAWAL", {balance: `-${amount}`});
        mixpanel.people.set({ balance: `-${amount}` });
        mixpanel.people.set({ "curve-apy-chaser-balance": amount });
        toast(
          <TransactionFeedbackToast
            status="success"
            msg={`Succesfully Withdrawn ${formatBalance(
              amount,
              4,
              token.decimals
            )} ${token.symbol}`}
            hash={txHash}
          />
        );
      },
      (e) => {
        toast.dismiss();

        console.log("error", e);
        mixpanel.track("FAILED_WITHDRAWAL", {error: e});
        if (e?.code === 4001) {
          toast(<TransactionFeedbackToast status="error" msg={e.message} />);
        } else {
          toast(
            <TransactionFeedbackToast
              status="error"
              msg="Transaction failed."
            />
          );
        }
        setWithdrawLoading(false);
      },
      (res) => {
        toast.dismiss();

        const { estimateTime, txHash } = res;

        const minutes = Math.ceil(Number(estimateTime) / 60);

        toast(
          <TransactionFeedbackToast
            status="wait"
            msg={`Your transaction is being confirmed...`}
            hash={txHash}
            linkText={`Estimated Duration: < ${minutes} min${
              minutes > 1 ? "s" : ""
            }`}
          />,
          {
            autoClose: false,
            closeButton: false,
          }
        );
      }
    );
  };

  const depositPool = () => (
    <DepositPool
      vaultInfo={vaultInfo}
      selectedToken={depositToken}
      tokenBalances={tokenBalances}
      depositAmount={depositAmount}
      onDeposit={() => {
        moveScrollToTop();
        setStep(1);
      }}
      curvePoolAPY={curvePoolAPY}
      sevenDayVolume={sevenDayVolume}
      onSelectToken={(token) => handleSelectDepositToken(token)}
      onChangeDepositInputAmount={(value) => handleChangeDepositAmount(value)}
    />
  );

  return (
    <div className="liquidity-container">
      {step === 0 && (
        <>
          <MainLiquidityPanel
            vaultInfo={vaultInfo}
            onManageLiquidity={() => setStep(2)}
          />
          {wallet?.account ? (
            <>
              {depositToken?.name !== "" && vaultInfo.mainPoolAddress !== "" ? (
                depositPool()
              ) : (
                <div className="deposit-pool-loading-wrapper">
                  <LoadingTriple />
                </div>
              )}
            </>
          ) : (
            <>
              {vaultInfo.mainPoolAddress !== "" ? (
                depositPool()
              ) : (
                <div className="deposit-pool-loading-wrapper">
                  <LoadingTriple />
                </div>
              )}
            </>
          )}
        </>
      )}
      {step === 1 && (
        <DepositConfirm
          vaultInfo={vaultInfo}
          depositAmount={depositAmount}
          selectedToken={depositToken}
          onBack={() => setStep(0)}
          onConfirmDeposit={() => handleAddLiquidity()}
          loading={depositLoading}
          calcExpectedPercentage={calculateDepositParams}
        />
      )}
      {step === 2 && (
        <ManageLiquidity
          vaultInfo={vaultInfo}
          onBack={() => setStep(0)}
          onWithdrawLiquidity={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <WithdrawConfirm
          vaultInfo={vaultInfo}
          tokenBalances={tokenBalances}
          withdrawPercentage={withdrawPercentage}
          selectedToken={withdrawToken}
          onSelectToken={(token) => handleSelectWithdrawToken(token)}
          onBack={() => setStep(2)}
          onChangeWithdrawPercentage={(value) => setWithdrawPercentage(value)}
          onConfirmWithdraw={() => handleWithdrawLiquidity()}
          loading={withdrawLoading}
        />
      )}
    </div>
  );
};

export default Liquidity;
