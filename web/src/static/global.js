$(document).ready(function() {



$(".middle").css({
    opacity: 1
});

var lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) $("#"+lastFormat).addClass("checked");
else $("#mp3").addClass("checked");

$("button.format").on("click", function(e) {
    $("button.format").removeClass("checked");
    $(this).addClass("checked");
    lastFormat = $("button.format.checked")[0].id;
    localStorage.setItem("lastFormat", lastFormat);
    start();
});

$("input.url").focus();
$(document).on("keydown", function(e) {
    if (
        e.which != 13 && // enter
        e.which != 9 && // tab
        e.which != 32 && // space
        e.which != 16 // shift
    ) {
        $("input.url").focus();
    }
});
$("input.url").on("keydown", function(e) {
    if (e.which != 13) return; // enter
    start();
});

var ws, open = false;
function socketConnect(callback) {
    ws = new WebSocket("wss://"+window.location.hostname+"/website-dl");
    ws.onopen = function() {
        if (callback) callback();
    }
}

function start() {
    var format = $("button.format.checked")[0].id;
    console.log(format);
    var middleDiv = document.querySelector(".middle");
    middleDiv.id = "loading";
    middleDiv.classList.add("loading");
    socketConnect(function(err) {
        if (err) return;
        var message = {
            url: $("input.url")[0].value,
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
            if (type == "err") {
                ws.close();
                console.log("err");
                console.log(data);
                console.log(data.msg);
                if (data.msg == "invalid url") {
                    errorMsgP.innerHTML = data.msg;
                    errorCodeP.innerHTML = "Code: "+data.code;
                } else {
                    errorMsgP.innerHTML = data.msg;
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
            } else if (type == "completed") {
                middleDiv.id = "success";
                ws.close();
                console.log("completed");
                console.log(data);
                setTimeout(function() {
                    middleDiv.classList.remove("loading");
                }, 300);
                window.location = "/dl/"+data.id;
                $("input.url")[0].classList.remove("locked");
                $("input.url")[0].removeAttribute("readonly");
                setTimeout(function() {
                    middleDiv.id = "options";
                }, 1000);
            }
        }
        ws.onclose = function(e) {
            if (middleDiv.id != "success" && middleDiv.id != "error") {
                console.log("err - connection closed unexpectedly");
                console.log(e);
                errorMsgP.innerHTML = "The server connection closed unexpectedly";
                errorCodeP.innerHTML = "Code: "+e.code;
                middleDiv.id = "error";
                setTimeout(function() {
                    middleDiv.classList.remove("loading");
                }, 300);
            }
        }
    });
}

(function browserTests() {
    // Opera 8.0+
    window.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    window.isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari 3.0+ "[object HTMLElementConstructor]"
    window.isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    // Internet Explorer 6-11
    window.isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    window.isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    window.isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    window.isBlink = (isChrome || isOpera) && !!window.CSS;
})();

if (isChrome) {
    var extensionDiv = document.querySelector(".chrome-extension");
    extensionDiv.classList.add("visible");
    var svg = extensionDiv.querySelector("svg");
    svg.addEventListener("click", function() {
        var extLink = "https://chrome.google.com/webstore/detail/ofojemljpdnbfmjenigkncgofkcoacag";
        chrome.webstore.install(extLink, function(suc) {
            console.log(suc);
        }, function(err) {
            console.log(err);
        });
    });
}



});
