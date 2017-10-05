"use strict";
// express
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
// local modules
require("./modules/compile")();

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

// routes
const routes = require("./modules/routes")(wss);
app.get("/", routes.home);
app.post("/start-dl/:format/:url", routes.startDL);
app.get("/dl/:id", routes.dl);

// start server
server.listen(80, function listening() {
    console.log("Express and WebSocket listening on %d", server.address().port);
});
