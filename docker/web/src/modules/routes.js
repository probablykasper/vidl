"use strict";
const fs = require("fs");
const url = require("url");
const crypto = require("crypto");
const base32 = require("base32");
const rimraf = require("rimraf");
const sanitize = require("sanitize-filename");
const ytdl = require('youtube-dl');
function b32(x) {
    return base32.encode(crypto.randomBytes(x, "hex"));
}

module.exports = (app, ws) => {
    // HOME
    app.get("/", (req, res) => {
        res.render("home");
    });
    // DL
    app.get("/dl/:id", (req, res) => {
        fs.readdir(`/usr/src/app/files/${req.params.id}`, (err, files) => {
            for (var i = 0; i < files.length; i++) {
                if (files[i].endsWith(".mp3") || files[i].endsWith(".aac")
                || files[i].endsWith(".mp4")) {
                    res.download(`/usr/src/app/files/${req.params.id}/${files[i]}`);
                }
            }
        });
    });
    // SOCKET
    ws.on("connection", (ws, req) => {
        const ip = req.connection.remoteAddress;
        const path = url.parse(req.url, true).pathname;

        console.log(`socket conn ${path}: ${ip}`);
        if (path == "/website-dl" || path == "/chrome-extension") {
            let callCount = 0;

            ws.on("message", (msgData) => {
                const data = JSON.parse(msgData);
                if (callCount == 0) {
                    socketMsg(ws, data.type, data);
                } else if (data.type == "start") {
                    let message = {
                        type: "err",
                        code: "00002",
                        msg: "already active"
                    };
                    ws.send(JSON.message(message));
                }
                callCount++;
            });
        }
    });
}
function getInfo(url, cbErr, cbSuc) {
    ytdl.getInfo(url, [], (err, info) => {
        if (err) {
            if (err.code == 1) {
                cbErr({
                    type: "err",
                    code: "f0001-1",
                    msg: "invalid url"
                });
            } else {
                console.log("::::: FFMPEG GETINFO UNKNOWN ERROR :::::");
                console.log(err);
                cbErr({
                    type: err,
                    code: "f0001-"+err.code,
                    msg: "unable to get info from url"
                });
            }
        } else {
            cbSuc(info.title, info.uploader, info.webpage_url);
        }
    });
}
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
                type: "err",
                code: "f0002-"+err.code,
                msg: "unknown"
            });
        } else {
            cbSuc();
        }
    });
}
function socketMsg(ws, type, data) {
    const info = {};
    info.format = data.format;
    info.mp3 = (data.format == "mp3") ? true : false;
    info.aac = (data.format == "aac") ? true : false;
    info.mp4 = (data.format == "mp4") ? true : false;
    if (info.mp3 || info.aac || info.mp4) {
        info.id = b32(6);
        info.audioOnly = (info.format != "mp4") ? true : false;
        info.url = data.url;
        getInfo(info.url, (err) => {
            ws.send(JSON.stringify(err));
        }, (title, uploader, url) => {
            info.title = title;
            info.uploader = uploader;
            info.url = url;
            let message = {
                type: "info",
                uploader: info.uploader,
                url: info.url,
                id: info.id
            };
            ws.send(JSON.stringify(message));
            download(info, (err) => {
                ws.send(JSON.stringify(err));
            }, () => {
                let message = {
                    type: "downloaded"
                };
                ws.send(JSON.stringify(message));
                const filename = `files/${info.id}/file.${info.format}`;
                let newFilename = `${sanitize(info.title)}.${info.format}`;
                newFilename = `files/${info.id}/${newFilename}`;
                fs.rename(filename, newFilename, () => {
                    let message = {
                        type: "completed",
                        id: info.id
                    }
                    ws.send(JSON.stringify(message));
                    setTimeout(() => {
                        deleteFile(`files/${info.id}`);
                    }, 1000*60*60);
                });
            });
        });
    } else {
        let message = {
            type: "err",
            code: "00001",
            msg: "invalid format"
        }
        ws.send(JSON.stringify(message));
    }
}
function deleteFile(path) {
    // delete file
    rimraf(path, (err) => {
        if (err) {
            console.log("::::: RIMRAF FOLDER DELETE ERROR :::::");
            console.log(err);
        }
    });
}
