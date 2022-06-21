const { withSentryConfig } = require("@sentry/nextjs");

const moduleExports = {
  trailingSlash: true,
  env: {
    STORYBLOK_ACCESS_TOKEN: process.env.STORYBLOK_ACCESS_TOKEN,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    MIXPANEL_API_KEY: process.env.MIXPANEL_API_KEY,
    KALLISTO_VAULT_ADDRESS: process.env.KALLISTO_VAULT_ADDRESS,

    QUICK_NODE_ENDPOINT: process.env.QUICK_NODE_ENDPOINT,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,

    REDIS_SERVER_URL: process.env.REDIS_SERVER_URL,
    REDIS_SERVER_PORT: process.env.REDIS_SERVER_PORT,
    REDIS_SERVER_PASSWORD: process.env.REDIS_SERVER_PASSWORD,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.tls = false;
    }

    return config;
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
