// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "COUNT_INPUTS") {
        const count = document.querySelectorAll("input").length;
        sendResponse({ count }); // sends back a response to popup.js
    }
});
