const path = require("path");
const webpack = require("webpack");
//const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const paths = {
  // Source files
  src: path.resolve(__dirname, "../sdk-npm/lib/com.kubelt.sdk.js"),

  // Production build files
  build: path.resolve(__dirname, "./lib"),
};

// TODO: make a production and dev build target
module.exports = {
  entry: paths.src,
  mode: "development",
  output: {
    path: paths.build,
    filename: "index.js",
    library: "sdk",
    libraryTarget: "commonjs2",
  },
  plugins: [
    //new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  devtool: "inline-source-map",
};
