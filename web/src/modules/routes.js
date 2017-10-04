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
const ytdl = require('youtube-dl');
module.exports.startDL = (req, res) => {
    const url = req.params.url;
    const fileID = b32(6);
    const args = [
        "--ffmpeg-location",
        "/root/bin/",
        "-x",
        "-o",
        `files/${fileID}.%(ext)s`,
        "--audio-format",
        "mp3",
        "--embed-thumbnail"];
    const dl = ytdl.exec(url, args, {}, function exec(err, output) {
        "use strict";
        if (err) throw err;
        console.log("YER BOY IS DUNN");
        console.log(err);
        console.log(output);
        jsonRes(res, {
            id: fileID
        });
    });
};

module.exports.dl = (req, res) => {
    res.download(`/usr/src/app/files/${req.params.filename}`);
}
