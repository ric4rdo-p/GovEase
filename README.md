# GovEase 🧓💬

**Your AI companion for government forms**

GovEase is a Chrome extension that helps elderly users navigate and fill out complex government forms with AI-powered summaries, text to speech voice guidance, and smart autofill.


## Features

### 🤖 AI Form Assistant
- **Smart Auto-Fill**: Uses your saved profile information to fill forms automatically

### 🔊 Voice Guidance
- **Text-to-Speech**: Reads form instructions and field descriptions aloud

### 👤 User Profile System
- **Secure Storage**: Personal information stored locally on your device
- **Common Fields**: First name, last name, address, phone, email, etc.
- **Privacy Focused**: Information never leaves your device

### ♿ Accessibility Features
- **Voice Assistance**: Audio guidance for users with visual impairments

## Installation

1. **Download the Extension**
   - Clone or download this repository
   - Navigate to the `govEase` folder

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `govEase` folder
   - The GovEase icon should appear in your Chrome toolbar

## How to Use

### 1. Set Up Your Profile
- Click the GovEase icon in your Chrome toolbar
- Go to the "👤 Profile" tab
- Fill in your personal information (this stays private on your device)
- Adjust your preferences (voice, text size, contrast)
- Click "💾 Save Profile"

### 2. Use on Government Websites
- Visit any government website (e.g., ssa.gov, irs.gov)
- Look for the green form badges that appear on forms
- Click a form badge to open the AI assistant panel
- Use the buttons to:
  - ✨ Auto-fill with your saved information
  - 🔊 Read form instructions aloud
  - ❓ Get help with individual fields

## Privacy & Security

- **Local Storage**: All personal information is stored on your device only
- **No Data Sharing**: Information is never sent to external servers
- **Secure**: Uses Chrome's built-in storage API for data protection
- **Transparent**: Open source code you can review

## Technical Details

### Technologies
- Chrome Extension APIs
- Gemini API for dynamic summarization
- ElevenLabs API for text-to-speech

## Development

### Loading in Development
1. Load the `dist` folder as an unpacked extension in Chrome
2. Make changes and rebuild to see updates

## Future Enhancements

- [ ] AI integration for more intelligent form analysis
- [ ] Support for more government websites
- [ ] Advanced voice commands
- [ ] Form completion reminders
- [ ] Integration with calendar systems
- [ ] Multi-language support
- [ ] Voice Commands

## Contributing

This project was built for HackTX with the goal of helping elderly users navigate government websites more easily. Contributions and suggestions are welcome!
