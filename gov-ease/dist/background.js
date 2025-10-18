chrome.runtime.onInstalled.addListener(() => {
    console.log("GovEase background service running...");
});

// Handle messages between popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'enableAutoFill') {
        // Forward message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'enableAutoFill' });
            }
        });
    } else if (message.action === 'enableVoiceGuidance') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'enableVoiceGuidance' });
            }
        });
    } else if (message.action === 'enableFieldHelp') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'enableFieldHelp' });
            }
        });
    }
    return true; // Keep message channel open for async response
});