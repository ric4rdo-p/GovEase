# GovEase 🧓💬

**Your AI companion for government forms**

GovEase is a Chrome extension designed to help elderly users navigate and fill out government forms with ease. It provides AI-powered assistance, voice guidance, and accessibility features to make government websites more user-friendly for seniors.

## Features

### 🤖 AI Form Assistant
- **Automatic Form Detection**: Identifies government forms on websites
- **Smart Auto-Fill**: Uses your saved profile information to fill forms automatically
- **Progress Tracking**: Shows completion status of forms
- **Difficulty Assessment**: Rates forms by complexity (Low/Medium/High)

### 🔊 Voice Guidance
- **Text-to-Speech**: Reads form instructions and field descriptions aloud
- **Audio Feedback**: Confirms actions and provides helpful announcements
- **Adjustable Speed**: Slower speech rate optimized for elderly users

### 👤 User Profile System
- **Secure Storage**: Personal information stored locally on your device
- **Common Fields**: First name, last name, address, phone, email, etc.
- **Privacy Focused**: Information never leaves your device

### ♿ Accessibility Features
- **Large Text Mode**: Increases font size for better readability
- **High Contrast Mode**: Enhanced visibility for low vision users
- **Voice Assistance**: Audio guidance for users with visual impairments
- **Field Help**: Hover over fields to hear explanations

## Installation

1. **Download the Extension**
   - Clone or download this repository
   - Navigate to the `gov-ease/dist` folder

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `gov-ease/dist` folder
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

### 3. Voice Commands
- The extension will automatically read form information when you click buttons
- Hover over form fields to hear field descriptions
- Voice guidance can be toggled on/off in your profile settings

## Supported Websites

Currently optimized for:
- Social Security Administration (ssa.gov)
- IRS.gov
- Medicare.gov
- Other government websites with standard forms

## Privacy & Security

- **Local Storage**: All personal information is stored on your device only
- **No Data Sharing**: Information is never sent to external servers
- **Secure**: Uses Chrome's built-in storage API for data protection
- **Transparent**: Open source code you can review

## Technical Details

### Architecture
- **Chrome Extension**: Manifest v3 compliant
- **React Frontend**: Modern, accessible UI
- **Content Scripts**: Injected into government websites
- **Background Service**: Handles extension lifecycle and messaging

### Technologies
- React 19
- Vite build system
- Chrome Extension APIs
- Web Speech API for text-to-speech
- Chrome Storage API for data persistence

## Development

### Building from Source
```bash
npm install
npm run build
```

### Loading in Development
1. Build the project: `npm run build`
2. Load the `dist` folder as an unpacked extension in Chrome
3. Make changes and rebuild to see updates

## Future Enhancements

- [ ] AI integration for more intelligent form analysis
- [ ] Support for more government websites
- [ ] Advanced voice commands
- [ ] Form completion reminders
- [ ] Integration with calendar systems
- [ ] Multi-language support

## Contributing

This project was built for HackTX with the goal of helping elderly users navigate government websites more easily. Contributions and suggestions are welcome!

## License

MIT License - feel free to use and modify for your own projects.

---

**Made with ❤️ for elderly users who need help with government forms**