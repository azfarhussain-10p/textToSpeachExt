// text-processor.js - Comprehensive Text Processing for TTS in Browser Extensions

/**
 * Sanitizes input text by removing HTML tags, scripts, and dangerous attributes.
 * Adapted from DOMParser-based sanitization examples.
 * @param {string} str - The input string, potentially containing HTML.
 * @return {string} - Cleaned plain text.
 */
function sanitizeText(str) {
  // Use DOMParser to create a temporary document
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  const body = doc.body || document.createElement('body');

  // Remove scripts
  const scripts = body.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Recursively remove dangerous attributes
  function cleanNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const attrs = node.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const { name, value } = attrs[i];
        if (name.startsWith('on') || (['src', 'href'].includes(name) && value.toLowerCase().includes('javascript:'))) {
          node.removeAttribute(name);
        }
      }
      node.childNodes.forEach(cleanNode);
    }
  }
  cleanNode(body);

  // Extract plain text
  return body.textContent.trim().replace(/\s+/g, ' ');
}

/**
 * Removes or escapes special characters that may affect TTS pronunciation.
 * @param {string} text - Input text.
 * @param {boolean} keepPunctuation - If true, preserves basic punctuation.
 * @return {string} - Cleaned text.
 */
function removeSpecialChars(text, keepPunctuation = true) {
  let regex = /[^\w\s]/gi;
  if (keepPunctuation) {
    regex = /[^\w\s.!?]/gi; // Keep periods, exclamations, questions
  }
  return text.replace(regex, '');
}

/**
 * Normalizes text for TTS: collapses whitespace, optional acronym expansion.
 * @param {string} text - Input text.
 * @return {string} - Normalized text.
 */
function normalizeText(text) {
  // Collapse multiple spaces
  text = text.replace(/\s+/g, ' ');
  // Example acronym expansion (customizable)
  const acronyms = { 'TTS': 'text to speech', 'JS': 'javascript' };
  for (const [key, value] of Object.entries(acronyms)) {
    text = text.replace(new RegExp(`\\b${key}\\b`, 'gi'), value);
  }
  return text.trim();
}

/**
 * Chunks text by sentences, preserving punctuation.
 * Adapted from Deepgram examples.
 * @param {string} text - Input text.
 * @return {string[]} - Array of sentence chunks.
 */
function chunkBySentence(text) {
  return text.split(/(?<=[.!?])\s+/).filter(chunk => chunk.trim());
}

/**
 * Chunks text by character count with overlap.
 * Inspired by LangChain splitters.
 * @param {string} text - Input text.
 * @param {number} chunkSize - Max characters per chunk.
 * @param {number} overlap - Overlap characters.
 * @return {string[]} - Array of chunks.
 */
function chunkByCharacters(text, chunkSize = 1024, overlap = 128) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end > text.length) end = text.length;
    // Adjust end to avoid mid-word if possible
    if (end < text.length) {
      while (end > start && text[end] !== ' ') end--;
      if (end === start) end = start + chunkSize; // Fallback
    }
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

/**
 * Main processing function: sanitizes, normalizes, and chunks text for TTS.
 * @param {string} input - Raw input text.
 * @param {Object} options - { chunkType: 'sentence'|'character', chunkSize, overlap, keepPunctuation }
 * @return {string[]} - Array of processed chunks ready for TTS.
 */
function processText(input, options = {}) {
  let text = sanitizeText(input);
  text = removeSpecialChars(text, options.keepPunctuation ?? true);
  text = normalizeText(text);
  
  const chunkType = options.chunkType ?? 'sentence';
  if (chunkType === 'sentence') {
    return chunkBySentence(text);
  } else if (chunkType === 'character') {
    return chunkByCharacters(text, options.chunkSize ?? 1024, options.overlap ?? 128);
  }
  return [text]; // Fallback single chunk
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeText, removeSpecialChars, normalizeText, chunkBySentence, chunkByCharacters, processText };
} else {
  window.TextProcessor = { sanitizeText, removeSpecialChars, normalizeText, chunkBySentence, chunkByCharacters, processText };
}