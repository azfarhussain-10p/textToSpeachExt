/**
 * Unit Tests for TTS Service
 */

import { TTSService } from '../../../src/services/tts-service.js';

describe('TTSService', () => {
    let ttsService;

    beforeEach(() => {
        ttsService = new TTSService();
    });

    afterEach(() => {
        if (ttsService.isInitialized) {
            ttsService.stop();
        }
    });

    describe('Initialization', () => {
        test('should initialize successfully', async () => {
            await ttsService.initialize();
            expect(ttsService.isInitialized).toBe(true);
        });

        test('should throw error if Web Speech API is not supported', async () => {
            delete global.speechSynthesis;
            
            await expect(ttsService.initialize()).rejects.toThrow(
                'Web Speech API is not supported in this browser'
            );
        });

        test('should load voices on initialization', async () => {
            global.speechSynthesis.getVoices.mockReturnValue([
                { name: 'Voice 1', lang: 'en-US', localService: true },
                { name: 'Voice 2', lang: 'es-ES', localService: false }
            ]);

            await ttsService.initialize();
            
            expect(ttsService.availableVoices).toHaveLength(2);
        });
    });

    describe('Voice Management', () => {
        beforeEach(async () => {
            global.speechSynthesis.getVoices.mockReturnValue([
                { name: 'English Voice', lang: 'en-US', localService: true, default: true },
                { name: 'Spanish Voice', lang: 'es-ES', localService: false, default: false },
                { name: 'French Voice', lang: 'fr-FR', localService: true, default: false }
            ]);
            
            await ttsService.initialize();
        });

        test('should organize voices by language', () => {
            expect(ttsService.voicesByLanguage.en).toBeDefined();
            expect(ttsService.voicesByLanguage.es).toBeDefined();
            expect(ttsService.voicesByLanguage.fr).toBeDefined();
        });

        test('should prefer local voices', () => {
            const englishVoices = ttsService.voicesByLanguage.en;
            expect(englishVoices[0].localService).toBe(true);
        });

        test('should get voices for specific language', () => {
            const spanishVoices = ttsService.getVoicesForLanguage('es-ES');
            expect(spanishVoices).toHaveLength(1);
            expect(spanishVoices[0].lang).toBe('es-ES');
        });

        test('should return all available voices', () => {
            const allVoices = ttsService.getAllVoices();
            expect(allVoices).toHaveLength(3);
            expect(allVoices[0]).toHaveProperty('name');
            expect(allVoices[0]).toHaveProperty('lang');
        });
    });

    describe('Settings Management', () => {
        beforeEach(async () => {
            await ttsService.initialize();
        });

        test('should update settings', () => {
            const newSettings = {
                rate: 1.5,
                pitch: 0.8,
                volume: 0.9
            };

            ttsService.updateSettings(newSettings);

            expect(ttsService.settings.rate).toBe(1.5);
            expect(ttsService.settings.pitch).toBe(0.8);
            expect(ttsService.settings.volume).toBe(0.9);
        });

        test('should clamp values to valid ranges', () => {
            ttsService.updateSettings({
                rate: 15, // Should be clamped to 10
                pitch: -1, // Should be clamped to 0
                volume: 2 // Should be clamped to 1
            });

            expect(ttsService.settings.rate).toBe(10);
            expect(ttsService.settings.pitch).toBe(0);
            expect(ttsService.settings.volume).toBe(1);
        });
    });

    describe('Speech Synthesis', () => {
        beforeEach(async () => {
            global.speechSynthesis.getVoices.mockReturnValue([
                { name: 'Test Voice', lang: 'en-US', localService: true }
            ]);
            await ttsService.initialize();
        });

        test('should speak text successfully', async () => {
            const speakPromise = ttsService.speak('Hello world');
            
            // Simulate speech end
            const utterance = global.speechSynthesis.speak.mock.calls[0][0];
            setTimeout(() => utterance.onend({ type: 'end' }), 100);
            
            await speakPromise;
            
            expect(global.speechSynthesis.speak).toHaveBeenCalled();
        });

        test('should handle speech errors', async () => {
            const speakPromise = ttsService.speak('Hello world');
            
            // Simulate speech error
            const utterance = global.speechSynthesis.speak.mock.calls[0][0];
            setTimeout(() => utterance.onerror({ 
                type: 'error', 
                error: 'synthesis-failed' 
            }), 100);
            
            await expect(speakPromise).rejects.toThrow('Speech synthesis failed: synthesis-failed');
        });

        test('should preprocess text before speaking', () => {
            const processedText = ttsService.preprocessText('  Dr. Smith  visited  http://example.com  ');
            
            expect(processedText).toBe('Doctor Smith visited link');
        });

        test('should stop current speech', () => {
            ttsService.stop();
            expect(global.speechSynthesis.cancel).toHaveBeenCalled();
        });

        test('should pause speech', () => {
            global.speechSynthesis.speaking = true;
            global.speechSynthesis.paused = false;
            
            ttsService.pause();
            expect(global.speechSynthesis.pause).toHaveBeenCalled();
        });

        test('should resume speech', () => {
            global.speechSynthesis.paused = true;
            
            ttsService.resume();
            expect(global.speechSynthesis.resume).toHaveBeenCalled();
        });
    });

    describe('Event System', () => {
        beforeEach(async () => {
            await ttsService.initialize();
        });

        test('should add event listeners', () => {
            const callback = jest.fn();
            ttsService.addEventListener('start', callback);
            
            expect(ttsService.eventListeners.get('start')).toContain(callback);
        });

        test('should remove event listeners', () => {
            const callback = jest.fn();
            ttsService.addEventListener('start', callback);
            ttsService.removeEventListener('start', callback);
            
            expect(ttsService.eventListeners.get('start')).not.toContain(callback);
        });

        test('should fire events', () => {
            const callback = jest.fn();
            ttsService.addEventListener('test', callback);
            ttsService.fireEvent('test', { data: 'test' });
            
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });
    });

    describe('Language Detection', () => {
        beforeEach(async () => {
            await ttsService.initialize();
        });

        test('should detect Arabic text', () => {
            const language = ttsService.detectLanguage('مرحبا بالعالم');
            expect(language).toBe('ar');
        });

        test('should detect Chinese text', () => {
            const language = ttsService.detectLanguage('你好世界');
            expect(language).toBe('zh');
        });

        test('should default to English for Latin text', () => {
            const language = ttsService.detectLanguage('Hello world');
            expect(language).toBe('en');
        });
    });

    describe('Utility Functions', () => {
        test('should clamp values correctly', () => {
            expect(ttsService.clamp(5, 0, 10)).toBe(5);
            expect(ttsService.clamp(-1, 0, 10)).toBe(0);
            expect(ttsService.clamp(15, 0, 10)).toBe(10);
        });

        test('should get service info', async () => {
            await ttsService.initialize();
            
            const info = ttsService.getInfo();
            expect(info).toHaveProperty('isInitialized', true);
            expect(info).toHaveProperty('isSupported', true);
            expect(info).toHaveProperty('voiceCount');
        });
    });
});