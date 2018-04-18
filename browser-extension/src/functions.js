const middleContainer = document.querySelector(".middle-container");
const loadingViewSpacer = middleContainer.querySelector(".loading-view .spacer");
const pTitle = middleContainer.querySelector("p.title");
const pUploader = middleContainer.querySelector("p.uploader");
const pErrorMessage = middleContainer.querySelector("p.error-message");
const pErrorCode = middleContainer.querySelector("p.error-code");
let currentView = "format-selection";
let changeViewTimeout;
const fn = {
    changeToView: (toView) => {
        clearTimeout(changeViewTimeout);
        currentView = toView;
        const fromView = middleContainer.attributes["data-view"].value;
        middleContainer.classList.remove(fromView);
        middleContainer.querySelector(`.${fromView}`).classList.remove("visible");
        changeViewTimeout = setTimeout(() => {
            middleContainer.classList.add(toView);
            middleContainer.setAttribute("data-view", toView);
            middleContainer.querySelector(`.${toView}`).classList.add("visible");
            fn.updateMiddleContainerHeight();
            // fn.updateMiddleContainerHeight();
        }, 280/4);
    },
    getCurrentView: () => {
        return currentView;
        // return middleContainer.getAttribute("data-view");
    },
    showTitle: (title) => {
        loadingViewSpacer.classList.add("visible");
        pTitle.classList.add("visible");
        pTitle.innerHTML = title;
        fn.updateMiddleContainerHeight();
    },
    showUploader: (uploader) => {
        loadingViewSpacer.classList.add("visible");
        pUploader.classList.add("visible");
        pUploader.innerHTML = uploader;
        fn.updateMiddleContainerHeight();
    },
    hideTitle: (title) => {
        loadingViewSpacer.classList.remove("visible");
        pTitle.classList.remove("visible");
        // fn.updateMiddleContainerHeight();
    },
    hideUploader: () => {
        loadingViewSpacer.classList.remove("visible");
        pUploader.classList.remove("visible");
        // fn.updateMiddleContainerHeight();
    },
    showError: (code, message) => {
        fn.changeToView("error-view");
        pErrorMessage.innerHTML = message;
        pErrorCode.innerHTML = `Code: ${code}`;
    },
    updateMiddleContainerHeight: () => {
        const height = document.querySelector(".middle-container > .visible").clientHeight;
        middleContainer.style.height = height+"px";
    }
}
fn.updateMiddleContainerHeight();
window.fn = fn;
module.exports = fn;
