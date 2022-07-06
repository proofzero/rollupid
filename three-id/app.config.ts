import "dotenv/config";

export default {
  entryPoint: "./src/index",
  name: "3iD Gateway",
  slug: "three-id-gateway",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/three-id-logo.png",
  userInterfaceStyle: "light",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  extra: {
    twitterUrl: process.env.TWITTER_URL,
    discordUrl: process.env.DISCORD_URL,
    discordChannelUrl: process.env.DISCORD_CHANNEL_URL,
    gateRedirectUrl: process.env.GATE_REDIRECT_URL,
    oortSchema: process.env.OORT_SCHEMA,
    oortHost: process.env.OORT_HOST,
    oortPort: process.env.OORT_PORT ? +process.env.OORT_PORT : 8787,
    autoGate: process.env.AUTO_GATE
      ? Boolean(JSON.parse(process.env.AUTO_GATE))
      : false,
    datadogEnv: process.env.DATADOG_ENV,
    datadogClientToken: process.env.DATADOG_CLIENT_TOKEN,
    datadogApplicationId: process.env.DATADOG_APPLICATION_ID,
    datadogServiceName: process.env.DATADOG_SERVICE_NAME,
  },
};
