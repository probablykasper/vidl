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

module.exports = (app, wss) => {
    // HOME
    app.get("/", (req, res) => {
        res.render("home");
    });
    // DL
    app.get("/dl/:id", (req, res) => {
        fs.readdir(`/usr/src/app/files/${req.params.id}`, (err, files) => {
            if (err) {
                console.log("::::: err reading dirrrrr");
                console.log(err);
                res.status(404).end();
            } else if (!files) {
                console.log("::::: filessssss:");
                console.log(files);
                res.status(404).end();
            } else {
                for (var i = 0; i < files.length; i++) {
                    if (files[i].endsWith(".mp3") || files[i].endsWith(".aac")
                    || files[i].endsWith(".mp4")) {
                        res.download(`/usr/src/app/files/${req.params.id}/${files[i]}`);
                    }
                }
            }
        });
    });
    // SOCKET
    wss.on("connection", (ws, req) => {
        const ip = req.connection.remoteAddress;
        console.log(req.connection.remoteAddress);
        const path = url.parse(req.url, true).pathname;
        let open = true;

        console.log(`${path}: ${ip}     OPEN  socket connection`);
        ws.on("close", () => {
            open = false;
            console.log(`${path}: ${ip}     CLOSE socket connection`);
        });
        if (path == "/website-dl" || path == "/chrome-extension") {
            let callCount = 0;
            ws.on("message", (msgData) => {
                const data = JSON.parse(msgData);
                if (callCount == 0) {
                    socketMsg(ws, data, ip, path);
                } else if (data.type == "start") {
                    let message = {
                        type: "err",
                        code: "001",
                        msg: "A download is already active"
                    };
                    res(ws, open, message);
                }
                callCount++;
            });
        }
    });
}
function getInfo(url, ip, path, cbErr, cbSuc) {
    ytdl.getInfo(url, [], (err, info) => {
        if (err) {
            if (err.code == 1) {
                cbErr({
                    type: "err",
                    code: "002",
                    msg: "The URL is invalid"
                });
            } else {
                console.log("::::: FFMPEG GETINFO UNKNOWN ERROR :::::");
                console.log(err);
                cbErr({
                    type: "err",
                    code: "003-"+err.code,
                    msg: `Unable to get info from URL`
                });
            }
        } else {
            console.log(`${path}: ${ip}     ${info.uploader} - ${info.title}`);
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
                code: "004-"+err.code,
                msg: "An unknown error occured"
            });
        } else {
            cbSuc();
        }
    });
}
function res(ws, open, msg) {
    if (open) {
        ws.send(JSON.stringify(msg), (err) => {
            if (err) {
                console.log("Socket send error. Connection probably closed");
                console.log(err);
                ws.terminate();
            }
            if (msg.type == "err") {
                ws.terminate();
            }
        });
    } else {
        console.log("Socket message not sent; Connection closed");
    }
}
function socketMsg(ws, data, ip, path) {
    const info = {};
    info.format = data.format;
    info.mp3 = (data.format == "mp3") ? true : false;
    info.aac = (data.format == "aac") ? true : false;
    info.mp4 = (data.format == "mp4") ? true : false;
    let open = true;
    ws.on("close", () => {
        open = false;
    });
    if (info.mp3 || info.aac || info.mp4) {
        info.id = b32(6);
        info.audioOnly = (info.format != "mp4") ? true : false;
        info.url = data.url;
        console.log(`${path}: ${ip}     ${data.url}`);
        getInfo(info.url, ip, path, (err) => {
            res(ws, open, err);
        }, (title, uploader, url) => {
            info.title = title;
            info.uploader = uploader;
            info.url = url;
            let message = {
                type: "info",
                title: info.title,
                uploader: info.uploader,
                url: info.url,
                id: info.id
            };
            res(ws, open, message);
            download(info, (err) => {
                res(ws, open, err);
            }, () => {
                const filename = `files/${info.id}/file.${info.format}`;
                let newFilename = `${sanitize(info.uploader)} - ${sanitize(info.title)}.${info.format}`;
                newFilename = `files/${info.id}/${newFilename}`;
                fs.rename(filename, newFilename, () => {
                    let message = {
                        type: "completed",
                        id: info.id
                    }
                    res(ws, open, message);
                    setTimeout(() => {
                        deleteFile(`files/${info.id}`);
                        ws.terminate();
                    }, 1000*60*60);
                });
            });
        });
    } else {
        let message = {
            type: "err",
            code: "005",
            msg: "The requested format is invalid"
        }
        res(ws, open, message);
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
