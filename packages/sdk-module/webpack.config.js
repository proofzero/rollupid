const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "../sdk-js/lib/sdk.js",
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "index.js",
  },
  plugins: [new NodePolyfillPlugin()],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
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
          },
        },
      },
    ],
  },
};
