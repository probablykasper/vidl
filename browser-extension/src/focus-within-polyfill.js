module.exports = function(className) {
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
}
