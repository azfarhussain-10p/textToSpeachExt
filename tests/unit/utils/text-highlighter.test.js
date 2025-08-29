/**
 * Text Highlighter Unit Tests
 * Tests for the text highlighting functionality during speech
 */

describe('Text Highlighter', () => {
  let highlighter;
  
  beforeEach(async () => {
    jest.resetModules();
    const module = await import('../../../src/utils/text-highlighter.js');
    const TextHighlighter = module.default || module.TextHighlighter;
    highlighter = new TextHighlighter();
  });

  afterEach(() => {
    if (highlighter) {
      highlighter.cleanup();
    }
    
    // Clean up any injected styles
    const styleElement = document.getElementById('tts-highlighter-styles');
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      expect(highlighter).toBeDefined();
      expect(highlighter.highlightClass).toBe('tts-highlight-word');
      expect(highlighter.sentenceHighlightClass).toBe('tts-highlight-sentence');
      expect(highlighter.isHighlighting).toBe(false);
    });

    test('should inject CSS styles', () => {
      const styleElement = document.getElementById('tts-highlighter-styles');
      expect(styleElement).toBeDefined();
      expect(styleElement.textContent).toContain('.tts-highlight-word');
      expect(styleElement.textContent).toContain('background-color: #ffeb3b');
    });

    test('should not inject styles twice', () => {
      // Create another highlighter instance
      const highlighter2 = new highlighter.constructor();
      
      const styleElements = document.querySelectorAll('#tts-highlighter-styles');
      expect(styleElements).toHaveLength(1);
    });
  });

  describe('Highlighting Initialization', () => {
    test('should initialize highlighting for element', () => {
      const element = testUtils.mockDOMElement('div', {
        textContent: 'Hello world test text'
      });
      
      highlighter.initializeHighlighting(element, 'Hello world test text');
      
      expect(highlighter.targetElement).toBe(element);
      expect(highlighter.originalText).toBe('Hello world test text');
      expect(highlighter.isHighlighting).toBe(true);
      expect(element.classList.add).toHaveBeenCalledWith('tts-highlight-container');
    });

    test('should cleanup previous highlighting before initialization', () => {
      const element1 = testUtils.mockDOMElement('div');
      const element2 = testUtils.mockDOMElement('div');
      
      highlighter.initializeHighlighting(element1, 'First text');
      expect(highlighter.targetElement).toBe(element1);
      
      highlighter.initializeHighlighting(element2, 'Second text');
      expect(highlighter.targetElement).toBe(element2);
      expect(highlighter.originalText).toBe('Second text');
    });
  });

  describe('Word Finding', () => {
    test('should find word at character index', () => {
      const text = 'Hello world testing';
      
      const result = highlighter.findWordAt(6, text); // 'w' in 'world'
      expect(result).toEqual({
        start: 6,
        end: 11,
        word: 'world'
      });
    });

    test('should find word at beginning of text', () => {
      const text = 'Hello world';
      
      const result = highlighter.findWordAt(2, text); // 'l' in 'Hello'
      expect(result).toEqual({
        start: 0,
        end: 5,
        word: 'Hello'
      });
    });

    test('should find word at end of text', () => {
      const text = 'Hello world';
      
      const result = highlighter.findWordAt(8, text); // 'r' in 'world'
      expect(result).toEqual({
        start: 6,
        end: 11,
        word: 'world'
      });
    });

    test('should return null for invalid indices', () => {
      const text = 'Hello world';
      
      expect(highlighter.findWordAt(-1, text)).toBeNull();
      expect(highlighter.findWordAt(100, text)).toBeNull();
    });

    test('should return null when not on a word character', () => {
      const text = 'Hello, world!';
      
      const result = highlighter.findWordAt(5, text); // ',' character
      expect(result).toBeNull();
    });
  });

  describe('Sentence Finding', () => {
    test('should find sentence at character index', () => {
      const text = 'Hello world. This is a test.';
      
      const result = highlighter.findSentenceAt(15, text); // 'T' in 'This'
      expect(result.start).toBe(13); // After '. '
      expect(result.end).toBe(29); // Including the '.'
      expect(result.sentence).toBe('This is a test.');
    });

    test('should find first sentence', () => {
      const text = 'Hello world. This is a test.';
      
      const result = highlighter.findSentenceAt(5, text); // 'w' in 'world'
      expect(result.start).toBe(0);
      expect(result.end).toBe(12);
      expect(result.sentence).toBe('Hello world.');
    });

    test('should handle text without sentence punctuation', () => {
      const text = 'Hello world';
      
      const result = highlighter.findSentenceAt(5, text);
      expect(result.start).toBe(0);
      expect(result.end).toBe(11);
      expect(result.sentence).toBe('Hello world');
    });
  });

  describe('Word Highlighting', () => {
    test('should highlight word at character index', () => {
      const element = testUtils.mockDOMElement('div', {
        textContent: 'Hello world test'
      });
      
      highlighter.initializeHighlighting(element, 'Hello world test');
      highlighter.highlightWordAt(6, 'Hello world test'); // 'w' in 'world'
      
      expect(document.createElement).toHaveBeenCalledWith('span');
      expect(element.appendChild).toHaveBeenCalled();
    });

    test('should handle invalid highlight positions gracefully', () => {
      const element = testUtils.mockDOMElement('div', {
        textContent: 'Hello world'
      });
      
      highlighter.initializeHighlighting(element, 'Hello world');
      
      // Should not throw errors
      expect(() => {
        highlighter.highlightWordAt(-1, 'Hello world');
        highlighter.highlightWordAt(100, 'Hello world');
      }).not.toThrow();
    });

    test('should clear previous word highlights', () => {
      const element = testUtils.mockDOMElement('div', {
        textContent: 'Hello world test'
      });
      
      highlighter.initializeHighlighting(element, 'Hello world test');
      highlighter.highlightWordAt(0, 'Hello world test'); // 'Hello'
      highlighter.highlightWordAt(6, 'Hello world test'); // 'world'
      
      // Should have cleared and re-highlighted
      expect(element.appendChild).toHaveBeenCalledTimes(4); // 2 highlights * 2 calls each
    });
  });

  describe('Sentence Highlighting', () => {
    test('should highlight sentence at character index', () => {
      const element = testUtils.mockDOMElement('div');
      
      highlighter.initializeHighlighting(element, 'Hello world. This is a test.');
      highlighter.highlightSentenceAt(15, 'Hello world. This is a test.');
      
      expect(element.classList.add).toHaveBeenCalledWith('tts-highlight-sentence');
    });

    test('should not highlight if not initialized', () => {
      // Don't call initializeHighlighting
      expect(() => {
        highlighter.highlightSentenceAt(5, 'Hello world');
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all highlights', () => {
      const element = testUtils.mockDOMElement('div', {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        }
      });
      
      highlighter.initializeHighlighting(element, 'Hello world');
      highlighter.cleanup();
      
      expect(element.classList.remove).toHaveBeenCalledWith('tts-highlight-container');
      expect(element.classList.remove).toHaveBeenCalledWith('tts-highlight-sentence');
      expect(highlighter.isHighlighting).toBe(false);
      expect(highlighter.targetElement).toBeNull();
    });

    test('should handle cleanup when not initialized', () => {
      expect(() => {
        highlighter.cleanup();
      }).not.toThrow();
    });
  });

  describe('Settings Update', () => {
    test('should update highlight classes', () => {
      const newSettings = {
        highlightClass: 'custom-highlight',
        sentenceHighlightClass: 'custom-sentence'
      };
      
      highlighter.updateSettings(newSettings);
      
      expect(highlighter.highlightClass).toBe('custom-highlight');
      expect(highlighter.sentenceHighlightClass).toBe('custom-sentence');
    });

    test('should re-inject styles when settings change', () => {
      // Remove existing styles
      const existingStyles = document.getElementById('tts-highlighter-styles');
      if (existingStyles) {
        existingStyles.remove();
      }
      
      highlighter.updateSettings({
        highlightClass: 'new-highlight-class'
      });
      
      const newStyles = document.getElementById('tts-highlighter-styles');
      expect(newStyles).toBeDefined();
      expect(newStyles.textContent).toContain('.new-highlight-class');
    });
  });

  describe('State Management', () => {
    test('should track active highlighting state', () => {
      expect(highlighter.isActive()).toBe(false);
      
      const element = testUtils.mockDOMElement('div');
      highlighter.initializeHighlighting(element, 'Hello world');
      
      expect(highlighter.isActive()).toBe(true);
      
      highlighter.cleanup();
      
      expect(highlighter.isActive()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle DOM manipulation errors gracefully', () => {
      const element = testUtils.mockDOMElement('div', {
        textContent: 'Hello world',
        appendChild: jest.fn().mockImplementation(() => {
          throw new Error('DOM error');
        })
      });
      
      highlighter.initializeHighlighting(element, 'Hello world');
      
      // Should not throw despite DOM error
      expect(() => {
        highlighter.highlightWordAt(0, 'Hello world');
      }).not.toThrow();
    });

    test('should handle invalid text content gracefully', () => {
      const element = testUtils.mockDOMElement('div', {
        textContent: null
      });
      
      highlighter.initializeHighlighting(element, '');
      
      expect(() => {
        highlighter.highlightWordAt(0, 'Hello world');
      }).not.toThrow();
    });
  });
});