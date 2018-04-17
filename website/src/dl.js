const VIDL_ENV = "§VIDL_ENV§";
const VIDL_URL_DEV = "§VIDL_URL_DEV§";
const VIDL_URL_PROD = "§VIDL_URL_PROD§";
function wsConnect(openCallback, errorCallback) {
    if (VIDL_ENV == "dev") {
        return new WebSocket(VIDL_URL_DEV);
    } else {
        return new WebSocket(VIDL_URL_PROD);
    }
}

const fn = require("./functions.js");

const middleContainer = document.querySelector(".middle-container");
const urlBar = document.querySelector(".url input");
module.exports = {};
module.exports.start = (url, format) => {
    fn.changeToView("loading-view");
    setTimeout(() => {
        fn.changeToView("format-selection");
    }, 2000);

    const ws = wsConnect();
    ws.onerror = () => {
        console.log(9);
    }
    ws.onclose = () => {
        console.log(7);

    }
    ws.onopen = () => {
        console.log(6);
        const message = {
            url: urlBar.value,
            format: format,
        }

    }
    ws.onmessage = () => {
        console.log(8);

    }
}
