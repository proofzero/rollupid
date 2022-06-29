import "dotenv/config";

export default {
  entryPoint: "./src/index",
  name: "3iD Gateway",
  slug: "3id-gateway",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./src/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./src/assets/favicon.png",
  },
  extra: {
    twitterUrl: process.env.TWITTER_URL,
    discordUrl: process.env.DISCORD_URL,
    discordChannelUrl: process.env.DISCORD_CHANNEL_URL,
    gateRedirectUrl: process.env.GATE_REDIRECT_URL,
    oortSchema: process.env.OORT_SCHEMA,
    oortHost: process.env.OORT_HOST,
    oortPort: process.env.OORT_PORT ? +process.env.OORT_PORT : 8787,
    autoGate: process.env.AUTO_GATE ? Boolean(JSON.parse(process.env.AUTO_GATE)) : false
  },
};
