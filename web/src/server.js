"use strict";
// express
const express = require("express");
const app = express();
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
const routes = require("./modules/routes");
app.get("/", routes.home);
// app.post("/start-dl/:format/:url", routes.startDL);
// app.get("/dl/:id", routes.dl);

// start server
var server = app.listen(80, () => {
    console.log("Express server listening on 80");
});

// socket setup
const socket = require("socket.io");
var io = socket(server);
io.on("connection", routes.io);
