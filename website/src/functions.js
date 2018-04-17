const middleContainer = document.querySelector(".middle-container");
module.exports = {
    changeToView: (toView) => {
        const fromView = middleContainer.attributes["data-view"].value;
        middleContainer.classList.remove(fromView);
        middleContainer.querySelector(`.${fromView}`).classList.remove("visible");
        setTimeout(() => {
            middleContainer.classList.add(toView);
            middleContainer.setAttribute("data-view", toView);
            middleContainer.querySelector(`.${toView}`).classList.add("visible");
        }, 280/4);
    },
    getCurrentView: () => {
        return middleContainer.getAttribute("data-view");
    },
    showTitle: (title) => {
        middleContainer.classList.add("title-visible");
        middleContainer.querySelector("p.title").innerHTML = title;
    },
    showUploader: (uploader) => {
        middleContainer.classList.add("uploader-visible");
        middleContainer.querySelector("p.uploader").innerHTML = uploader;
    },
    hideTitle: (title) => {
        middleContainer.classList.remove("title-visible");
    },
    hideUploader: () => {
        middleContainer.classList.remove("uploader-visible");
    },
}
