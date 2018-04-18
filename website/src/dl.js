const VIDL_ENV = "§VIDL_ENV§";
const VIDL_URL = (() => {
    if (VIDL_ENV == "dev") return "§VIDL_URL_PROD§"
    else return "§VIDL_URL_PROD§";
})();
const VIDL_DL_URL = (() => {
    if (VIDL_ENV == "dev") return "§VIDL_DL_URL_PROD§"
    else return "§VIDL_DL_URL_PROD§";
})();

const fn = require("./functions.js");

const middleContainer = document.querySelector(".middle-container");
const urlBar = document.querySelector(".url input");
const dlLink = document.querySelector("a.dl-link");
module.exports = {};
// fn.changeToView("error-view");
module.exports.init = (url, format) => {
    if (fn.getCurrentView() == "loading-view") return;
    fn.changeToView("loading-view");
    // setTimeout(() => {
    //     fn.changeToView("format-selection");
    // }, 2000);

    const ws = new WebSocket(VIDL_URL);
    ws.onclose = (e) => {
        if (fn.getCurrentView() == "loading-view") {
            console.log("ws err - The server connection closed unexpectedly.");
            console.log(e);
            fn.showError(e.code, "The server connection closed unexpectedly.");
        }
    }
    ws.onopen = (e) => {
        console.log("ws open");
        console.log(e);
        const message = {
            url: urlBar.value,
            format: format,
        }
        ws.send(JSON.stringify(message));
    }
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const type = data.type;
        if (type == "err") {
            console.log(`vidl err - ${data.msg}`);
            console.log(data);
            fn.showError(data.code, data.msg);
            ws.close();
        } else if (type == "info") {
            console.log("info");
            console.log(data);
            if (data.title) fn.showTitle(data.title);
            if (data.uploader) fn.showTitle(data.uploader);
        } else if (type == "file") {
            console.log("file");
            console.log(data);
            dlLink.setAttribute("href", VIDL_DL_URL+data.id);
            dlLink.click();
            if (data.lastFile) {
                fn.changeToView("success-view");
                ws.close();
                setTimeout(() => {
                    fn.changeToView("format-selection");
                }, 1000);
            }
        }
    }
}
