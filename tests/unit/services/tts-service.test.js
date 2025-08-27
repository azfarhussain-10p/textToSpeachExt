/**
 * Unit Tests for TTS Service
 * Tests the core text-to-speech functionality with Web Speech API
 */

// Import the TTS Service
const TTSService = require('../../../src/services/tts-service.js');

describe('TTSService', () => {
  let ttsService;
  let mockSpeechSynthesis;
  let mockUtterance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create fresh TTS service instance
    ttsService = new TTSService();
    
    // Get references to mocked APIs
    mockSpeechSynthesis = global.speechSynthesis;
    
    // Reset mock state
    mockSpeechSynthesis.speaking = false;
    mockSpeechSynthesis.paused = false;
    mockSpeechSynthesis.pending = false;
  });

  afterEach(() => {
    if (ttsService) {
      ttsService.destroy();
    }
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      expect(ttsService.synth).toBeNull();
      expect(ttsService.currentUtterance).toBeNull();
      expect(ttsService.isInitialized).toBe(false);
      expect(ttsService.availableVoices).toEqual([]);
      expect(ttsService.defaultSettings).toEqual({
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US',
        voice: null
      });
    });

    test('should have null event callbacks initially', () => {
      expect(ttsService.onStart).toBeNull();
      expect(ttsService.onEnd).toBeNull();
      expect(ttsService.onPause).toBeNull();
      expect(ttsService.onResume).toBeNull();
      expect(ttsService.onError).toBeNull();
      expect(ttsService.onBoundary).toBeNull();
    });
  });

  describe('initialize()', () => {
    test('should initialize successfully when Web Speech API is available', async () => {
      const result = await ttsService.initialize();
      
      expect(result).toBe(true);
      expect(ttsService.isInitialized).toBe(true);
      expect(ttsService.synth).toBe(mockSpeechSynthesis);
      expect(ttsService.availableVoices.length).toBeGreaterThan(0);
    });

    test('should throw error when Web Speech API is not available', async () => {
      // Remove speechSynthesis from window
      const originalSpeechSynthesis = global.speechSynthesis;
      delete global.speechSynthesis;
      
      await expect(ttsService.initialize()).rejects.toThrow(
        'Web Speech API not supported in this browser'
      );
      
      // Restore speechSynthesis
      global.speechSynthesis = originalSpeechSynthesis;
    });

    test('should load voices and select default', async () => {
      await ttsService.initialize();
      
      expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
      expect(ttsService.availableVoices.length).toBe(3);
      expect(ttsService.defaultSettings.voice).not.toBeNull();
      expect(ttsService.defaultSettings.voice.default).toBe(true);
    });
  });

  describe('loadVoices()', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should load voices immediately if available', async () => {
      // Reset and test fresh load
      ttsService.availableVoices = [];
      mockSpeechSynthesis.getVoices.mockReturnValueOnce([
        { name: 'Test Voice', lang: 'en-US', default: true, voiceURI: 'test' }
      ]);
      
      await ttsService.loadVoices();
      
      expect(ttsService.availableVoices).toHaveLength(1);
      expect(ttsService.availableVoices[0].name).toBe('Test Voice');
    });

    test('should handle empty voices list', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);
      
      await ttsService.loadVoices();
      
      expect(ttsService.availableVoices).toEqual([]);
      expect(ttsService.defaultSettings.voice).toBeNull();
    });
  });

  describe('speak()', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should speak simple text successfully', async () => {
      const testText = 'Hello, world!';
      
      // Mock successful speech
      const speakPromise = ttsService.speak(testText);
      
      // Simulate speech start and end
      const mockUtterance = ttsService.currentUtterance;
      expect(mockUtterance).not.toBeNull();
      expect(mockUtterance.text).toBe(testText);
      
      // Trigger speech end
      mockUtterance._triggerEvent('onend');
      
      await expect(speakPromise).resolves.toBeUndefined();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterance);
    });

    test('should reject with error for empty text', async () => {
      await expect(ttsService.speak('')).rejects.toThrow(
        'Invalid text provided for speech synthesis'
      );
      
      await expect(ttsService.speak(null)).rejects.toThrow(
        'Invalid text provided for speech synthesis'
      );
      
      await expect(ttsService.speak()).rejects.toThrow(
        'Invalid text provided for speech synthesis'
      );
    });

    test('should apply custom settings', async () => {
      const customSettings = {
        rate: 1.5,
        pitch: 0.8,
        volume: 0.7,
        language: 'es-ES'
      };
      
      const speakPromise = ttsService.speak('Hola', customSettings);
      
      const mockUtterance = ttsService.currentUtterance;
      expect(mockUtterance.rate).toBe(1.5);
      expect(mockUtterance.pitch).toBe(0.8);
      expect(mockUtterance.volume).toBe(0.7);
      expect(mockUtterance.lang).toBe('es-ES');
      
      // Complete the speech
      mockUtterance._triggerEvent('onend');
      await speakPromise;
    });

    test('should stop previous speech before starting new one', async () => {
      // Start first speech
      const firstPromise = ttsService.speak('First text');
      expect(ttsService.currentUtterance).not.toBeNull();
      
      // Start second speech (should stop first)
      const secondPromise = ttsService.speak('Second text');
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      
      // Complete second speech
      const secondUtterance = ttsService.currentUtterance;
      secondUtterance._triggerEvent('onend');
      
      await secondPromise;
    });

    test('should handle speech synthesis errors', async () => {
      const speakPromise = ttsService.speak('Test error');
      
      const mockUtterance = ttsService.currentUtterance;
      mockUtterance._triggerEvent('onerror', { error: 'synthesis-failed' });
      
      await expect(speakPromise).rejects.toThrow(
        'Speech synthesis failed: synthesis-failed'
      );
    });

    test('should trigger event callbacks', async () => {
      const onStartCallback = jest.fn();
      const onEndCallback = jest.fn();
      
      ttsService.onStart = onStartCallback;
      ttsService.onEnd = onEndCallback;
      
      const speakPromise = ttsService.speak('Test callbacks');
      const mockUtterance = ttsService.currentUtterance;
      
      // Trigger events
      const startEvent = { type: 'start' };
      const endEvent = { type: 'end' };
      
      mockUtterance._triggerEvent('onstart', startEvent);
      mockUtterance._triggerEvent('onend', endEvent);
      
      await speakPromise;
      
      expect(onStartCallback).toHaveBeenCalledWith(startEvent);
      expect(onEndCallback).toHaveBeenCalledWith(endEvent);
    });
  });

  describe('stop()', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should stop current speech', () => {
      mockSpeechSynthesis.speaking = true;
      
      ttsService.stop();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(ttsService.currentUtterance).toBeNull();
    });

    test('should handle stop when not speaking', () => {
      mockSpeechSynthesis.speaking = false;
      
      ttsService.stop();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(ttsService.currentUtterance).toBeNull();
    });
  });

  describe('pause() and resume()', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should pause current speech', () => {
      mockSpeechSynthesis.speaking = true;
      mockSpeechSynthesis.paused = false;
      
      ttsService.pause();
      
      expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
    });

    test('should resume paused speech', () => {
      mockSpeechSynthesis.paused = true;
      
      ttsService.resume();
      
      expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    });

    test('should not pause if not speaking', () => {
      mockSpeechSynthesis.speaking = false;
      
      ttsService.pause();
      
      expect(mockSpeechSynthesis.pause).not.toHaveBeenCalled();
    });

    test('should not resume if not paused', () => {
      mockSpeechSynthesis.paused = false;
      
      ttsService.resume();
      
      expect(mockSpeechSynthesis.resume).not.toHaveBeenCalled();
    });
  });

  describe('Voice management', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should return available voices', () => {
      const voices = ttsService.getVoices();
      
      expect(voices).toBeInstanceOf(Array);
      expect(voices.length).toBe(3);
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('lang');
      expect(voices[0]).toHaveProperty('voiceURI');
    });

    test('should find voice by name', () => {
      const voice = ttsService.findVoice('English (US) Female');
      
      expect(voice).not.toBeNull();
      expect(voice.name).toBe('English (US) Female');
      expect(voice.lang).toBe('en-US');
    });

    test('should find voice by voiceURI', () => {
      const voice = ttsService.findVoice('en-US-female');
      
      expect(voice).not.toBeNull();
      expect(voice.voiceURI).toBe('en-US-female');
    });

    test('should return null for non-existent voice', () => {
      const voice = ttsService.findVoice('Non-existent Voice');
      
      expect(voice).toBeNull();
    });

    test('should get voices for specific language', () => {
      const englishVoices = ttsService.getVoicesForLanguage('en-US');
      
      expect(englishVoices).toHaveLength(1);
      expect(englishVoices[0].lang).toBe('en-US');
    });

    test('should get supported languages', () => {
      const languages = ttsService.getSupportedLanguages();
      
      expect(languages).toContain('en-US');
      expect(languages).toContain('en-GB');
      expect(languages).toContain('es-ES');
      expect(languages.length).toBe(3);
    });
  });

  describe('Text processing', () => {
    test('should split long text into chunks', () => {
      const longText = 'A'.repeat(500) + '. ' + 'B'.repeat(300) + '. ' + 'C'.repeat(200);
      
      const chunks = ttsService.splitTextIntoChunks(longText, 200);
      
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(200);
      });
    });

    test('should not split short text', () => {
      const shortText = 'This is a short text.';
      
      const chunks = ttsService.splitTextIntoChunks(shortText, 200);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(shortText);
    });

    test('should handle text with no sentence breaks', () => {
      const noSentenceText = 'A'.repeat(500);
      
      const chunks = ttsService.splitTextIntoChunks(noSentenceText, 200);
      
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('Validation methods', () => {
    test('should validate rate values', () => {
      expect(ttsService.validateRate(1.5)).toBe(1.5);
      expect(ttsService.validateRate(0.1)).toBe(0.1);
      expect(ttsService.validateRate(10)).toBe(10);
      expect(ttsService.validateRate(0.05)).toBe(0.1); // Clamped to minimum
      expect(ttsService.validateRate(15)).toBe(10); // Clamped to maximum
      expect(ttsService.validateRate('invalid')).toBe(1.0); // Default for invalid
    });

    test('should validate pitch values', () => {
      expect(ttsService.validatePitch(1.5)).toBe(1.5);
      expect(ttsService.validatePitch(0)).toBe(0);
      expect(ttsService.validatePitch(2)).toBe(2);
      expect(ttsService.validatePitch(-0.5)).toBe(0); // Clamped to minimum
      expect(ttsService.validatePitch(3)).toBe(2); // Clamped to maximum
      expect(ttsService.validatePitch('invalid')).toBe(1.0); // Default for invalid
    });

    test('should validate volume values', () => {
      expect(ttsService.validateVolume(0.5)).toBe(0.5);
      expect(ttsService.validateVolume(0)).toBe(0);
      expect(ttsService.validateVolume(1)).toBe(1);
      expect(ttsService.validateVolume(-0.5)).toBe(0); // Clamped to minimum
      expect(ttsService.validateVolume(1.5)).toBe(1); // Clamped to maximum
      expect(ttsService.validateVolume('invalid')).toBe(1.0); // Default for invalid
    });
  });

  describe('State queries', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should report speaking state correctly', () => {
      mockSpeechSynthesis.speaking = false;
      expect(ttsService.isSpeaking()).toBe(false);
      
      mockSpeechSynthesis.speaking = true;
      expect(ttsService.isSpeaking()).toBe(true);
    });

    test('should report paused state correctly', () => {
      mockSpeechSynthesis.paused = false;
      expect(ttsService.isPaused()).toBe(false);
      
      mockSpeechSynthesis.paused = true;
      expect(ttsService.isPaused()).toBe(true);
    });
  });

  describe('destroy()', () => {
    beforeEach(async () => {
      await ttsService.initialize();
    });

    test('should clean up resources', () => {
      ttsService.onStart = jest.fn();
      ttsService.onEnd = jest.fn();
      
      ttsService.destroy();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(ttsService.synth).toBeNull();
      expect(ttsService.availableVoices).toEqual([]);
      expect(ttsService.isInitialized).toBe(false);
      expect(ttsService.onStart).toBeNull();
      expect(ttsService.onEnd).toBeNull();
    });
  });
});

describe('TTSService Integration', () => {
  let ttsService;

  beforeEach(async () => {
    ttsService = new TTSService();
    await ttsService.initialize();
  });

  afterEach(() => {
    ttsService.destroy();
  });

  test('should handle complete speech workflow', async () => {
    const onStartSpy = jest.fn();
    const onEndSpy = jest.fn();
    
    ttsService.onStart = onStartSpy;
    ttsService.onEnd = onEndSpy;
    
    const speakPromise = ttsService.speak('Integration test text', {
      rate: 1.2,
      pitch: 0.9
    });
    
    const utterance = ttsService.currentUtterance;
    expect(utterance.text).toBe('Integration test text');
    expect(utterance.rate).toBe(1.2);
    expect(utterance.pitch).toBe(0.9);
    
    // Simulate speech lifecycle
    utterance._triggerEvent('onstart');
    expect(onStartSpy).toHaveBeenCalled();
    
    utterance._triggerEvent('onend');
    expect(onEndSpy).toHaveBeenCalled();
    
    await speakPromise;
    expect(ttsService.currentUtterance).toBeNull();
  });

  test('should handle long text speech workflow', async () => {
    const longText = 'This is a very long text. '.repeat(20);
    
    const speakPromise = ttsService.speakLongText(longText);
    
    // The method should split the text and speak in chunks
    // For testing, we'll just complete the first chunk
    if (ttsService.currentUtterance) {
      ttsService.currentUtterance._triggerEvent('onend');
    }
    
    await speakPromise;
    
    expect(global.speechSynthesis.speak).toHaveBeenCalled();
  });
});