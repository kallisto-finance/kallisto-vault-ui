import React from "react";

import Liquidity from "containers/liquidity";
import MigrationBanner from "containers/migration/Banner";

import { addresses } from "utils/constants";

import mixpanel from "mixpanel-browser";

mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

export default function Home({ state, router }) {
  mixpanel.track("VISIT");
  return (
    <div className="page-container">
      <Liquidity />
    </div>
  );
}
