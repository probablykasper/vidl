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

var urlBar = document.querySelector("input.url");
function socketConnect() {
    socket = io.connect("http://"+window.location.hostname);
}
socketConnect();
function DLfinished(socket) {
    socket.close();
    activeDL = false;
}
var activeDL = false;
urlBar.addEventListener("keydown", function(e) {
    if (e.which == 13) {
        if (!activeDL) {
            activeDL = true;

            var middleDiv = document.querySelector(".middle");
            middleDiv.id = "loading";
            middleDiv.classList.add("loading");
            var format = updateLastFormat();

            urlBar.classList.add("locked");
            urlBar.setAttribute("readonly", "");

            socket.emit("start-dl", {
                url: urlBar.value,
                format: format
            });
            var errorMsgP = document.querySelector("p.errorMsg");
            var errorCodeP = document.querySelector("p.errorCode");
            socket.on("err", function(data) {
                DLfinished(socket);
                console.log("err");
                console.log(data);
                if (data.msg == "invalidURL") {
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
            });
            var titleP = document.querySelector("p.title");
            var uploaderP = document.querySelector("p.uploader");
            socket.on("info", function(data) {
                console.log("info");
                console.log(data);
                titleP.innerHTML = data.title;
                uploaderP.innerHTML = data.uploader;
                if (data.title) titleP.classList.add("visible");
                if (data.uploader) uploaderP.classList.add("visible");
            });
            socket.on("downloaded", function(data) {
                console.log("downloaded");
                console.log(data);
            });
            socket.on("completed", function(data) {
                DLfinished(socket);
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
                    socketConnect();
                }, 1000);
            });
        }
    }
});
