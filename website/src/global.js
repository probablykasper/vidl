require("./focus-within-polyfill")("focus-within");

const middleContainer = document.querySelector(".middle-container");
window.changeView = function(fromView, toView) {
    middleContainer.classList.remove(fromView);
    middleContainer.querySelector(`.${fromView}`).classList.remove("visible");
    setTimeout(() => {
        middleContainer.classList.add(toView);
        middleContainer.querySelector(`.${toView}`).classList.add("visible");
    }, 280/4);
}
window.showTitle = function(title) {
    middleContainer.classList.add("title-visible");
    middleContainer.querySelector("p.title").innerHTML = title;
}
window.showUploader = function(uploader) {
    middleContainer.classList.add("uploader-visible");
    middleContainer.querySelector("p.uploader").innerHTML = uploader;
}
window.hideTitle = function(title) {
    middleContainer.classList.remove("title-visible");
}
window.hideUploader = function() {
    middleContainer.classList.remove("uploader-visible");
}

setTimeout(() => {
    changeView("format-selection", "loading-view");
}, 0);



const isChrome = !!window.chrome && !!window.chrome.webstore;
if (isChrome) {

    const extLink = "https://chrome.google.com/webstore/detail/ofojemljpdnbfmjenigkncgofkcoacag";
    const extensionDiv = document.querySelector(".extension.chrome");
    const svg = extensionDiv.querySelector("svg");
    svg.addEventListener("click", function() {
        chrome.webstore.install(extLink, function(suc) {
            console.log(suc);
        }, function(err) {
            console.log(err);
        });
    });
    extensionDiv.classList.add("visible");

}
