const VIDL_ENV = "§VIDL_ENV§";
const VIDL_URL = (() => {
    if (VIDL_ENV == "dev") return "§VIDL_URL_PROD§"
    else return "§VIDL_URL_PROD§";
})();
const VIDL_DL_URL = (() => {
    if (VIDL_ENV == "dev") return "§VIDL_DL_URL_PROD§"
    else return "§VIDL_DL_URL_PROD§";
})();

// init from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        dl.init(tabs[0].url, msg.format);
    });
});

// init from shortcut
chrome.commands.onCommand.addListener(command => {
    let format;
    if (command == "dl_last") {
        format = localStorage.getItem("lastFormat");
        if (!format) format = "mp3";
    } else if (command == "dl_mp3") {
        format = "mp3";
    } else if (command == "dl_mp4") {
        format = "mp4";
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        dl.init(tabs[0].url, format, tabs[0].title);
    });
});

let lastNotifId = null;
function notify(title, msg, id, lastNotif) {
    chrome.notifications.clear(id, () => {
        chrome.notifications.create(id, {
            type: "basic",
            title: title,
            message: msg,
            iconUrl: "icon128.png",
        });
    });
}

let idIndex = 0;
const getId = () => String(idIndex++);

const dl = {};
dl.init = (url, format, pageTitle) => {
    const id = getId();
    notify("Download Started", null, id);
    let finished = false;
    let downloadCount = 0;

    const ws = new WebSocket(VIDL_URL);
    ws.onclose = (e) => {
        if (!finished) {
            console.log("ws err - The server connection closed unexpectedly.");
            console.log(e);
            const msg = "The server connection closed unexpectedly.";
            notify("Error Downloading Video", msg+" Code: "+e.code, id, true);
        }
    }
    ws.onopen = (e) => {
        console.log("ws open");
        console.log(e);
        const message = {
            url: url,
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
            notify("Error Downloading Video", data.msg+" Code: "+data.code, id, true);
            finished = true;
            ws.close();
        } else if (type == "info") {
            console.log("info");
            console.log(data);
            if (data.uploader && data.title) {
                notify("Download Started", data.uploader+" - "+data.title, id);
            } else if (data.uploader) {
                notify("Download Started", data.uploader, id);
            } else if (data.title) {
                notify("Download Started", data.title, id);
            }
        } else if (type == "file") {
            console.log("file");
            console.log(data);

            let notifTitle = "Download Complete";
            if (!data.lastFile) {
                notifTitle = `Download ${downloadCount} of ${data.totalFiles} Complete`;
            } else {
                finished = true;
                ws.close();
            }

            if (data.uploader && data.title) {
                notify(notifTitle, data.uploader+" - "+data.title, id, true);
            } else if (data.uploader) {
                notify(notifTitle, data.uploader, id, true);
            } else if (data.title) {
                notify(notifTitle, data.title, id, true);
            } else {
                notify(notifTitle, pageTitle);
            }
            chrome.downloads.download({
                url: VIDL_DL_URL+data.id
            });
        }
    }
}
