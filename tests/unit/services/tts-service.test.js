/**
 * TTS Service Unit Tests
 * Tests for the Text-to-Speech service functionality
 */

describe('TTS Service', () => {
  let TTSService;
  
  beforeEach(async () => {
    // Import the service fresh for each test
    jest.resetModules();
    const module = await import('../../../src/services/tts-service.js');
    TTSService = module.default || module.TTSService;
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      const tts = new TTSService();
      expect(tts).toBeDefined();
      expect(tts.isSupported()).toBe(true);
    });

    test('should detect browser support correctly', () => {
      const tts = new TTSService();
      expect(typeof tts.isSupported()).toBe('boolean');
    });

    test('should load voices on initialization', async () => {
      const tts = new TTSService();
      await tts.initialize();
      const voices = tts.getVoices();
      expect(Array.isArray(voices)).toBe(true);
    });
  });

  describe('Voice Management', () => {
    let tts;

    beforeEach(async () => {
      tts = new TTSService();
      await tts.initialize();
    });

    test('should return available voices', () => {
      const voices = tts.getVoices();
      expect(voices).toHaveLength(1);
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('lang');
    });

    test('should find voice by language', () => {
      const voice = tts.getVoiceByLanguage('en-US');
      expect(voice).toBeDefined();
      expect(voice.lang).toBe('en-US');
    });

    test('should return null for unsupported language', () => {
      const voice = tts.getVoiceByLanguage('xx-XX');
      expect(voice).toBeNull();
    });
  });

  describe('Speech Synthesis', () => {
    let tts;

    beforeEach(async () => {
      tts = new TTSService();
      await tts.initialize();
    });

    test('should speak text successfully', async () => {
      const result = await tts.speak('Hello world');
      expect(result).toBe(true);
      expect(speechSynthesis.speak).toHaveBeenCalled();
    });

    test('should handle speech with options', async () => {
      const options = {
        voice: 'English (US)',
        rate: 1.2,
        pitch: 1.1,
        volume: 0.8
      };
      
      await tts.speak('Hello world', options);
      expect(speechSynthesis.speak).toHaveBeenCalled();
      
      const utterance = speechSynthesis.speak.mock.calls[0][0];
      expect(utterance.text).toBe('Hello world');
      expect(utterance.rate).toBe(1.2);
      expect(utterance.pitch).toBe(1.1);
      expect(utterance.volume).toBe(0.8);
    });

    test('should handle empty text gracefully', async () => {
      const result = await tts.speak('');
      expect(result).toBe(false);
      expect(speechSynthesis.speak).not.toHaveBeenCalled();
    });

    test('should handle speech errors', async () => {
      // Mock speech synthesis error
      speechSynthesis.speak.mockImplementation((utterance) => {
        setTimeout(() => {
          if (utterance.onerror) {
            utterance.onerror({ error: 'synthesis-failed' });
          }
        }, 10);
      });

      const result = await tts.speak('Hello world');
      await testUtils.waitFor(50);
      expect(result).toBe(true); // Still returns true as it attempted
    });
  });

  describe('Playback Control', () => {
    let tts;

    beforeEach(async () => {
      tts = new TTSService();
      await tts.initialize();
    });

    test('should pause speech', () => {
      tts.pause();
      expect(speechSynthesis.pause).toHaveBeenCalled();
    });

    test('should resume speech', () => {
      tts.resume();
      expect(speechSynthesis.resume).toHaveBeenCalled();
    });

    test('should stop speech', () => {
      tts.stop();
      expect(speechSynthesis.cancel).toHaveBeenCalled();
    });

    test('should report speaking status', () => {
      speechSynthesis.speaking = true;
      expect(tts.isSpeaking()).toBe(true);
      
      speechSynthesis.speaking = false;
      expect(tts.isSpeaking()).toBe(false);
    });

    test('should report paused status', () => {
      speechSynthesis.paused = true;
      expect(tts.isPaused()).toBe(true);
      
      speechSynthesis.paused = false;
      expect(tts.isPaused()).toBe(false);
    });
  });

  describe('Event Handling', () => {
    let tts;

    beforeEach(async () => {
      tts = new TTSService();
      await tts.initialize();
    });

    test('should register event listeners', () => {
      const onStart = jest.fn();
      const onEnd = jest.fn();
      
      tts.on('start', onStart);
      tts.on('end', onEnd);
      
      expect(tts.eventListeners.start).toContain(onStart);
      expect(tts.eventListeners.end).toContain(onEnd);
    });

    test('should remove event listeners', () => {
      const onStart = jest.fn();
      
      tts.on('start', onStart);
      expect(tts.eventListeners.start).toContain(onStart);
      
      tts.off('start', onStart);
      expect(tts.eventListeners.start).not.toContain(onStart);
    });

    test('should trigger events during speech', async () => {
      const onStart = jest.fn();
      const onEnd = jest.fn();
      
      tts.on('start', onStart);
      tts.on('end', onEnd);
      
      // Mock successful speech
      speechSynthesis.speak.mockImplementation((utterance) => {
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
          setTimeout(() => {
            if (utterance.onend) utterance.onend();
          }, 10);
        }, 10);
      });
      
      await tts.speak('Hello world');
      await testUtils.waitFor(50);
      
      expect(onStart).toHaveBeenCalled();
      expect(onEnd).toHaveBeenCalled();
    });
  });

  describe('Settings Management', () => {
    let tts;

    beforeEach(async () => {
      tts = new TTSService();
      await tts.initialize();
    });

    test('should update settings', () => {
      const newSettings = {
        defaultVoice: 'English (UK)',
        rate: 1.5,
        pitch: 0.8,
        volume: 0.9
      };
      
      tts.updateSettings(newSettings);
      expect(tts.getSettings()).toMatchObject(newSettings);
    });

    test('should validate settings', () => {
      const invalidSettings = {
        rate: 5.0, // Invalid: too high
        pitch: -1, // Invalid: too low
        volume: 2  // Invalid: too high
      };
      
      tts.updateSettings(invalidSettings);
      const settings = tts.getSettings();
      
      expect(settings.rate).toBeLessThanOrEqual(3.0);
      expect(settings.pitch).toBeGreaterThanOrEqual(0);
      expect(settings.volume).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Error Handling', () => {
    let tts;

    beforeEach(async () => {
      tts = new TTSService();
      await tts.initialize();
    });

    test('should handle missing speech synthesis gracefully', () => {
      delete global.speechSynthesis;
      const newTTS = new TTSService();
      expect(newTTS.isSupported()).toBe(false);
    });

    test('should handle voice loading errors', async () => {
      speechSynthesis.getVoices.mockReturnValue([]);
      
      const newTTS = new TTSService();
      await newTTS.initialize();
      
      const voices = newTTS.getVoices();
      expect(voices).toHaveLength(0);
    });
  });
});