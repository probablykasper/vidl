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
document.addEventListener("keydown", function(e) {
    if (e.which == 13) {
        xhr("", "/start-dl/"+encodeURIComponent(urlBar.value), function(res) {
            if (res.errors) {
                console.log("error");
            } else {
                console.log("done");
                console.log(res);
                window.location = "/dl/"+res.id+".mp3";
            }
        });
    }
});
