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
app.use("/", express.static("static", { redirect: false }));
app.use("/", express.static("static/favicon", { redirect: false }));

// routes
const routes = require("./modules/routes");
app.get("/", routes.home);
app.post("/download", routes.download);

// start server
app.listen(80, function() {
    console.log("Express server listening");
});
