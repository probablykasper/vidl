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
        window.close();
    }
};

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("format")) {
        dl.init(e.target.attributes["data-format"].value);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.which != 13) return;
    dl.init(lastFormat);
});

function removeAutoFocus(e) {
    if (e.target.classList.contains("invisible-button")) {
        e.target.style.display = "none";
        document.removeEventListener("focus", removeAutoFocus);
    }
}
document.addEventListener("focus", removeAutoFocus, true);

require("./focus-within-polyfill")("focus-within");
