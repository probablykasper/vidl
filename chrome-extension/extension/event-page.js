var hostURL = "localhost";
var ws, open = false;
function socketConnect(callback) {
    ws = new WebSocket("ws://"+hostURL+"/website-dl");
    ws.onopen = function() {
        if (callback) callback();
    }
}
function socketClose() {
    ws.close();
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    var url;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        url = tabs[0].url;
    });
    socketConnect(function(err) {
        if (err) return;
        var message = {
            url: url,
            format: msg.format
        };
        ws.send(JSON.stringify(message));
        ws.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var type = data.type;
            console.log(data);
            if (type == "err") {
                console.log("err");
            } else if (type == "completed") {
                ws.close();
                console.log("completed");
                chrome.downloads.download({url:"http://"+hostURL+"/dl/"+data.id});
            }
        }
    });
});
