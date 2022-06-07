import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import BigNumber from "bignumber.js";

import MainLiquidityPanel from "./MainLiquidityPanel";
import ManageLiquidity from "./ManageLiquidity";
import DepositPool from "./DepositPool";
import DepositConfirm from "./DepositConfirm";
import WithdrawConfirm from "./WithdrawConfirm";
import { LoadingTriple } from "components/LoadingIcon";

import { useWallet, usePool, useBalance } from "hooks";

import { moveScrollToTop } from "utils/document";
import { VETH } from "utils/constants";
import { toBalance } from "utils/number";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY);

let valueLoadingProgressBarInterval = null;

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

  const { vaultInfo } = usePool();
  const { tokenBalances } = useBalance();

  // Deposit
  const [depositTokenAddress, setDepositTokenAddress] = useState(VETH);
  const [depositAmount, setDepositAmount] = useState({
    value: new BigNumber(0),
    format: "0.00",
  });

  const depositToken = useMemo(() => {
    const findIndex = tokenBalances.findIndex(
      (item) => item.address === depositTokenAddress
    );
    return tokenBalances[findIndex];
  }, [depositTokenAddress, tokenBalances]);

  const handleSelectDepositToken = (token) => {
    setDepositTokenAddress(token.address);
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
          onBack={() => setStep(0)}
          onConfirmDeposit={() => {}}
          loading={false}
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
          onConfirmWithdraw={(collectType) => {}}
          loading={false}
        />
      )}
    </div>
  );
};

export default Liquidity;
