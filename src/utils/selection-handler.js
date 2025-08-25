/**
 * Selection Handler Utility for Intelligent TTS Extension
 * Manages text selection, processing, and validation
 */

export class SelectionHandler {
    constructor() {
        this.currentSelection = null;
        this.lastSelection = null;
        this.selectionHistory = [];
        this.maxHistoryLength = 10;
        this.settings = {
            maxTextLength: 5000,
            minTextLength: 1,
            autoCleanText: true,
            preserveFormatting: false
        };
    }

    /**
     * Get current text selection from the page
     */
    getCurrentSelection() {
        const selection = window.getSelection();
        
        if (selection.rangeCount === 0) {
            return null;
        }

        const selectedText = selection.toString().trim();
        
        if (!selectedText || selectedText.length < this.settings.minTextLength) {
            return null;
        }

        const range = selection.getRangeAt(0);
        const selectionData = {
            text: selectedText,
            originalText: selectedText,
            range: range,
            boundingRect: range.getBoundingClientRect(),
            element: range.commonAncestorContainer,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            timestamp: Date.now()
        };

        // Process and clean the text if needed
        if (this.settings.autoCleanText) {
            selectionData.text = this.cleanText(selectedText);
        }

        // Validate text length
        if (selectionData.text.length > this.settings.maxTextLength) {
            selectionData.text = this.truncateText(selectionData.text, this.settings.maxTextLength);
            selectionData.wasTruncated = true;
        }

        // Store selection data
        this.currentSelection = selectionData;
        this.addToHistory(selectionData);

        return selectionData;
    }

    /**
     * Get selection position for UI positioning
     */
    getSelectionPosition() {
        if (!this.currentSelection) {
            return null;
        }

        const rect = this.currentSelection.boundingRect;
        
        return {
            x: rect.left + window.pageXOffset + (rect.width / 2),
            y: rect.top + window.pageYOffset,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + window.pageXOffset + (rect.width / 2),
            centerY: rect.top + window.pageYOffset + (rect.height / 2),
            bottom: rect.bottom + window.pageYOffset
        };
    }

    /**
     * Check if there's a valid text selection
     */
    hasSelection() {
        const selection = window.getSelection();
        return selection && 
               selection.rangeCount > 0 && 
               selection.toString().trim().length > 0;
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
        this.currentSelection = null;
    }

    /**
     * Restore a previous selection
     */
    restoreSelection(selectionData) {
        if (!selectionData || !selectionData.range) {
            return false;
        }

        try {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(selectionData.range);
            this.currentSelection = selectionData;
            return true;
        } catch (error) {
            console.error('Failed to restore selection:', error);
            return false;
        }
    }

    /**
     * Extract text from a specific element
     */
    extractTextFromElement(element, options = {}) {
        if (!element) return '';

        const {
            includeHidden = false,
            preserveLineBreaks = true,
            includeAltText = true
        } = options;

        let text = '';

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tagName = node.tagName.toLowerCase();
                        
                        // Skip script and style elements
                        if (tagName === 'script' || tagName === 'style') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        
                        // Handle hidden elements
                        if (!includeHidden) {
                            const style = window.getComputedStyle(node);
                            if (style.display === 'none' || style.visibility === 'hidden') {
                                return NodeFilter.FILTER_REJECT;
                            }
                        }
                        
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );

        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent;
                if (textContent.trim()) {
                    text += textContent;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                // Add line breaks for block elements
                if (preserveLineBreaks && this.isBlockElement(tagName)) {
                    text += '\n';
                }
                
                // Handle images with alt text
                if (includeAltText && tagName === 'img' && node.alt) {
                    text += `[Image: ${node.alt}] `;
                }
                
                // Handle links
                if (tagName === 'a' && node.href) {
                    text += ` (${node.href}) `;
                }
            }
        }

        return this.cleanText(text);
    }

    /**
     * Clean and normalize text
     */
    cleanText(text) {
        if (!text) return '';

        return text
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            // Remove excessive punctuation
            .replace(/[.]{3,}/g, '...')
            .replace(/[!]{2,}/g, '!')
            .replace(/[?]{2,}/g, '?')
            // Clean up quotes
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")
            // Remove zero-width characters
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            // Trim
            .trim();
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;

        // Try to truncate at sentence boundary
        const sentences = text.split(/[.!?]+/);
        let truncated = '';
        
        for (const sentence of sentences) {
            if ((truncated + sentence).length > maxLength - 3) {
                break;
            }
            truncated += sentence + '.';
        }

        if (truncated.length < maxLength / 2) {
            // If sentence-based truncation is too short, truncate at word boundary
            const words = text.split(' ');
            truncated = '';
            
            for (const word of words) {
                if ((truncated + word).length > maxLength - 3) {
                    break;
                }
                truncated += word + ' ';
            }
        }

        return truncated.trim() + '...';
    }

    /**
     * Detect language of selected text
     */
    detectLanguage(text) {
        if (!text) return 'en';

        // Simple language detection based on character sets
        const patterns = {
            ar: /[\u0600-\u06FF]/,      // Arabic
            he: /[\u0590-\u05FF]/,      // Hebrew
            zh: /[\u4E00-\u9FFF]/,      // Chinese
            ja: /[\u3040-\u309F\u30A0-\u30FF]/, // Japanese
            ko: /[\uAC00-\uD7AF]/,      // Korean
            ru: /[\u0400-\u04FF]/,      // Russian/Cyrillic
            hi: /[\u0900-\u097F]/,      // Hindi
            th: /[\u0E00-\u0E7F]/,      // Thai
            ur: /[\u0600-\u06FF]/       // Urdu (shares with Arabic)
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return lang;
            }
        }

        // Default to English for Latin-based text
        return 'en';
    }

    /**
     * Check if element is a block-level element
     */
    isBlockElement(tagName) {
        const blockElements = [
            'address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div',
            'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main',
            'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'table', 'tfoot',
            'ul', 'video'
        ];
        
        return blockElements.includes(tagName);
    }

    /**
     * Add selection to history
     */
    addToHistory(selectionData) {
        if (!selectionData) return;

        // Avoid duplicates
        const isDuplicate = this.selectionHistory.some(item => 
            item.text === selectionData.text &&
            Date.now() - item.timestamp < 5000 // Within 5 seconds
        );

        if (!isDuplicate) {
            this.selectionHistory.unshift({
                text: selectionData.text,
                timestamp: selectionData.timestamp,
                element: selectionData.element?.tagName || 'unknown'
            });

            // Limit history size
            if (this.selectionHistory.length > this.maxHistoryLength) {
                this.selectionHistory = this.selectionHistory.slice(0, this.maxHistoryLength);
            }
        }
    }

    /**
     * Get selection history
     */
    getHistory() {
        return [...this.selectionHistory];
    }

    /**
     * Clear selection history
     */
    clearHistory() {
        this.selectionHistory = [];
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * Validate if text is suitable for TTS
     */
    validateForTTS(text) {
        if (!text || typeof text !== 'string') {
            return { valid: false, reason: 'No text provided' };
        }

        const trimmedText = text.trim();

        if (trimmedText.length < this.settings.minTextLength) {
            return { valid: false, reason: 'Text too short' };
        }

        if (trimmedText.length > this.settings.maxTextLength) {
            return { valid: false, reason: 'Text too long' };
        }

        // Check for mostly non-readable content
        const readableChars = trimmedText.replace(/[^\w\s]/g, '').length;
        const readableRatio = readableChars / trimmedText.length;

        if (readableRatio < 0.3) {
            return { valid: false, reason: 'Text contains too many special characters' };
        }

        return { valid: true, text: trimmedText };
    }

    /**
     * Get context around selection
     */
    getSelectionContext(contextLength = 100) {
        if (!this.currentSelection || !this.currentSelection.range) {
            return null;
        }

        try {
            const range = this.currentSelection.range;
            const container = range.commonAncestorContainer;
            const fullText = container.textContent || '';
            
            const selectionStart = range.startOffset;
            const selectionEnd = range.endOffset;
            
            const beforeStart = Math.max(0, selectionStart - contextLength);
            const afterEnd = Math.min(fullText.length, selectionEnd + contextLength);
            
            return {
                before: fullText.substring(beforeStart, selectionStart),
                selected: fullText.substring(selectionStart, selectionEnd),
                after: fullText.substring(selectionEnd, afterEnd),
                fullContext: fullText.substring(beforeStart, afterEnd)
            };
        } catch (error) {
            console.error('Failed to get selection context:', error);
            return null;
        }
    }
}