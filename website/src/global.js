require("./focus-within-polyfill")("focus-within");



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
