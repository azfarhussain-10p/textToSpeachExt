/**
 * Language Manager for Intelligent TTS Extension
 * Handles multilingual support and localization
 */

export class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = new Map();
        this.translations = new Map();
        this.rtlLanguages = new Set(['ar', 'he', 'ur', 'fa']);
        this.isInitialized = false;
        
        this.initializeSupportedLanguages();
    }

    initializeSupportedLanguages() {
        // Map of language codes to language information
        this.supportedLanguages.set('en', {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            region: 'US',
            rtl: false,
            voices: ['en-US', 'en-GB', 'en-AU', 'en-CA']
        });

        this.supportedLanguages.set('es', {
            code: 'es',
            name: 'Spanish',
            nativeName: 'Español',
            region: 'ES',
            rtl: false,
            voices: ['es-ES', 'es-MX', 'es-AR', 'es-CO']
        });

        this.supportedLanguages.set('fr', {
            code: 'fr',
            name: 'French',
            nativeName: 'Français',
            region: 'FR',
            rtl: false,
            voices: ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH']
        });

        this.supportedLanguages.set('de', {
            code: 'de',
            name: 'German',
            nativeName: 'Deutsch',
            region: 'DE',
            rtl: false,
            voices: ['de-DE', 'de-AT', 'de-CH']
        });

        this.supportedLanguages.set('it', {
            code: 'it',
            name: 'Italian',
            nativeName: 'Italiano',
            region: 'IT',
            rtl: false,
            voices: ['it-IT']
        });

        this.supportedLanguages.set('pt', {
            code: 'pt',
            name: 'Portuguese',
            nativeName: 'Português',
            region: 'BR',
            rtl: false,
            voices: ['pt-BR', 'pt-PT']
        });

        this.supportedLanguages.set('ru', {
            code: 'ru',
            name: 'Russian',
            nativeName: 'Русский',
            region: 'RU',
            rtl: false,
            voices: ['ru-RU']
        });

        this.supportedLanguages.set('zh', {
            code: 'zh',
            name: 'Chinese',
            nativeName: '中文',
            region: 'CN',
            rtl: false,
            voices: ['zh-CN', 'zh-TW', 'zh-HK']
        });

        this.supportedLanguages.set('ja', {
            code: 'ja',
            name: 'Japanese',
            nativeName: '日本語',
            region: 'JP',
            rtl: false,
            voices: ['ja-JP']
        });

        this.supportedLanguages.set('ko', {
            code: 'ko',
            name: 'Korean',
            nativeName: '한국어',
            region: 'KR',
            rtl: false,
            voices: ['ko-KR']
        });

        this.supportedLanguages.set('ar', {
            code: 'ar',
            name: 'Arabic',
            nativeName: 'العربية',
            region: 'SA',
            rtl: true,
            voices: ['ar-SA', 'ar-EG', 'ar-AE', 'ar-MA']
        });

        this.supportedLanguages.set('hi', {
            code: 'hi',
            name: 'Hindi',
            nativeName: 'हिन्दी',
            region: 'IN',
            rtl: false,
            voices: ['hi-IN']
        });

        this.supportedLanguages.set('ur', {
            code: 'ur',
            name: 'Urdu',
            nativeName: 'اردو',
            region: 'PK',
            rtl: true,
            voices: ['ur-PK', 'ur-IN']
        });

        this.supportedLanguages.set('nl', {
            code: 'nl',
            name: 'Dutch',
            nativeName: 'Nederlands',
            region: 'NL',
            rtl: false,
            voices: ['nl-NL', 'nl-BE']
        });

        this.supportedLanguages.set('sv', {
            code: 'sv',
            name: 'Swedish',
            nativeName: 'Svenska',
            region: 'SE',
            rtl: false,
            voices: ['sv-SE']
        });
    }

    async initialize() {
        try {
            await this.loadTranslations();
            await this.detectUserLanguage();
            this.isInitialized = true;
            console.log('Language Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Language Manager:', error);
        }
    }

    async loadTranslations() {
        // Load translation data for each supported language
        const translations = {
            en: {
                // UI Labels
                'ui.speak': 'Speak',
                'ui.stop': 'Stop',
                'ui.explain': 'Explain',
                'ui.close': 'Close',
                'ui.settings': 'Settings',
                'ui.language': 'Language',
                'ui.voice': 'Voice',
                'ui.speed': 'Speed',
                'ui.pitch': 'Pitch',
                'ui.volume': 'Volume',
                'ui.save': 'Save',
                'ui.cancel': 'Cancel',
                'ui.reset': 'Reset',
                'ui.help': 'Help',
                
                // Status Messages
                'status.speaking': 'Speaking...',
                'status.stopped': 'Speech stopped',
                'status.loading': 'Loading...',
                'status.ready': 'Ready',
                'status.error': 'Error occurred',
                
                // Accessibility Messages
                'a11y.speak_selected': 'Speak selected text',
                'a11y.get_explanation': 'Get AI explanation',
                'a11y.stop_speech': 'Stop speech',
                'a11y.close_overlay': 'Close TTS overlay',
                'a11y.overlay_opened': 'TTS controls opened',
                'a11y.overlay_closed': 'TTS controls closed',
                'a11y.speech_started': 'Started reading text',
                'a11y.speech_finished': 'Finished reading text',
                'a11y.explanation_ready': 'AI explanation is ready',
                
                // Error Messages
                'error.no_text_selected': 'No text selected',
                'error.speech_failed': 'Speech synthesis failed',
                'error.api_error': 'API request failed',
                'error.network_error': 'Network connection error',
                'error.rate_limit': 'Rate limit exceeded',
                
                // Keyboard Shortcuts
                'shortcuts.speak': 'Ctrl+Shift+S: Speak selected text',
                'shortcuts.explain': 'Ctrl+Shift+E: Get AI explanation',
                'shortcuts.stop': 'Ctrl+Shift+X: Stop speech',
                'shortcuts.overlay': 'Ctrl+Shift+O: Toggle overlay',
                'shortcuts.help': 'Ctrl+Shift+H: Show help',
                
                // Settings
                'settings.voice_settings': 'Voice Settings',
                'settings.ai_settings': 'AI Settings',
                'settings.interface': 'Interface',
                'settings.privacy': 'Privacy',
                'settings.advanced': 'Advanced',
                'settings.complexity': 'Explanation Complexity',
                'settings.simple': 'Simple',
                'settings.detailed': 'Detailed',
                'settings.technical': 'Technical'
            },

            es: {
                'ui.speak': 'Hablar',
                'ui.stop': 'Parar',
                'ui.explain': 'Explicar',
                'ui.close': 'Cerrar',
                'ui.settings': 'Configuración',
                'ui.language': 'Idioma',
                'ui.voice': 'Voz',
                'ui.speed': 'Velocidad',
                'ui.pitch': 'Tono',
                'ui.volume': 'Volumen',
                'ui.save': 'Guardar',
                'ui.cancel': 'Cancelar',
                'ui.reset': 'Restablecer',
                'ui.help': 'Ayuda',
                
                'status.speaking': 'Hablando...',
                'status.stopped': 'Voz detenida',
                'status.loading': 'Cargando...',
                'status.ready': 'Listo',
                'status.error': 'Error ocurrido',
                
                'a11y.speak_selected': 'Leer texto seleccionado',
                'a11y.get_explanation': 'Obtener explicación de IA',
                'a11y.stop_speech': 'Detener voz',
                'a11y.close_overlay': 'Cerrar superposición TTS',
                'a11y.overlay_opened': 'Controles TTS abiertos',
                'a11y.overlay_closed': 'Controles TTS cerrados',
                
                'error.no_text_selected': 'Ningún texto seleccionado',
                'error.speech_failed': 'Falló la síntesis de voz',
                'error.api_error': 'Falló la solicitud de API',
                'error.network_error': 'Error de conexión de red',
                'error.rate_limit': 'Límite de velocidad excedido'
            },

            fr: {
                'ui.speak': 'Parler',
                'ui.stop': 'Arrêter',
                'ui.explain': 'Expliquer',
                'ui.close': 'Fermer',
                'ui.settings': 'Paramètres',
                'ui.language': 'Langue',
                'ui.voice': 'Voix',
                'ui.speed': 'Vitesse',
                'ui.pitch': 'Hauteur',
                'ui.volume': 'Volume',
                'ui.save': 'Enregistrer',
                'ui.cancel': 'Annuler',
                'ui.reset': 'Réinitialiser',
                'ui.help': 'Aide',
                
                'status.speaking': 'Parle...',
                'status.stopped': 'Voix arrêtée',
                'status.loading': 'Chargement...',
                'status.ready': 'Prêt',
                'status.error': 'Erreur survenue'
            },

            de: {
                'ui.speak': 'Sprechen',
                'ui.stop': 'Stoppen',
                'ui.explain': 'Erklären',
                'ui.close': 'Schließen',
                'ui.settings': 'Einstellungen',
                'ui.language': 'Sprache',
                'ui.voice': 'Stimme',
                'ui.speed': 'Geschwindigkeit',
                'ui.pitch': 'Tonhöhe',
                'ui.volume': 'Lautstärke',
                'ui.save': 'Speichern',
                'ui.cancel': 'Abbrechen',
                'ui.reset': 'Zurücksetzen',
                'ui.help': 'Hilfe',
                
                'status.speaking': 'Spricht...',
                'status.stopped': 'Sprache gestoppt',
                'status.loading': 'Lädt...',
                'status.ready': 'Bereit',
                'status.error': 'Fehler aufgetreten'
            },

            ar: {
                'ui.speak': 'تحدث',
                'ui.stop': 'توقف',
                'ui.explain': 'اشرح',
                'ui.close': 'إغلاق',
                'ui.settings': 'الإعدادات',
                'ui.language': 'اللغة',
                'ui.voice': 'الصوت',
                'ui.speed': 'السرعة',
                'ui.pitch': 'النبرة',
                'ui.volume': 'الصوت',
                'ui.save': 'حفظ',
                'ui.cancel': 'إلغاء',
                'ui.reset': 'إعادة تعيين',
                'ui.help': 'مساعدة',
                
                'status.speaking': 'يتحدث...',
                'status.stopped': 'توقف الكلام',
                'status.loading': 'جاري التحميل...',
                'status.ready': 'جاهز',
                'status.error': 'حدث خطأ'
            },

            zh: {
                'ui.speak': '朗读',
                'ui.stop': '停止',
                'ui.explain': '解释',
                'ui.close': '关闭',
                'ui.settings': '设置',
                'ui.language': '语言',
                'ui.voice': '语音',
                'ui.speed': '速度',
                'ui.pitch': '音调',
                'ui.volume': '音量',
                'ui.save': '保存',
                'ui.cancel': '取消',
                'ui.reset': '重置',
                'ui.help': '帮助',
                
                'status.speaking': '正在朗读...',
                'status.stopped': '语音已停止',
                'status.loading': '加载中...',
                'status.ready': '就绪',
                'status.error': '发生错误'
            },

            ja: {
                'ui.speak': '読み上げ',
                'ui.stop': '停止',
                'ui.explain': '説明',
                'ui.close': '閉じる',
                'ui.settings': '設定',
                'ui.language': '言語',
                'ui.voice': '音声',
                'ui.speed': '速度',
                'ui.pitch': 'ピッチ',
                'ui.volume': '音量',
                'ui.save': '保存',
                'ui.cancel': 'キャンセル',
                'ui.reset': 'リセット',
                'ui.help': 'ヘルプ',
                
                'status.speaking': '読み上げ中...',
                'status.stopped': '音声停止',
                'status.loading': '読み込み中...',
                'status.ready': '準備完了',
                'status.error': 'エラーが発生しました'
            }
        };

        // Store translations
        Object.entries(translations).forEach(([lang, strings]) => {
            this.translations.set(lang, new Map(Object.entries(strings)));
        });
    }

    async detectUserLanguage() {
        try {
            // Try to get language from extension settings first
            const response = await chrome.runtime.sendMessage({ action: 'GET_SETTINGS' });
            if (response.success && response.data.language) {
                const settingsLang = response.data.language.split('-')[0];
                if (this.supportedLanguages.has(settingsLang)) {
                    this.currentLanguage = settingsLang;
                    return;
                }
            }
        } catch (error) {
            console.log('Could not get language from settings');
        }

        // Fall back to browser language detection
        const browserLang = navigator.language || navigator.languages[0];
        const langCode = browserLang ? browserLang.split('-')[0] : 'en';
        
        if (this.supportedLanguages.has(langCode)) {
            this.currentLanguage = langCode;
        } else {
            this.currentLanguage = 'en'; // Default fallback
        }
    }

    /**
     * Get translated text
     */
    t(key, fallback = null) {
        const langMap = this.translations.get(this.currentLanguage);
        if (langMap && langMap.has(key)) {
            return langMap.get(key);
        }

        // Fallback to English
        const englishMap = this.translations.get('en');
        if (englishMap && englishMap.has(key)) {
            return englishMap.get(key);
        }

        // Return fallback or key
        return fallback || key;
    }

    /**
     * Set current language
     */
    setLanguage(languageCode) {
        const langCode = languageCode.split('-')[0];
        if (this.supportedLanguages.has(langCode)) {
            this.currentLanguage = langCode;
            this.applyLanguageChanges();
            return true;
        }
        return false;
    }

    /**
     * Get current language information
     */
    getCurrentLanguage() {
        return this.supportedLanguages.get(this.currentLanguage);
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return Array.from(this.supportedLanguages.values());
    }

    /**
     * Check if language is RTL
     */
    isRTL(languageCode = null) {
        const code = languageCode ? languageCode.split('-')[0] : this.currentLanguage;
        return this.rtlLanguages.has(code);
    }

    /**
     * Apply language-specific changes to the UI
     */
    applyLanguageChanges() {
        // Update document direction
        if (this.isRTL()) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', this.currentLanguage);
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', this.currentLanguage);
        }

        // Update existing UI elements
        this.updateUITexts();
        
        // Notify other components
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }

    /**
     * Update UI text elements
     */
    updateUITexts() {
        // Update elements with data-i18n attributes
        const i18nElements = document.querySelectorAll('[data-i18n]');
        i18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('title')) {
                element.title = translation;
            } else if (element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', translation);
            } else {
                element.textContent = translation;
            }
        });

        // Update TTS extension specific elements
        this.updateExtensionElements();
    }

    updateExtensionElements() {
        // Update button texts
        const speakButtons = document.querySelectorAll('.tts-speak-btn .btn-text');
        speakButtons.forEach(btn => btn.textContent = this.t('ui.speak'));

        const explainButtons = document.querySelectorAll('.tts-explain-btn .btn-text');
        explainButtons.forEach(btn => btn.textContent = this.t('ui.explain'));

        const stopButtons = document.querySelectorAll('.tts-stop-btn .btn-text');
        stopButtons.forEach(btn => btn.textContent = this.t('ui.stop'));

        // Update aria labels
        const speakBtns = document.querySelectorAll('.tts-speak-btn');
        speakBtns.forEach(btn => btn.setAttribute('aria-label', this.t('a11y.speak_selected')));

        const explainBtns = document.querySelectorAll('.tts-explain-btn');
        explainBtns.forEach(btn => btn.setAttribute('aria-label', this.t('a11y.get_explanation')));

        const stopBtns = document.querySelectorAll('.tts-stop-btn');
        stopBtns.forEach(btn => btn.setAttribute('aria-label', this.t('a11y.stop_speech')));

        const closeBtns = document.querySelectorAll('.tts-close-btn');
        closeBtns.forEach(btn => btn.setAttribute('aria-label', this.t('ui.close')));
    }

    /**
     * Format numbers according to locale
     */
    formatNumber(number, options = {}) {
        try {
            const locale = this.getCurrentLanguageLocale();
            return new Intl.NumberFormat(locale, options).format(number);
        } catch (error) {
            return number.toString();
        }
    }

    /**
     * Format dates according to locale
     */
    formatDate(date, options = {}) {
        try {
            const locale = this.getCurrentLanguageLocale();
            return new Intl.DateTimeFormat(locale, options).format(date);
        } catch (error) {
            return date.toString();
        }
    }

    /**
     * Get current language locale
     */
    getCurrentLanguageLocale() {
        const langInfo = this.getCurrentLanguage();
        return `${langInfo.code}-${langInfo.region}`;
    }

    /**
     * Get text direction for current language
     */
    getTextDirection() {
        return this.isRTL() ? 'rtl' : 'ltr';
    }

    /**
     * Pluralization helper
     */
    plural(count, singular, plural = null) {
        if (count === 1) {
            return this.t(singular);
        }
        
        const pluralKey = plural || `${singular}_plural`;
        return this.t(pluralKey, this.t(singular));
    }

    /**
     * Get language-specific voice preferences
     */
    getVoicePreferences() {
        const langInfo = this.getCurrentLanguage();
        return langInfo.voices || [];
    }

    /**
     * Clean up
     */
    destroy() {
        document.documentElement.removeAttribute('dir');
        document.documentElement.removeAttribute('lang');
        this.isInitialized = false;
    }
}