// packages/id3-web/webpack.config.js

const path = require("path");
const webpack = require("webpack");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: path.resolve(__dirname, "./lib/com.kubelt.id3.js"),
  output: {
    path: path.resolve(__dirname, "./lib/"),
    filename: "index.js",
    library: "id3",
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
