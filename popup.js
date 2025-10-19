document.addEventListener('DOMContentLoaded', () => {
    const summarizeButton = document.getElementById('summarize');
    const summaryDiv = document.getElementById('summary');
    const summaryContainer = document.getElementById('summaryContainer');
    const loadingDiv = document.getElementById('loading');
    const statusMessage = document.getElementById('statusMessage');
    const playTtsButton = document.getElementById('playTts');

    let currentSummary = '';
    let speechSynthesis = window.speechSynthesis;
    let currentUtterance = null;
    let isPlaying = false;

    // Utility functions
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    }

    function showLoading() {
        loadingDiv.classList.remove('hidden');
        summaryDiv.style.display = 'none';
        summaryContainer.classList.remove('hidden');
    }

    function hideLoading() {
        loadingDiv.classList.add('hidden');
        summaryDiv.style.display = 'block';
    }

    function formatSummaryAsBulletPoints(text) {
        // Split the text into lines and create bullet points
        const lines = text.split('\n').filter(line => line.trim().length > 0);

        // If the text already contains bullet points or numbered lists, keep them
        if (text.includes('•') || text.includes('-') || text.includes('*') || /^\d+\./.test(text)) {
            return text;
        }

        // Otherwise, format as bullet points
        const bulletPoints = lines.map(line => {
            const trimmedLine = line.trim();
            // Skip very short lines that might be headers
            if (trimmedLine.length < 10) return trimmedLine;
            return `• ${trimmedLine}`;
        }).filter(point => point.length > 3); // Filter out very short points

        return bulletPoints.join('\n');
    }

    function speakText(text) {
        if (isPlaying) {
            stopSpeaking();
            return;
        }

        if (!text) return;

        // Stop any current speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        // Create utterance with the summary text
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 0.9;
        currentUtterance.pitch = 1;
        currentUtterance.volume = 1;

        // Try to use a more natural voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.name.includes('Google') ||
            voice.name.includes('Microsoft') ||
            voice.lang.startsWith('en')
        );
        if (preferredVoice) {
            currentUtterance.voice = preferredVoice;
        }

        currentUtterance.onstart = () => {
            isPlaying = true;
            playTtsButton.textContent = 'Pause';
            playTtsButton.title = 'Pause reading';
        };

        currentUtterance.onend = () => {
            stopSpeaking();
        };

        currentUtterance.onerror = () => {
            stopSpeaking();
            showStatus('Speech synthesis error', 'error');
        };

        speechSynthesis.speak(currentUtterance);
        showStatus('Reading summary...', 'success');
    }

    function stopSpeaking() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        isPlaying = false;
        playTtsButton.textContent = 'Play';
        playTtsButton.title = 'Read aloud';
    }

    // Initialize the extension
    showStatus('Ready to summarize webpages!', 'success');

    // TTS button click handler
    playTtsButton.addEventListener('click', () => {
        if (currentSummary) {
            speakText(currentSummary);
        }
    });

    // Summarize button click handler
    summarizeButton.addEventListener('click', () => {
        // Show loading state
        showLoading();
        summarizeButton.disabled = true;
        summarizeButton.textContent = 'Processing...';

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: () => document.body.innerText
            }, (injectionResults) => {
                if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
                    hideLoading();
                    summaryDiv.textContent = 'Error: Could not access page content. Please try refreshing the page.';
                    summarizeButton.disabled = false;
                    summarizeButton.textContent = 'Summarize Page';
                    showStatus('Failed to access page content', 'error');
                    return;
                }

                const pageText = injectionResults[0].result;
                if (!pageText || pageText.trim().length < 100) {
                    hideLoading();
                    summaryDiv.textContent = 'Error: Page content is too short or empty. Please try a different page.';
                    summarizeButton.disabled = false;
                    summarizeButton.textContent = 'Summarize Page';
                    showStatus('Page content too short', 'error');
                    return;
                }

                // Send to background script (no API key needed)
                chrome.runtime.sendMessage({
                    type: 'summarize',
                    text: pageText
                });
            });
        });
    });

    // Listen for summary from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'summary') {
            hideLoading();
            currentSummary = request.summary;

            // Format summary as bullet points
            const formattedSummary = formatSummaryAsBulletPoints(currentSummary);
            summaryDiv.textContent = formattedSummary;

            // Reset button state
            summarizeButton.disabled = false;
            summarizeButton.textContent = 'Summarize Page';

            // Reset TTS button
            stopSpeaking();

            showStatus('Summary generated successfully!', 'success');
        }
    });

    // Handle page visibility changes to stop speech when popup is closed
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            stopSpeaking();
        }
    });

    // Handle popup close to stop speech
    window.addEventListener('beforeunload', () => {
        if (isPlaying) {
            stopSpeaking();
        }
    });

    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            // Voices loaded
        };
    }
});