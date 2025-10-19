document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveKeyButton = document.getElementById('saveKey');
    const summarizeButton = document.getElementById('summarize');
    const summaryDiv = document.getElementById('summary');

    // Load API key from storage
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
        }
    });

    // Save API key to storage
    saveKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        if (apiKey) {
            chrome.storage.sync.set({ 'geminiApiKey': apiKey }, () => {
                summaryDiv.textContent = 'API Key saved.';
            });
        }
    });

    // Summarize button click handler
    summarizeButton.addEventListener('click', () => {
        summaryDiv.textContent = 'Summarizing...';
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: () => document.body.innerText
            }, (injectionResults) => {
                if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
                    summaryDiv.textContent = 'Error: could not get page content.';
                    return;
                }
                const pageText = injectionResults[0].result;
                chrome.storage.sync.get(['geminiApiKey'], (result) => {
                    if (!result.geminiApiKey) {
                        summaryDiv.textContent = 'Error: API Key not set.';
                        return;
                    }
                    // Send to background script
                    chrome.runtime.sendMessage({
                        type: 'summarize',
                        text: pageText,
                        apiKey: result.geminiApiKey
                    });
                });
            });
        });
    });

    // Listen for summary from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'summary') {
            summaryDiv.textContent = request.summary;
        }
    });
});