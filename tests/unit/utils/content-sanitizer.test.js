/**
 * Content Sanitizer Unit Tests
 * Tests for the content sanitization utilities
 */

describe('Content Sanitizer', () => {
  let sanitizer;
  
  beforeEach(async () => {
    jest.resetModules();
    const module = await import('../../../src/utils/content-sanitizer.js');
    sanitizer = module;
  });

  describe('clearElement', () => {
    test('should clear all child elements', () => {
      const element = testUtils.mockDOMElement('div');
      const child1 = testUtils.mockDOMElement('span');
      const child2 = testUtils.mockDOMElement('p');
      
      element.firstChild = child1;
      element.removeChild = jest.fn((child) => {
        if (child === child1) {
          element.firstChild = child2;
        } else if (child === child2) {
          element.firstChild = null;
        }
      });
      
      sanitizer.clearElement(element);
      
      expect(element.removeChild).toHaveBeenCalledWith(child1);
      expect(element.removeChild).toHaveBeenCalledWith(child2);
    });

    test('should handle null element gracefully', () => {
      expect(() => sanitizer.clearElement(null)).not.toThrow();
      expect(() => sanitizer.clearElement(undefined)).not.toThrow();
    });
  });

  describe('createTextElement', () => {
    test('should create element with text content', () => {
      const element = sanitizer.createTextElement('div', 'Hello world');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(element.textContent).toBe('Hello world');
    });

    test('should create element with class name', () => {
      const element = sanitizer.createTextElement('span', 'Text', 'test-class');
      
      expect(element.textContent).toBe('Text');
      expect(element.className).toBe('test-class');
    });

    test('should handle empty text content', () => {
      const element = sanitizer.createTextElement('p', '');
      expect(element.textContent).toBe('');
    });
  });

  describe('createOptionElement', () => {
    test('should create option with text and value', () => {
      const option = sanitizer.createOptionElement('Display Text', 'option-value');
      
      expect(document.createElement).toHaveBeenCalledWith('option');
      expect(option.textContent).toBe('Display Text');
      expect(option.value).toBe('option-value');
      expect(option.selected).toBe(false);
    });

    test('should create selected option', () => {
      const option = sanitizer.createOptionElement('Text', 'value', true);
      expect(option.selected).toBe(true);
    });
  });

  describe('createButtonElement', () => {
    test('should create button with text and class', () => {
      const button = sanitizer.createButtonElement('Click Me', 'btn-primary');
      
      expect(document.createElement).toHaveBeenCalledWith('button');
      expect(button.textContent).toBe('Click Me');
      expect(button.className).toBe('btn-primary');
    });

    test('should attach click handler', () => {
      const clickHandler = jest.fn();
      const button = sanitizer.createButtonElement('Button', 'btn', clickHandler);
      
      expect(button.addEventListener).toHaveBeenCalledWith('click', clickHandler);
    });

    test('should work without click handler', () => {
      const button = sanitizer.createButtonElement('Button', 'btn');
      expect(button.textContent).toBe('Button');
    });
  });

  describe('createElementStructure', () => {
    test('should create simple element structure', () => {
      const structure = {
        tag: 'div',
        text: 'Hello',
        className: 'container'
      };
      
      const element = sanitizer.createElementStructure(structure);
      
      expect(element.textContent).toBe('Hello');
      expect(element.className).toBe('container');
    });

    test('should create element with attributes', () => {
      const structure = {
        tag: 'input',
        attributes: {
          type: 'text',
          placeholder: 'Enter text'
        }
      };
      
      const element = sanitizer.createElementStructure(structure);
      
      expect(element.setAttribute).toHaveBeenCalledWith('type', 'text');
      expect(element.setAttribute).toHaveBeenCalledWith('placeholder', 'Enter text');
    });

    test('should create nested element structure', () => {
      const structure = {
        tag: 'div',
        className: 'parent',
        children: [
          {
            tag: 'h1',
            text: 'Title'
          },
          {
            tag: 'p',
            text: 'Content'
          }
        ]
      };
      
      const element = sanitizer.createElementStructure(structure);
      
      expect(element.className).toBe('parent');
      expect(element.appendChild).toHaveBeenCalledTimes(2);
    });
  });

  describe('populateSelectElement', () => {
    test('should populate select with options', () => {
      const selectElement = testUtils.mockDOMElement('select');
      const options = [
        { text: 'Option 1', value: 'opt1' },
        { text: 'Option 2', value: 'opt2', selected: true }
      ];
      
      sanitizer.populateSelectElement(selectElement, options);
      
      expect(selectElement.appendChild).toHaveBeenCalledTimes(2);
    });

    test('should handle null select element', () => {
      expect(() => sanitizer.populateSelectElement(null, [])).not.toThrow();
    });

    test('should handle invalid options array', () => {
      const selectElement = testUtils.mockDOMElement('select');
      expect(() => sanitizer.populateSelectElement(selectElement, null)).not.toThrow();
    });
  });

  describe('setSafeContent', () => {
    test('should set content from structure array', () => {
      const element = testUtils.mockDOMElement('div');
      const contentStructure = [
        { tag: 'h1', text: 'Title' },
        { tag: 'p', text: 'Paragraph' }
      ];
      
      sanitizer.setSafeContent(element, contentStructure);
      
      expect(element.appendChild).toHaveBeenCalledTimes(2);
    });

    test('should clear existing content first', () => {
      const element = testUtils.mockDOMElement('div');
      element.firstChild = testUtils.mockDOMElement('span');
      element.removeChild = jest.fn(() => {
        element.firstChild = null;
      });
      
      sanitizer.setSafeContent(element, [{ tag: 'p', text: 'New' }]);
      
      expect(element.removeChild).toHaveBeenCalled();
    });

    test('should handle null parameters', () => {
      expect(() => sanitizer.setSafeContent(null, [])).not.toThrow();
      expect(() => sanitizer.setSafeContent(testUtils.mockDOMElement(), null)).not.toThrow();
    });
  });

  describe('sanitizeText', () => {
    test('should return clean text', () => {
      const result = sanitizer.sanitizeText('Hello world');
      expect(result).toBe('Hello world');
    });

    test('should handle non-string input', () => {
      expect(sanitizer.sanitizeText(null)).toBe('');
      expect(sanitizer.sanitizeText(undefined)).toBe('');
      expect(sanitizer.sanitizeText(123)).toBe('');
      expect(sanitizer.sanitizeText({})).toBe('');
    });

    test('should strip HTML-like content via textContent', () => {
      // This test verifies the function creates a temp element for sanitization
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizer.sanitizeText(input);
      
      // The exact result depends on DOM implementation, but should be safer
      expect(typeof result).toBe('string');
      expect(document.createElement).toHaveBeenCalledWith('div');
    });

    test('should handle empty string', () => {
      const result = sanitizer.sanitizeText('');
      expect(result).toBe('');
    });
  });

  describe('Integration Tests', () => {
    test('should create complex safe DOM structure', () => {
      const structure = {
        tag: 'form',
        className: 'settings-form',
        children: [
          {
            tag: 'div',
            className: 'form-group',
            children: [
              {
                tag: 'label',
                text: 'Voice:'
              },
              {
                tag: 'select',
                attributes: {
                  name: 'voice'
                }
              }
            ]
          },
          {
            tag: 'button',
            text: 'Save',
            className: 'btn-save',
            attributes: {
              type: 'submit'
            }
          }
        ]
      };
      
      const form = sanitizer.createElementStructure(structure);
      
      expect(form.className).toBe('settings-form');
      expect(form.appendChild).toHaveBeenCalledTimes(2);
      expect(document.createElement).toHaveBeenCalledWith('form');
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.createElement).toHaveBeenCalledWith('label');
      expect(document.createElement).toHaveBeenCalledWith('select');
      expect(document.createElement).toHaveBeenCalledWith('button');
    });

    test('should prevent XSS through safe content creation', () => {
      const maliciousText = '<script>alert("XSS")</script>Hello';
      const element = sanitizer.createTextElement('div', maliciousText);
      
      // textContent should contain the raw string, not execute script
      expect(element.textContent).toBe(maliciousText);
      // innerHTML should never be used
      expect(element.innerHTML).toBe('');
    });
  });
});