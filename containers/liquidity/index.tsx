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
import { formatBalance, toBalance } from "utils/number";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY);

const Liquidity = ({ router }) => {
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

  const { vaultInfo, addLiquidity, fetchVaultInfo } = usePool();
  const { tokenBalances } = useBalance();

  // Deposit
  const [depositTokenAddress, setDepositTokenAddress] = useState(VETH); // ETH
  // const [depositTokenAddress, setDepositTokenAddress] = useState(
  //   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  // ); // USDC
  const [depositAmount, setDepositAmount] = useState({
    value: new BigNumber(0),
    format: "0.00",
  });
  const [depositLoading, setDepositLoading] = useState(false);

  const depositToken = useMemo(() => {
    const findIndex = tokenBalances.findIndex(
      (item) => item.address === depositTokenAddress
    );
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
      const format = toBalance(amount, 4, depositToken.decimals);
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
        const { token, amount, txHash } = res;

        setDepositLoading(false);
        fetchVaultInfo();
        setStep(0);
        setDepositAmount({
          value: new BigNumber(0),
          format: "0.00",
        });

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
      },
      (e) => {
        console.log('error', e);
        if (e?.code === 4001) {
          toast(<TransactionFeedbackToast status="error" msg={e.message} />);
        } else {
          toast(<TransactionFeedbackToast status="error" msg="Transaction is failed." />);
        }
        setDepositLoading(false);
      }
    );
  };

  // Withdraw
  const [withdrawTokenAddress, setWithdrawTokenAddress] = useState(VETH);
  const [withdrawPercentage, setWithdrawPercentage] = useState(50);

  const withdrawToken = useMemo(() => {
    const findIndex = tokenBalances.findIndex(
      (item) => item.address === withdrawTokenAddress
    );
    return tokenBalances[findIndex];
  }, [withdrawTokenAddress, tokenBalances]);

  const handleSelectWithdrawToken = (token) => {
    setWithdrawTokenAddress(token.address);
  };

  return (
    <div className="liquidity-container">
      {step === 0 && (
        <>
          <MainLiquidityPanel
            vaultInfo={vaultInfo}
            onManageLiquidity={() => setStep(2)}
          />
          {depositToken ? (
            <DepositPool
              vaultInfo={vaultInfo}
              selectedToken={depositToken}
              tokenBalances={tokenBalances}
              depositAmount={depositAmount}
              onDeposit={() => {
                moveScrollToTop();
                setStep(1);
              }}
              onSelectToken={(token) => handleSelectDepositToken(token)}
              onChangeDepositInputAmount={(value) =>
                handleChangeDepositAmount(value)
              }
            />
          ) : (
            <div className="deposit-pool-loading-wrapper">
              <LoadingTriple />
            </div>
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
          onConfirmWithdraw={() => {}}
          loading={false}
        />
      )}
    </div>
  );
};

export default Liquidity;
