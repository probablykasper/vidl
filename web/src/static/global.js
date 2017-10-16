var lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) {
    document.querySelector("#"+lastFormat).checked = true;
} else {
    document.querySelector("#mp3").checked = true;
}
function updateLastFormat() {
    var format = "";
    var inputs = document.querySelectorAll(".options input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            format = inputs[i].id;
        }
    }
    localStorage.setItem("lastFormat", format);
    return format;
}
document.addEventListener("click", function() {
    updateLastFormat();
});

var ws, open = false;
function socketConnect(callback) {
    ws = new WebSocket("ws://"+window.location.hostname+"/website-dl");
    ws.onopen = function() {
        if (callback) callback();
    }
}
function socketClose() {
    ws.close();
}
var urlBar = document.querySelector("input.url");
urlBar.focus();
urlBar.addEventListener("keydown", function(e) {
    if (e.which != 13) return;
    var format = updateLastFormat();
    var middleDiv = document.querySelector(".middle");
    middleDiv.id = "loading";
    middleDiv.classList.add("loading");
    socketConnect(function(err) {
        if (err) return;
        var message = {
            url: urlBar.value,
            format: format
        };
        ws.send(JSON.stringify(message));
        var errorMsgP = document.querySelector("p.errorMsg");
        var errorCodeP = document.querySelector("p.errorCode");
        var titleP = document.querySelector("p.title");
        var uploaderP = document.querySelector("p.uploader");
        ws.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var type = data.type;
            console.log(data);
            if (type == "err") {
                ws.close();
                console.log("err");
                console.log(data);
                if (data.msg == "invalid url") {
                    errorMsgP.innerHTML = "The URL is not valid";
                    errorCodeP.innerHTML = "Code: "+data.code;
                } else {
                    errorMsgP.innerHTML = "An unknown error occured";
                    errorCodeP.innerHTML = "Code: "+data.code;
                }
                middleDiv.id = "error";
                setTimeout(function() {
                    middleDiv.classList.remove("loading");
                }, 300);
            } else if (type == "info") {
                console.log("info");
                console.log(data);
                titleP.innerHTML = data.title;
                uploaderP.innerHTML = data.uploader;
                if (data.title) titleP.classList.add("visible");
                if (data.uploader) uploaderP.classList.add("visible");
            } else if (type == "downloaded") {
                console.log("downloaded");
                console.log(data);
            } else if (type == "completed") {
                ws.close();
                console.log("completed");
                console.log(data);
                middleDiv.id = "success";
                setTimeout(function() {
                    middleDiv.classList.remove("loading");
                }, 300);
                window.location = "/dl/"+data.id;
                urlBar.classList.remove("locked");
                urlBar.removeAttribute("readonly");
                setTimeout(function() {
                    middleDiv.id = "options";
                }, 1000);
            }
        }
    });
});

if (chrome && chrome.webstore && chrome.webstore.install) {
    var chromeExtensionDiv = document.querySelector(".chrome-extension");
    chromeExtensionDiv.classList.add("visible");
    var svg = chromeExtensionDiv.querySelector(" svg");
    svg.addEventListener("click", function() {
        var extLink = "https://chrome.google.com/webstore/detail/ofojemljpdnbfmjenigkncgofkcoacag";
        chrome.webstore.install(extLink, function(suc) {
            console.log(suc);
        }, function(err) {
            console.log(err);
        });
    });
}
