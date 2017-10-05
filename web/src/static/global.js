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

function xhr(reqContent, url, callback, options = {}) {
    var xhr = new XMLHttpRequest();
    if (options.type == undefined)        options.type = "POST";
    if (options.contentType == undefined) options.contentType = "values";
    if (options.parseJSON == undefined) options.parseJSON = true;
    xhr.open(options.type, url, true);
    xhr.send(reqContent);
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            var res = JSON.parse(this.responseText);
            if (!options.parseJSON) res = this.responseText;
            if      (this.status == 200) callback(res, false);
            else if (this.status == 404) callback(res, 404);
        }
    };
}

var urlBar = document.querySelector("input.url");
urlBar.addEventListener("keydown", function(e) {
    if (e.which == 13) {
        var middleDiv = document.querySelector(".middle");
        middleDiv.id = "loading";
        middleDiv.classList.add("loading");
        var format = updateLastFormat();
        xhr("", "/start-dl/"+format+"/"+encodeURIComponent(urlBar.value), function(res) {
            if (res.errors) {
                console.log("error");
                console.log(res.errors);
            } else {
                window.location = "/dl/"+res.id;
                middleDiv.id = "success";
                setTimeout(function() {
                    middleDiv.classList.remove("loading");
                }, 300);
                setTimeout(function() {
                    middleDiv.id = "options";
                }, 1000);
            }
        });
    }
    var socket = new WebSocket("ws://"+window.location.hostname+"/hello");
});
