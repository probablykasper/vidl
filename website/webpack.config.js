const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = (env) => {
    let ifProduction = true;
    let ifDevelopment = false;
    if (env && env.development) {
        ifProduction = true;
        ifDevelopment = true;
    }
    return [
        {
            entry: "./src/global.js",
            output: {
                path: path.join(__dirname, "./../docs"),
                filename: "global.js",
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ["env"],
                            }
                        },
                    },
                ]
            },
            plugins: (() => {
                let arr = [];
                if (ifProduction) {
                    arr.push(
                        new webpack.optimize.UglifyJsPlugin({
                            compress: {
                                warnings: false,
                                drop_console: false,
                            }
                        })
                    );
                }
                return arr;
            })()
        },
        {
            entry: "./src/global.sass",
            output: {
                path: path.join(__dirname, "./../docs"),
                filename: "global.css",
            },
            module: {
                rules: [
                    {
                        test: /\.sass$/,
                        use: ExtractTextPlugin.extract({
                            // fallback: "syle-loader",
                            use: ["css-loader", "sass-loader"],
                        })
                    }
                ]
            },
            plugins: [
                new ExtractTextPlugin({
                    filename: "global.css"
                })
            ]
        }
    ]
}
