let lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) document.querySelector(`button.${lastFormat}`).classList.add("checked");
else {
    lastFormat = "mp3";
    document.querySelector(`button.mp3`).classList.add("checked");
}

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("format")) {
        document.querySelector(`button.${lastFormat}`).classList.remove("checked");
        lastFormat = e.target.attributes["data-format"].value;
        localStorage.setItem("lastFormat", lastFormat);
        startDownload();
    }
});

function startDownload() {
    changeToView("loading-view");
}
