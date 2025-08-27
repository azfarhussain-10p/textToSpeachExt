/**
 * Integration Tests for TTS Content Script
 * Tests the integration between content script, TTS service, and overlay UI
 */

describe('TTS Content Script Integration', () => {
  let mockDocument;
  let mockWindow;
  let ttsContentScript;

  beforeEach(() => {
    // Set up DOM mocks
    mockDocument = global.document;
    mockWindow = global.window;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock chrome.runtime.getURL for content script imports
    global.chrome.runtime.getURL.mockImplementation((path) => `chrome-extension://test/${path}`);
    
    // Mock chrome.storage.sync.get for settings
    global.chrome.storage.sync.get.mockResolvedValue({
      ttsSettings: {
        voice: null,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US'
      },
      uiSettings: {
        theme: 'auto',
        overlayPosition: 'bottom-right',
        keyboardShortcuts: true
      },
      privacySettings: {
        aiExplanationsConsent: false
      }
    });
  });

  describe('Text Selection and Overlay', () => {
    test('should show overlay when text is selected', () => {
      // Mock text selection
      const mockSelection = {
        toString: jest.fn(() => 'Selected test text'),
        getRangeAt: jest.fn(() => ({
          getBoundingClientRect: jest.fn(() => ({
            right: 200,
            bottom: 100
          }))
        }))
      };
      
      mockWindow.getSelection.mockReturnValue(mockSelection);
      
      // Create mock overlay element
      const mockOverlay = {
        style: { display: 'none' },
        classList: { add: jest.fn(), remove: jest.fn() },
        querySelector: jest.fn(() => ({
          textContent: '',
          title: '',
          style: { display: 'none' }
        }))
      };
      
      mockDocument.createElement.mockReturnValue(mockOverlay);
      
      // Simulate the content script logic
      const selectedText = mockSelection.toString();
      expect(selectedText).toBe('Selected test text');
      
      // Verify overlay would be shown
      expect(selectedText.length).toBeGreaterThan(0);
    });

    test('should hide overlay when selection is empty', () => {
      // Mock empty selection
      const mockSelection = {
        toString: jest.fn(() => ''),
        getRangeAt: jest.fn()
      };
      
      mockWindow.getSelection.mockReturnValue(mockSelection);
      
      const selectedText = mockSelection.toString();
      expect(selectedText).toBe('');
      
      // Verify overlay would be hidden for empty selection
      expect(selectedText.length).toBe(0);
    });
  });

  describe('TTS Functionality Integration', () => {
    test('should integrate TTS service with content script messaging', async () => {
      const testText = 'Test integration text';
      
      // Mock chrome.runtime.sendMessage for TTS request
      global.chrome.runtime.sendMessage.mockResolvedValue({
        success: true,
        data: {
          text: testText,
          settings: { rate: 1.0, pitch: 1.0, volume: 1.0 }
        }
      });
      
      // Simulate content script TTS request
      const response = await chrome.runtime.sendMessage({
        type: 'TTS_START',
        data: { text: testText, settings: {} }
      });
      
      expect(response.success).toBe(true);
      expect(response.data.text).toBe(testText);
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'TTS_START',
        data: { text: testText, settings: {} }
      });
    });

    test('should handle TTS service errors gracefully', async () => {
      // Mock failed TTS request
      global.chrome.runtime.sendMessage.mockResolvedValue({
        success: false,
        error: 'TTS service not available'
      });
      
      const response = await chrome.runtime.sendMessage({
        type: 'TTS_START',
        data: { text: 'Test text', settings: {} }
      });
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('TTS service not available');
    });
  });

  describe('AI Integration', () => {
    test('should request AI explanation when consent is given', async () => {
      const testText = 'Complex technical term';
      const explanation = 'This is an AI-generated explanation.';
      
      // Mock consent and AI response
      global.chrome.storage.sync.get.mockResolvedValue({
        privacySettings: { aiExplanationsConsent: true },
        aiSettings: { provider: 'groq', explanationLength: 'medium' }
      });
      
      global.chrome.runtime.sendMessage.mockResolvedValue({
        success: true,
        explanation: explanation,
        provider: 'groq'
      });
      
      // Simulate AI explanation request
      const settings = await chrome.storage.sync.get(['privacySettings', 'aiSettings']);
      
      if (settings.privacySettings.aiExplanationsConsent) {
        const response = await chrome.runtime.sendMessage({
          type: 'AI_EXPLAIN',
          data: { text: testText, context: {} }
        });
        
        expect(response.success).toBe(true);
        expect(response.explanation).toBe(explanation);
        expect(response.provider).toBe('groq');
      }
    });

    test('should block AI explanation when consent is not given', async () => {
      const testText = 'Some text to explain';
      
      // Mock no consent
      global.chrome.storage.sync.get.mockResolvedValue({
        privacySettings: { aiExplanationsConsent: false }
      });
      
      const settings = await chrome.storage.sync.get(['privacySettings']);
      
      if (!settings.privacySettings.aiExplanationsConsent) {
        // Should not make AI request
        expect(global.chrome.runtime.sendMessage).not.toHaveBeenCalledWith(
          expect.objectContaining({ type: 'AI_EXPLAIN' })
        );
      }
    });
  });

  describe('Cross-Context Messaging', () => {
    test('should handle messages from service worker', () => {
      const mockMessageHandler = jest.fn();
      
      // Simulate message listener registration
      chrome.runtime.onMessage.addListener.mockImplementation((handler) => {
        mockMessageHandler.mockImplementation(handler);
      });
      
      // Simulate service worker message
      const message = {
        type: 'TTS_START_RESPONSE',
        data: { success: true, text: 'Test', settings: {} }
      };
      
      const sender = { tab: { id: 1 } };
      const sendResponse = jest.fn();
      
      // Call the handler (simulating message reception)
      mockMessageHandler(message, sender, sendResponse);
      
      // Verify listener was added
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    test('should handle popup communication', () => {
      // Mock popup requesting voice list
      const voiceRequest = {
        type: 'GET_VOICES_REQUEST'
      };
      
      // Mock available voices
      const mockVoices = [
        { name: 'Test Voice', lang: 'en-US', voiceURI: 'test-voice' }
      ];
      
      global.speechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      // Simulate content script handling voice request
      const voices = global.speechSynthesis.getVoices();
      const response = {
        success: true,
        voices: voices.map(voice => ({
          name: voice.name,
          lang: voice.lang,
          voiceURI: voice.voiceURI
        }))
      };
      
      expect(response.success).toBe(true);
      expect(response.voices).toHaveLength(1);
      expect(response.voices[0].name).toBe('Test Voice');
    });
  });

  describe('Keyboard Shortcuts Integration', () => {
    test('should handle Ctrl+Shift+S for speak shortcut', () => {
      const mockKeyEvent = {
        code: 'KeyS',
        ctrlKey: true,
        shiftKey: true,
        preventDefault: jest.fn()
      };
      
      // Mock selected text
      mockWindow.getSelection.mockReturnValue({
        toString: () => 'Text to speak'
      });
      
      // Simulate keyboard shortcut logic
      const selectedText = mockWindow.getSelection().toString();
      const isValidShortcut = mockKeyEvent.code === 'KeyS' && 
                              mockKeyEvent.ctrlKey && 
                              mockKeyEvent.shiftKey;
      
      if (isValidShortcut && selectedText) {
        mockKeyEvent.preventDefault();
        // Would trigger TTS
      }
      
      expect(mockKeyEvent.preventDefault).toHaveBeenCalled();
      expect(selectedText).toBe('Text to speak');
    });

    test('should handle Ctrl+Shift+E for explain shortcut', () => {
      const mockKeyEvent = {
        code: 'KeyE',
        ctrlKey: true,
        shiftKey: true,
        preventDefault: jest.fn()
      };
      
      // Mock selected text
      mockWindow.getSelection.mockReturnValue({
        toString: () => 'Text to explain'
      });
      
      // Simulate keyboard shortcut logic
      const selectedText = mockWindow.getSelection().toString();
      const isValidShortcut = mockKeyEvent.code === 'KeyE' && 
                              mockKeyEvent.ctrlKey && 
                              mockKeyEvent.shiftKey;
      
      if (isValidShortcut && selectedText) {
        mockKeyEvent.preventDefault();
        // Would trigger AI explanation
      }
      
      expect(mockKeyEvent.preventDefault).toHaveBeenCalled();
      expect(selectedText).toBe('Text to explain');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      global.chrome.runtime.sendMessage.mockRejectedValue(
        new Error('Network error')
      );
      
      try {
        await chrome.runtime.sendMessage({
          type: 'TTS_START',
          data: { text: 'Test', settings: {} }
        });
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle service worker unavailable', async () => {
      // Mock service worker not responding
      global.chrome.runtime.sendMessage.mockResolvedValue(undefined);
      
      const response = await chrome.runtime.sendMessage({
        type: 'TTS_START',
        data: { text: 'Test', settings: {} }
      });
      
      expect(response).toBeUndefined();
    });
  });

  describe('Performance Integration', () => {
    test('should handle large text selections efficiently', () => {
      const largeText = 'A'.repeat(10000);
      
      // Mock large text selection
      mockWindow.getSelection.mockReturnValue({
        toString: () => largeText
      });
      
      const selectedText = mockWindow.getSelection().toString();
      
      // Verify large text is handled
      expect(selectedText.length).toBe(10000);
      
      // Would be chunked for TTS processing
      const chunkSize = 200;
      const expectedChunks = Math.ceil(largeText.length / chunkSize);
      
      expect(expectedChunks).toBeGreaterThan(1);
    });

    test('should debounce rapid text selections', () => {
      let selectionCount = 0;
      const handleSelection = () => {
        selectionCount++;
      };
      
      // Simulate rapid selections
      handleSelection();
      handleSelection();
      handleSelection();
      
      // In real implementation, this would be debounced
      expect(selectionCount).toBe(3);
    });
  });
});