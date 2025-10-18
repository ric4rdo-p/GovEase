import React, { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [userProfile, setUserProfile] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      ssn: '',
      dob: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: ''
    },
    preferences: {
      voiceEnabled: true,
      largeText: false,
      highContrast: false
    }
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const result = await chrome.storage.sync.get(['userProfile']);
      if (result.userProfile) {
        setUserProfile(result.userProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveUserProfile = async () => {
    try {
      await chrome.storage.sync.set({ userProfile });
      setIsEditing(false);
      // Announce success
      if (userProfile.preferences.voiceEnabled) {
        const utterance = new SpeechSynthesisUtterance('Profile saved successfully!');
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleVoice = () => {
    handleInputChange('preferences', 'voiceEnabled', !userProfile.preferences.voiceEnabled);
    if (!userProfile.preferences.voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance('Voice assistance enabled');
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const announceText = (text) => {
    if (userProfile.preferences.voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`app ${userProfile.preferences.largeText ? 'large-text' : ''} ${userProfile.preferences.highContrast ? 'high-contrast' : ''}`}>
      <style jsx>{`
        .app {
          width: 400px;
          min-height: 500px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          overflow: hidden;
        }
        
        .app.large-text {
          font-size: 18px;
        }
        
        .app.high-contrast {
          background: #000;
          color: #fff;
        }
        
        .header {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          text-align: center;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .header p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        
        .tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .tab {
          flex: 1;
          padding: 15px;
          text-align: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s;
          border: none;
          background: transparent;
          color: white;
        }
        
        .tab:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .tab.active {
          background: rgba(255, 255, 255, 0.2);
          border-bottom: 3px solid #fff;
        }
        
        .content {
          padding: 20px;
          max-height: 350px;
          overflow-y: auto;
        }
        
        .assistant-section {
          text-align: center;
        }
        
        .status-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(76, 175, 80, 0.8);
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .status-indicator.inactive {
          background: rgba(255, 152, 0, 0.8);
        }
        
        .big-button {
          width: 100%;
          padding: 15px 20px;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin: 10px 0;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .big-button.primary {
          background: #4CAF50;
          color: white;
        }
        
        .big-button.primary:hover {
          background: #45a049;
          transform: translateY(-2px);
        }
        
        .big-button.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .big-button.secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .profile-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .form-group label {
          font-weight: 500;
          font-size: 14px;
        }
        
        .form-group input {
          padding: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }
        
        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #4CAF50;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .preferences {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .preference-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .toggle {
          width: 50px;
          height: 25px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .toggle.active {
          background: #4CAF50;
        }
        
        .toggle::after {
          content: '';
          position: absolute;
          width: 21px;
          height: 21px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
        
        .toggle.active::after {
          left: 27px;
        }
        
        .save-button {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 20px;
          width: 100%;
        }
        
        .save-button:hover {
          background: #45a049;
        }
        
        .help-text {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 5px;
          text-align: center;
        }
      `}</style>

      <div className="header">
        <h1>
          <span>🧓</span>
          <span>GovEase</span>
          <span>💬</span>
        </h1>
        <p>Your AI companion for government forms</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('assistant');
            announceText('Assistant tab selected');
          }}
        >
          🤖 Assistant
        </button>
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            announceText('Profile tab selected');
          }}
        >
          👤 Profile
        </button>
      </div>

      <div className="content">
        {activeTab === 'assistant' && (
          <div className="assistant-section">
            <div className="status-card">
              <div className={`status-indicator ${userProfile.preferences.voiceEnabled ? '' : 'inactive'}`}>
                <span>{userProfile.preferences.voiceEnabled ? '🔊' : '🔇'}</span>
                <span>{userProfile.preferences.voiceEnabled ? 'Voice Active' : 'Voice Disabled'}</span>
              </div>
              <h3>Ready to Help!</h3>
              <p>I'll guide you through government forms and fill them out automatically using your saved information.</p>
            </div>

            <button
              className="big-button primary"
              onClick={() => {
                announceText('Auto-fill enabled. I will help fill out forms on government websites.');
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'enableAutoFill' });
                });
              }}
            >
              ✨ Enable Auto-Fill
            </button>

            <button
              className="big-button secondary"
              onClick={() => {
                announceText('Voice guidance enabled. I will read form instructions aloud.');
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'enableVoiceGuidance' });
                });
              }}
            >
              🔊 Voice Guidance
            </button>

            <button
              className="big-button secondary"
              onClick={() => {
                announceText('Field help enabled. I will explain each form field.');
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'enableFieldHelp' });
                });
              }}
            >
              ❓ Field Help
            </button>

            <div className="help-text">
              Visit a government website with forms to see me in action!
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3>Your Information</h3>
            <p>This information will be used to auto-fill forms securely.</p>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={userProfile.personalInfo.firstName}
                onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={userProfile.personalInfo.lastName}
                onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={userProfile.personalInfo.dob}
                onChange={(e) => handleInputChange('personalInfo', 'dob', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={userProfile.personalInfo.address}
                onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={userProfile.personalInfo.city}
                onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                placeholder="Enter your city"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={userProfile.personalInfo.state}
                onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
                placeholder="Enter your state"
              />
            </div>

            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                value={userProfile.personalInfo.zip}
                onChange={(e) => handleInputChange('personalInfo', 'zip', e.target.value)}
                placeholder="Enter your ZIP code"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={userProfile.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userProfile.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="preferences">
              <h4>Preferences</h4>

              <div className="preference-item">
                <span>Voice Assistance</span>
                <div
                  className={`toggle ${userProfile.preferences.voiceEnabled ? 'active' : ''}`}
                  onClick={toggleVoice}
                ></div>
              </div>

              <div className="preference-item">
                <span>Large Text</span>
                <div
                  className={`toggle ${userProfile.preferences.largeText ? 'active' : ''}`}
                  onClick={() => handleInputChange('preferences', 'largeText', !userProfile.preferences.largeText)}
                ></div>
              </div>

              <div className="preference-item">
                <span>High Contrast</span>
                <div
                  className={`toggle ${userProfile.preferences.highContrast ? 'active' : ''}`}
                  onClick={() => handleInputChange('preferences', 'highContrast', !userProfile.preferences.highContrast)}
                ></div>
              </div>
            </div>

            <button
              className="save-button"
              onClick={saveUserProfile}
            >
              💾 Save Profile
            </button>

            <div className="help-text">
              Your information is stored securely on your device and never shared.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
