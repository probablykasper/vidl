"use strict";
// express
const express = require("express");
const app = express();
// local modules
if (process.env.VIDL_PRODUCTION == "dev") require("./modules/compile")();
require("./modules/init")();

// load view engine
app.set("views", "pug");
app.set("view engine", "pug");

// static content
const bodyParser = require("body-parser");
app.use("/", express.static("static", { redirect: false }));
app.use("/", express.static("static/favicon", { redirect: false }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// start server
const server = app.listen(80, () => {
    console.log("Express server listening on 80");
});

const WebSocket = require("ws");
const wss = new WebSocket.Server({server});

// routes
require("./modules/routes")(app, wss);
