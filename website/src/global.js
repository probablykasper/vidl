let lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) document.querySelector(`button.${lastFormat}`).classList.add("checked");
else {
    lastFormat = "mp3";
    document.querySelector(`button.mp3`).classList.add("checked");
}

require("./focus-within-polyfill")("focus-within");
const dl = require("./dl");

const urlBar = document.querySelector(".url input");

// focus url bar on paste
document.addEventListener("paste", (e) => {
    if (
        !document.activeElement ||
        !document.activeElement.classList ||
        !document.activeElement.classList.contains("url-bar")
    ) {
        urlBar.focus();
    }
});
// focus url bar on keypress
document.addEventListener("keypress", (e) => {
    if (e.which != 13) { //enter
        urlBar.focus();
    }
});
document.addEventListener("keydown", (e) => {
    if (
        e.which == 37 || // arrow left
        e.which == 38 || // arrow up
        e.which == 39 || // arrow right
        e.which == 40 || // arrow down
        e.which == 46 || // delete
        e.which ==  8    // backspace
    ) {
        urlBar.focus();
    }
});

// press enter to download
document.addEventListener("keydown", (e) => {
    if (e.which == 13) {
        if (
            e.target.classList.contains("url-bar") ||
            document.activeElement.nodeName == "BODY"
        ) {
            if (e.which != 13) return; // enter
            dl.init(urlBar.value, lastFormat);
        }
    }
});


// press button to download
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("format")) {
        document.querySelector(`button.${lastFormat}`).classList.remove("checked");
        e.target.classList.add("checked")
        lastFormat = e.target.attributes["data-format"].value;
        localStorage.setItem("lastFormat", lastFormat);
        dl.init(urlBar.value, lastFormat);
    }
});

// press X to go back to format-selection
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("go-back-on-click")) {
        fn.changeToView("format-selection");
    }
});

const isChrome = !!window.chrome && !!window.chrome.webstore;
if (isChrome) {

    const extensionDiv = document.querySelector(".extension.chrome");
    const extensionTooltip = document.querySelector(".extension.chrome .extension-tooltip");
    const svg = extensionDiv.querySelector(".svg");
    svg.addEventListener("mouseenter", () => {
        extensionTooltip.classList.add("visible");
    });
    extensionDiv.addEventListener("mouseleave", () => {
        extensionTooltip.classList.remove("visible");
    });
    extensionDiv.classList.add("visible");

}
