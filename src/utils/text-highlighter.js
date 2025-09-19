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
      /* TTS Text Highlighting Styles */
      .${this.highlightClass} {
        background-color: #ffeb3b !important;
        color: #000 !important;
        transition: background-color 0.2s ease !important;
        border-radius: 2px !important;
        padding: 1px 2px !important;
        font-weight: 500 !important;
        display: inline !important;
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
      
      .tts-highlight-word.active,
      .${this.highlightClass}.active {
        background-color: #ff9800 !important;
        color: #fff !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
        display: inline !important;
        font-weight: 600 !important;
      }
      
      /* Ensure highlighting works in iframe context */
      iframe .${this.highlightClass} {
        background-color: #ff9800 !important;
        color: #fff !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
        font-weight: 500 !important;
        display: inline !important;
      }
    `;

    // Insert into document head or body
    const target = document.head || document.body;
    target.appendChild(styleElement);

    console.warn('🎨 TTS highlighter styles injected into:', target.tagName);
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

    console.warn('📝 Text highlighting initialized for:', text.substring(0, 50) + '...');
  }

  /**
   * Highlight word at specific character index
   * @param {number} charIndex - Character index in the text
   * @param {string} text - Full text being spoken
   */
  highlightWordAt(charIndex, text) {
    console.warn('🟡 highlightWordAt called with:', { charIndex, textLength: text?.length, isHighlighting: this.isHighlighting, hasTargetElement: !!this.targetElement });

    if (!this.isHighlighting) {
      console.warn('🟡 Highlighting not active - isHighlighting:', this.isHighlighting);
      return;
    }

    if (!this.targetElement) {
      console.warn('🟡 No target element for highlighting - targetElement:', this.targetElement);
      return;
    }

    try {
      // Clear previous word highlights
      this.clearWordHighlights();

      // Find the word boundaries around the character index
      console.warn('🟡 Finding word at charIndex:', charIndex, 'in text:', text?.substring(0, 100));
      const wordBoundaries = this.findWordAt(charIndex, text);
      console.warn('🟡 Word boundaries found:', wordBoundaries);

      if (!wordBoundaries) {
        console.warn('🟡 No word boundaries found for charIndex:', charIndex);
        return;
      }

      console.warn('🟡 About to highlight text range:', wordBoundaries.start, 'to', wordBoundaries.end);

      // Create highlight span for the word
      this.highlightTextRange(wordBoundaries.start, wordBoundaries.end, this.highlightClass + ' active');

      console.warn('🟡 Highlighting word completed:', wordBoundaries.word, 'at index', charIndex);

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

      console.warn('🟨 Highlighting sentence at index', charIndex);

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
    console.warn('🟡 findWordAt called with charIndex:', charIndex, 'text length:', text?.length);

    if (charIndex < 0 || charIndex >= text.length) {
      console.warn('🟡 charIndex out of bounds:', charIndex, 'text length:', text.length);
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

    const wordText = text.substring(start, end);
    console.warn('🟡 Word boundaries calculated:', { start, end, word: wordText, charAtIndex: text[charIndex] });

    // Ensure we found a valid word
    if (start >= end || !/\w/.test(wordText)) {
      console.warn('🟡 Invalid word found:', { start, end, word: wordText, hasWordChar: /\w/.test(wordText) });
      return null;
    }

    const result = {
      start: start,
      end: end,
      word: wordText
    };

    console.warn('🟡 findWordAt returning:', result);
    return result;
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
    if (end < text.length) {end++;} // Include the punctuation

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
    if (!this.targetElement) {
      console.warn('No target element for highlighting');
      return;
    }

    try {
      // Get current text content (handle both plain text and existing highlights)
      const textContent = this.getCleanTextContent();

      if (!textContent || startIndex < 0 || endIndex > textContent.length || startIndex >= endIndex) {
        console.warn('Invalid highlight range:', { startIndex, endIndex, textLength: textContent?.length });
        return;
      }

      // Clear any existing word highlights first
      this.clearWordHighlights();

      // Split text into parts: before, highlighted, after
      const beforeText = textContent.substring(0, startIndex);
      const highlightText = textContent.substring(startIndex, endIndex);
      const afterText = textContent.substring(endIndex);

      console.warn('🟡 Highlighting text range:', {
        startIndex,
        endIndex,
        word: highlightText,
        beforeLength: beforeText.length,
        afterLength: afterText.length
      });

      // Create highlight span with inline styles as fallback
      const highlightSpan = document.createElement('span');
      highlightSpan.className = className;
      highlightSpan.textContent = highlightText;
      highlightSpan.setAttribute('data-tts-highlight', 'word');

      // Apply inline styles as fallback to ensure visibility
      highlightSpan.style.backgroundColor = '#ff9800';
      highlightSpan.style.color = '#fff';
      highlightSpan.style.padding = '1px 2px';
      highlightSpan.style.borderRadius = '2px';
      highlightSpan.style.fontWeight = '500';
      highlightSpan.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
      highlightSpan.style.transition = 'all 0.2s ease';

      // Rebuild element content with highlighted section
      this.targetElement.textContent = '';

      if (beforeText) {
        this.targetElement.appendChild(document.createTextNode(beforeText));
      }

      this.targetElement.appendChild(highlightSpan);
      this.highlightedElements.push(highlightSpan);

      if (afterText) {
        this.targetElement.appendChild(document.createTextNode(afterText));
      }

      console.warn('🟡 Highlight span created:', highlightSpan);
      console.warn('🟡 Target element after highlight:', this.targetElement);
      console.warn('🟡 Highlighted elements count:', this.highlightedElements.length);

      // Scroll highlighted word into view if needed
      this.scrollIntoViewIfNeeded(highlightSpan);

    } catch (error) {
      console.warn('Failed to highlight text range:', error);
    }
  }

  /**
   * Get clean text content without highlight spans
   * @returns {string} Clean text content
   */
  getCleanTextContent() {
    if (!this.targetElement) {return '';}

    // If we have the original text, use it
    if (this.originalText) {
      return this.originalText;
    }

    // Otherwise extract text from current element
    return this.targetElement.textContent || this.targetElement.innerText || '';
  }

  /**
   * Scroll highlighted element into view if necessary
   * @param {Element} element - Element to scroll into view
   */
  scrollIntoViewIfNeeded(element) {
    try {
      if (element && element.scrollIntoViewIfNeeded) {
        element.scrollIntoViewIfNeeded(false);
      } else if (element && element.scrollIntoView) {
        // Use smooth scrolling if available
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    } catch (error) {
      console.warn('Failed to scroll highlight into view:', error);
    }
  }

  /**
   * Clear all word highlights (but keep sentence highlights)
   */
  clearWordHighlights() {
    try {
      // Remove individual word highlight spans
      this.highlightedElements.forEach((element, _index) => {
        if (element && element.parentNode && element.className.includes(this.highlightClass)) {
          const parent = element.parentNode;
          const textNode = document.createTextNode(element.textContent);
          parent.replaceChild(textNode, element);
          parent.normalize(); // Merge adjacent text nodes
        }
      });

      // Filter out cleared elements
      this.highlightedElements = this.highlightedElements.filter(
        element => element && element.parentNode && !element.className.includes(this.highlightClass)
      );

      console.warn('🧹 Cleared word highlights, remaining elements:', this.highlightedElements.length);
    } catch (error) {
      console.warn('Failed to clear word highlights:', error);
      // Reset the array if there's an error
      this.highlightedElements = [];
    }
  }

  /**
   * Clear all highlights and restore original text
   */
  cleanup() {
    try {
      console.warn('🧹 Starting text highlighting cleanup');

      // Remove all highlight spans
      this.highlightedElements.forEach((element, _index) => {
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

        // Restore original text if available
        if (this.originalText && this.targetElement.textContent !== this.originalText) {
          this.targetElement.textContent = this.originalText;
        }
      }

      // Reset state
      this.highlightedElements = [];
      this.targetElement = null;
      this.originalText = '';
      this.isHighlighting = false;

      console.warn('✅ Text highlighting cleaned up successfully');
    } catch (error) {
      console.warn('Failed to cleanup text highlighting:', error);
      // Force reset state even if cleanup failed
      this.highlightedElements = [];
      this.targetElement = null;
      this.originalText = '';
      this.isHighlighting = false;
    }
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