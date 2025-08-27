/**
 * Popup Script for Intelligent TTS Extension
 * Handles popup UI interactions and settings management
 */

class TTSPopup {
  constructor() {
    this.settings = {};
    this.voices = [];
    this.isLoading = false;
    
    // DOM elements
    this.elements = {};
    
    this.init();
  }

  async init() {
    try {
      // Get DOM elements
      this.initializeElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadSettings();
      await this.loadVoices();
      await this.loadUsageStats();
      
      // Update UI
      this.updateUI();
      
      console.log('TTS Popup initialized');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showError('Failed to load extension settings');
    }
  }

  initializeElements() {
    // Status elements
    this.elements.statusDot = document.getElementById('statusDot');
    this.elements.statusText = document.getElementById('statusText');
    this.elements.testTTSBtn = document.getElementById('testTTSBtn');
    this.elements.toggleExtensionBtn = document.getElementById('toggleExtensionBtn');

    // Voice settings
    this.elements.voiceSelect = document.getElementById('voiceSelect');
    this.elements.rateSlider = document.getElementById('rateSlider');
    this.elements.rateValue = document.getElementById('rateValue');
    this.elements.pitchSlider = document.getElementById('pitchSlider');
    this.elements.pitchValue = document.getElementById('pitchValue');
    this.elements.volumeSlider = document.getElementById('volumeSlider');
    this.elements.volumeValue = document.getElementById('volumeValue');

    // AI settings
    this.elements.aiExplanationsEnabled = document.getElementById('aiExplanationsEnabled');
    this.elements.aiProviderSelect = document.getElementById('aiProviderSelect');
    this.elements.explanationLengthSelect = document.getElementById('explanationLengthSelect');
    this.elements.aiProviderGroups = document.querySelectorAll('.ai-provider-group');

    // Usage stats
    this.elements.speechCount = document.getElementById('speechCount');
    this.elements.explanationCount = document.getElementById('explanationCount');
    this.elements.todayUsage = document.getElementById('todayUsage');

    // Footer buttons
    this.elements.settingsBtn = document.getElementById('settingsBtn');
    this.elements.helpBtn = document.getElementById('helpBtn');
    this.elements.privacyBtn = document.getElementById('privacyBtn');
    this.elements.feedbackBtn = document.getElementById('feedbackBtn');
    this.elements.versionNumber = document.getElementById('versionNumber');

    // Modal elements
    this.elements.privacyModal = document.getElementById('privacyModal');
    this.elements.modalClose = document.getElementById('modalClose');
    this.elements.privacyAccept = document.getElementById('privacyAccept');
    this.elements.privacyDecline = document.getElementById('privacyDecline');

    // Loading overlay
    this.elements.loadingOverlay = document.getElementById('loadingOverlay');
  }

  setupEventListeners() {
    // Quick actions
    this.elements.testTTSBtn.addEventListener('click', this.testTTS.bind(this));
    this.elements.toggleExtensionBtn.addEventListener('click', this.toggleExtension.bind(this));

    // Voice settings
    this.elements.voiceSelect.addEventListener('change', this.updateVoiceSetting.bind(this));
    this.elements.rateSlider.addEventListener('input', this.updateRateSetting.bind(this));
    this.elements.pitchSlider.addEventListener('input', this.updatePitchSetting.bind(this));
    this.elements.volumeSlider.addEventListener('input', this.updateVolumeSetting.bind(this));

    // AI settings
    this.elements.aiExplanationsEnabled.addEventListener('change', this.toggleAIExplanations.bind(this));
    this.elements.aiProviderSelect.addEventListener('change', this.updateAIProvider.bind(this));
    this.elements.explanationLengthSelect.addEventListener('change', this.updateExplanationLength.bind(this));

    // Footer buttons
    this.elements.settingsBtn.addEventListener('click', this.openSettings.bind(this));
    this.elements.helpBtn.addEventListener('click', this.openHelp.bind(this));
    this.elements.privacyBtn.addEventListener('click', this.openPrivacy.bind(this));
    this.elements.feedbackBtn.addEventListener('click', this.openFeedback.bind(this));

    // Modal events
    this.elements.modalClose.addEventListener('click', this.closePrivacyModal.bind(this));
    this.elements.privacyAccept.addEventListener('click', this.acceptPrivacy.bind(this));
    this.elements.privacyDecline.addEventListener('click', this.declinePrivacy.bind(this));
    this.elements.privacyModal.addEventListener('click', (e) => {
      if (e.target === this.elements.privacyModal) {
        this.closePrivacyModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      
      if (response.success) {
        this.settings = response.settings;
        console.log('Settings loaded:', this.settings);
      } else {
        console.warn('Failed to load settings, using defaults');
        this.settings = this.getDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  async loadVoices() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_VOICES' });
      
      if (response.success && response.voices) {
        this.voices = response.voices;
        this.populateVoiceSelect();
      } else {
        console.warn('Failed to load voices');
        this.showVoiceError();
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      this.showVoiceError();
    }
  }

  async loadUsageStats() {
    try {
      const stats = await chrome.storage.local.get(['speechCount', 'explanationCount', 'dailyUsage']);
      
      this.elements.speechCount.textContent = stats.speechCount || 0;
      this.elements.explanationCount.textContent = stats.explanationCount || 0;
      
      // Calculate today's usage
      const today = new Date().toDateString();
      const dailyUsage = stats.dailyUsage || {};
      this.elements.todayUsage.textContent = dailyUsage[today] || 0;
      
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  }

  updateUI() {
    // Update voice settings
    if (this.settings.ttsSettings) {
      this.elements.rateSlider.value = this.settings.ttsSettings.rate || 1.0;
      this.elements.rateValue.textContent = `${this.settings.ttsSettings.rate || 1.0}x`;
      
      this.elements.pitchSlider.value = this.settings.ttsSettings.pitch || 1.0;
      this.elements.pitchValue.textContent = (this.settings.ttsSettings.pitch || 1.0).toFixed(1);
      
      this.elements.volumeSlider.value = this.settings.ttsSettings.volume || 1.0;
      this.elements.volumeValue.textContent = `${Math.round((this.settings.ttsSettings.volume || 1.0) * 100)}%`;
    }

    // Update AI settings
    if (this.settings.privacySettings && this.settings.aiSettings) {
      this.elements.aiExplanationsEnabled.checked = this.settings.privacySettings.aiExplanationsConsent || false;
      this.elements.aiProviderSelect.value = this.settings.aiSettings.provider || 'groq';
      this.elements.explanationLengthSelect.value = this.settings.aiSettings.explanationLength || 'medium';
      
      this.toggleAIProviderGroups(this.elements.aiExplanationsEnabled.checked);
    }

    // Update extension version
    const manifest = chrome.runtime.getManifest();
    this.elements.versionNumber.textContent = manifest.version;

    // Update status
    this.updateStatus();
  }

  populateVoiceSelect() {
    const select = this.elements.voiceSelect;
    select.innerHTML = '';

    if (this.voices.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No voices available';
      select.appendChild(option);
      return;
    }

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'System Default';
    select.appendChild(defaultOption);

    // Group voices by language
    const voicesByLang = {};
    this.voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      if (!voicesByLang[lang]) {
        voicesByLang[lang] = [];
      }
      voicesByLang[lang].push(voice);
    });

    // Add voice options grouped by language
    Object.keys(voicesByLang).sort().forEach(lang => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = this.getLanguageName(lang);
      
      voicesByLang[lang].forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voiceURI || voice.name;
        option.textContent = `${voice.name} ${voice.localService ? '(Local)' : '(Online)'}`;
        optgroup.appendChild(option);
      });
      
      select.appendChild(optgroup);
    });

    // Set current voice
    if (this.settings.ttsSettings && this.settings.ttsSettings.voice) {
      select.value = this.settings.ttsSettings.voice.voiceURI || this.settings.ttsSettings.voice.name || '';
    }
  }

  showVoiceError() {
    const select = this.elements.voiceSelect;
    select.innerHTML = '<option value="">Failed to load voices</option>';
  }

  async testTTS() {
    if (this.isLoading) return;
    
    this.setLoading(true);
    this.updateStatus('Testing...', 'loading');
    
    try {
      // Send test message to active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TTS_CONTEXT_MENU',
          data: { 
            text: 'Hello! This is a test of the Text-to-Speech extension. The voice settings are working correctly.',
            action: 'speak'
          }
        });
        
        this.updateStatus('Test completed', 'success');
        setTimeout(() => this.updateStatus(), 2000);
        
        // Update usage stats
        await this.incrementUsageStats('speech');
        
      } else {
        throw new Error('No active tab found');
      }
    } catch (error) {
      console.error('TTS test failed:', error);
      this.updateStatus('Test failed', 'error');
      setTimeout(() => this.updateStatus(), 3000);
    } finally {
      this.setLoading(false);
    }
  }

  async toggleExtension() {
    // This would toggle the extension's active state
    // For now, we'll just show a message
    this.updateStatus('Extension toggled', 'success');
    setTimeout(() => this.updateStatus(), 2000);
  }

  async updateVoiceSetting() {
    const selectedVoice = this.elements.voiceSelect.value;
    
    // Find the voice object
    let voice = null;
    if (selectedVoice) {
      voice = this.voices.find(v => v.voiceURI === selectedVoice || v.name === selectedVoice);
    }
    
    await this.updateSettings({
      ttsSettings: {
        ...this.settings.ttsSettings,
        voice: voice
      }
    });
  }

  async updateRateSetting() {
    const rate = parseFloat(this.elements.rateSlider.value);
    this.elements.rateValue.textContent = `${rate.toFixed(1)}x`;
    
    await this.updateSettings({
      ttsSettings: {
        ...this.settings.ttsSettings,
        rate: rate
      }
    });
  }

  async updatePitchSetting() {
    const pitch = parseFloat(this.elements.pitchSlider.value);
    this.elements.pitchValue.textContent = pitch.toFixed(1);
    
    await this.updateSettings({
      ttsSettings: {
        ...this.settings.ttsSettings,
        pitch: pitch
      }
    });
  }

  async updateVolumeSetting() {
    const volume = parseFloat(this.elements.volumeSlider.value);
    this.elements.volumeValue.textContent = `${Math.round(volume * 100)}%`;
    
    await this.updateSettings({
      ttsSettings: {
        ...this.settings.ttsSettings,
        volume: volume
      }
    });
  }

  async toggleAIExplanations() {
    const enabled = this.elements.aiExplanationsEnabled.checked;
    
    if (enabled && !this.settings.privacySettings?.aiExplanationsConsent) {
      // Show privacy consent modal
      this.showPrivacyModal();
      // Revert checkbox until user decides
      this.elements.aiExplanationsEnabled.checked = false;
      return;
    }
    
    await this.updateSettings({
      privacySettings: {
        ...this.settings.privacySettings,
        aiExplanationsConsent: enabled
      },
      aiSettings: {
        ...this.settings.aiSettings,
        enableExplanations: enabled
      }
    });
    
    this.toggleAIProviderGroups(enabled);
  }

  toggleAIProviderGroups(show) {
    this.elements.aiProviderGroups.forEach(group => {
      group.style.display = show ? 'block' : 'none';
      if (show) {
        group.classList.add('enabled');
      } else {
        group.classList.remove('enabled');
      }
    });
  }

  async updateAIProvider() {
    const provider = this.elements.aiProviderSelect.value;
    
    await this.updateSettings({
      aiSettings: {
        ...this.settings.aiSettings,
        provider: provider
      }
    });
  }

  async updateExplanationLength() {
    const length = this.elements.explanationLengthSelect.value;
    
    await this.updateSettings({
      aiSettings: {
        ...this.settings.aiSettings,
        explanationLength: length
      }
    });
  }

  async updateSettings(newSettings) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        data: newSettings
      });
      
      if (response.success) {
        // Merge new settings
        Object.keys(newSettings).forEach(key => {
          this.settings[key] = { ...this.settings[key], ...newSettings[key] };
        });
        
        console.log('Settings updated:', newSettings);
      } else {
        console.error('Failed to update settings:', response.error);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  showPrivacyModal() {
    this.elements.privacyModal.style.display = 'flex';
    this.elements.privacyAccept.focus();
  }

  closePrivacyModal() {
    this.elements.privacyModal.style.display = 'none';
  }

  async acceptPrivacy() {
    await this.updateSettings({
      privacySettings: {
        ...this.settings.privacySettings,
        aiExplanationsConsent: true
      },
      aiSettings: {
        ...this.settings.aiSettings,
        enableExplanations: true
      }
    });
    
    this.elements.aiExplanationsEnabled.checked = true;
    this.toggleAIProviderGroups(true);
    this.closePrivacyModal();
  }

  async declinePrivacy() {
    // Keep AI explanations disabled
    this.elements.aiExplanationsEnabled.checked = false;
    this.toggleAIProviderGroups(false);
    this.closePrivacyModal();
  }

  async openSettings() {
    try {
      await chrome.runtime.openOptionsPage();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }

  openHelp() {
    chrome.tabs.create({ url: 'https://github.com/azfarhussain-10p/textToSpeachExt#help' });
  }

  openPrivacy() {
    chrome.tabs.create({ url: 'https://github.com/azfarhussain-10p/textToSpeachExt/blob/main/PRIVACY.md' });
  }

  openFeedback() {
    chrome.tabs.create({ url: 'https://github.com/azfarhussain-10p/textToSpeachExt/issues/new?template=feedback.md' });
  }

  handleKeyboardShortcuts(event) {
    // Escape to close modal
    if (event.key === 'Escape' && this.elements.privacyModal.style.display === 'flex') {
      this.closePrivacyModal();
    }
    
    // Ctrl+T to test TTS
    if (event.ctrlKey && event.key === 't') {
      event.preventDefault();
      this.testTTS();
    }
  }

  async incrementUsageStats(type) {
    try {
      const stats = await chrome.storage.local.get(['speechCount', 'explanationCount', 'dailyUsage']);
      const today = new Date().toDateString();
      
      const newStats = {
        speechCount: (stats.speechCount || 0) + (type === 'speech' ? 1 : 0),
        explanationCount: (stats.explanationCount || 0) + (type === 'explanation' ? 1 : 0),
        dailyUsage: {
          ...(stats.dailyUsage || {}),
          [today]: ((stats.dailyUsage || {})[today] || 0) + 1
        }
      };
      
      await chrome.storage.local.set(newStats);
      
      // Update UI
      this.elements.speechCount.textContent = newStats.speechCount;
      this.elements.explanationCount.textContent = newStats.explanationCount;
      this.elements.todayUsage.textContent = newStats.dailyUsage[today];
      
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }

  updateStatus(text = 'Ready', type = 'ready') {
    this.elements.statusText.textContent = text;
    
    // Update status dot
    this.elements.statusDot.className = 'status-dot';
    if (type === 'loading') {
      this.elements.statusDot.classList.add('loading');
    } else if (type === 'error') {
      this.elements.statusDot.classList.add('inactive');
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.elements.loadingOverlay.style.display = loading ? 'flex' : 'none';
  }

  showError(message) {
    this.updateStatus(message, 'error');
    setTimeout(() => this.updateStatus(), 5000);
  }

  getDefaultSettings() {
    return {
      ttsSettings: {
        voice: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US'
      },
      aiSettings: {
        provider: 'groq',
        enableExplanations: false,
        explanationLength: 'medium'
      },
      privacySettings: {
        aiExplanationsConsent: false,
        dataCollection: false,
        analytics: false
      }
    };
  }

  getLanguageName(langCode) {
    const langNames = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ur': 'Urdu',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'pl': 'Polish',
      'tr': 'Turkish'
    };
    
    return langNames[langCode] || langCode.toUpperCase();
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TTSPopup();
});

// Handle popup closing
window.addEventListener('beforeunload', () => {
  console.log('TTS Popup closing');
});