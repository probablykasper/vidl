const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
    let ifProduction = true;
    let ifDevelopment = false;
    if (env == "development") {
        ifProduction = false;
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
                    {
                        test: /\.pug$/,
                        use: "pug-loader",
                    }
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
                arr.push(
                    new HtmlWebpackPlugin({
                        hash: ifDevelopment,
                        inject: false,
                        template: "./src/index.pug",
                        // minify: ifProduction,
                    })
                );
                arr.push(
                    new CopyWebpackPlugin([
                        {from: "./src/favicon", to: ""},
                        {from: "./src/static", to: ""},
                    ])
                );
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
                            use: [
                                "css-loader",
                                {
                                    loader: "sass-loader",
                                    options: {
                                        outputStyle: (() => {
                                            if (ifProduction) {
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
        }
    ]
}
