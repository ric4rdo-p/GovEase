console.log("GovEase content script loaded on SSA website!");

// Form detection and analysis system
class GovEaseFormAssistant {
    constructor() {
        this.forms = [];
        this.currentForm = null;
        this.userProfile = null;
        this.init();
    }

    async init() {
        // Load user profile from storage
        await this.loadUserProfile();

        // Detect forms on the page
        this.detectForms();

        // Add AI assistance overlay
        this.createAssistanceOverlay();

        // Initialize text-to-speech
        this.initTextToSpeech();

        // Listen for form changes
        this.observeFormChanges();
    }

    async loadUserProfile() {
        try {
            const result = await chrome.storage.sync.get(['userProfile']);
            this.userProfile = result.userProfile || {
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
            };
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.userProfile = { personalInfo: {}, preferences: { voiceEnabled: true } };
        }
    }

    detectForms() {
        const forms = document.querySelectorAll('form');
        this.forms = Array.from(forms).map(form => this.analyzeForm(form));

        console.log(`Detected ${this.forms.length} forms on the page`);

        // Highlight forms for user
        this.highlightForms();
    }

    analyzeForm(form) {
        const formData = {
            id: form.id || `form_${Math.random().toString(36).substr(2, 9)}`,
            element: form,
            fields: this.extractFormFields(form),
            title: this.getFormTitle(form),
            description: this.getFormDescription(form),
            estimatedTime: this.estimateCompletionTime(form),
            difficulty: this.assessFormDifficulty(form)
        };

        return formData;
    }

    extractFormFields(form) {
        const fields = [];
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            const field = {
                id: input.id,
                name: input.name,
                type: input.type,
                label: this.getFieldLabel(input),
                required: input.required,
                placeholder: input.placeholder,
                element: input,
                suggestions: this.getFieldSuggestions(input)
            };
            fields.push(field);
        });

        return fields;
    }

    getFieldLabel(input) {
        // Try multiple methods to find the label
        let label = '';

        // Method 1: Associated label element
        if (input.id) {
            const labelElement = document.querySelector(`label[for="${input.id}"]`);
            if (labelElement) label = labelElement.textContent.trim();
        }

        // Method 2: Parent label
        if (!label && input.closest('label')) {
            label = input.closest('label').textContent.trim();
        }

        // Method 3: Previous sibling text
        if (!label && input.previousElementSibling) {
            label = input.previousElementSibling.textContent.trim();
        }

        // Method 4: Placeholder or name
        if (!label) {
            label = input.placeholder || input.name || input.type;
        }

        return label;
    }

    getFieldSuggestions(input) {
        const fieldName = (input.name || input.id || '').toLowerCase();
        const suggestions = [];

        // Common field mappings
        const fieldMappings = {
            'firstname': 'firstName',
            'lastname': 'lastName',
            'ssn': 'ssn',
            'social': 'ssn',
            'dob': 'dob',
            'dateofbirth': 'dob',
            'address': 'address',
            'city': 'city',
            'state': 'state',
            'zip': 'zip',
            'phone': 'phone',
            'email': 'email'
        };

        for (const [key, profileKey] of Object.entries(fieldMappings)) {
            if (fieldName.includes(key) && this.userProfile?.personalInfo?.[profileKey]) {
                suggestions.push({
                    value: this.userProfile.personalInfo[profileKey],
                    confidence: 0.9,
                    source: 'user_profile'
                });
            }
        }

        return suggestions;
    }

    getFormTitle(form) {
        // Try to find form title
        const titleElement = form.querySelector('h1, h2, h3, .title, .form-title');
        if (titleElement) return titleElement.textContent.trim();

        // Look for title in nearby elements
        const prevSibling = form.previousElementSibling;
        if (prevSibling && prevSibling.tagName.match(/H[1-6]/)) {
            return prevSibling.textContent.trim();
        }

        return 'Government Form';
    }

    getFormDescription(form) {
        const descElement = form.querySelector('.description, .form-description, p');
        return descElement ? descElement.textContent.trim() : '';
    }

    estimateCompletionTime(form) {
        const fields = this.extractFormFields(form);
        const baseTime = fields.length * 0.5; // 30 seconds per field
        const complexityMultiplier = fields.filter(f => f.type === 'text' || f.type === 'textarea').length * 0.3;
        return Math.round(baseTime + complexityMultiplier);
    }

    assessFormDifficulty(form) {
        const fields = this.extractFormFields(form);
        const requiredFields = fields.filter(f => f.required).length;
        const totalFields = fields.length;

        if (requiredFields > 10 || totalFields > 20) return 'High';
        if (requiredFields > 5 || totalFields > 10) return 'Medium';
        return 'Low';
    }

    highlightForms() {
        this.forms.forEach((form, index) => {
            const highlight = document.createElement('div');
            highlight.className = 'govease-form-highlight';
            highlight.innerHTML = `
        <div class="govease-form-badge">
          <span class="govease-form-number">${index + 1}</span>
          <span class="govease-form-title">${form.title}</span>
          <span class="govease-form-difficulty ${form.difficulty.toLowerCase()}">${form.difficulty}</span>
        </div>
      `;

            form.element.style.position = 'relative';
            form.element.appendChild(highlight);

            // Add click handler
            highlight.addEventListener('click', () => {
                this.selectForm(form);
            });
        });
    }

    selectForm(form) {
        this.currentForm = form;
        this.showFormAssistance(form);
        this.announceForm(form);
    }

    showFormAssistance(form) {
        // Remove existing assistance panel
        const existing = document.querySelector('.govease-assistance-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.className = 'govease-assistance-panel';
        panel.innerHTML = `
      <div class="govease-panel-header">
        <h3>🤖 AI Form Assistant</h3>
        <button class="govease-close-btn">&times;</button>
      </div>
      <div class="govease-panel-content">
        <div class="govease-form-info">
          <h4>${form.title}</h4>
          <p>Estimated time: ${form.estimatedTime} minutes</p>
          <p>Difficulty: <span class="govease-difficulty ${form.difficulty.toLowerCase()}">${form.difficulty}</span></p>
        </div>
        <div class="govease-actions">
          <button class="govease-btn govease-btn-primary" onclick="goveaseAssistant.autoFillForm()">
            ✨ Auto-fill with my info
          </button>
          <button class="govease-btn govease-btn-secondary" onclick="goveaseAssistant.readFormInstructions()">
            🔊 Read instructions
          </button>
          <button class="govease-btn govease-btn-secondary" onclick="goveaseAssistant.showFieldHelp()">
            ❓ Get field help
          </button>
        </div>
        <div class="govease-progress">
          <div class="govease-progress-bar">
            <div class="govease-progress-fill" style="width: 0%"></div>
          </div>
          <span class="govease-progress-text">0 / ${form.fields.length} fields completed</span>
        </div>
      </div>
    `;

        document.body.appendChild(panel);

        // Add close functionality
        panel.querySelector('.govease-close-btn').addEventListener('click', () => {
            panel.remove();
        });
    }

    async autoFillForm() {
        if (!this.currentForm) return;

        let filledCount = 0;
        for (const field of this.currentForm.fields) {
            const suggestions = field.suggestions;
            if (suggestions.length > 0 && suggestions[0].confidence > 0.7) {
                field.element.value = suggestions[0].value;
                field.element.dispatchEvent(new Event('input', { bubbles: true }));
                filledCount++;

                // Visual feedback
                field.element.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    field.element.style.backgroundColor = '';
                }, 1000);
            }
        }

        this.updateProgress(filledCount);
        this.announce(`Auto-filled ${filledCount} fields with your information.`);
    }

    readFormInstructions() {
        if (!this.currentForm) return;

        const instructions = `${this.currentForm.title}. ${this.currentForm.description}. This form has ${this.currentForm.fields.length} fields and should take about ${this.currentForm.estimatedTime} minutes to complete.`;
        this.announce(instructions);
    }

    showFieldHelp() {
        if (!this.currentForm) return;

        const helpText = this.currentForm.fields.map(field => {
            return `${field.label}: ${field.required ? 'Required' : 'Optional'}`;
        }).join('. ');

        this.announce(`Field help: ${helpText}`);
    }

    updateProgress(completedFields) {
        const progressBar = document.querySelector('.govease-progress-fill');
        const progressText = document.querySelector('.govease-progress-text');

        if (progressBar && progressText) {
            const percentage = (completedFields / this.currentForm.fields.length) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completedFields} / ${this.currentForm.fields.length} fields completed`;
        }
    }

    observeFormChanges() {
        // Watch for form field changes to update progress
        document.addEventListener('input', (event) => {
            if (this.currentForm && this.currentForm.fields.some(f => f.element === event.target)) {
                this.updateFormProgress();
            }
        });
    }

    updateFormProgress() {
        if (!this.currentForm) return;

        const completedFields = this.currentForm.fields.filter(field =>
            field.element.value && field.element.value.trim() !== ''
        ).length;

        this.updateProgress(completedFields);
    }

    initTextToSpeech() {
        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
        }
    }

    announce(text) {
        if (this.userProfile?.preferences?.voiceEnabled && this.synth) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8; // Slower for elderly users
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            this.synth.speak(utterance);
        }
    }

    announceForm(form) {
        const announcement = `Form detected: ${form.title}. Difficulty level: ${form.difficulty}. Estimated completion time: ${form.estimatedTime} minutes.`;
        this.announce(announcement);
    }

    createAssistanceOverlay() {
        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
      .govease-form-highlight {
        position: absolute;
        top: -10px;
        right: -10px;
        z-index: 1000;
      }
      
      .govease-form-badge {
        background: #4CAF50;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .govease-form-number {
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
      }
      
      .govease-form-difficulty {
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
      }
      
      .govease-form-difficulty.low { background: #4CAF50; }
      .govease-form-difficulty.medium { background: #FF9800; }
      .govease-form-difficulty.high { background: #F44336; }
      
      .govease-assistance-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: white;
        border: 2px solid #4CAF50;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Arial, sans-serif;
      }
      
      .govease-panel-header {
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .govease-panel-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .govease-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
      }
      
      .govease-panel-content {
        padding: 15px;
      }
      
      .govease-form-info h4 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 14px;
      }
      
      .govease-form-info p {
        margin: 5px 0;
        font-size: 12px;
        color: #666;
      }
      
      .govease-actions {
        margin: 15px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .govease-btn {
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .govease-btn-primary {
        background: #4CAF50;
        color: white;
      }
      
      .govease-btn-primary:hover {
        background: #45a049;
      }
      
      .govease-btn-secondary {
        background: #f0f0f0;
        color: #333;
      }
      
      .govease-btn-secondary:hover {
        background: #e0e0e0;
      }
      
      .govease-progress {
        margin-top: 15px;
      }
      
      .govease-progress-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 5px;
      }
      
      .govease-progress-fill {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s ease;
      }
      
      .govease-progress-text {
        font-size: 11px;
        color: #666;
      }
    `;
        document.head.appendChild(style);
    }
}

// Initialize the assistant
const goveaseAssistant = new GovEaseFormAssistant();

// Make it globally available
window.goveaseAssistant = goveaseAssistant;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'enableAutoFill') {
        goveaseAssistant.enableAutoFillMode();
        sendResponse({ success: true });
    } else if (message.action === 'enableVoiceGuidance') {
        goveaseAssistant.enableVoiceGuidance();
        sendResponse({ success: true });
    } else if (message.action === 'enableFieldHelp') {
        goveaseAssistant.enableFieldHelp();
        sendResponse({ success: true });
    }
    return true;
});

// Add additional methods to the GovEaseFormAssistant class
GovEaseFormAssistant.prototype.enableAutoFillMode = function () {
    this.announce('Auto-fill mode enabled. I will automatically suggest your information for form fields.');
    // Highlight fields that can be auto-filled
    if (this.forms.length > 0) {
        this.forms.forEach(form => {
            form.fields.forEach(field => {
                if (field.suggestions.length > 0) {
                    field.element.style.border = '2px solid #4CAF50';
                    field.element.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                }
            });
        });
    }
};

GovEaseFormAssistant.prototype.enableVoiceGuidance = function () {
    this.announce('Voice guidance enabled. I will read form instructions and provide audio feedback.');
    // Enable enhanced voice features
    this.enhancedVoiceEnabled = true;
};

GovEaseFormAssistant.prototype.enableFieldHelp = function () {
    this.announce('Field help enabled. Hover over form fields to hear explanations.');
    // Add field help tooltips
    if (this.forms.length > 0) {
        this.forms.forEach(form => {
            form.fields.forEach(field => {
                field.element.addEventListener('mouseenter', () => {
                    this.announceFieldHelp(field);
                });
            });
        });
    }
};

GovEaseFormAssistant.prototype.announceFieldHelp = function (field) {
    if (this.userProfile?.preferences?.voiceEnabled) {
        const helpText = `${field.label}. ${field.required ? 'This field is required.' : 'This field is optional.'}`;
        this.announce(helpText);
    }
};