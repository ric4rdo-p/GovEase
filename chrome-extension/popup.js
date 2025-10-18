document.getElementById('summarize-button').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getPageContent,
    }, (injectionResults) => {
      for (const frameResult of injectionResults) {
        if (frameResult.result) {
          // Here I would call a summarization API with the content
          // For now, I'll just display the first 500 characters.
          const summary = frameResult.result.substring(0, 500) + '...';
          document.getElementById('summary').innerText = summary;
        }
      }
    });
  });
});

function getPageContent() {
  return document.body.innerText;
}
