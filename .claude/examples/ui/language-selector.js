// language-selector.js - Comprehensive Language Selector Component for Multi-Language Interfaces

/**
 * LanguageSelector class for managing multi-language switches.
 * Features: Renders UI (dropdown/buttons), loads JSON translations, updates DOM,
 * persists in localStorage, RTL support, event dispatching.
 * Usage: new LanguageSelector({ languages: [...], defaultLang: 'en', renderTarget: '#selector' });
 */

class LanguageSelector {
  constructor(options = {}) {
    this.options = {
      languages: [ // Array of { code: 'en', name: 'English', native: 'English', rtl: false }
        { code: 'en', name: 'English', native: 'English', rtl: false },
        { code: 'es', name: 'Spanish', native: 'Español', rtl: false },
        { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true }
      ],
      defaultLang: 'en',
      translationAttr: 'data-i18n', // Attribute for translatable elements
      renderType: 'dropdown', // 'dropdown' or 'buttons'
      renderTarget: '#language-selector', // Selector to append UI
      jsonPath: './lang/', // Path to JSON files (e.g., en.json)
      useJsonFiles: true, // True for files, false for inline objects
      translations: {}, // Inline translations if not using files
      onChange: null, // Callback on language change
      ...options
    };

    this.currentLang = localStorage.getItem('lang') || this.options.defaultLang;
    this.translationsCache = {};
    this.init();
  }

  async init() {
    await this.loadTranslations(this.currentLang);
    this.renderUI();
    this.updateContent();
    this.setRTL(this.currentLang);
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
  }

  async loadTranslations(lang) {
    if (this.translationsCache[lang]) return;
    if (this.options.useJsonFiles) {
      try {
        const response = await fetch(`${this.options.jsonPath}${lang}.json`);
        this.translationsCache[lang] = await response.json();
      } catch (error) {
        console.error(`Failed to load ${lang}.json:`, error);
        this.translationsCache[lang] = {};
      }
    } else {
      this.translationsCache[lang] = this.options.translations[lang] || {};
    }
  }

  async switchLanguage(lang) {
    if (!this.options.languages.find(l => l.code === lang)) return;
    await this.loadTranslations(lang);
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.updateContent();
    this.setRTL(lang);
    if (this.options.onChange) this.options.onChange(lang);
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  updateContent() {
    const elements = document.querySelectorAll(`[${this.options.translationAttr}]`);
    elements.forEach(el => {
      const key = el.getAttribute(this.options.translationAttr);
      el.textContent = this.translationsCache[this.currentLang][key] || el.textContent;
    });
  }

  setRTL(lang) {
    const langInfo = this.options.languages.find(l => l.code === lang);
    document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  renderUI() {
    const target = document.querySelector(this.options.renderTarget);
    if (!target) return console.error('Render target not found');

    target.innerHTML = '';
    if (this.options.renderType === 'dropdown') {
      const select = document.createElement('select');
      select.ariaLabel = 'Select language';
      this.options.languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = `${lang.native} / ${lang.name}`;
        if (lang.code === this.currentLang) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener('change', e => this.switchLanguage(e.target.value));
      target.appendChild(select);
    } else if (this.options.renderType === 'buttons') {
      this.options.languages.forEach(lang => {
        const button = document.createElement('button');
        button.textContent = lang.native;
        button.ariaLabel = `Switch to ${lang.name}`;
        button.addEventListener('click', () => this.switchLanguage(lang.code));
        if (lang.code === this.currentLang) button.classList.add('active');
        target.appendChild(button);
      });
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageSelector;
} else {
  window.LanguageSelector = LanguageSelector;
}