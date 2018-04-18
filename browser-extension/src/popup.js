setInterval(() => {
    window.location.reload();
}, 3000);

let lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) document.querySelector(`button.${lastFormat}`).classList.add("checked");
else {
    lastFormat = "mp3";
    document.querySelector(`button.mp3`).classList.add("checked");
}

const dl = {
    init: format => {
        chrome.runtime.sendMessage({
            format: format,
        });
        // window.close();
    }
};

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("format")) {
        lastFormat = e.target.attributes["data-format"].value;
        localStorage.setItem("lastFormat", lastFormat);
        dl.init(lastFormat);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.which != 13) return;
    dl.init(lastFormat);
});

require("./focus-within-polyfill")("focus-within");
