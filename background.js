chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'summarize') {
        const { text } = request;

        // Your hardcoded Gemini API key - replace with your actual API key
        const API_KEY = 'GEMINI_API_KEY'; // Replace this with your actual API key

        // Your hardcoded ElevenLabs API key - replace with your actual API key
        //const ELEVENLABS_API_KEY = 'sk_4afacedf936105b6b53193009ea0c51832fb268985b9ed1a'; // Replace this with your actual ElevenLabs API key

        const model = 'gemini-2.5-flash'; // Using the latest flash model
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;

        const data = {
            contents: [{
                parts: [{
                    text: `Please provide a concise summary of the following text in bullet point format. Make it easy to understand and keep it brief:

${text}

Format your response as bullet points using • symbol. Start each bullet point on a new line.
 Focus on the key points and main ideas. Do not add any type of markdown in the response, just plain text.`
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
    } else if (request.type === 'elevenLabsTTS') {
        const { text } = request;

        // Your hardcoded ElevenLabs API key - replace with your actual API key
        const ELEVENLABS_API_KEY = 'ELEVENLABS_API_KEY'; // Replace this with your actual ElevenLabs API key

        const voiceId = 'UgBBYS2sOqTuMpoF3BR0';
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        const data = {
            text: text,
            model_id: 'eleven_turbo_v2', // or 'eleven_multilingual_v2', etc.
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
                }
                return response.arrayBuffer();
            })
            .then(audioData => {
                // Convert ArrayBuffer to Uint8Array for sending to popup
                const audioBytes = new Uint8Array(audioData);
                chrome.runtime.sendMessage({
                    type: 'elevenLabsAudio',
                    audioData: Array.from(audioBytes)
                });
            })
            .catch(error => {
                console.error('ElevenLabs TTS Error:', error);
                chrome.runtime.sendMessage({
                    type: 'elevenLabsError',
                    error: error.message || 'ElevenLabs TTS failed'
                });
            });
    }
});