// packages/sdk-web/webpack.config.js

const path = require("path");
const webpack = require("webpack");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: path.resolve(__dirname, "./lib/com.kubelt.sdk.js"),
  output: {
    path: path.resolve(__dirname, "./lib/"),
    filename: "index.js",
    library: "sdk",
    libraryTarget: "amd",
  },
  /*
  resolve: {
    fallback: {
      fs: false,
    },
  },
  */
  plugins: [
    //new NodePolyfillPlugin(),
    //new webpack.ProvidePlugin({
    //  Buffer: ["buffer", "Buffer"],
    //  process: "process/browser",
    //}),
  ],
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
    config.devtool = "inline-source-map";
  }
  return config;
};
