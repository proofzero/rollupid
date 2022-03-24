const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';

const config = {
    entry: path.resolve(__dirname, "../sdk-js/lib/sdk.js"),
    output: {
        path: path.resolve(__dirname, "./lib/"),
        filename: "index.js",
        library: "sdk",
        libraryTarget: "amd",
    },
    resolve: {
        fallback: {
            "fs": false
        },
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
        new NodePolyfillPlugin()
    ],
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';


    } else {
        config.mode = 'development';
        config.devtool = 'inline-source-map'
    }
    return config;
};
