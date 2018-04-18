/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VIDL_ENV = "dev";
var VIDL_URL = function () {
    if (VIDL_ENV == "dev") return "wss://apividl.kasp.io/website-dl";else return "§VIDL_URL_PROD§";
}();
var VIDL_DL_URL = function () {
    if (VIDL_ENV == "dev") return "https://apividl.kasp.io/dl/";else return "§VIDL_DL_URL_PROD§";
}();

// init from popup
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        dl.init(tabs[0].url, msg.format);
    });
});

// init from shortcut
chrome.commands.onCommand.addListener(function (command) {
    var format = void 0;
    if (command == "dl_last") {
        format = localStorage.getItem("lastFormat");
        if (!format) format = "mp3";
    } else if (command == "dl_mp3") {
        format = "mp3";
    } else if (command == "dl_mp4") {
        format = "mp4";
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        dl.init(tabs[0].url, format, tabs[0].title);
    });
});

var lastNotifId = null;
function notify(title, msg, id, lastNotif) {
    chrome.notifications.clear(id, function () {
        chrome.notifications.create(id, {
            type: "basic",
            title: title,
            message: msg,
            iconUrl: "icon128.png"
        });
    });
}

var idIndex = 0;
var getId = function getId() {
    return String(idIndex++);
};

var dl = {};
dl.init = function (url, format, pageTitle) {
    var id = getId();
    notify("Download Started", null, id);
    var finished = false;
    var downloadCount = 0;

    var ws = new WebSocket(VIDL_URL);
    ws.onclose = function (e) {
        if (!finished) {
            console.log("ws err - The server connection closed unexpectedly.");
            console.log(e);
            var msg = "The server connection closed unexpectedly.";
            notify("Error Downloading Video", msg + " Code: " + e.code, id, true);
        }
    };
    ws.onopen = function (e) {
        console.log("ws open");
        console.log(e);
        var message = {
            url: url,
            format: format
        };
        ws.send(JSON.stringify(message));
    };
    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var type = data.type;
        if (type == "err") {
            console.log("vidl err - " + data.msg);
            console.log(data);
            notify("Error Downloading Video", data.msg + " Code: " + data.code, id, true);
            finished = true;
            ws.close();
        } else if (type == "info") {
            console.log("info");
            console.log(data);
            if (data.uploader && data.title) {
                notify("Download Started", data.uploader + " - " + data.title, id);
            } else if (data.uploader) {
                notify("Download Started", data.uploader, id);
            } else if (data.title) {
                notify("Download Started", data.title, id);
            }
        } else if (type == "file") {
            console.log("file");
            console.log(data);

            var notifTitle = "Download Complete";
            if (!data.lastFile) {
                notifTitle = "Download " + downloadCount + " of " + data.totalFiles + " Complete";
            } else {
                finished = true;
                ws.close();
            }

            if (data.uploader && data.title) {
                notify(notifTitle, data.uploader + " - " + data.title, id, true);
            } else if (data.uploader) {
                notify(notifTitle, data.uploader, id, true);
            } else if (data.title) {
                notify(notifTitle, data.title, id, true);
            } else {
                notify(notifTitle, pageTitle);
            }
            chrome.downloads.download({
                url: VIDL_DL_URL + data.id
            });
        }
    };
};

/***/ })
/******/ ]);