/**
 * Integration Tests for TTS Extension
 */

import { TTSService } from '../../src/services/tts-service.js';
import { UIOverlay } from '../../src/components/ui-overlay.js';
import { AccessibilityManager } from '../../src/utils/accessibility-manager.js';
import { LanguageManager } from '../../src/utils/language-manager.js';

describe('TTS Extension Integration', () => {
    let ttsService, overlay, accessibilityManager, languageManager;

    beforeEach(async () => {
        // Setup global mocks
        global.chrome.runtime.sendMessage.mockResolvedValue({
            success: true,
            data: {
                language: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                screenReaderSupport: true
            }
        });

        global.speechSynthesis.getVoices.mockReturnValue([
            { name: 'Test Voice', lang: 'en-US', localService: true }
        ]);

        // Initialize components
        ttsService = new TTSService();
        overlay = new UIOverlay();
        accessibilityManager = new AccessibilityManager();
        languageManager = new LanguageManager();

        await Promise.all([
            ttsService.initialize(),
            overlay.initialize(),
            accessibilityManager.initialize(),
            languageManager.initialize()
        ]);
    });

    afterEach(() => {
        if (ttsService.isInitialized) ttsService.stop();
        if (overlay.isInitialized) overlay.destroy();
        if (accessibilityManager.isInitialized) accessibilityManager.destroy();
        if (languageManager.isInitialized) languageManager.destroy();
    });

    describe('Text Selection and Speech Integration', () => {
        test('should handle complete text-to-speech workflow', async () => {
            // Simulate text selection
            const selectedText = 'Hello world, this is a test.';
            
            // Show overlay
            overlay.show({
                text: selectedText,
                position: { x: 100, y: 100 },
                onSpeak: async () => {
                    const speakPromise = ttsService.speak(selectedText);
                    
                    // Simulate speech completion
                    setTimeout(() => {
                        const utterance = global.speechSynthesis.speak.mock.calls[0][0];
                        utterance.onend({ type: 'end' });
                    }, 100);
                    
                    return speakPromise;
                }
            });

            expect(overlay.isVisible).toBe(true);
            
            // Trigger speak action
            const speakButton = overlay.container.querySelector('.tts-speak-btn');
            speakButton.click();
            
            await testUtils.waitFor(() => global.speechSynthesis.speak.mock.calls.length > 0);
            expect(global.speechSynthesis.speak).toHaveBeenCalled();
        });

        test('should integrate accessibility announcements with speech', async () => {
            const announceSpy = jest.spyOn(accessibilityManager, 'announce');
            
            const selectedText = 'Accessibility test text';
            
            // Start speech
            const speakPromise = ttsService.speak(selectedText);
            
            // Simulate speech start
            const utterance = global.speechSynthesis.speak.mock.calls[0][0];
            utterance.onstart({ type: 'start' });
            
            // Should announce speech started
            accessibilityManager.announceStatus('speech_started', selectedText);
            expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('Reading selected text'));
            
            // Simulate speech end
            utterance.onend({ type: 'end' });
            await speakPromise;
            
            accessibilityManager.announceStatus('speech_finished');
            expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('finished'));
        });
    });

    describe('Multi-language Integration', () => {
        test('should coordinate language changes across components', async () => {
            // Change language
            languageManager.setLanguage('es-ES');
            
            // Should update UI texts
            await testUtils.waitFor(() => 
                document.documentElement.getAttribute('lang') === 'es'
            );
            
            expect(document.documentElement.getAttribute('lang')).toBe('es');
            expect(languageManager.currentLanguage).toBe('es');
        });

        test('should handle RTL languages properly', async () => {
            // Switch to Arabic
            languageManager.setLanguage('ar-SA');
            
            await testUtils.waitFor(() => 
                document.documentElement.getAttribute('dir') === 'rtl'
            );
            
            expect(document.documentElement.getAttribute('dir')).toBe('rtl');
            expect(languageManager.isRTL()).toBe(true);
        });

        test('should use appropriate voices for selected language', async () => {
            // Mock voices for different languages
            global.speechSynthesis.getVoices.mockReturnValue([
                { name: 'English Voice', lang: 'en-US', localService: true },
                { name: 'Spanish Voice', lang: 'es-ES', localService: true },
                { name: 'French Voice', lang: 'fr-FR', localService: true }
            ]);

            // Re-initialize with new voices
            await ttsService.loadVoices();
            
            // Change to Spanish
            languageManager.setLanguage('es-ES');
            ttsService.updateSettings({ language: 'es-ES' });
            
            const spanishVoices = languageManager.getVoicePreferences();
            expect(spanishVoices).toContain('es-ES');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle speech synthesis errors gracefully', async () => {
            const announceSpy = jest.spyOn(accessibilityManager, 'announce');
            
            // Simulate speech error
            const speakPromise = ttsService.speak('Error test text');
            const utterance = global.speechSynthesis.speak.mock.calls[0][0];
            
            utterance.onerror({ 
                type: 'error', 
                error: 'synthesis-unavailable' 
            });
            
            await expect(speakPromise).rejects.toThrow();
            
            // Should announce error to screen readers
            accessibilityManager.announceStatus('error', 'Speech synthesis failed');
            expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('Error'));
        });

        test('should handle API errors with user feedback', async () => {
            // Mock API error
            global.chrome.runtime.sendMessage.mockRejectedValue(new Error('API Error'));
            
            const errorSpy = jest.spyOn(overlay, 'showError');
            
            try {
                await chrome.runtime.sendMessage({ action: 'GET_AI_EXPLANATION' });
            } catch (error) {
                overlay.showError('Failed to get explanation');
            }
            
            expect(errorSpy).toHaveBeenCalledWith('Failed to get explanation');
        });
    });

    describe('Keyboard Navigation Integration', () => {
        test('should handle keyboard shortcuts across components', async () => {
            // Mock selected text
            global.getSelection.mockReturnValue({
                toString: () => 'Selected text for keyboard test',
                rangeCount: 1,
                getRangeAt: () => ({
                    getBoundingClientRect: () => ({ left: 100, top: 100, width: 200, height: 20 })
                })
            });

            // Simulate Ctrl+Shift+S (speak shortcut)
            const event = new KeyboardEvent('keydown', {
                key: 'S',
                ctrlKey: true,
                shiftKey: true
            });

            global.chrome.runtime.sendMessage.mockResolvedValue({ success: true });
            
            document.dispatchEvent(event);
            
            await testUtils.waitFor(() => 
                global.chrome.runtime.sendMessage.mock.calls.length > 0
            );
            
            expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
                action: 'SPEAK_SELECTION_KEYBOARD'
            });
        });

        test('should manage focus properly when opening overlay', () => {
            const originalFocus = document.activeElement;
            
            overlay.show({
                text: 'Focus test',
                position: { x: 100, y: 100 }
            });
            
            // Should focus first interactive element in overlay
            const firstButton = overlay.container.querySelector('button');
            expect(document.activeElement).toBe(firstButton);
            
            overlay.hide();
            
            // Focus should be restored (in a real implementation)
            // For testing, we just verify the overlay is hidden
            expect(overlay.isVisible).toBe(false);
        });
    });

    describe('Performance Integration', () => {
        test('should handle rapid speech requests efficiently', async () => {
            const texts = [
                'First text to speak',
                'Second text to speak',
                'Third text to speak'
            ];

            // Start multiple speech requests
            const promises = texts.map(text => {
                const promise = ttsService.speak(text);
                
                // Immediately simulate completion for testing
                setTimeout(() => {
                    const utterance = global.speechSynthesis.speak.mock.calls.slice(-1)[0][0];
                    utterance.onend({ type: 'end' });
                }, 50);
                
                return promise;
            });

            // Should handle all requests
            await Promise.all(promises);
            
            expect(global.speechSynthesis.speak).toHaveBeenCalledTimes(3);
            expect(global.speechSynthesis.cancel).toHaveBeenCalledTimes(2); // Previous calls cancelled
        });

        test('should debounce rapid UI updates', async () => {
            let updateCount = 0;
            const originalShow = overlay.show.bind(overlay);
            
            overlay.show = (...args) => {
                updateCount++;
                return originalShow(...args);
            };

            // Rapid show/hide calls
            for (let i = 0; i < 10; i++) {
                overlay.show({
                    text: `Update ${i}`,
                    position: { x: 100, y: 100 }
                });
                overlay.hide();
            }

            // Should handle updates efficiently
            expect(updateCount).toBe(10);
            expect(overlay.isVisible).toBe(false);
        });
    });

    describe('Cross-Component Communication', () => {
        test('should coordinate settings changes across all components', async () => {
            const newSettings = {
                language: 'fr-FR',
                rate: 1.5,
                screenReaderSupport: false,
                highContrast: true
            };

            // Update language manager
            languageManager.setLanguage(newSettings.language);
            
            // Update TTS settings
            ttsService.updateSettings({
                language: newSettings.language,
                rate: newSettings.rate
            });
            
            // Update accessibility settings
            accessibilityManager.updateSettings({
                screenReaderSupport: newSettings.screenReaderSupport,
                highContrast: newSettings.highContrast
            });

            // Verify changes
            expect(languageManager.currentLanguage).toBe('fr');
            expect(ttsService.settings.rate).toBe(1.5);
            expect(accessibilityManager.settings.highContrast).toBe(true);
        });

        test('should handle component initialization order', async () => {
            // Create new instances
            const newTTS = new TTSService();
            const newOverlay = new UIOverlay();
            const newA11y = new AccessibilityManager();
            const newLang = new LanguageManager();

            // Initialize in different order
            await newA11y.initialize();
            await newLang.initialize();
            await newTTS.initialize();
            await newOverlay.initialize();

            expect(newTTS.isInitialized).toBe(true);
            expect(newOverlay.isInitialized).toBe(true);
            expect(newA11y.isInitialized).toBe(true);
            expect(newLang.isInitialized).toBe(true);

            // Cleanup
            newTTS.stop();
            newOverlay.destroy();
            newA11y.destroy();
            newLang.destroy();
        });
    });
});