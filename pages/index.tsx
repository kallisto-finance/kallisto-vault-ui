import React from "react";

import Liquidity from "containers/liquidity";

import { getAPY } from 'utils/redis';

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.MIXPANEL_API_KEY)

export default function Home({ state, router, apy }) {

  mixpanel.track("VISIT");
  return (
    <div className="page-container">
      <Liquidity router={router} curveAPY={apy} />
    </div>
  );
}

export async function getServerSideProps() {
  const apy = await getAPY();

  return { props: { apy } }
}