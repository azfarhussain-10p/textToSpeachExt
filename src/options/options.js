/**
 * Options Page Script for TTS Extension
 * Comprehensive settings management interface
 */

class TTSOptions {
  constructor() {
    this.settings = {};
    this.voices = [];
    this.currentTab = 'general';
    
    this.init();
  }

  async init() {
    try {
      // Initialize DOM elements
      this.initializeElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadSettings();
      await this.loadVoices();
      
      // Update UI
      this.updateUI();
      this.updateDebugInfo();
      
      console.log('TTS Options initialized');
    } catch (error) {
      console.error('Failed to initialize options:', error);
      this.showNotification('Failed to load settings', 'error');
    }
  }

  initializeElements() {
    // Tab navigation
    this.tabButtons = document.querySelectorAll('.nav-tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // General settings
    this.extensionEnabled = document.getElementById('extensionEnabled');
    this.autoStart = document.getElementById('autoStart');
    this.contextMenu = document.getElementById('contextMenu');
    this.defaultLanguage = document.getElementById('defaultLanguage');
    
    // Voice settings
    this.voiceSelect = document.getElementById('voiceSelect');
    this.speechRate = document.getElementById('speechRate');
    this.speechRateValue = document.getElementById('speechRateValue');
    this.speechPitch = document.getElementById('speechPitch');
    this.speechPitchValue = document.getElementById('speechPitchValue');
    this.speechVolume = document.getElementById('speechVolume');
    this.speechVolumeValue = document.getElementById('speechVolumeValue');
    this.pauseOnSwitch = document.getElementById('pauseOnSwitch');
    this.highlightText = document.getElementById('highlightText');
    this.testVoiceBtn = document.getElementById('testVoiceBtn');
    
    // AI settings
    this.aiEnabled = document.getElementById('aiEnabled');
    this.aiSettings = document.getElementById('aiSettings');
    this.aiProvider = document.getElementById('aiProvider');
    this.explanationStyle = document.getElementById('explanationStyle');
    this.explanationLength = document.getElementById('explanationLength');
    this.groqApiKey = document.getElementById('groqApiKey');
    this.claudeApiKey = document.getElementById('claudeApiKey');
    this.testAiBtn = document.getElementById('testAiBtn');
    
    // UI settings
    this.overlayPosition = document.getElementById('overlayPosition');
    this.uiTheme = document.getElementById('uiTheme');
    this.keyboardShortcuts = document.getElementById('keyboardShortcuts');
    this.animationsEnabled = document.getElementById('animationsEnabled');
    this.overlaySize = document.getElementById('overlaySize');
    
    // Privacy settings
    this.aiDataConsent = document.getElementById('aiDataConsent');
    this.usageAnalytics = document.getElementById('usageAnalytics');
    this.errorReporting = document.getElementById('errorReporting');
    this.clearDataBtn = document.getElementById('clearDataBtn');
    this.exportSettingsBtn = document.getElementById('exportSettingsBtn');
    this.importSettingsBtn = document.getElementById('importSettingsBtn');
    this.settingsFileInput = document.getElementById('settingsFileInput');
    
    // Advanced settings
    this.maxTextLength = document.getElementById('maxTextLength');
    this.maxTextLengthValue = document.getElementById('maxTextLengthValue');
    this.chunkSize = document.getElementById('chunkSize');
    this.chunkSizeValue = document.getElementById('chunkSizeValue');
    this.retryAttempts = document.getElementById('retryAttempts');
    this.debugMode = document.getElementById('debugMode');
    this.betaFeatures = document.getElementById('betaFeatures');
    this.resetSettingsBtn = document.getElementById('resetSettingsBtn');
    this.debugInfo = document.getElementById('debugInfo');
    this.copyDebugBtn = document.getElementById('copyDebugBtn');
    
    // Version and notification
    this.versionNumber = document.getElementById('versionNumber');
    this.notification = document.getElementById('notification');
  }

  setupEventListeners() {
    // Tab navigation
    this.tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // General settings
    this.extensionEnabled?.addEventListener('change', this.updateGeneralSettings.bind(this));
    this.autoStart?.addEventListener('change', this.updateGeneralSettings.bind(this));
    this.contextMenu?.addEventListener('change', this.updateGeneralSettings.bind(this));
    this.defaultLanguage?.addEventListener('change', this.updateGeneralSettings.bind(this));
    
    // Voice settings
    this.voiceSelect?.addEventListener('change', this.updateVoiceSettings.bind(this));
    this.speechRate?.addEventListener('input', this.updateSpeechRate.bind(this));
    this.speechPitch?.addEventListener('input', this.updateSpeechPitch.bind(this));
    this.speechVolume?.addEventListener('input', this.updateSpeechVolume.bind(this));
    this.pauseOnSwitch?.addEventListener('change', this.updateVoiceSettings.bind(this));
    this.highlightText?.addEventListener('change', this.updateVoiceSettings.bind(this));
    this.testVoiceBtn?.addEventListener('click', this.testVoice.bind(this));
    
    // AI settings
    this.aiEnabled?.addEventListener('change', this.toggleAISettings.bind(this));
    this.aiProvider?.addEventListener('change', this.updateAISettings.bind(this));
    this.explanationStyle?.addEventListener('change', this.updateAISettings.bind(this));
    this.explanationLength?.addEventListener('change', this.updateAISettings.bind(this));
    this.groqApiKey?.addEventListener('input', this.updateAPIKeys.bind(this));
    this.claudeApiKey?.addEventListener('input', this.updateAPIKeys.bind(this));
    this.testAiBtn?.addEventListener('click', this.testAI.bind(this));
    
    // UI settings
    this.overlayPosition?.addEventListener('change', this.updateUISettings.bind(this));
    this.uiTheme?.addEventListener('change', this.updateUISettings.bind(this));
    this.keyboardShortcuts?.addEventListener('change', this.updateUISettings.bind(this));
    this.animationsEnabled?.addEventListener('change', this.updateUISettings.bind(this));
    this.overlaySize?.addEventListener('change', this.updateUISettings.bind(this));
    
    // Privacy settings
    this.aiDataConsent?.addEventListener('change', this.updatePrivacySettings.bind(this));
    this.usageAnalytics?.addEventListener('change', this.updatePrivacySettings.bind(this));
    this.errorReporting?.addEventListener('change', this.updatePrivacySettings.bind(this));
    this.clearDataBtn?.addEventListener('click', this.clearData.bind(this));
    this.exportSettingsBtn?.addEventListener('click', this.exportSettings.bind(this));
    this.importSettingsBtn?.addEventListener('click', () => this.settingsFileInput.click());
    this.settingsFileInput?.addEventListener('change', this.importSettings.bind(this));
    
    // Advanced settings
    this.maxTextLength?.addEventListener('input', this.updateMaxTextLength.bind(this));
    this.chunkSize?.addEventListener('input', this.updateChunkSize.bind(this));
    this.retryAttempts?.addEventListener('change', this.updateAdvancedSettings.bind(this));
    this.debugMode?.addEventListener('change', this.updateAdvancedSettings.bind(this));
    this.betaFeatures?.addEventListener('change', this.updateAdvancedSettings.bind(this));
    this.resetSettingsBtn?.addEventListener('click', this.resetSettings.bind(this));
    this.copyDebugBtn?.addEventListener('click', this.copyDebugInfo.bind(this));
    
    // Password toggle buttons
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.addEventListener('click', this.togglePasswordVisibility.bind(this));
    });
    
    // Notification close
    const notificationClose = document.querySelector('.notification-close');
    if (notificationClose) {
      notificationClose.addEventListener('click', this.hideNotification.bind(this));
    }
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      
      if (response.success) {
        this.settings = response.settings;
      } else {
        this.settings = this.getDefaultSettings();
      }
      
      console.log('Settings loaded:', this.settings);
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
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  }

  updateUI() {
    // Update version
    const manifest = chrome.runtime.getManifest();
    if (this.versionNumber) {
      this.versionNumber.textContent = manifest.version;
    }
    
    // General settings
    if (this.settings.extensionSettings) {
      this.extensionEnabled.checked = this.settings.extensionSettings.enabled !== false;
      this.autoStart.checked = this.settings.extensionSettings.autoStart || false;
      this.contextMenu.checked = this.settings.extensionSettings.contextMenu !== false;
      this.defaultLanguage.value = this.settings.ttsSettings?.language || 'en-US';
    }
    
    // Voice settings
    if (this.settings.ttsSettings) {
      this.speechRate.value = this.settings.ttsSettings.rate || 1.0;
      this.speechRateValue.textContent = `${this.settings.ttsSettings.rate || 1.0}x`;
      
      this.speechPitch.value = this.settings.ttsSettings.pitch || 1.0;
      this.speechPitchValue.textContent = (this.settings.ttsSettings.pitch || 1.0).toFixed(1);
      
      this.speechVolume.value = this.settings.ttsSettings.volume || 1.0;
      this.speechVolumeValue.textContent = `${Math.round((this.settings.ttsSettings.volume || 1.0) * 100)}%`;
      
      this.pauseOnSwitch.checked = this.settings.ttsSettings.pauseOnSwitch || false;
      this.highlightText.checked = this.settings.ttsSettings.highlightText || false;
    }
    
    // AI settings
    if (this.settings.aiSettings && this.settings.privacySettings) {
      this.aiEnabled.checked = this.settings.privacySettings.aiExplanationsConsent || false;
      this.aiProvider.value = this.settings.aiSettings.provider || 'groq';
      this.explanationStyle.value = this.settings.aiSettings.explanationStyle || 'simple';
      this.explanationLength.value = this.settings.aiSettings.explanationLength || 'medium';
      
      this.toggleAISettingsVisibility(this.aiEnabled.checked);
    }
    
    // UI settings
    if (this.settings.uiSettings) {
      this.overlayPosition.value = this.settings.uiSettings.overlayPosition || 'bottom-right';
      this.uiTheme.value = this.settings.uiSettings.theme || 'auto';
      this.keyboardShortcuts.checked = this.settings.uiSettings.keyboardShortcuts !== false;
      this.animationsEnabled.checked = this.settings.uiSettings.animationsEnabled !== false;
      this.overlaySize.value = this.settings.uiSettings.overlaySize || 'medium';
    }
    
    // Privacy settings
    if (this.settings.privacySettings) {
      this.aiDataConsent.checked = this.settings.privacySettings.aiExplanationsConsent || false;
      this.usageAnalytics.checked = this.settings.privacySettings.analytics || false;
      this.errorReporting.checked = this.settings.privacySettings.errorReporting || false;
    }
    
    // Advanced settings
    if (this.settings.advancedSettings) {
      this.maxTextLength.value = this.settings.advancedSettings.maxTextLength || 2000;
      this.maxTextLengthValue.textContent = `${this.settings.advancedSettings.maxTextLength || 2000} chars`;
      
      this.chunkSize.value = this.settings.advancedSettings.chunkSize || 200;
      this.chunkSizeValue.textContent = `${this.settings.advancedSettings.chunkSize || 200} chars`;
      
      this.retryAttempts.value = this.settings.advancedSettings.retryAttempts || 3;
      this.debugMode.checked = this.settings.advancedSettings.debugMode || false;
      this.betaFeatures.checked = this.settings.advancedSettings.betaFeatures || false;
    }
  }

  populateVoiceSelect() {
    if (!this.voiceSelect || this.voices.length === 0) return;
    
    this.voiceSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'System Default';
    this.voiceSelect.appendChild(defaultOption);
    
    // Group voices by language
    const voicesByLang = {};
    this.voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      if (!voicesByLang[lang]) {
        voicesByLang[lang] = [];
      }
      voicesByLang[lang].push(voice);
    });
    
    // Add voice options
    Object.keys(voicesByLang).sort().forEach(lang => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = this.getLanguageName(lang);
      
      voicesByLang[lang].forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voiceURI || voice.name;
        option.textContent = `${voice.name} ${voice.localService ? '(Local)' : '(Online)'}`;
        optgroup.appendChild(option);
      });
      
      this.voiceSelect.appendChild(optgroup);
    });
    
    // Set current voice
    if (this.settings.ttsSettings?.voice) {
      this.voiceSelect.value = this.settings.ttsSettings.voice.voiceURI || this.settings.ttsSettings.voice.name || '';
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab buttons
    this.tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });
    
    // Update tab content
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });
  }

  async updateGeneralSettings() {
    const extensionSettings = {
      enabled: this.extensionEnabled.checked,
      autoStart: this.autoStart.checked,
      contextMenu: this.contextMenu.checked
    };
    
    const ttsSettings = {
      ...this.settings.ttsSettings,
      language: this.defaultLanguage.value
    };
    
    await this.saveSettings({
      extensionSettings,
      ttsSettings
    });
  }

  async updateVoiceSettings() {
    const selectedVoice = this.voiceSelect.value;
    let voice = null;
    
    if (selectedVoice) {
      voice = this.voices.find(v => v.voiceURI === selectedVoice || v.name === selectedVoice);
    }
    
    const ttsSettings = {
      ...this.settings.ttsSettings,
      voice: voice,
      pauseOnSwitch: this.pauseOnSwitch.checked,
      highlightText: this.highlightText.checked
    };
    
    await this.saveSettings({ ttsSettings });
  }

  updateSpeechRate() {
    const rate = parseFloat(this.speechRate.value);
    this.speechRateValue.textContent = `${rate.toFixed(1)}x`;
    
    this.debounce(async () => {
      const ttsSettings = {
        ...this.settings.ttsSettings,
        rate: rate
      };
      await this.saveSettings({ ttsSettings });
    }, 300);
  }

  updateSpeechPitch() {
    const pitch = parseFloat(this.speechPitch.value);
    this.speechPitchValue.textContent = pitch.toFixed(1);
    
    this.debounce(async () => {
      const ttsSettings = {
        ...this.settings.ttsSettings,
        pitch: pitch
      };
      await this.saveSettings({ ttsSettings });
    }, 300);
  }

  updateSpeechVolume() {
    const volume = parseFloat(this.speechVolume.value);
    this.speechVolumeValue.textContent = `${Math.round(volume * 100)}%`;
    
    this.debounce(async () => {
      const ttsSettings = {
        ...this.settings.ttsSettings,
        volume: volume
      };
      await this.saveSettings({ ttsSettings });
    }, 300);
  }

  async testVoice() {
    const testText = 'Hello! This is a test of your current voice settings. The text-to-speech extension is working correctly.';
    
    try {
      await chrome.tabs.create({ 
        url: 'data:text/html,<html><body><h1>Voice Test</h1><p>Testing voice settings...</p></body></html>',
        active: false
      });
      
      setTimeout(async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          await chrome.tabs.sendMessage(tabs[0].id, {
            type: 'TTS_CONTEXT_MENU',
            data: { text: testText, action: 'speak' }
          });
        }
      }, 1000);
      
      this.showNotification('Voice test started', 'success');
    } catch (error) {
      console.error('Voice test failed:', error);
      this.showNotification('Voice test failed', 'error');
    }
  }

  toggleAISettings() {
    const enabled = this.aiEnabled.checked;
    this.toggleAISettingsVisibility(enabled);
    
    this.debounce(async () => {
      const privacySettings = {
        ...this.settings.privacySettings,
        aiExplanationsConsent: enabled
      };
      
      const aiSettings = {
        ...this.settings.aiSettings,
        enableExplanations: enabled
      };
      
      await this.saveSettings({
        privacySettings,
        aiSettings
      });
    }, 100);
  }

  toggleAISettingsVisibility(show) {
    if (this.aiSettings) {
      this.aiSettings.style.display = show ? 'block' : 'none';
    }
  }

  async updateAISettings() {
    const aiSettings = {
      ...this.settings.aiSettings,
      provider: this.aiProvider.value,
      explanationStyle: this.explanationStyle.value,
      explanationLength: this.explanationLength.value
    };
    
    await this.saveSettings({ aiSettings });
  }

  async updateAPIKeys() {
    this.debounce(async () => {
      await this.saveAPIKey('groqApiKey', this.groqApiKey.value);
      await this.saveAPIKey('claudeApiKey', this.claudeApiKey.value);
    }, 500);
  }

  async saveAPIKey(keyName, value) {
    try {
      await chrome.storage.sync.set({ [keyName]: value });
    } catch (error) {
      console.error(`Failed to save ${keyName}:`, error);
    }
  }

  async testAI() {
    const testText = 'artificial intelligence';
    
    try {
      this.showNotification('Testing AI explanation...', 'info');
      
      const response = await chrome.runtime.sendMessage({
        type: 'AI_EXPLAIN',
        data: {
          text: testText,
          context: { test: true }
        }
      });
      
      if (response.success) {
        this.showNotification(`AI test successful! Provider: ${response.provider}`, 'success');
      } else {
        this.showNotification(`AI test failed: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('AI test failed:', error);
      this.showNotification('AI test failed: Network error', 'error');
    }
  }

  async updateUISettings() {
    const uiSettings = {
      ...this.settings.uiSettings,
      overlayPosition: this.overlayPosition.value,
      theme: this.uiTheme.value,
      keyboardShortcuts: this.keyboardShortcuts.checked,
      animationsEnabled: this.animationsEnabled.checked,
      overlaySize: this.overlaySize.value
    };
    
    await this.saveSettings({ uiSettings });
  }

  async updatePrivacySettings() {
    const privacySettings = {
      ...this.settings.privacySettings,
      aiExplanationsConsent: this.aiDataConsent.checked,
      analytics: this.usageAnalytics.checked,
      errorReporting: this.errorReporting.checked
    };
    
    await this.saveSettings({ privacySettings });
  }

  updateMaxTextLength() {
    const value = parseInt(this.maxTextLength.value);
    this.maxTextLengthValue.textContent = `${value} chars`;
    
    this.debounce(async () => {
      const advancedSettings = {
        ...this.settings.advancedSettings,
        maxTextLength: value
      };
      await this.saveSettings({ advancedSettings });
    }, 300);
  }

  updateChunkSize() {
    const value = parseInt(this.chunkSize.value);
    this.chunkSizeValue.textContent = `${value} chars`;
    
    this.debounce(async () => {
      const advancedSettings = {
        ...this.settings.advancedSettings,
        chunkSize: value
      };
      await this.saveSettings({ advancedSettings });
    }, 300);
  }

  async updateAdvancedSettings() {
    const advancedSettings = {
      ...this.settings.advancedSettings,
      retryAttempts: parseInt(this.retryAttempts.value),
      debugMode: this.debugMode.checked,
      betaFeatures: this.betaFeatures.checked
    };
    
    await this.saveSettings({ advancedSettings });
  }

  async saveSettings(newSettings) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        data: newSettings
      });
      
      if (response.success) {
        // Merge settings
        Object.keys(newSettings).forEach(key => {
          this.settings[key] = { ...this.settings[key], ...newSettings[key] };
        });
        
        this.updateDebugInfo();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification('Failed to save settings', 'error');
    }
  }

  async clearData() {
    if (!window.confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      return;
    }
    
    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      
      this.settings = this.getDefaultSettings();
      this.updateUI();
      this.updateDebugInfo();
      
      this.showNotification('All data cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing data:', error);
      this.showNotification('Failed to clear data', 'error');
    }
  }

  exportSettings() {
    try {
      const exportData = {
        settings: this.settings,
        timestamp: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tts-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showNotification('Settings exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.showNotification('Failed to export settings', 'error');
    }
  }

  async importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.settings) {
        await this.saveSettings(importData.settings);
        this.updateUI();
        this.showNotification('Settings imported successfully', 'success');
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Import failed:', error);
      this.showNotification('Failed to import settings', 'error');
    }
    
    // Clear file input
    event.target.value = '';
  }

  async resetSettings() {
    if (!window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      return;
    }
    
    try {
      const defaultSettings = this.getDefaultSettings();
      await this.saveSettings(defaultSettings);
      this.settings = defaultSettings;
      this.updateUI();
      
      this.showNotification('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Reset failed:', error);
      this.showNotification('Failed to reset settings', 'error');
    }
  }

  updateDebugInfo() {
    if (!this.debugInfo) return;
    
    const debugData = {
      version: chrome.runtime.getManifest().version,
      browser: this.getBrowserInfo(),
      settings: this.settings,
      voices: this.voices.length,
      timestamp: new Date().toISOString()
    };
    
    this.debugInfo.value = JSON.stringify(debugData, null, 2);
  }

  copyDebugInfo() {
    if (!this.debugInfo) return;
    
    this.debugInfo.select();
    document.execCommand('copy');
    this.showNotification('Debug info copied to clipboard', 'success');
  }

  togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    // Update icon (could be enhanced with actual icon swap)
    button.title = isPassword ? 'Hide password' : 'Show password';
  }

  showNotification(message, type = 'info') {
    if (!this.notification) return;
    
    const notificationText = this.notification.querySelector('.notification-text');
    notificationText.textContent = message;
    
    this.notification.className = `notification notification-${type}`;
    this.notification.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification() {
    if (this.notification) {
      this.notification.style.display = 'none';
    }
  }

  debounce(func, delay) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, delay);
  }

  getDefaultSettings() {
    return {
      extensionSettings: {
        enabled: true,
        autoStart: false,
        contextMenu: true
      },
      ttsSettings: {
        voice: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US',
        pauseOnSwitch: false,
        highlightText: false
      },
      aiSettings: {
        provider: 'groq',
        enableExplanations: false,
        explanationStyle: 'simple',
        explanationLength: 'medium'
      },
      uiSettings: {
        overlayPosition: 'bottom-right',
        theme: 'auto',
        keyboardShortcuts: true,
        animationsEnabled: true,
        overlaySize: 'medium'
      },
      privacySettings: {
        aiExplanationsConsent: false,
        analytics: false,
        errorReporting: false
      },
      advancedSettings: {
        maxTextLength: 2000,
        chunkSize: 200,
        retryAttempts: 3,
        debugMode: false,
        betaFeatures: false
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

  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
}

// Initialize options page
document.addEventListener('DOMContentLoaded', () => {
  new TTSOptions();
});