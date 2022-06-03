import React, { useState } from "react";
import { useRouter } from "next/router";

import MainLiquidityPanel from "./MainLiquidityPanel";
import ManageLiquidity from "./ManageLiquidity";
import DepositPool from "./DepositPool";
import DepositConfirm from "./DepositConfirm";
import WithdrawConfirm from "./WithdrawConfirm";

import { moveScrollToTop } from "utils/document";

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

  return (
    <div className="liquidity-container">
      {step === 0 && (
        <>
          <MainLiquidityPanel onManageLiquidity={() => setStep(2)} />
          <DepositPool
            onDeposit={() => {
              moveScrollToTop();
              setStep(1);
            }}
            onChangeDepositInputAmount={(value) => {}}
          />{" "}
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
          onBack={() => setStep(0)}
          onWithdrawLiquidity={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <WithdrawConfirm
          onBack={() => setStep(2)}
          withdrawPercentage={50}
          onChangeWithdrawPercentage={(value) => {}}
          onConfirmWithdraw={(collectType) => {}}
          loading={false}
        />
      )}
    </div>
  );
};

export default Liquidity;
