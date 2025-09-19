/**
 * TTS Workflow Integration Tests
 * Tests complete text-to-speech workflow including service integration
 */

const { TTSService } = require('../../src/services/tts-service.js');

describe('TTS Workflow Integration', () => {
  let ttsService;

  beforeEach(async () => {
    ttsService = new TTSService();

    // Wait for initialization
    await global.testUtils.waitFor(50);
  });

  afterEach(() => {
    if (ttsService) {
      ttsService.stop();
    }
  });

  describe('Service initialization', () => {
    test('should initialize TTS service successfully', () => {
      expect(ttsService.isInitialized).toBe(true);
      expect(ttsService.synthesis).toBeDefined();
      expect(ttsService.voices.length).toBeGreaterThan(0);
    });

    test('should detect browser type correctly', () => {
      expect(['chrome', 'firefox', 'safari', 'edge', 'unknown']).toContain(ttsService.browserType);
    });

    test('should load browser-specific configuration', () => {
      expect(ttsService.config).toBeDefined();
      expect(ttsService.config.maxSegmentLength).toBeGreaterThan(0);
    });
  });

  describe('Voice management', () => {
    test('should load available voices', () => {
      const voices = ttsService.getVoices();

      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('lang');
    });

    test('should get voices by language', () => {
      const englishVoices = ttsService.getVoicesByLanguage('en');

      expect(Array.isArray(englishVoices)).toBe(true);
      englishVoices.forEach(voice => {
        expect(voice.lang.toLowerCase()).toMatch(/^en/);
      });
    });

    test('should get default voice', () => {
      const defaultVoice = ttsService.getDefaultVoice('en');

      expect(defaultVoice).toBeDefined();
      expect(defaultVoice).toHaveProperty('name');
      expect(defaultVoice).toHaveProperty('lang');
    });

    test('should get voice by name', () => {
      const testVoice = ttsService.getVoiceByName('Test Voice 1');

      expect(testVoice).toBeDefined();
      expect(testVoice.name).toBe('Test Voice 1');
    });
  });

  describe('Settings integration', () => {
    test('should load TTS settings from storage', async () => {
      // Mock storage with custom settings
      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          ttsSettings: {
            voice: 'Test Voice 2',
            rate: 1.2,
            pitch: 0.8,
            volume: 0.9,
            enabled: true
          }
        });
      });

      const settings = await ttsService.getUserSettings();

      expect(settings.voice).toBe('Test Voice 2');
      expect(settings.rate).toBe(1.2);
      expect(settings.pitch).toBe(0.8);
      expect(settings.volume).toBe(0.9);
    });

    test('should use default settings when storage fails', async () => {
      // Mock storage error
      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        global.chrome.runtime.lastError = { message: 'Storage error' };
        callback({});
      });

      const settings = await ttsService.getUserSettings();

      expect(settings).toEqual(ttsService.getDefaultSettings());

      // Clean up
      global.chrome.runtime.lastError = null;
    });
  });

  describe('Speech synthesis', () => {
    test('should speak text successfully', async () => {
      const testText = 'Hello, this is a test.';
      let speechStarted = false;
      let speechEnded = false;

      ttsService.setEventCallbacks({
        onStart: () => { speechStarted = true; },
        onEnd: () => { speechEnded = true; }
      });

      const speakPromise = ttsService.speak(testText);

      // Wait for speech to start
      await global.testUtils.waitFor(50);
      expect(speechStarted).toBe(true);
      expect(ttsService.isSpeaking()).toBe(true);

      // Wait for speech to complete
      await speakPromise;
      expect(speechEnded).toBe(true);
      expect(ttsService.isSpeaking()).toBe(false);
    });

    test('should handle empty text input', async () => {
      await expect(ttsService.speak('')).rejects.toThrow('No text provided for speech');
      await expect(ttsService.speak(null)).rejects.toThrow('No text provided for speech');
    });

    test('should apply voice settings correctly', async () => {
      const testText = 'Test with custom settings.';
      const customOptions = {
        voice: 'Test Voice 2',
        rate: 1.5,
        pitch: 1.2,
        volume: 0.8
      };

      await ttsService.speak(testText, customOptions);

      expect(global.speechSynthesis.currentUtterance).toBeDefined();
      expect(global.speechSynthesis.currentUtterance.rate).toBe(1.5);
      expect(global.speechSynthesis.currentUtterance.pitch).toBe(1.2);
      expect(global.speechSynthesis.currentUtterance.volume).toBe(0.8);
    });
  });

  describe('Speech controls', () => {
    test('should pause and resume speech', async () => {
      const testText = 'This is a longer text for pause/resume testing.';
      let pauseEventFired = false;
      let resumeEventFired = false;

      ttsService.setEventCallbacks({
        onPause: () => { pauseEventFired = true; },
        onResume: () => { resumeEventFired = true; }
      });

      // Start speech
      ttsService.speak(testText);
      await global.testUtils.waitFor(50);

      // Pause
      ttsService.pause();
      expect(ttsService.isPaused()).toBe(true);
      await global.testUtils.waitFor(50);
      expect(pauseEventFired).toBe(true);

      // Resume
      ttsService.resume();
      expect(ttsService.isPaused()).toBe(false);
      await global.testUtils.waitFor(50);
      expect(resumeEventFired).toBe(true);
    });

    test('should stop speech correctly', async () => {
      const testText = 'This text will be stopped.';

      ttsService.speak(testText);
      await global.testUtils.waitFor(50);
      expect(ttsService.isSpeaking()).toBe(true);

      ttsService.stop();
      expect(ttsService.isSpeaking()).toBe(false);
      expect(ttsService.currentUtterance).toBeNull();
    });
  });

  describe('Word boundary events', () => {
    test('should trigger word boundary callbacks', async () => {
      const testText = 'Word boundary test.';
      const wordBoundaries = [];

      ttsService.setWordBoundaryCallback((event) => {
        wordBoundaries.push(event);
      });

      ttsService.speak(testText);
      await global.testUtils.waitFor(50);

      // Simulate word boundary event
      if (ttsService.currentUtterance) {
        global.testUtils.triggerTTSEvent(ttsService.currentUtterance, 'boundary', {
          name: 'word',
          charIndex: 0
        });
      }

      await global.testUtils.waitFor(50);
      expect(wordBoundaries.length).toBeGreaterThan(0);
      expect(wordBoundaries[0]).toHaveProperty('charIndex');
      expect(wordBoundaries[0]).toHaveProperty('text');
    });
  });

  describe('Error handling', () => {
    test('should handle speech synthesis errors', async () => {
      const testText = 'This will cause an error.';
      let errorEventFired = false;
      let errorMessage = '';

      ttsService.setEventCallbacks({
        onError: (event) => {
          errorEventFired = true;
          errorMessage = event.error || 'Unknown error';
        }
      });

      const speakPromise = ttsService.speak(testText);
      await global.testUtils.waitFor(50);

      // Simulate error
      if (ttsService.currentUtterance) {
        global.testUtils.triggerTTSEvent(ttsService.currentUtterance, 'error', {
          error: 'synthesis-failed'
        });
      }

      await expect(speakPromise).rejects.toThrow();
      expect(errorEventFired).toBe(true);
      expect(errorMessage).toBe('synthesis-failed');
    });

    test('should handle initialization failure gracefully', () => {
      // Mock speechSynthesis as unavailable
      const originalSpeechSynthesis = global.speechSynthesis;
      delete global.speechSynthesis;
      delete global.SpeechSynthesisUtterance;

      expect(() => new TTSService()).toThrow();

      // Restore
      global.speechSynthesis = originalSpeechSynthesis;
      global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    });
  });

  describe('Long text handling', () => {
    test('should handle long text by splitting into chunks', async () => {
      const longText = 'This is a very long text. '.repeat(50);

      await ttsService.speakLongText(longText);

      // Should complete without errors
      expect(ttsService.isSpeaking()).toBe(false);
    });

    test('should split text into appropriate chunks', () => {
      const longText = 'Sentence one. Sentence two. Sentence three. '.repeat(20);
      const chunks = ttsService.splitTextIntoChunks(longText, 100);

      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Service status', () => {
    test('should provide accurate status information', () => {
      const status = ttsService.getStatus();

      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('supported');
      expect(status).toHaveProperty('speaking');
      expect(status).toHaveProperty('paused');
      expect(status).toHaveProperty('voicesLoaded');
      expect(status).toHaveProperty('browserType');

      expect(status.initialized).toBe(true);
      expect(status.supported).toBe(true);
      expect(status.voicesLoaded).toBeGreaterThan(0);
    });
  });

  describe('Browser compatibility', () => {
    test('should handle Chrome-specific timeouts', async () => {
      // Mock Chrome browser
      ttsService.browserType = 'chrome';
      ttsService.config = ttsService.getBrowserConfig();

      const testText = 'Chrome timeout test.';
      await ttsService.speak(testText);

      expect(ttsService.config.resumeWorkaround).toBe(true);
    });

    test('should handle Firefox voice loading', async () => {
      // Mock Firefox browser
      ttsService.browserType = 'firefox';
      ttsService.config = ttsService.getBrowserConfig();

      expect(ttsService.config.requiresEventListener).toBe(true);
    });
  });
});