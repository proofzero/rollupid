import "dotenv/config";

export default {
  entryPoint: "./src/index",
  name: "3iD Gateway",
  slug: "three-id-gateway",
  version: "1.0.0",
  orientation: "portrait",

  // https://github.com/kubelt/three-id/issues/92

  // Adding the icon property
  // makes Expo generate favicons and
  // application (PWA, iOS, Android)
  // icons based on a single reference image.

  // In order to adapt to user browser style
  // with the application icon
  // we need to remove expo's auto generated
  // icons. This means ejecting or removing
  // this property and handling it via head
  // manipulation.

  // icon: "./src/assets/Favicon.png",

  userInterfaceStyle: "automatic",
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
