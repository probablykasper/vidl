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
const fs = require('fs');

const base32 = require("base32");
const sanitize = require("sanitize-filename");
const ytdl = require('youtube-dl');
function b32(x) {
    return base32.encode(crypto.randomBytes(x, "hex"));
}

module.exports.home = (req, res) => {
    res.render("home");
}

// module.exports.dl = (req, res) => {
//     fs.readdir(`/usr/src/app/files/${req.params.id}`, (err, files) => {
//         for (var i = 0; i < files.length; i++) {
//             if (files[i].endsWith(".mp3") || files[i].endsWith(".aac")
//             || files[i].endsWith(".mp4")) {
//                 res.download(`/usr/src/app/files/${req.params.id}/${files[i]}`);
//             }
//         }
//     });
// }

function download(info, cbErr, cbSuc) {
    const args = ["--ffmpeg-location", "/root/bin/"];
    if (info.audioOnly) args.push("-x");
    args.push("-o", `files/${info.id}/file.%(ext)s`);
    args.push("--restrict-filenames");
    if (info.audioOnly) args.push("--audio-format", info.format);
    if (info.audioOnly) args.push("--audio-quality", "0");
    if (!info.audioOnly) args.push("--format", info.format);
    if (info.mp3) args.push("--embed-thumbnail");

    ytdl.exec(info.url, args, {}, function exec(err, output) {
        if (err) {
            console.log("::::: FFMPEG GETINFO UNKNOWN ERROR :::::");
            console.log(err);
            cbErr({
                code: "f0002-"+err.code,
                msg: "unknown"
            });
        } else {
            cbSuc();
        }
    });
}



function getInfo(url, cbErr, cbSuc) {
    ytdl.getInfo(url, [], (err, info) => {
        if (err) {
            if (err.code == 1) {
                cbErr({
                    code: "f0001-1",
                    msg: "invalidURL"
                });
            } else {
                console.log("::::: FFMPEG GETINFO UNKNOWN ERROR :::::");
                console.log(err);
                cbErr({
                    code: "f0001-"+err.code,
                    msg: "unknown"
                });
            }
        } else {
            cbSuc(info.title, info.uploader, info.webpage_url);
        }
    });
}

module.exports.io = (socket) => {
    console.log(`socket conn: ${socket.id}`);
    let callCount = 0;
    socket.on("start-dl", (data) => {
        const info = {};
        info.format = data.format;
        info.mp3 = (info.format == "mp3") ? true : false;
        info.aac = (info.format == "aac") ? true : false;
        info.webm = (info.format == "webm") ? true : false;
        if (callCount == 0 && (info.mp3 || info.aac || info.webm)) {
            callCount++;
            info.id = b32(6);
            info.audioOnly = (info.format != "webm") ? true : false;
            info.url = data.url;
            getInfo(info.url, (err) => {
                socket.emit("err", err);
            }, (title, uploader, url) => {
                info.title = title;
                info.uploader = uploader;
                info.url = url;
                socket.emit("info", {
                    title: title,
                    uploader: uploader,
                    url: url,
                    id: info.id
                });
                download(info, (err) => {
                    socket.emit("err", err);
                }, () => {
                    socket.emit("downloaded");
                    const filename = `files/${info.id}/file.${info.format}`;
                    let newFilename = `${sanitize(info.title)}.${info.format}`;
                    newFilename = `files/${info.id}/${newFilename}`;
                    fs.rename(filename, newFilename, () => {
                        socket.emit("completed");
                    });
                });
            });
        } else {
            socket.emit("err", {
                code: "00001",
                msg: "invalidFormat"
            });
        }
    });
};
