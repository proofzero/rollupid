const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const isProduction = process.env.NODE_ENV == 'production';


const config = {
    entry: path.resolve(__dirname, "../sdk-js/lib/sdk.js"),
    output: {
        path: path.resolve(__dirname, 'lib'),
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
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
    } else {
        config.mode = 'development';
        config.devtool = "inline-source-map";
    }
    return config;
};
