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


var lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) document.querySelector("button." + lastFormat).classList.add("checked");else {
    lastFormat = "mp3";
    document.querySelector("button.mp3").classList.add("checked");
}

__webpack_require__(1)("focus-within");
var dl = __webpack_require__(2);

var urlBar = document.querySelector(".url input");

// focus url bar on paste
document.addEventListener("paste", function (e) {
    if (!document.activeElement || !document.activeElement.classList || !document.activeElement.classList.contains("url-bar")) {
        urlBar.focus();
    }
});
// focus url bar on keypress
document.addEventListener("keypress", function (e) {
    if (e.which != 13) {
        //enter
        urlBar.focus();
    }
});
document.addEventListener("keydown", function (e) {
    if (e.which == 37 || // arrow left
    e.which == 38 || // arrow up
    e.which == 39 || // arrow right
    e.which == 40 || // arrow down
    e.which == 46 || // delete
    e.which == 8 // backspace
    ) {
            urlBar.focus();
        }
});

// press enter to download
document.addEventListener("keydown", function (e) {
    if (e.which == 13) {
        if (e.target.classList.contains("url-bar") || document.activeElement.nodeName == "BODY") {
            if (e.which != 13) return; // enter
            dl.init(urlBar.value, lastFormat);
        }
    }
});

// press button to download
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("format")) {
        document.querySelector("button." + lastFormat).classList.remove("checked");
        e.target.classList.add("checked");
        lastFormat = e.target.attributes["data-format"].value;
        localStorage.setItem("lastFormat", lastFormat);
        dl.init(urlBar.value, lastFormat);
    }
});

// press X to go back to format-selection
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("go-back-on-click")) {
        fn.changeToView("format-selection");
    }
});

var isChrome = !!window.chrome && !!window.chrome.webstore;
if (isChrome) {

    var extensionDiv = document.querySelector(".extension.chrome");
    var extensionTooltip = document.querySelector(".extension.chrome .extension-tooltip");
    var svg = extensionDiv.querySelector(".svg");
    svg.addEventListener("mouseenter", function () {
        extensionTooltip.classList.add("visible");
    });
    extensionDiv.addEventListener("mouseleave", function () {
        extensionTooltip.classList.remove("visible");
    });
    extensionDiv.classList.add("visible");
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (className) {
    if (!className) className = "focus-within";
    var focusedElements = [];
    function update() {
        var focusedElement;
        while (focusedElement = focusedElements.pop()) {
            focusedElement.classList.remove(className);
        }

        // add .focus-within if document has focus,
        var activeElement = document.activeElement;
        while (document.hasFocus() && activeElement.nodeName != "#document") {
            activeElement.classList.add(className);
            focusedElements.push(activeElement);
            activeElement = activeElement.parentNode;
        }
    }

    document.addEventListener("focus", update, true);
    document.addEventListener("blur", update, true);
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VIDL_ENV = "prod";
var VIDL_URL = function () {
    if (VIDL_ENV == "dev") return "ws://localhost:80/website-dl/";else return "wss://apividl.kasp.io/website-dl/";
}();
var VIDL_DL_URL = function () {
    if (VIDL_ENV == "dev") return "http://localhost:80/dl/";else return "https://apividl.kasp.io/dl/";
}();

var fn = __webpack_require__(3);

var middleContainer = document.querySelector(".middle-container");
var urlBar = document.querySelector(".url input");
var dlLink = document.querySelector("a.dl-link");
module.exports = {};
// fn.changeToView("error-view");
module.exports.init = function (url, format) {
    if (fn.getCurrentView() == "loading-view") return;
    fn.changeToView("loading-view");
    // setTimeout(() => {
    //     fn.changeToView("format-selection");
    // }, 2000);

    var ws = new WebSocket(VIDL_URL);
    ws.onclose = function (e) {
        if (fn.getCurrentView() == "loading-view") {
            console.log("ws err - The server connection closed unexpectedly.");
            console.log(e);
            fn.showError(e.code, "The server connection closed unexpectedly.");
        }
    };
    ws.onopen = function (e) {
        console.log("ws open");
        console.log(e);
        var message = {
            url: urlBar.value,
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
            fn.showError(data.code, data.msg);
            ws.close();
        } else if (type == "info") {
            console.log("info");
            console.log(data);
            if (data.title) fn.showTitle(data.title);
            if (data.uploader) fn.showUploader(data.uploader);
        } else if (type == "file") {
            console.log("file");
            console.log(data);
            dlLink.setAttribute("href", VIDL_DL_URL + data.id);
            dlLink.click();
            if (data.lastFile) {
                fn.changeToView("success-view");
                ws.close();
                setTimeout(function () {
                    fn.changeToView("format-selection");
                }, 1000);
            }
        }
    };
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var middleContainer = document.querySelector(".middle-container");
var loadingViewSpacer = middleContainer.querySelector(".loading-view .spacer");
var pTitle = middleContainer.querySelector("p.title");
var pUploader = middleContainer.querySelector("p.uploader");
var pErrorMessage = middleContainer.querySelector("p.error-message");
var pErrorCode = middleContainer.querySelector("p.error-code");
var currentView = "format-selection";
var changeViewTimeout = void 0;
var fn = {
    changeToView: function changeToView(toView) {
        clearTimeout(changeViewTimeout);
        currentView = toView;
        var fromView = middleContainer.attributes["data-view"].value;
        middleContainer.classList.remove(fromView);
        middleContainer.querySelector("." + fromView).classList.remove("visible");
        changeViewTimeout = setTimeout(function () {
            middleContainer.classList.add(toView);
            middleContainer.setAttribute("data-view", toView);
            middleContainer.querySelector("." + toView).classList.add("visible");
            fn.updateMiddleContainerHeight();
            // fn.updateMiddleContainerHeight();
        }, 280 / 4);
    },
    getCurrentView: function getCurrentView() {
        return currentView;
        // return middleContainer.getAttribute("data-view");
    },
    showTitle: function showTitle(title) {
        loadingViewSpacer.classList.add("visible");
        pTitle.classList.add("visible");
        pTitle.innerHTML = title;
        fn.updateMiddleContainerHeight();
    },
    showUploader: function showUploader(uploader) {
        loadingViewSpacer.classList.add("visible");
        pUploader.classList.add("visible");
        pUploader.innerHTML = uploader;
        fn.updateMiddleContainerHeight();
    },
    hideTitle: function hideTitle(title) {
        loadingViewSpacer.classList.remove("visible");
        pTitle.classList.remove("visible");
        // fn.updateMiddleContainerHeight();
    },
    hideUploader: function hideUploader() {
        loadingViewSpacer.classList.remove("visible");
        pUploader.classList.remove("visible");
        // fn.updateMiddleContainerHeight();
    },
    showError: function showError(code, message) {
        fn.changeToView("error-view");
        pErrorMessage.innerHTML = message;
        pErrorCode.innerHTML = "Code: " + code;
    },
    updateMiddleContainerHeight: function updateMiddleContainerHeight() {
        var height = document.querySelector(".middle-container > .visible").clientHeight;
        middleContainer.style.height = height + "px";
    }
};
fn.updateMiddleContainerHeight();
window.fn = fn;
module.exports = fn;

/***/ })
/******/ ]);