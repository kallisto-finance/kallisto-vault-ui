import React from "react";

import DashboardContainer from "containers/dashboard";

import mixpanel from "mixpanel-browser";
mixpanel.init("f5f9ce712e36f5677629c9059c20f3dc");

export default function Dashboard({ state, router }) {
  mixpanel.track("VISIT");
  return (
    <div className="page-container">
      <DashboardContainer />
    </div>
  );
}
