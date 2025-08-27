/**
 * Content Script for Intelligent TTS Extension
 * Handles text selection, overlay UI, and user interaction on web pages
 */

// Import TTS Service
if (typeof TTSService === 'undefined') {
  // Dynamically import for content script environment
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('services/tts-service.js');
  document.head.appendChild(script);
}

class TTSContentScript {
  constructor() {
    this.ttsService = null;
    this.overlay = null;
    this.isInitialized = false;
    this.selectedText = '';
    this.selectionRange = null;
    this.settings = null;
    this.isOverlayVisible = false;
    
    // Keyboard shortcuts
    this.keyboardShortcuts = {
      'KeyS': { ctrlKey: true, shiftKey: true }, // Ctrl+Shift+S to speak
      'KeyE': { ctrlKey: true, shiftKey: true }, // Ctrl+Shift+E to explain
      'Escape': { ctrlKey: false, shiftKey: false } // Escape to hide overlay
    };
    
    this.init();
  }

  async init() {
    try {
      // Wait for TTS Service to be available
      await this.waitForTTSService();
      
      // Initialize TTS Service
      this.ttsService = new TTSService();
      await this.ttsService.initialize();
      
      // Load settings
      await this.loadSettings();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize overlay
      this.createOverlay();
      
      this.isInitialized = true;
      console.log('TTS Content Script initialized');
      
    } catch (error) {
      console.error('Failed to initialize TTS Content Script:', error);
    }
  }

  async waitForTTSService() {
    return new Promise((resolve) => {
      const checkTTSService = () => {
        if (typeof TTSService !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkTTSService, 50);
        }
      };
      checkTTSService();
    });
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response.success) {
        this.settings = response.settings;
      } else {
        console.warn('Failed to load settings, using defaults');
        this.settings = {};
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = {};
    }
  }

  setupEventListeners() {
    // Text selection handling
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
    document.addEventListener('keyup', this.handleKeyboardSelection.bind(this));
    
    // Touch support for mobile
    document.addEventListener('touchend', this.handleTextSelection.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    
    // Click outside to hide overlay
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // Message handling from service worker
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Handle window resize
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  handleTextSelection(event) {
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && selectedText.length > 0) {
        this.selectedText = selectedText;
        this.selectionRange = selection.getRangeAt(0);
        this.showOverlay(event.clientX, event.clientY);
      } else {
        this.hideOverlay();
      }
    }, 10);
  }

  handleKeyboardSelection(event) {
    // Handle keyboard text selection
    if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.code)) {
      this.handleTextSelection(event);
    }
  }

  handleKeyboardShortcuts(event) {
    if (!this.settings?.uiSettings?.keyboardShortcuts) return;
    
    for (const [key, modifiers] of Object.entries(this.keyboardShortcuts)) {
      if (event.code === key && 
          event.ctrlKey === modifiers.ctrlKey && 
          event.shiftKey === modifiers.shiftKey) {
        
        event.preventDefault();
        
        switch (key) {
          case 'KeyS':
            if (this.selectedText) {
              this.startTTS();
            }
            break;
          case 'KeyE':
            if (this.selectedText) {
              this.requestExplanation();
            }
            break;
          case 'Escape':
            this.hideOverlay();
            this.stopTTS();
            break;
        }
      }
    }
  }

  handleOutsideClick(event) {
    if (this.isOverlayVisible && this.overlay && !this.overlay.contains(event.target)) {
      this.hideOverlay();
    }
  }

  handleWindowResize() {
    if (this.isOverlayVisible && this.selectionRange) {
      const rect = this.selectionRange.getBoundingClientRect();
      this.positionOverlay(rect.right, rect.bottom);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'TTS_START_RESPONSE':
        if (message.data.success) {
          await this.startTTSWithSettings(message.data.text, message.data.settings);
        }
        break;
        
      case 'TTS_STOP_RESPONSE':
        this.stopTTS();
        break;
        
      case 'TTS_CONTEXT_MENU':
        if (message.data.action === 'speak') {
          this.selectedText = message.data.text;
          this.startTTS();
        } else if (message.data.action === 'explain') {
          this.selectedText = message.data.text;
          this.requestExplanation();
        }
        break;
        
      case 'GET_VOICES_REQUEST': {
        const voices = this.ttsService ? this.ttsService.getVoices() : [];
        sendResponse({ success: true, voices });
        break;
      }
    }
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'tts-extension-overlay';
    this.overlay.className = 'tts-overlay';
    
    this.overlay.innerHTML = `
      <div class="tts-overlay-content">
        <div class="tts-overlay-header">
          <span class="tts-selected-text" title="Selected text">${this.truncateText(this.selectedText, 50)}</span>
          <button class="tts-close-btn" title="Close (Esc)">×</button>
        </div>
        <div class="tts-overlay-controls">
          <button class="tts-btn tts-speak-btn" title="Speak text (Ctrl+Shift+S)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            Speak
          </button>
          <button class="tts-btn tts-explain-btn" title="Get AI explanation (Ctrl+Shift+E)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
            </svg>
            Explain
          </button>
          <div class="tts-controls-secondary">
            <button class="tts-btn tts-pause-btn" title="Pause/Resume" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
            <button class="tts-btn tts-stop-btn" title="Stop" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h12v12H6z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="tts-overlay-status" style="display: none;">
          <div class="tts-status-text">Ready</div>
          <div class="tts-progress-bar">
            <div class="tts-progress-fill"></div>
          </div>
        </div>
        <div class="tts-explanation" style="display: none;">
          <div class="tts-explanation-content"></div>
        </div>
      </div>
    `;
    
    // Add event listeners to overlay buttons
    this.overlay.querySelector('.tts-close-btn').addEventListener('click', this.hideOverlay.bind(this));
    this.overlay.querySelector('.tts-speak-btn').addEventListener('click', this.startTTS.bind(this));
    this.overlay.querySelector('.tts-explain-btn').addEventListener('click', this.requestExplanation.bind(this));
    this.overlay.querySelector('.tts-pause-btn').addEventListener('click', this.togglePause.bind(this));
    this.overlay.querySelector('.tts-stop-btn').addEventListener('click', this.stopTTS.bind(this));
    
    // Add to DOM but keep hidden
    document.body.appendChild(this.overlay);
  }

  showOverlay(x, y) {
    if (!this.overlay) return;
    
    // Update selected text display
    this.overlay.querySelector('.tts-selected-text').textContent = this.truncateText(this.selectedText, 50);
    this.overlay.querySelector('.tts-selected-text').title = this.selectedText;
    
    // Position overlay
    this.positionOverlay(x, y);
    
    // Show overlay
    this.overlay.style.display = 'block';
    this.overlay.classList.add('tts-overlay-visible');
    this.isOverlayVisible = true;
    
    // Reset overlay state
    this.resetOverlayState();
  }

  positionOverlay(x, y) {
    if (!this.overlay) return;
    
    const rect = this.overlay.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Position preference from settings
    const position = this.settings?.uiSettings?.overlayPosition || 'bottom-right';
    
    let left = x + 10;
    let top = y + 10;
    
    // Adjust position based on preference and viewport constraints
    if (position === 'bottom-left') {
      left = Math.max(10, x - rect.width - 10);
    } else if (position === 'top-right') {
      top = Math.max(10, y - rect.height - 10);
    } else if (position === 'top-left') {
      left = Math.max(10, x - rect.width - 10);
      top = Math.max(10, y - rect.height - 10);
    }
    
    // Ensure overlay stays within viewport
    if (left + rect.width > viewportWidth - 20) {
      left = viewportWidth - rect.width - 20;
    }
    if (top + rect.height > viewportHeight - 20) {
      top = viewportHeight - rect.height - 20;
    }
    
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    this.overlay.style.left = `${left}px`;
    this.overlay.style.top = `${top}px`;
  }

  hideOverlay() {
    if (!this.overlay) return;
    
    this.overlay.style.display = 'none';
    this.overlay.classList.remove('tts-overlay-visible');
    this.isOverlayVisible = false;
    
    // Clear selection
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    
    this.selectedText = '';
    this.selectionRange = null;
  }

  resetOverlayState() {
    const status = this.overlay.querySelector('.tts-overlay-status');
    const explanation = this.overlay.querySelector('.tts-explanation');
    const controls = this.overlay.querySelector('.tts-controls-secondary');
    
    status.style.display = 'none';
    explanation.style.display = 'none';
    controls.querySelectorAll('.tts-pause-btn, .tts-stop-btn').forEach(btn => {
      btn.style.display = 'none';
    });
    
    this.updateStatus('Ready');
  }

  updateStatus(text) {
    const statusElement = this.overlay?.querySelector('.tts-status-text');
    if (statusElement) {
      statusElement.textContent = text;
    }
  }

  showStatus() {
    const status = this.overlay?.querySelector('.tts-overlay-status');
    if (status) {
      status.style.display = 'block';
    }
  }

  hideStatus() {
    const status = this.overlay?.querySelector('.tts-overlay-status');
    if (status) {
      status.style.display = 'none';
    }
  }

  async startTTS() {
    if (!this.selectedText || !this.ttsService) return;
    
    try {
      // Show status
      this.showStatus();
      this.updateStatus('Starting speech...');
      
      // Show control buttons
      const controls = this.overlay.querySelector('.tts-controls-secondary');
      controls.querySelectorAll('.tts-pause-btn, .tts-stop-btn').forEach(btn => {
        btn.style.display = 'inline-flex';
      });
      
      // Set up TTS callbacks
      this.ttsService.onStart = () => {
        this.updateStatus('Speaking...');
      };
      
      this.ttsService.onEnd = () => {
        this.updateStatus('Completed');
        setTimeout(() => this.hideStatus(), 2000);
        controls.querySelectorAll('.tts-pause-btn, .tts-stop-btn').forEach(btn => {
          btn.style.display = 'none';
        });
      };
      
      this.ttsService.onError = (error) => {
        this.updateStatus(`Error: ${error.error}`);
        setTimeout(() => this.hideStatus(), 3000);
        controls.querySelectorAll('.tts-pause-btn, .tts-stop-btn').forEach(btn => {
          btn.style.display = 'none';
        });
      };
      
      // Start TTS with current settings
      const ttsSettings = this.settings?.ttsSettings || {};
      
      // Use chunked speaking for long text
      if (this.selectedText.length > 200) {
        await this.ttsService.speakLongText(this.selectedText, ttsSettings);
      } else {
        await this.ttsService.speak(this.selectedText, ttsSettings);
      }
      
    } catch (error) {
      console.error('TTS failed:', error);
      this.updateStatus(`Error: ${error.message}`);
      setTimeout(() => this.hideStatus(), 3000);
    }
  }

  async startTTSWithSettings(text, settings) {
    this.selectedText = text;
    if (this.ttsService) {
      await this.ttsService.speak(text, settings);
    }
  }

  stopTTS() {
    if (this.ttsService) {
      this.ttsService.stop();
      this.updateStatus('Stopped');
      setTimeout(() => this.hideStatus(), 1000);
      
      // Hide control buttons
      const controls = this.overlay?.querySelector('.tts-controls-secondary');
      if (controls) {
        controls.querySelectorAll('.tts-pause-btn, .tts-stop-btn').forEach(btn => {
          btn.style.display = 'none';
        });
      }
    }
  }

  togglePause() {
    if (!this.ttsService) return;
    
    if (this.ttsService.isPaused()) {
      this.ttsService.resume();
      this.updateStatus('Speaking...');
    } else {
      this.ttsService.pause();
      this.updateStatus('Paused');
    }
  }

  async requestExplanation() {
    if (!this.selectedText) return;
    
    try {
      // Check privacy consent
      if (!this.settings?.privacySettings?.aiExplanationsConsent) {
        this.showExplanation(
          'AI explanations require your consent. Please enable this feature in the extension settings.',
          'warning'
        );
        return;
      }
      
      // Show loading state
      this.showExplanation('Generating explanation...', 'loading');
      
      // Request explanation from service worker
      const response = await chrome.runtime.sendMessage({
        type: 'AI_EXPLAIN',
        data: {
          text: this.selectedText,
          context: this.getPageContext()
        }
      });
      
      if (response.success) {
        this.showExplanation(response.explanation, 'success', response.provider);
      } else {
        this.showExplanation(`Failed to generate explanation: ${response.error}`, 'error');
      }
      
    } catch (error) {
      console.error('Explanation request failed:', error);
      this.showExplanation('Failed to get explanation. Please check your settings.', 'error');
    }
  }

  showExplanation(text, type = 'success', provider = null) {
    const explanationDiv = this.overlay?.querySelector('.tts-explanation');
    const contentDiv = this.overlay?.querySelector('.tts-explanation-content');
    
    if (!explanationDiv || !contentDiv) return;
    
    // Create explanation content
    let content = `<div class="tts-explanation-text ${type}">${text}</div>`;
    
    if (provider) {
      content += `<div class="tts-explanation-provider">Powered by ${provider.charAt(0).toUpperCase() + provider.slice(1)}</div>`;
    }
    
    if (type === 'success' && text !== 'Generating explanation...') {
      content += `<div class="tts-explanation-actions">
        <button class="tts-btn tts-speak-explanation-btn" title="Speak explanation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          Speak
        </button>
      </div>`;
    }
    
    contentDiv.innerHTML = content;
    explanationDiv.style.display = 'block';
    
    // Add speak explanation handler
    const speakBtn = contentDiv.querySelector('.tts-speak-explanation-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        this.selectedText = text;
        this.startTTS();
      });
    }
  }

  getPageContext() {
    // Get basic page context for better AI explanations
    return {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname
    };
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Cleanup when content script is unloaded
  destroy() {
    if (this.ttsService) {
      this.ttsService.destroy();
    }
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    // Remove event listeners
    document.removeEventListener('mouseup', this.handleTextSelection);
    document.removeEventListener('keyup', this.handleKeyboardSelection);
    document.removeEventListener('touchend', this.handleTextSelection);
    document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    document.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('resize', this.handleWindowResize);
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TTSContentScript();
  });
} else {
  new TTSContentScript();
}

// Handle page navigation in SPAs
let currentURL = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentURL) {
    currentURL = window.location.href;
    // Reinitialize if needed for SPAs
    console.log('Page navigation detected');
  }
});

observer.observe(document.body, { childList: true, subtree: true });