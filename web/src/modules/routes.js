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
const sanitize = require("sanitize-filename");
function b32(x) {
    return base32.encode(crypto.randomBytes(x, "hex"));
}

let wss;
const returnExports = {};

returnExports.home = (req, res) => {
    res.render("home");
}

const fs = require('fs');
const ytdl = require('youtube-dl');
function download(res, url, format, id, callback) {
    let audio = false;
    if (format == "mp3" || format == "aac") audio = true;

    const args = ["--ffmpeg-location", "/root/bin/"];
    if (audio) args.push("-x");
    args.push("-o", `files/${id}/file.%(ext)s`);
    args.push("--restrict-filenames");
    if (audio) args.push("--audio-format", format);
    if (audio) args.push("--audio-quality", "0");
    if (!audio) args.push("--format", format);
    if (format == "mp3") args.push("--embed-thumbnail");

    ytdl.exec(url, args, {}, function exec(err, output) {
        if (err) {
            console.log("-------------------- FFMPEG ERROR:");
            console.log(err);
            jsonRes(res, "err", 10002);
        } else {
            callback();
        }
    });
}
function getInfo(res, url, callback) {
    ytdl.getInfo(url, [], (err, info) => {
        if (err) {
            console.log("-------------------- FFMPEG ERROR:");
            console.log(err);
            jsonRes(res, "err", 10003);
        } else {
            callback(info.title);
        }
    });
}
returnExports.startDL = (req, res) => {
    const url = req.params.url;
    const id = b32(6);
    const format = req.params.format;
    if (format == "mp3" || format == "aac" || format == "mp4") {
        getInfo(res, url, (title) => {
            download(res, url, format, id, () => {
                const filename = `files/${id}/file.${format}`;
                let newFilename = `${sanitize(title)}.${format}`;
                newFilename = `files/${id}/${newFilename}`;
                fs.rename(filename, newFilename, () => {
                    jsonRes(res, {
                        id: id
                    });
                });
            });
        });
    } else {
        jsonRes(res, "err", 10001);
    }
};

returnExports.dl = (req, res) => {
    fs.readdir(`/usr/src/app/files/${req.params.id}`, (err, files) => {
        for (var i = 0; i < files.length; i++) {
            if (files[i].endsWith(".mp3") || files[i].endsWith(".aac")
            || files[i].endsWith(".mp4")) {
                res.download(`/usr/src/app/files/${req.params.id}/${files[i]}`);
            }
        }
    });
}

const url = require("url");

module.exports = (wssFromServerJS) => {
    wss = wssFromServerJS;
    wss.on("connection", function connection(ws, req) {
        const location = url.parse(req.url, true);

        ws.on("message", function incoming(message) {
            console.log("received: %s", message);
        });

        ws.send("WOBO");
    });
    return returnExports;
}
