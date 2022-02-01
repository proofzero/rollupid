const path = require("path");
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const paths = {
  // Source files
  src: path.resolve(__dirname, "./lib/com.kubelt.sdk.js"),

  // Production build files
  build: path.resolve(__dirname, "./lib"),
};

module.exports = {
  entry: paths.src,
  mode: "development",
  devtool: "source-map",
  output: {
    path: paths.build,
    filename: "index.js",
  },
  plugins: [
    new NodePolyfillPlugin(),

    //new webpack.ProvidePlugin({
      //Buffer: ["buffer", "Buffer"],
      //process: "process/browser",
    //}),
  ],
  devtool: 'inline-source-map',
  resolve: {
    modules: [paths.src, "node_modules"],
    extensions: [".tsx", ".ts", ".js", ".json"],
    //alias: {
      //"@": paths.src,
    //},
  },
  //target: "node",
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
            ],
            plugins: [["@babel/plugin-transform-runtime"],],
          },
        },
      },
    ],
  },
};
