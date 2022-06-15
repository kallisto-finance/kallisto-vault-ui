const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  trailingSlash: true,
  env: {
    STORYBLOK_ACCESS_TOKEN: process.env.STORYBLOK_ACCESS_TOKEN,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    MIXPANEL_API_KEY: process.env.MIXPANEL_API_KEY,
    KALLISTO_VAULT_ADDRESS: process.env.KALLISTO_VAULT_ADDRESS,
    QUICK_NODE_ENDPOINT: process.env.QUICK_NODE_ENDPOINT
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
