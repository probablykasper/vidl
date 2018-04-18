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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var lastFormat = localStorage.getItem("lastFormat");
if (lastFormat) document.querySelector("button." + lastFormat).classList.add("checked");else {
    lastFormat = "mp3";
    document.querySelector("button.mp3").classList.add("checked");
}

var dl = {
    init: function init(format) {
        chrome.runtime.sendMessage({
            format: format
        });
        // window.close();
    }
};

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("format")) {
        dl.init(e.target.attributes["data-format"].value);
    }
});

document.addEventListener("keydown", function (e) {
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

__webpack_require__(2)("focus-within");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var invisibleButton = document.querySelector("button.invisible-button");
module.exports = function (className) {
    if (!className) className = "focus-within";
    var focusedElements = [];
    function update() {
        invisibleButton.style.display = "none";
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

/***/ })
/******/ ]);