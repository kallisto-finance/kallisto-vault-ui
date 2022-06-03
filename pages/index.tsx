import React from "react";

import Liquidity from "containers/liquidity";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY)

export default function Home({ state, router }) {
  mixpanel.track("VISIT");
  return (
    <div className="page-container">
      <Liquidity router={router} />
    </div>
  );
}
