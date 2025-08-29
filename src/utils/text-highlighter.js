/**
 * Text Highlighting Utility
 * Provides visual highlighting of text during speech synthesis
 */

class TextHighlighter {
  constructor() {
    this.highlightedElements = [];
    this.originalText = '';
    this.targetElement = null;
    this.highlightClass = 'tts-highlight-word';
    this.sentenceHighlightClass = 'tts-highlight-sentence';
    this.isHighlighting = false;
    
    // Inject highlighting styles
    this.injectStyles();
  }

  /**
   * Inject CSS styles for text highlighting
   */
  injectStyles() {
    // Check if styles already injected
    if (document.getElementById('tts-highlighter-styles')) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'tts-highlighter-styles';
    styleElement.textContent = `
      .${this.highlightClass} {
        background-color: #ffeb3b !important;
        color: #000 !important;
        transition: background-color 0.2s ease !important;
        border-radius: 2px !important;
        padding: 1px 2px !important;
        font-weight: 500 !important;
      }
      
      .${this.sentenceHighlightClass} {
        background-color: rgba(255, 235, 59, 0.3) !important;
        border-left: 3px solid #ffeb3b !important;
        padding-left: 8px !important;
        transition: all 0.3s ease !important;
      }
      
      .tts-highlight-container {
        position: relative !important;
      }
      
      .tts-highlight-word.active {
        background-color: #ff9800 !important;
        color: #fff !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
      }
    `;

    // Insert into document head or body
    (document.head || document.body).appendChild(styleElement);
  }

  /**
   * Initialize highlighting for a text element
   * @param {Element} element - The element containing the text to highlight
   * @param {string} text - The text that will be spoken
   */
  initializeHighlighting(element, text) {
    this.cleanup(); // Clear any previous highlighting
    
    this.targetElement = element;
    this.originalText = text;
    this.isHighlighting = true;
    
    // Add container class for styling
    if (element) {
      element.classList.add('tts-highlight-container');
    }
    
    console.log('📝 Text highlighting initialized for:', text.substring(0, 50) + '...');
  }

  /**
   * Highlight word at specific character index
   * @param {number} charIndex - Character index in the text
   * @param {string} text - Full text being spoken
   */
  highlightWordAt(charIndex, text) {
    if (!this.isHighlighting || !this.targetElement) {
      return;
    }

    try {
      // Clear previous word highlights
      this.clearWordHighlights();
      
      // Find the word boundaries around the character index
      const wordBoundaries = this.findWordAt(charIndex, text);
      if (!wordBoundaries) {
        return;
      }

      // Create highlight span for the word
      this.highlightTextRange(wordBoundaries.start, wordBoundaries.end, this.highlightClass + ' active');
      
      console.log('🟡 Highlighting word:', wordBoundaries.word, 'at index', charIndex);
      
    } catch (error) {
      console.warn('Failed to highlight word:', error);
    }
  }

  /**
   * Highlight sentence at specific character index
   * @param {number} charIndex - Character index in the text
   * @param {string} text - Full text being spoken
   */
  highlightSentenceAt(charIndex, text) {
    if (!this.isHighlighting || !this.targetElement) {
      return;
    }

    try {
      // Find sentence boundaries
      const sentenceBoundaries = this.findSentenceAt(charIndex, text);
      if (!sentenceBoundaries) {
        return;
      }

      // Add sentence highlight class to element
      this.targetElement.classList.add(this.sentenceHighlightClass);
      
      console.log('🟨 Highlighting sentence at index', charIndex);
      
    } catch (error) {
      console.warn('Failed to highlight sentence:', error);
    }
  }

  /**
   * Find word boundaries at character index
   * @param {number} charIndex - Character index
   * @param {string} text - Full text
   * @returns {Object|null} Word boundaries {start, end, word}
   */
  findWordAt(charIndex, text) {
    if (charIndex < 0 || charIndex >= text.length) {
      return null;
    }

    // Find word start (go backward to find word boundary)
    let start = charIndex;
    while (start > 0 && /\w/.test(text[start - 1])) {
      start--;
    }

    // Find word end (go forward to find word boundary)
    let end = charIndex;
    while (end < text.length && /\w/.test(text[end])) {
      end++;
    }

    // Ensure we found a valid word
    if (start >= end || !/\w/.test(text.substring(start, end))) {
      return null;
    }

    return {
      start: start,
      end: end,
      word: text.substring(start, end)
    };
  }

  /**
   * Find sentence boundaries at character index
   * @param {number} charIndex - Character index
   * @param {string} text - Full text
   * @returns {Object|null} Sentence boundaries {start, end, sentence}
   */
  findSentenceAt(charIndex, text) {
    if (charIndex < 0 || charIndex >= text.length) {
      return null;
    }

    // Find sentence start (go backward to find sentence boundary)
    let start = charIndex;
    while (start > 0 && !/[.!?]/.test(text[start - 1])) {
      start--;
    }

    // Find sentence end (go forward to find sentence boundary)  
    let end = charIndex;
    while (end < text.length && !/[.!?]/.test(text[end])) {
      end++;
    }
    if (end < text.length) end++; // Include the punctuation

    return {
      start: start,
      end: end,
      sentence: text.substring(start, end).trim()
    };
  }

  /**
   * Highlight text range with specified class
   * @param {number} startIndex - Start character index
   * @param {number} endIndex - End character index
   * @param {string} className - CSS class name for highlighting
   */
  highlightTextRange(startIndex, endIndex, className) {
    if (!this.targetElement) return;

    try {
      // Create a temporary element to wrap the highlighted text
      const textContent = this.targetElement.textContent || this.targetElement.innerText;
      
      if (startIndex < 0 || endIndex > textContent.length || startIndex >= endIndex) {
        return;
      }

      // Split text into parts: before, highlighted, after
      const beforeText = textContent.substring(0, startIndex);
      const highlightText = textContent.substring(startIndex, endIndex);
      const afterText = textContent.substring(endIndex);

      // Create highlight span
      const highlightSpan = document.createElement('span');
      highlightSpan.className = className;
      highlightSpan.textContent = highlightText;

      // Clear element and rebuild with highlighted section
      this.targetElement.textContent = '';
      
      if (beforeText) {
        this.targetElement.appendChild(document.createTextNode(beforeText));
      }
      
      this.targetElement.appendChild(highlightSpan);
      this.highlightedElements.push(highlightSpan);
      
      if (afterText) {
        this.targetElement.appendChild(document.createTextNode(afterText));
      }

    } catch (error) {
      console.warn('Failed to highlight text range:', error);
    }
  }

  /**
   * Clear all word highlights (but keep sentence highlights)
   */
  clearWordHighlights() {
    // Remove individual word highlight spans
    this.highlightedElements.forEach(element => {
      if (element && element.parentNode && element.className.includes(this.highlightClass)) {
        const parent = element.parentNode;
        const textNode = document.createTextNode(element.textContent);
        parent.replaceChild(textNode, element);
        parent.normalize(); // Merge adjacent text nodes
      }
    });
    
    this.highlightedElements = this.highlightedElements.filter(
      element => element && !element.className.includes(this.highlightClass)
    );
  }

  /**
   * Clear all highlights and restore original text
   */
  cleanup() {
    // Remove all highlight spans
    this.highlightedElements.forEach(element => {
      if (element && element.parentNode) {
        const parent = element.parentNode;
        const textNode = document.createTextNode(element.textContent);
        parent.replaceChild(textNode, element);
        parent.normalize();
      }
    });
    
    // Clear highlight classes from target element
    if (this.targetElement) {
      this.targetElement.classList.remove('tts-highlight-container');
      this.targetElement.classList.remove(this.sentenceHighlightClass);
    }

    // Reset state
    this.highlightedElements = [];
    this.targetElement = null;
    this.originalText = '';
    this.isHighlighting = false;
    
    console.log('🧹 Text highlighting cleaned up');
  }

  /**
   * Check if highlighting is active
   * @returns {boolean} True if highlighting is active
   */
  isActive() {
    return this.isHighlighting && this.targetElement !== null;
  }

  /**
   * Update highlight settings
   * @param {Object} settings - Highlight settings
   */
  updateSettings(settings = {}) {
    if (settings.highlightClass) {
      this.highlightClass = settings.highlightClass;
    }
    if (settings.sentenceHighlightClass) {
      this.sentenceHighlightClass = settings.sentenceHighlightClass;
    }
    
    // Re-inject styles if settings changed
    if (settings.highlightClass || settings.sentenceHighlightClass) {
      const existingStyles = document.getElementById('tts-highlighter-styles');
      if (existingStyles) {
        existingStyles.remove();
      }
      this.injectStyles();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextHighlighter;
} else if (typeof window !== 'undefined') {
  window.TextHighlighter = TextHighlighter;
}