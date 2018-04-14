var VIDL_ENV = "production";
if (VIDL_ENV == "production") {
    var hostURL = "vidl.kasp.io";
} else {
    var hostURL = "localhost";
}
function socketConnect(callback) {
    if (VIDL_ENV == "production") {
        ws = new WebSocket("wss://"+hostURL+"/chrome-extension");
    } else {
        ws = new WebSocket("ws://"+hostURL+"/chrome-extension");
    }
    ws.onopen = function() {
        if (callback) callback(ws);
    }
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        startDownload(tabs[0].url, msg.format);
    });
});
chrome.commands.onCommand.addListener(function(command) {
    if (command == "dl_last") {
        var lastFormat = localStorage.getItem("lastFormat");
        if (!lastFormat) lastFormat = "mp3";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            startDownload(tabs[0].url, lastFormat);
        });
    } else if (command == "dl_mp3") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            startDownload(tabs[0].url, "mp3");
        });
    } else if (command == "dl_aac") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            startDownload(tabs[0].url, "aac");
        });
    } else if (command == "dl_mp4") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            startDownload(tabs[0].url, "mp4");
        });
    }
});
var lastNotifId = null;
function notify(title, msg, finalNotif) {
    if (lastNotifId) {
        chrome.notifications.clear(lastNotifId);
        lastNotifId = null;
    }
    chrome.notifications.create({
        type: "basic",
        title: title,
        message: msg,
        iconUrl: "icon128.png"
    }, function(id) {
        if (!finalNotif) lastNotifId = id;
    });
}
function startDownload(url, format) {
    notify("Download Started", "");
    socketConnect(function(ws) {
        var message = {
            url: url,
            format: format
        };
        ws.send(JSON.stringify(message));
        var uploader, title;
        var downloadCount = 0;
        ws.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var type = data.type;
            if (type == "err") {
                console.log("err");
                console.log(data);
                console.log(data.msg);
                notify("Error Downloading Video", data.msg+" Code: "+data.code);
            } else if (type == "info") {
                console.log("info");
                console.log(data);
                uploader = data.uploader;
                title = data.title;
                if (uploader && title) {
                    notify("Download Started", uploader+" - "+title);
                } else if (uploader) {
                    notify("Download Started", uploader);
                } else if (title) {
                    notify("Download Started", title);
                }
            } else if (type == "file") {
                console.log("file");
                console.log(data);
                var notificationTitle = "Download Complete";
                downloadCount++;
                if (!data.lastOne) {
                    notificationTitle = "Download "+downloadCount+" of "+data.totalFiles+" Complete";
                } else {
                    ws.close();
                }
                if (data.uploader && data.title) {
                    notify(notificationTitle, data.uploader+" - "+data.title, true);
                } else if (data.uploader) {
                    notify(notificationTitle, data.uploader, true);
                } else if (data.title) {
                    notify(notificationTitle, data.title, true);
                }
                chrome.downloads.download({url:"http://"+hostURL+"/dl/"+data.id});
            }
        };
    });
}
