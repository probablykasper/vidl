"use strict";
const fs = require("fs");
const url = require("url");
const crypto = require("crypto");
const base32 = require("base32");
const rimraf = require("rimraf");
const sanitize = require("sanitize-filename");
const ytdl = require('youtube-dl');
const ffmetadata = require("ffmetadata");
function b32(x) {
    return base32.encode(crypto.randomBytes(x, "hex"));
}

module.exports = (app, wss) => {
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
                        msg: "A download is already active."
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
                    msg: "The URL is invalid."
                });
            } else {
                console.log("::::: FFMPEG GETINFO UNKNOWN ERROR :::::");
                console.log(err);
                cbErr({
                    type: "err",
                    code: "003-"+err.code,
                    msg: `Unable to get info from URL.`
                });
            }
        } else {
            var infos = [];
            if (Array.isArray(info)) infos = info;
            else infos[0] = info;
            cbSuc(infos);
        }
    });
}
function download(info, cbErr, cbSuc, filename) {
    const args = ["--ffmpeg-location", "/root/bin/"];
    if (info.audioOnly) args.push("-x");

    const uploaderAndTitle = sanitize(info.uploader+" - "+info.title);
    console.log("__--_----++++++uploaderAndTitle");
    console.log(info.uploader);
    console.log(info.title);
    console.log(uploaderAndTitle);
    filename = `files/${info.id}-${info.index}/x${uploaderAndTitle}.%(ext)s`;
    args.push("-o", filename);

    // args.push("--restrict-filenames");
    if (info.audioOnly) args.push("--audio-format", info.format);
    if (info.audioOnly) args.push("--audio-quality", "0");
    if (!info.audioOnly) args.push("--format", info.format);
    if (info.mp3) args.push("--embed-thumbnail");
    ytdl.exec(info.url, args, {}, function exec(err, output) {
        if (err) {
            console.log("::::: FFMPEG DOWNLOAD UNKNOWN ERROR :::::");
            console.log(err);
            let msg = "";
            if (err.code == 1) {
                msg = `The format "${info.format}" not available for this URL.`
            } else {
                msg = "An unknown error occured."
            }
            cbErr({
                type: "err",
                code: "004-"+err.code,
                msg: msg
            });
        } else {
            changeMD(info, `files/${info.id}-${info.index}`, cbErr, cbSuc);
        }
    });
}
function changeMD(info, dir, cbErr, cbSuc) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.log("::::: err reading dir to change md");
            console.log(err);
            cbErr({
                type: "err",
                code: "006-"+err.code,
                msg: "Unable to read the directory the downloaded file is in",
            });
        } else if (!files) {
            console.log("::::: err no files to change md");
            console.log(files);
            cbErr({
                type: "err",
                code: "007-"+err.code,
                msg: "No files returned when reading directory the downloaded file is in",
            });
        } else {
            for (var i = 0; i < files.length; i++) {
                if (files[i].endsWith(".mp3") || files[i].endsWith(".aac")
                || files[i].endsWith(".mp4")) {
                    const cmd = require("node-cmd");
                    let md = `-metadata title="${info.title}" `;
                    md += `-metadata artist="${info.uploader}" `;
                    // if (info.multiple) md += `-metadata track="${info.index}/${info.fileCount}" `;
                    const file = files[i];
                    cmd.get(
                        `~/bin/ffmpeg -i '${dir}/${file}' ${md} '${dir}/${file.substr(1)}' -y`,
                        (err, data, stderr) => {
                            if (err) {
                                cbErr({
                                    type: "err",
                                    code: "008",
                                    msg: "Could not execute ffmpeg metadata command, node-cmd error",
                                });
                            } else if (!stderr) {
                                cbErr({
                                    type: "err",
                                    code: "009",
                                    msg: "Could not execute ffmpeg metadata command, node-cmd error",
                                });
                            } else {
                                fs.unlink(`${dir}/${file}`, err => {
                                    if (err) {
                                        console.log("::::: DELETEFOLDER x ERROR :::::");
                                        console.log(err);
                                        cbErr({
                                            type: "err",
                                            code: "008-"+err.code,
                                            msg: "Error deleting temp file",
                                        });
                                    } else {
                                        cbSuc();
                                    }
                                });
                            }
                        }
                    );
                }
            }
        }
    });
}
function res(ws, open, msg, callback) {
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
            if (callback) callback();
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
        }, (infos) => {
            let message = {
                type: "info",
                url: infos[0].url,
                id: infos[0].id,
            }
            if (infos.length == 1) {
                message.title    = infos[0].title;
                message.uploader = infos[0].uploader;
                message.multiple = false;
            } else {
                message.multiple = true;
            }
            res(ws, open, message);
            let filesDownloaded = 0;
            function anotherFileDownloaded() {
                filesDownloaded++;
                return (filesDownloaded == infos.length);
            }
            info.totalFiles = infos.length;
            let i = 0;
            function startADownload() {
                const index = i+1;
                console.log(`${path}: ${ip}     ${infos[i].uploader} - ${infos[i].title}`);
                const downloadInfo = {
                    title:      infos[i].title,
                    uploader:   infos[i].uploader,
                    url:        infos[i].webpage_url,
                    format:     info.format,
                    audioOnly:  info.audioOnly,
                    mp3:        info.mp3,
                    aac:        info.aac,
                    mp4:        info.mp4,
                    id:         info.id,
                    index:      index,
                    fileCount:   infos[i].length,
                };

                downloadInfo.uploader = infos[i].uploader;
                downloadInfo.title = infos[i].title;
                if (downloadInfo.title.indexOf(" - ") >= 1) {
                    downloadInfo.uploader = downloadInfo.title.substr(0, downloadInfo.title.indexOf(" - "));
                    downloadInfo.title = downloadInfo.title.substr(downloadInfo.title.indexOf(" - ")+3);
                }

                download(downloadInfo, (err) => {
                    anotherFileDownloaded();
                    res(ws, open, err);
                }, () => {
                    i++;
                    if (i < infos.length) startADownload();
                    const lastFile = anotherFileDownloaded();
                    let message = {
                        type: "file",
                        id: `${info.id}-${index}`,
                        lastFile: lastFile,
                        totalFiles: info.totalFiles,
                        title:      downloadInfo.title,
                        uploader:   downloadInfo.uploader,
                    }
                    res(ws, open, message, () => {
                        if (lastFile) {
                            setTimeout(() => {
                                ws.terminate();
                            }, 1000*1);
                        }
                    });
                    setTimeout(() => {
                        deleteFile(`files/${info.id}-${index}`);
                    }, 1000*60*60);
                    // });
                });
            }
            startADownload();
        });
    } else {
        let message = {
            type: "err",
            code: "005",
            msg: "The requested format is invalid."
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
