document.addEventListener('DOMContentLoaded', () => {
    const summarizeButton = document.getElementById('summarize');
    const summaryDiv = document.getElementById('summary');
    const summaryContainer = document.getElementById('summaryContainer');
    const loadingDiv = document.getElementById('loading');
    const statusMessage = document.getElementById('statusMessage');
    const playTtsButton = document.getElementById('playTts');

    let currentSummary = '';
    let currentAudio = null;
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

        // Show loading state for TTS
        playTtsButton.textContent = 'Loading...';
        playTtsButton.disabled = true;

        // Prepare text for ElevenLabs
        const fullText = `Here is a summary of the webpage content: ${text}`;

        // Send request to background script for ElevenLabs TTS
        chrome.runtime.sendMessage({
            type: 'elevenLabsTTS',
            text: fullText
        });
    }

    function stopSpeaking() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        isPlaying = false;
        playTtsButton.textContent = 'Play';
        playTtsButton.title = 'Read aloud';
        playTtsButton.disabled = false;
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

    // Listen for messages from background script
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
        } else if (request.type === 'elevenLabsAudio') {
            try {
                // Convert the plain JS array back into a typed array
                const audioBytes = new Uint8Array(request.audioData);
                const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Stop any current audio
                if (currentAudio) {
                    currentAudio.pause();
                    URL.revokeObjectURL(currentAudio.src);
                }

                // Create and play new audio
                currentAudio = new Audio(audioUrl);
                isPlaying = true;

                playTtsButton.textContent = 'Pause';
                playTtsButton.title = 'Pause reading';
                playTtsButton.disabled = false;

                currentAudio.play()
                    .then(() => showStatus('Playing audio...', 'success'))
                    .catch(err => {
                        console.error('Audio playback failed:', err);
                        showStatus('Audio playback failed', 'error');
                        stopSpeaking();
                    });

                currentAudio.onended = () => {
                    stopSpeaking();
                    URL.revokeObjectURL(audioUrl);
                };

                currentAudio.onerror = (err) => {
                    console.error('Audio error:', err);
                    stopSpeaking();
                    showStatus('Error playing audio', 'error');
                    URL.revokeObjectURL(audioUrl);
                };
            } catch (err) {
                console.error('Audio processing error:', err);
                showStatus('Invalid audio data', 'error');
                stopSpeaking();
            }
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
});