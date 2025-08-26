/**
 * selection-handler.js - Robust Text Selection Handler for Browser Extensions
 * 
 * Handles text selections reliably across browsers, including getting selected text,
 * positions for overlays, and event listening. Supports modern browsers (Chrome, Firefox, Edge)
 * with fallbacks for inputs/textareas. Use in content scripts.
 * 
 * Usage:
 * - Initialize: const handler = new SelectionHandler(callbackFunction);
 * - Callback receives { text, position: { x, y }, range }
 * - Destroy: handler.destroy() to remove listeners
 */

// Polyfill for older browsers if needed (e.g., IE)
if (!window.getSelection) {
  window.getSelection = () => document.selection ? document.selection.createRange().text : '';
}

class SelectionHandler {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = {
      minLength: 1, // Minimum selected characters to trigger
      debounceTime: 100, // Debounce selectionchange events
      ...options
    };
    this.debounceTimer = null;
    this.lastSelection = null;

    // Bind methods
    this.handleSelection = this.handleSelection.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    // Add listeners
    document.addEventListener('selectionchange', this.handleSelection);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Gets the selected text, handling cross-browser and input/textarea cases.
   * @returns {string} Trimmed selected text
   */
  getSelectedText() {
    let text = '';
    const activeEl = document.activeElement;
    const tagName = activeEl ? activeEl.tagName.toLowerCase() : '';

    if (
      (tagName === 'textarea' || (tagName === 'input' && /^(text|search|password|tel|url)$/i.test(activeEl.type))) &&
      typeof activeEl.selectionStart === 'number'
    ) {
      text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        text = sel.toString();
      }
    } else if (document.selection && document.selection.type !== 'Control') {
      text = document.selection.createRange().text;
    }

    return text.trim();
  }

  /**
   * Gets the position for overlays (bottom-right of selection or cursor).
   * @param {Event} event - Optional mouse event for position
   * @returns {{x: number, y: number}} Scroll-adjusted coordinates
   */
  getSelectionPosition(event) {
    let x = 0, y = 0;
    const sel = window.getSelection();

    if (event) {
      x = event.pageX;
      y = event.pageY;
    } else if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0).cloneRange();
      range.collapse(false); // Collapse to end
      const rect = range.getBoundingClientRect();
      x = rect.left + window.pageXOffset;
      y = rect.bottom + window.pageYOffset;
    }

    return { x, y };
  }

  /**
   * Gets the selection range for advanced manipulation.
   * @returns {Range|null} First range or null
   */
  getSelectionRange() {
    const sel = window.getSelection();
    return sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
  }

  /**
   * Handles selectionchange event with debounce.
   */
  handleSelection() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.processSelection();
    }, this.options.debounceTime);
  }

  /**
   * Handles mouseup event for immediate detection.
   * @param {MouseEvent} event
   */
  handleMouseUp(event) {
    this.processSelection(event);
  }

  /**
   * Processes the current selection and triggers callback if valid.
   * @param {MouseEvent} [event] - Optional for position
   */
  processSelection(event) {
    const text = this.getSelectedText();
    if (text.length >= this.options.minLength && text !== this.lastSelection) {
      const position = this.getSelectionPosition(event);
      const range = this.getSelectionRange();
      this.callback({ text, position, range });
      this.lastSelection = text;
    } else if (text.length === 0) {
      this.lastSelection = null;
    }
  }

  /**
   * Clears the current selection.
   */
  clearSelection() {
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    else if (document.selection) document.selection.empty();
    this.lastSelection = null;
  }

  /**
   * Destroys the handler, removing listeners.
   */
  destroy() {
    document.removeEventListener('selectionchange', this.handleSelection);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}

// Export for use in extensions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SelectionHandler;
} else {
  window.SelectionHandler = SelectionHandler;
}

// Example usage:
// const handler = new SelectionHandler((data) => console.log('Selected:', data.text));