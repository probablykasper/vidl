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
app.post("/start-dl/:url", routes.startDL);
app.get("/dl/:filename", routes.dl);

// start server
app.listen(80, function() {
    console.log("Express server listening");
});
