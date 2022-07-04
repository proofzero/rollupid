import "dotenv/config";

export default {
  entryPoint: "./src/index",
  name: "3iD Gateway",
  slug: "three-id-gateway",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/android-chrome-512x512.png",
  userInterfaceStyle: "light",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/android-chrome-512x512.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./src/assets/favicon-32x32.png",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
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
