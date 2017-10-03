"use strict";
function jsonRes(res, one, two) {
    let resObj = {};
    if (one == "err") {
        resObj.errors = two;
    } else {
        if (one) resObj = one;
        one.errors = null;
    }
    res.json(resObj);
}
const crypto = require("crypto");
const base32 = require("base32");
function b32(x) {
    return base32.encode(crypto.randomBytes(x, "hex"));
}

module.exports.home = (req, res) => {
    res.render("home");
}

const fs = require('fs');
module.exports.download = (req, res) => {

}

const ytdl = require('youtube-dl');
const url = "https://www.youtube.com/watch?v=dvsOfsMlT3M";
const args = ["-o", `files/${b32(6)}.%(ext)s`];
ytdl.exec(url, args, {}, function exec(err, output) {
    "use strict";
    if (err) {
        throw err;
    }
    console.log(output.join("\n"));
});


// const args = ["-x", "--audio-format", "mp3"];
// const dl = ytdl.exec(url, args, {}, (err, output) => {
//     console.log("DONE?");
//     console.log(err);
//     console.log(output);
// });
// dl.on("info", (info) => {
//     console.log("DL start");
//     console.log(info.title);
//     dl.pipe(fs.createWriteStream(`files/${info.id}.${info.ext}`));
//     dl.on("end", () => {
//         console.log("ENDED");
//     });
// });
