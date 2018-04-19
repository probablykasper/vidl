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
                            use: [
                                "css-loader",
                                {
                                    loader: "sass-loader",
                                    options: {
                                        outputStyle: (() => {
                                            if (ifProd && config.minify) {
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
                    filename: "global.css"
                })
            ]
        },
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
                    {
                        test: /\.pug$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "pug-loader",
                            query: {
                                pretty: !(ifProd && config.minify)
                            }
                        }
                    },
                    {
                        test: /\.js$/,
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
                if (ifProd && config.minify) {
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
                        // hash: ifDev,
                        hash: true,
                        inject: false,
                        template: "./src/index.pug",
                        filename: "index.html",
                    })
                );
                arr.push(
                    new CopyWebpackPlugin([
                        {from: "./src/favicon", to: ""},
                    ])
                );
                return arr;
            })()
        }
    ]
}
