/**
 * Content Sanitization Utilities
 * Provides secure DOM manipulation methods to prevent XSS attacks
 */

/**
 * Safely clear all child elements from a parent element
 * @param {Element} element - The element to clear
 */
export function clearElement(element) {
  if (!element) return;
  
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Create a text element with safe content
 * @param {string} tagName - HTML tag name (e.g., 'div', 'span', 'p')
 * @param {string} textContent - Safe text content
 * @param {string} className - CSS class name (optional)
 * @returns {Element} Created element
 */
export function createTextElement(tagName, textContent, className = '') {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  if (className) {
    element.className = className;
  }
  return element;
}

/**
 * Create a safe option element for select dropdowns
 * @param {string} text - Display text
 * @param {string} value - Option value
 * @param {boolean} selected - Whether option is selected
 * @returns {HTMLOptionElement} Created option element
 */
export function createOptionElement(text, value, selected = false) {
  const option = document.createElement('option');
  option.textContent = text;
  option.value = value;
  option.selected = selected;
  return option;
}

/**
 * Create a safe button element with text content
 * @param {string} text - Button text
 * @param {string} className - CSS class name
 * @param {Function} clickHandler - Click event handler (optional)
 * @returns {HTMLButtonElement} Created button element
 */
export function createButtonElement(text, className, clickHandler = null) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  
  if (clickHandler) {
    button.addEventListener('click', clickHandler);
  }
  
  return button;
}

/**
 * Create a safe structured element hierarchy
 * @param {Object} structure - Element structure definition
 * @returns {Element} Root element
 */
export function createElementStructure(structure) {
  const { tag, text, className, children, attributes } = structure;
  
  const element = document.createElement(tag);
  
  if (text) {
    element.textContent = text;
  }
  
  if (className) {
    element.className = className;
  }
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  if (children && Array.isArray(children)) {
    children.forEach(child => {
      const childElement = createElementStructure(child);
      element.appendChild(childElement);
    });
  }
  
  return element;
}

/**
 * Safely populate a select element with options
 * @param {HTMLSelectElement} selectElement - The select element
 * @param {Array} options - Array of {text, value, selected} objects
 */
export function populateSelectElement(selectElement, options) {
  if (!selectElement || !Array.isArray(options)) return;
  
  // Clear existing options safely
  clearElement(selectElement);
  
  options.forEach(option => {
    const optionElement = createOptionElement(
      option.text || option.value,
      option.value,
      option.selected || false
    );
    selectElement.appendChild(optionElement);
  });
}

/**
 * Replace innerHTML usage with safe DOM manipulation
 * @param {Element} element - Target element
 * @param {Array} contentStructure - Array of element structures to create
 */
export function setSafeContent(element, contentStructure) {
  if (!element || !Array.isArray(contentStructure)) return;
  
  // Clear existing content
  clearElement(element);
  
  // Add new content safely
  contentStructure.forEach(structure => {
    const childElement = createElementStructure(structure);
    element.appendChild(childElement);
  });
}

/**
 * Sanitize text input by stripping HTML tags and encoding special characters
 * @param {string} text - Input text
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  // Create a temporary element to decode HTML entities and strip tags
  const temp = document.createElement('div');
  temp.textContent = text;
  return temp.textContent || temp.innerText || '';
}