import React from "react";

import MigrationHome from "containers/migration";

import mixpanel from "mixpanel-browser";
mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

export default function Home({ state, router }) {
  mixpanel.track("VISIT");
  return (
    <div className="page-container">
      <MigrationHome />
    </div>
  );
}
