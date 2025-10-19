chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'summarize') {
        const { text, apiKey } = request;
        const model = 'gemini-2.5-flash'; // Using the latest flash model
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

        const data = {
            contents: [{
                parts: [{
                    text: `Summarize the following text:

${text}`
                }]
            }]
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                console.log('Gemini API Response:', result); // Log the full response
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    const summary = result.candidates[0].content.parts[0].text;
                    chrome.runtime.sendMessage({ type: 'summary', summary: summary });
                } else {
                    let errorMessage = 'Error: No summary returned from API.';
                    if (result.error) {
                        errorMessage += ` Details: ${result.error.message}`;
                    }
                    chrome.runtime.sendMessage({ type: 'summary', summary: errorMessage });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                chrome.runtime.sendMessage({ type: 'summary', summary: `Error: ${error.message}` });
            });
    }
});