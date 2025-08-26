/**
 * voice-picker.js
 * Advanced Voice Selection UI Component for Web Speech API
 * Features: Language/accent selection, search, filtering, preview, accessibility
 * 
 * @version 1.0.0
 * @license MIT
 */

'use strict';

/**
 * VoicePicker - Main voice selection component
 * Provides comprehensive voice selection UI with filtering and preview
 */
class VoicePicker {
  constructor(options = {}) {
    // Configuration
    this.config = {
      containerId: options.containerId || 'voice-picker-container',
      onChange: options.onChange || (() => {}),
      onPreview: options.onPreview || null,
      enableSearch: options.enableSearch !== false,
      enableFilters: options.enableFilters !== false,
      enablePreview: options.enablePreview !== false,
      enableFavorites: options.enableFavorites !== false,
      groupByLanguage: options.groupByLanguage !== false,
      showMetadata: options.showMetadata !== false,
      previewText: options.previewText || "Hello, this is how I sound.",
      persistPreferences: options.persistPreferences !== false,
      theme: options.theme || 'auto', // auto, light, dark
      compact: options.compact || false,
      virtualScroll: options.virtualScroll || false,
      maxHeight: options.maxHeight || '400px',
      labels: {
        placeholder: options.labels?.placeholder || 'Select a voice...',
        searchPlaceholder: options.labels?.searchPlaceholder || 'Search voices...',
        languageFilter: options.labels?.languageFilter || 'Filter by language',
        genderFilter: options.labels?.genderFilter || 'Filter by gender',
        previewButton: options.labels?.previewButton || 'Preview',
        favoriteButton: options.labels?.favoriteButton || 'Favorite',
        noResults: options.labels?.noResults || 'No voices found',
        loading: options.labels?.loading || 'Loading voices...',
        ...options.labels
      },
      ...options
    };
    
    // State
    this.state = {
      voices: [],
      filteredVoices: [],
      selectedVoice: null,
      isOpen: false,
      isLoading: true,
      searchTerm: '',
      filters: {
        language: '',
        gender: '',
        provider: '',
        quality: ''
      },
      favorites: this._loadFavorites(),
      recentlyUsed: this._loadRecentlyUsed()
    };
    
    // Voice metadata cache
    this.voiceMetadata = new Map();
    
    // References
    this.container = null;
    this.elements = {};
    
    // Bind methods
    this._bindMethods();
    
    // Initialize
    this._init();
  }
  
  /**
   * Bind all methods to instance
   */
  _bindMethods() {
    this._init = this._init.bind(this);
    this._loadVoices = this._loadVoices.bind(this);
    this._render = this._render.bind(this);
    this._handleVoiceSelect = this._handleVoiceSelect.bind(this);
    this._handleSearch = this._handleSearch.bind(this);
    this._handleFilterChange = this._handleFilterChange.bind(this);
    this._handlePreview = this._handlePreview.bind(this);
    this._handleFavorite = this._handleFavorite.bind(this);
    this._handleKeyboard = this._handleKeyboard.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  
  /**
   * Initialize component
   */
  async _init() {
    // Get container
    this.container = document.getElementById(this.config.containerId);
    if (!this.container) {
      console.error(`Container with ID "${this.config.containerId}" not found`);
      return;
    }
    
    // Apply theme
    this._applyTheme();
    
    // Load voices
    await this._loadVoices();
    
    // Load saved preferences
    if (this.config.persistPreferences) {
      this._loadPreferences();
    }
    
    // Initial render
    this._render();
    
    // Setup event listeners
    this._setupEventListeners();
  }
  
  /**
   * Load available voices
   */
  async _loadVoices() {
    return new Promise((resolve) => {
      const loadVoicesHandler = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.state.voices = this._processVoices(voices);
          this.state.filteredVoices = [...this.state.voices];
          this.state.isLoading = false;
          resolve(voices);
        }
      };
      
      // Try immediate load
      loadVoicesHandler();
      
      // Setup async loading for Chrome
      if (this.state.voices.length === 0) {
        if ('onvoiceschanged' in speechSynthesis) {
          speechSynthesis.onvoiceschanged = () => {
            loadVoicesHandler();
            this._render();
          };
        }
        
        // Timeout fallback
        setTimeout(() => {
          if (this.state.isLoading) {
            this.state.isLoading = false;
            this._render();
          }
        }, 3000);
      }
    });
  }
  
  /**
   * Process and enrich voice data
   */
  _processVoices(voices) {
    return voices.map(voice => {
      // Extract metadata
      const lang = voice.lang;
      const langCode = lang.split('-')[0];
      const region = lang.split('-')[1] || '';
      
      // Detect gender from voice name (heuristic)
      const gender = this._detectGender(voice.name);
      
      // Detect quality/provider
      const provider = this._detectProvider(voice.name);
      const quality = this._detectQuality(voice.name);
      
      // Create enhanced voice object
      const enhancedVoice = {
        voice: voice,
        id: `${voice.name}-${voice.lang}`,
        name: voice.name,
        lang: voice.lang,
        langCode: langCode,
        region: region,
        gender: gender,
        provider: provider,
        quality: quality,
        default: voice.default,
        localService: voice.localService,
        displayName: this._formatDisplayName(voice),
        searchableText: `${voice.name} ${voice.lang} ${gender} ${provider}`.toLowerCase()
      };
      
      // Cache metadata
      this.voiceMetadata.set(enhancedVoice.id, enhancedVoice);
      
      return enhancedVoice;
    });
  }
  
  /**
   * Detect gender from voice name
   */
  _detectGender(name) {
    const nameLower = name.toLowerCase();
    
    const femaleIndicators = [
      'female', 'woman', 'girl', 'lady',
      'samantha', 'victoria', 'kate', 'anna', 'emma', 'olivia',
      'sophia', 'isabella', 'charlotte', 'amelia', 'emily',
      'sara', 'karen', 'susan', 'alice', 'zoe', 'lily'
    ];
    
    const maleIndicators = [
      'male', 'man', 'boy', 'guy',
      'daniel', 'thomas', 'alex', 'james', 'william', 'michael',
      'david', 'richard', 'joseph', 'charles', 'christopher',
      'matthew', 'mark', 'steven', 'paul', 'andrew', 'fred'
    ];
    
    for (const indicator of femaleIndicators) {
      if (nameLower.includes(indicator)) return 'female';
    }
    
    for (const indicator of maleIndicators) {
      if (nameLower.includes(indicator)) return 'male';
    }
    
    return 'neutral';
  }
  
  /**
   * Detect provider from voice name
   */
  _detectProvider(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('google')) return 'Google';
    if (nameLower.includes('microsoft')) return 'Microsoft';
    if (nameLower.includes('apple') || nameLower.includes('siri')) return 'Apple';
    if (nameLower.includes('amazon') || nameLower.includes('polly')) return 'Amazon';
    if (nameLower.includes('ibm') || nameLower.includes('watson')) return 'IBM';
    
    return 'System';
  }
  
  /**
   * Detect quality from voice name
   */
  _detectQuality(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('premium') || nameLower.includes('plus')) return 'premium';
    if (nameLower.includes('enhanced') || nameLower.includes('hd')) return 'enhanced';
    if (nameLower.includes('neural') || nameLower.includes('wavenet')) return 'neural';
    if (nameLower.includes('compact') || nameLower.includes('lite')) return 'compact';
    
    return 'standard';
  }
  
  /**
   * Format display name for voice
   */
  _formatDisplayName(voice) {
    let displayName = voice.name;
    
    // Add language/region info
    const langName = this._getLanguageName(voice.lang);
    displayName += ` (${langName})`;
    
    // Add default indicator
    if (voice.default) {
      displayName += ' — DEFAULT';
    }
    
    return displayName;
  }
  
  /**
   * Get human-readable language name
   */
  _getLanguageName(langCode) {
    const languageNames = {
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'en-AU': 'English (Australia)',
      'en-IN': 'English (India)',
      'es-ES': 'Spanish (Spain)',
      'es-MX': 'Spanish (Mexico)',
      'es-AR': 'Spanish (Argentina)',
      'fr-FR': 'French (France)',
      'fr-CA': 'French (Canada)',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'pt-BR': 'Portuguese (Brazil)',
      'pt-PT': 'Portuguese (Portugal)',
      'ru-RU': 'Russian',
      'ja-JP': 'Japanese',
      'zh-CN': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'ko-KR': 'Korean',
      'ar-SA': 'Arabic',
      'hi-IN': 'Hindi',
      'nl-NL': 'Dutch',
      'sv-SE': 'Swedish',
      'da-DK': 'Danish',
      'nb-NO': 'Norwegian',
      'fi-FI': 'Finnish',
      'pl-PL': 'Polish',
      'tr-TR': 'Turkish',
      'th-TH': 'Thai'
    };
    
    return languageNames[langCode] || langCode;
  }
  
  /**
   * Main render method
   */
  _render() {
    this.container.innerHTML = '';
    this.container.className = `voice-picker ${this.config.compact ? 'voice-picker--compact' : ''}`;
    
    // Create main structure
    const wrapper = this._createElement('div', 'voice-picker__wrapper');
    
    // Selected display / trigger button
    const trigger = this._createTrigger();
    wrapper.appendChild(trigger);
    
    // Dropdown panel
    if (this.state.isOpen) {
      const dropdown = this._createDropdown();
      wrapper.appendChild(dropdown);
    }
    
    this.container.appendChild(wrapper);
    
    // Store element references
    this.elements.trigger = trigger;
    this.elements.dropdown = this.container.querySelector('.voice-picker__dropdown');
  }
  
  /**
   * Create trigger button
   */
  _createTrigger() {
    const trigger = this._createElement('button', 'voice-picker__trigger');
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', this.state.isOpen);
    trigger.setAttribute('aria-label', 'Select voice');
    
    // Display text
    const displayText = this.state.selectedVoice ? 
      this.state.selectedVoice.displayName : 
      this.config.labels.placeholder;
    
    trigger.innerHTML = `
      <span class="voice-picker__trigger-text">${displayText}</span>
      <svg class="voice-picker__trigger-icon" width="12" height="12" viewBox="0 0 12 12">
        <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `;
    
    trigger.addEventListener('click', () => this._toggleDropdown());
    
    return trigger;
  }
  
  /**
   * Create dropdown panel
   */
  _createDropdown() {
    const dropdown = this._createElement('div', 'voice-picker__dropdown');
    dropdown.setAttribute('role', 'listbox');
    dropdown.style.maxHeight = this.config.maxHeight;
    
    // Search bar
    if (this.config.enableSearch) {
      const searchBar = this._createSearchBar();
      dropdown.appendChild(searchBar);
    }
    
    // Filters
    if (this.config.enableFilters) {
      const filters = this._createFilters();
      dropdown.appendChild(filters);
    }
    
    // Voice list
    const voiceList = this._createVoiceList();
    dropdown.appendChild(voiceList);
    
    return dropdown;
  }
  
  /**
   * Create search bar
   */
  _createSearchBar() {
    const searchBar = this._createElement('div', 'voice-picker__search');
    
    const input = this._createElement('input', 'voice-picker__search-input');
    input.type = 'text';
    input.placeholder = this.config.labels.searchPlaceholder;
    input.value = this.state.searchTerm;
    input.setAttribute('aria-label', 'Search voices');
    
    input.addEventListener('input', this._handleSearch);
    
    searchBar.appendChild(input);
    
    return searchBar;
  }
  
  /**
   * Create filter controls
   */
  _createFilters() {
    const filters = this._createElement('div', 'voice-picker__filters');
    
    // Language filter
    const languages = this._getAvailableLanguages();
    if (languages.length > 1) {
      const langFilter = this._createSelect(
        'language',
        this.config.labels.languageFilter,
        languages
      );
      filters.appendChild(langFilter);
    }
    
    // Gender filter
    const genderFilter = this._createSelect(
      'gender',
      this.config.labels.genderFilter,
      [
        { value: '', label: 'All genders' },
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'neutral', label: 'Neutral' }
      ]
    );
    filters.appendChild(genderFilter);
    
    return filters;
  }
  
  /**
   * Create select dropdown for filters
   */
  _createSelect(name, label, options) {
    const wrapper = this._createElement('div', 'voice-picker__filter');
    
    const select = this._createElement('select', 'voice-picker__filter-select');
    select.setAttribute('aria-label', label);
    select.name = name;
    
    options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value || option;
      optionEl.textContent = option.label || this._getLanguageName(option);
      if (this.state.filters[name] === optionEl.value) {
        optionEl.selected = true;
      }
      select.appendChild(optionEl);
    });
    
    select.addEventListener('change', () => this._handleFilterChange(name, select.value));
    
    wrapper.appendChild(select);
    
    return wrapper;
  }
  
  /**
   * Get available languages from voices
   */
  _getAvailableLanguages() {
    const languages = new Set(['']);
    this.state.voices.forEach(voice => {
      languages.add(voice.lang);
    });
    
    return Array.from(languages).sort().map(lang => ({
      value: lang,
      label: lang ? this._getLanguageName(lang) : 'All languages'
    }));
  }
  
  /**
   * Create voice list
   */
  _createVoiceList() {
    const listWrapper = this._createElement('div', 'voice-picker__list-wrapper');
    
    if (this.state.isLoading) {
      listWrapper.innerHTML = `<div class="voice-picker__loading">${this.config.labels.loading}</div>`;
      return listWrapper;
    }
    
    const voices = this._getFilteredVoices();
    
    if (voices.length === 0) {
      listWrapper.innerHTML = `<div class="voice-picker__no-results">${this.config.labels.noResults}</div>`;
      return listWrapper;
    }
    
    const list = this._createElement('ul', 'voice-picker__list');
    list.setAttribute('role', 'listbox');
    
    // Group by language if enabled
    if (this.config.groupByLanguage) {
      const grouped = this._groupVoicesByLanguage(voices);
      
      Object.entries(grouped).forEach(([lang, langVoices]) => {
        // Language group header
        const header = this._createElement('li', 'voice-picker__group-header');
        header.textContent = this._getLanguageName(lang);
        header.setAttribute('role', 'presentation');
        list.appendChild(header);
        
        // Voices in group
        langVoices.forEach(voice => {
          const item = this._createVoiceItem(voice);
          list.appendChild(item);
        });
      });
    } else {
      // Flat list
      voices.forEach(voice => {
        const item = this._createVoiceItem(voice);
        list.appendChild(item);
      });
    }
    
    listWrapper.appendChild(list);
    
    return listWrapper;
  }
  
  /**
   * Create individual voice item
   */
  _createVoiceItem(voice) {
    const item = this._createElement('li', 'voice-picker__item');
    item.setAttribute('role', 'option');
    item.setAttribute('data-voice-id', voice.id);
    item.setAttribute('aria-selected', voice.id === this.state.selectedVoice?.id);
    
    if (voice.id === this.state.selectedVoice?.id) {
      item.classList.add('voice-picker__item--selected');
    }
    
    // Main content
    const content = this._createElement('div', 'voice-picker__item-content');
    
    // Voice name
    const name = this._createElement('div', 'voice-picker__item-name');
    name.textContent = voice.name;
    content.appendChild(name);
    
    // Metadata
    if (this.config.showMetadata) {
      const metadata = this._createElement('div', 'voice-picker__item-metadata');
      metadata.innerHTML = `
        <span class="voice-picker__item-lang">${this._getLanguageName(voice.lang)}</span>
        <span class="voice-picker__item-gender">${voice.gender}</span>
        ${voice.quality !== 'standard' ? `<span class="voice-picker__item-quality">${voice.quality}</span>` : ''}
      `;
      content.appendChild(metadata);
    }
    
    item.appendChild(content);
    
    // Actions
    const actions = this._createElement('div', 'voice-picker__item-actions');
    
    // Preview button
    if (this.config.enablePreview) {
      const previewBtn = this._createElement('button', 'voice-picker__item-preview');
      previewBtn.setAttribute('type', 'button');
      previewBtn.setAttribute('aria-label', `Preview ${voice.name}`);
      previewBtn.innerHTML = '▶';
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handlePreview(voice);
      });
      actions.appendChild(previewBtn);
    }
    
    // Favorite button
    if (this.config.enableFavorites) {
      const favBtn = this._createElement('button', 'voice-picker__item-favorite');
      favBtn.setAttribute('type', 'button');
      favBtn.setAttribute('aria-label', `${this._isFavorite(voice.id) ? 'Remove from' : 'Add to'} favorites`);
      favBtn.innerHTML = this._isFavorite(voice.id) ? '★' : '☆';
      favBtn.classList.toggle('voice-picker__item-favorite--active', this._isFavorite(voice.id));
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleFavorite(voice);
      });
      actions.appendChild(favBtn);
    }
    
    item.appendChild(actions);
    
    // Click handler
    item.addEventListener('click', () => this._handleVoiceSelect(voice));
    
    return item;
  }
  
  /**
   * Group voices by language
   */
  _groupVoicesByLanguage(voices) {
    const grouped = {};
    
    // Favorites section
    if (this.config.enableFavorites && this.state.favorites.length > 0) {
      const favoriteVoices = voices.filter(v => this._isFavorite(v.id));
      if (favoriteVoices.length > 0) {
        grouped['__favorites'] = favoriteVoices;
      }
    }
    
    // Recently used section
    if (this.state.recentlyUsed.length > 0) {
      const recentVoices = voices.filter(v => 
        this.state.recentlyUsed.includes(v.id)
      ).slice(0, 5);
      if (recentVoices.length > 0) {
        grouped['__recent'] = recentVoices;
      }
    }
    
    // Regular grouping
    voices.forEach(voice => {
      if (!grouped[voice.lang]) {
        grouped[voice.lang] = [];
      }
      grouped[voice.lang].push(voice);
    });
    
    return grouped;
  }
  
  /**
   * Get filtered voices based on current filters and search
   */
  _getFilteredVoices() {
    let voices = [...this.state.voices];
    
    // Apply search filter
    if (this.state.searchTerm) {
      const searchLower = this.state.searchTerm.toLowerCase();
      voices = voices.filter(voice => 
        voice.searchableText.includes(searchLower)
      );
    }
    
    // Apply language filter
    if (this.state.filters.language) {
      voices = voices.filter(voice => 
        voice.lang === this.state.filters.language
      );
    }
    
    // Apply gender filter
    if (this.state.filters.gender) {
      voices = voices.filter(voice => 
        voice.gender === this.state.filters.gender
      );
    }
    
    return voices;
  }
  
  /**
   * Handle voice selection
   */
  _handleVoiceSelect(voice) {
    this.state.selectedVoice = voice;
    
    // Update recently used
    this._updateRecentlyUsed(voice.id);
    
    // Save preference
    if (this.config.persistPreferences) {
      this._savePreferences();
    }
    
    // Close dropdown
    this._toggleDropdown(false);
    
    // Re-render
    this._render();
    
    // Trigger callback
    this.config.onChange(voice.voice, voice);
  }
  
  /**
   * Handle search input
   */
  _handleSearch(event) {
    this.state.searchTerm = event.target.value;
    
    // Debounced re-render
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      const list = this.container.querySelector('.voice-picker__list-wrapper');
      if (list) {
        const newList = this._createVoiceList();
        list.replaceWith(newList);
      }
    }, 300);
  }
  
  /**
   * Handle filter change
   */
  _handleFilterChange(filterName, value) {
    this.state.filters[filterName] = value;
    
    const list = this.container.querySelector('.voice-picker__list-wrapper');
    if (list) {
      const newList = this._createVoiceList();
      list.replaceWith(newList);
    }
  }
  
  /**
   * Handle voice preview
   */
  _handlePreview(voice) {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(this.config.previewText);
    utterance.voice = voice.voice;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    speechSynthesis.speak(utterance);
    
    // Custom callback
    if (this.config.onPreview) {
      this.config.onPreview(voice.voice, voice);
    }
  }
  
  /**
   * Handle favorite toggle
   */
  _handleFavorite(voice) {
    const index = this.state.favorites.indexOf(voice.id);
    
    if (index > -1) {
      this.state.favorites.splice(index, 1);
    } else {
      this.state.favorites.push(voice.id);
    }
    
    // Save favorites
    this._saveFavorites();
    
    // Update UI
    const favBtn = this.container.querySelector(`[data-voice-id="${voice.id}"] .voice-picker__item-favorite`);
    if (favBtn) {
      favBtn.innerHTML = this._isFavorite(voice.id) ? '★' : '☆';
      favBtn.classList.toggle('voice-picker__item-favorite--active', this._isFavorite(voice.id));
    }
  }
  
  /**
   * Check if voice is favorite
   */
  _isFavorite(voiceId) {
    return this.state.favorites.includes(voiceId);
  }
  
  /**
   * Toggle dropdown visibility
   */
  _toggleDropdown(state) {
    this.state.isOpen = state !== undefined ? state : !this.state.isOpen;
    this._render();
  }
  
  /**
   * Handle keyboard navigation
   */
  _handleKeyboard(event) {
    if (!this.state.isOpen) return;
    
    const items = Array.from(this.container.querySelectorAll('.voice-picker__item'));
    const currentIndex = items.findIndex(item => 
      item.classList.contains('voice-picker__item--focused')
    );
    
    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this._focusItem(items[nextIndex]);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        this._focusItem(items[prevIndex]);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex > -1) {
          items[currentIndex].click();
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this._toggleDropdown(false);
        this.elements.trigger?.focus();
        break;
    }
  }
  
  /**
   * Focus voice item
   */
  _focusItem(item) {
    // Remove previous focus
    this.container.querySelectorAll('.voice-picker__item--focused').forEach(el => {
      el.classList.remove('voice-picker__item--focused');
    });
    
    // Add focus
    if (item) {
      item.classList.add('voice-picker__item--focused');
      item.scrollIntoView({ block: 'nearest' });
    }
  }
  
  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', this._handleKeyboard);
    
    // Click outside to close
    document.addEventListener('click', (event) => {
      if (this.state.isOpen && !this.container.contains(event.target)) {
        this._toggleDropdown(false);
      }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      if (this.state.isOpen) {
        this._positionDropdown();
      }
    });
  }
  
  /**
   * Position dropdown (for absolute positioning)
   */
  _positionDropdown() {
    const dropdown = this.elements.dropdown;
    if (!dropdown) return;
    
    const trigger = this.elements.trigger;
    const triggerRect = trigger.getBoundingClientRect();
    
    // Check if dropdown would overflow viewport
    const dropdownHeight = dropdown.offsetHeight;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // Position above
      dropdown.style.bottom = '100%';
      dropdown.style.top = 'auto';
    } else {
      // Position below
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
    }
  }
  
  /**
   * Apply theme
   */
  _applyTheme() {
    let theme = this.config.theme;
    
    if (theme === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    this.container.setAttribute('data-theme', theme);
  }
  
  /**
   * Update recently used voices
   */
  _updateRecentlyUsed(voiceId) {
    // Remove if exists
    const index = this.state.recentlyUsed.indexOf(voiceId);
    if (index > -1) {
      this.state.recentlyUsed.splice(index, 1);
    }
    
    // Add to front
    this.state.recentlyUsed.unshift(voiceId);
    
    // Limit to 10
    this.state.recentlyUsed = this.state.recentlyUsed.slice(0, 10);
    
    // Save
    this._saveRecentlyUsed();
  }
  
  /**
   * Save preferences to localStorage
   */
  _savePreferences() {
    const prefs = {
      selectedVoiceId: this.state.selectedVoice?.id,
      filters: this.state.filters
    };
    
    localStorage.setItem('voicePicker_preferences', JSON.stringify(prefs));
  }
  
  /**
   * Load preferences from localStorage
   */
  _loadPreferences() {
    try {
      const stored = localStorage.getItem('voicePicker_preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        
        // Restore selected voice
        if (prefs.selectedVoiceId) {
          const voice = this.state.voices.find(v => v.id === prefs.selectedVoiceId);
          if (voice) {
            this.state.selectedVoice = voice;
          }
        }
        
        // Restore filters
        if (prefs.filters) {
          this.state.filters = { ...this.state.filters, ...prefs.filters };
        }
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }
  
  /**
   * Save favorites to localStorage
   */
  _saveFavorites() {
    localStorage.setItem('voicePicker_favorites', JSON.stringify(this.state.favorites));
  }
  
  /**
   * Load favorites from localStorage
   */
  _loadFavorites() {
    try {
      const stored = localStorage.getItem('voicePicker_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
  
  /**
   * Save recently used to localStorage
   */
  _saveRecentlyUsed() {
    localStorage.setItem('voicePicker_recentlyUsed', JSON.stringify(this.state.recentlyUsed));
  }
  
  /**
   * Load recently used from localStorage
   */
  _loadRecentlyUsed() {
    try {
      const stored = localStorage.getItem('voicePicker_recentlyUsed');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
  
  /**
   * Create DOM element with class
   */
  _createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    return element;
  }
  
  /**
   * Get current selected voice
   */
  getSelectedVoice() {
    return this.state.selectedVoice;
  }
  
  /**
   * Set selected voice programmatically
   */
  setSelectedVoice(voiceNameOrId) {
    const voice = this.state.voices.find(v => 
      v.id === voiceNameOrId || v.name === voiceNameOrId
    );
    
    if (voice) {
      this._handleVoiceSelect(voice);
    }
  }
  
  /**
   * Refresh voice list
   */
  async refresh() {
    this.state.isLoading = true;
    this._render();
    await this._loadVoices();
    this._render();
  }
  
  /**
   * Destroy component and cleanup
   */
  destroy() {
    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this._handleKeyboard);
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Clear references
    this.elements = {};
    this.state = {};
  }
}

/**
 * Default CSS styles (inject into page)
 */
const defaultStyles = `
.voice-picker {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  position: relative;
  width: 100%;
  max-width: 400px;
}

.voice-picker__wrapper {
  position: relative;
}

.voice-picker__trigger {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.voice-picker__trigger:hover {
  border-color: #999;
}

.voice-picker__trigger:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.voice-picker__trigger-icon {
  transition: transform 0.2s;
}

.voice-picker__trigger[aria-expanded="true"] .voice-picker__trigger-icon {
  transform: rotate(180deg);
}

.voice-picker__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.voice-picker__search {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.voice-picker__search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.voice-picker__search-input:focus {
  outline: none;
  border-color: #0066ff;
}

.voice-picker__filters {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.voice-picker__filter {
  flex: 1;
}

.voice-picker__filter-select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

.voice-picker__list-wrapper {
  max-height: 300px;
  overflow-y: auto;
}

.voice-picker__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.voice-picker__group-header {
  padding: 6px 12px;
  background: #f5f5f5;
  font-weight: 600;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
}

.voice-picker__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.voice-picker__item:hover,
.voice-picker__item--focused {
  background: #f5f5f5;
}

.voice-picker__item--selected {
  background: #e6f2ff;
}

.voice-picker__item[aria-selected="true"] {
  font-weight: 600;
}

.voice-picker__item-content {
  flex: 1;
  min-width: 0;
}

.voice-picker__item-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.voice-picker__item-metadata {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 8px;
}

.voice-picker__item-quality {
  background: #0066ff;
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  text-transform: uppercase;
}

.voice-picker__item-actions {
  display: flex;
  gap: 4px;
}

.voice-picker__item-preview,
.voice-picker__item-favorite {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.voice-picker__item-preview:hover,
.voice-picker__item-favorite:hover {
  background: #f5f5f5;
  border-color: #999;
}

.voice-picker__item-favorite--active {
  color: #ffa500;
}

.voice-picker__loading,
.voice-picker__no-results {
  padding: 24px;
  text-align: center;
  color: #666;
}

/* Compact mode */
.voice-picker--compact .voice-picker__trigger {
  padding: 6px 10px;
  font-size: 13px;
}

.voice-picker--compact .voice-picker__item {
  padding: 6px 10px;
}

.voice-picker--compact .voice-picker__item-metadata {
  display: none;
}

/* Dark theme */
.voice-picker[data-theme="dark"] .voice-picker__trigger,
.voice-picker[data-theme="dark"] .voice-picker__dropdown,
.voice-picker[data-theme="dark"] .voice-picker__filter-select {
  background: #1a1a1a;
  color: #e0e0e0;
  border-color: #333;
}

.voice-picker[data-theme="dark"] .voice-picker__search-input {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

.voice-picker[data-theme="dark"] .voice-picker__item:hover,
.voice-picker[data-theme="dark"] .voice-picker__item--focused {
  background: #2a2a2a;
}

.voice-picker[data-theme="dark"] .voice-picker__item--selected {
  background: #1a3a5a;
}

.voice-picker[data-theme="dark"] .voice-picker__group-header {
  background: #2a2a2a;
  color: #999;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .voice-picker__trigger,
  .voice-picker__dropdown {
    border-width: 2px;
  }
  
  .voice-picker__trigger:focus {
    outline: 2px solid;
    outline-offset: 2px;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .voice-picker__dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px 12px 0 0;
    max-height: 70vh;
  }
  
  .voice-picker__list-wrapper {
    max-height: calc(70vh - 100px);
  }
}
`;

/**
 * Inject default styles if not already present
 */
function injectStyles() {
  if (!document.getElementById('voice-picker-styles')) {
    const style = document.createElement('style');
    style.id = 'voice-picker-styles';
    style.textContent = defaultStyles;
    document.head.appendChild(style);
  }
}

// Auto-inject styles
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoicePicker;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return VoicePicker; });
} else {
  window.VoicePicker = VoicePicker;
}