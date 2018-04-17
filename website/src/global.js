require("./focus-within-polyfill")("focus-within");
const dl = require("./dl");

// setTimeout(() => {
//     fn.changeToView("loading-view");
// }, 100);

let lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) document.querySelector(`button.${lastFormat}`).classList.add("checked");
else {
    lastFormat = "mp3";
    document.querySelector(`button.mp3`).classList.add("checked");
}

const urlBar = document.querySelector(".url input");

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("format")) {
        document.querySelector(`button.${lastFormat}`).classList.remove("checked");
        e.target.classList.add("checked")
        lastFormat = e.target.attributes["data-format"].value;
        localStorage.setItem("lastFormat", lastFormat);
        dl.start(urlBar.value, lastFormat);
    }
});

document.addEventListener("keydown", (e) => {
    if (
        e.which != 13 && // enter
        e.which != 9 && // tab
        e.which != 32 && // space
        e.which != 16 // shift
    ) {
        urlBar.focus();
    }
    if (e.target.classList.contains("url-bar")) {
        if (e.which != 13) return; // enter
        dl.start(urlBar.value, lastFormat);
    }
});



const isChrome = !!window.chrome && !!window.chrome.webstore;
if (isChrome) {

    const extLink = "https://chrome.google.com/webstore/detail/ofojemljpdnbfmjenigkncgofkcoacag";
    const extensionDiv = document.querySelector(".extension.chrome");
    const svg = extensionDiv.querySelector("svg");
    svg.addEventListener("click", function() {
        chrome.webstore.install(extLink, function(suc) {
            console.log(suc);
        }, function(err) {
            console.log(err);
        });
    });
    extensionDiv.classList.add("visible");

}
