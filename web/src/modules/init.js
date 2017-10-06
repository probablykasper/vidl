const fs = require('fs');
const rimraf = require("rimraf");
module.exports = () => {
    fs.readdir("files", (err, files) => {
        if (files) {
            for (var i = 0; i < files.length; i++) {
                rimraf(`files/${files[i]}`, (err) => {
                    if (err) {
                        console.log("::::: RIMRAF INIT DELETE FILES ERROR :::::");
                        console.log("::::: init.js");
                        console.log(err);
                    }
                });
            }
        } else {
            console.log("::::: COULD NOT READ files DIR :::::");
            console.log("::::: init.js");
            console.log(err);
        }
    });
}
