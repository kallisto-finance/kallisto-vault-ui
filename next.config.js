const { withSentryConfig } = require('@sentry/nextjs');

// module.exports = {
//   trailingSlash: true,
//   env: {
//     STORYBLOK_ACCESS_TOKEN: process.env.STORYBLOK_ACCESS_TOKEN,
//     LIQUIDITY_CONTRACT: process.env.LIQUIDITY_CONTRACT,
//   },
// }

const moduleExports = {
  trailingSlash: true,
  env: {
    STORYBLOK_ACCESS_TOKEN: process.env.STORYBLOK_ACCESS_TOKEN,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    LIQUIDITY_CONTRACT: process.env.LIQUIDITY_CONTRACT,
    KUJIRA_AUST_VAULT: process.env.KUJIRA_AUST_VAULT,
    LIQUIDITY_APY: process.env.LIQUIDITY_APY,
    KUJIRA_AUST_APY: process.env.KUJIRA_AUST_APY
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
