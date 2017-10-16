var hostURL = "vidl.kasp.io";
function socketConnect(callback) {
    ws = new WebSocket("ws://"+hostURL+"/chrome-extension");
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
function startDownload(url, format) {
    socketConnect(function(ws) {
        var message = {
            url: url,
            format: format
        };
        ws.send(JSON.stringify(message));
        ws.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var type = data.type;
            if (type == "err") {
                console.log("err");
                console.log(data);
            } else if (type == "info") {
                console.log("info");
                console.log(data);
            } else if (type == "downloaded") {
                console.log("downloaded");
                console.log(data);
            } else if (type == "completed") {
                console.log("completed");
                chrome.downloads.download({url:"http://"+hostURL+"/dl/"+data.id});
            }
        };
    });
}
