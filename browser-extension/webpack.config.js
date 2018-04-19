const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const config = require("./config");

module.exports = (env) => {
    let ifProd = true;
    let ifDev = false;
    if (env.VIDL_ENV == "dev") {
        ifProd = false;
        ifDev = true;
    } else {
        VIDL_ENV = "prod";
    }
    return [
        {
            entry: "./src/popup.sass",
            output: {
                path: path.join(__dirname, "./dist/chrome"),
                filename: "popup.css",
            },
            module: {
                rules: [
                    {
                        test: /\.sass$/,
                        exclude: /node_modules/,
                        use: ExtractTextPlugin.extract({
                            use: [
                                "css-loader",
                                {
                                    loader: "sass-loader",
                                    options: {
                                        outputStyle: (() => {
                                            if (ifProd) {
                                                return "compressed";
                                            } else {
                                                return "nested"
                                            }
                                        })()
                                    }
                                }
                            ]
                        })
                    }
                ]
            },
            plugins: [
                new ExtractTextPlugin({
                    filename: "popup.css"
                })
            ]
        },
        {
            entry: {
                "event-page": "./src/event-page.js",
                "popup": "./src/popup.js",
            },
            output: {
                path: path.join(__dirname, "./dist/chrome"),
                filename: "[name].js",
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
                    {
                        test: /\.pug$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "pug-loader",
                            query: {
                                pretty: ifDev
                            }
                        }
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: 'string-replace-loader',
                        options: {
                            multiple: [
                                {flags: "g", search: "§VIDL_ENV§", replace: env.VIDL_ENV},
                                {flags: "g", search: "§VIDL_URL_DEV§", replace: config.VIDL_URL_DEV},
                                {flags: "g", search: "§VIDL_URL_PROD§", replace: config.VIDL_URL_PROD},
                                {flags: "g", search: "§VIDL_DL_URL_DEV§", replace: config.VIDL_DL_URL_DEV},
                                {flags: "g", search: "§VIDL_DL_URL_PROD§", replace: config.VIDL_DL_URL_PROD},
                            ]
                        }
                    },
                ]
            },
            plugins: (() => {
                let arr = [];
                if (ifProd) {
                    arr.push(
                        new webpack.optimize.UglifyJsPlugin({
                            compress: {
                                warnings: false,
                                drop_console: false,
                            }
                        })
                    );
                }
                arr.push(
                    new HtmlWebpackPlugin({
                        hash: ifDev,
                        inject: false,
                        template: "./src/popup.pug",
                        filename: "popup.html",
                    })
                );
                arr.push(
                    new CopyWebpackPlugin([
                        {from: "./src/extension-files", to: ""},
                    ])
                );
                return arr;
            })()
        }
    ]
}
