/**
 * response-formatter.js - Comprehensive Response Formatter for User-Friendly AI Explanations
 * 
 * Transforms raw AI outputs into clear, structured, and accessible formats using markdown,
 * summarization, and personalization. Designed for browser and Node.js environments.
 * 
 * Usage:
 * - Initialize: const formatter = new ResponseFormatter({ tone: 'friendly', maxLength: 500 });
 * - Format: await formatter.format({ content: 'Raw AI output', context: {...} });
 * - Summarize: await formatter.summarize({ content: 'Long text', maxLength: 100 });
 * - Table: await formatter.createTable({ data: [...], headers: [...] });
 * 
 * Supports local processing and optional API integration for advanced formatting.
 */

class ResponseFormatter {
  constructor(options = {}) {
    this.options = {
      tone: 'neutral', // 'friendly', 'professional', 'technical'
      maxLength: 1000, // Max characters for formatted output
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
      apiUrl: 'https://api.example.com/v1/format', // Placeholder for external formatting API
      apiKey: options.apiKey || null,
      onError: (err) => console.error('ResponseFormatter Error:', err),
      ...options
    };

    // Tone-specific templates
    this.toneTemplates = {
      friendly: {
        intro: 'Hey there! Here’s what I found for you:',
        bullet: '- 😊 ',
        closing: 'Hope that helps! Let me know if you need more.',
        jargonLevel: 0.3 // Less technical terms
      },
      professional: {
        intro: 'Here is the information you requested:',
        bullet: '- ',
        closing: 'Please let me know if you require further details.',
        jargonLevel: 0.7
      },
      technical: {
        intro: 'Analysis Results:',
        bullet: '- ',
        closing: 'Refer to the documentation for additional context.',
        jargonLevel: 1.0
      }
    };

    // Common stop words for summarization
    this.stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'and', 'or']);
  }

  /**
   * Formats raw AI content into user-friendly output.
   * @param {Object} params - { content, context: { userLevel: 'beginner'|'expert', language: 'en' }, includeSummary: boolean, includeTable: boolean }
   * @returns {Promise<string>} Formatted markdown string
   */
  async format(params) {
    const { content, context = {}, includeSummary = false, includeTable = false } = params;
    const { userLevel = 'beginner', language = 'en' } = context;
    let output = content;

    // Simplify based on user level
    output = this._simplifyText(output, userLevel);

    // Apply tone
    const tone = this.toneTemplates[this.options.tone] || this.toneTemplates.neutral;
    output = this._applyTone(output, tone);

    // Summarize if requested
    if (includeSummary) {
      output = await this.summarize({ content: output, maxLength: this.options.maxLength / 2 });
    }

    // Create table if requested
    if (includeTable && Array.isArray(context.data)) {
      const table = this.createTable({ data: context.data, headers: context.headers });
      output += `\n\n${table}`;
    }

    // Ensure length constraint
    output = output.slice(0, this.options.maxLength);

    // Optional API-based formatting
    if (this.options.apiKey && this.options.apiUrl) {
      output = await this._fetchFormattedOutput(output, language);
    }

    return output;
  }

  /**
   * Summarizes content to a specified length.
   * @param {Object} params - { content, maxLength }
   * @returns {Promise<string>} Summarized text
   */
  async summarize(params) {
    const { content, maxLength = this.options.maxLength / 2 } = params;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const wordScores = {};

    // Basic word frequency scoring
    const words = content.toLowerCase().split(/\W+/).filter(w => w && !this.stopWords.has(w));
    words.forEach(word => {
      wordScores[word] = (wordScores[word] || 0) + 1;
    });

    // Rank sentences by word importance
    const rankedSentences = sentences.map(sentence => {
      const score = sentence.toLowerCase().split(/\W+/).reduce((acc, word) => acc + (wordScores[word] || 0), 0);
      return { sentence: sentence.trim(), score };
    }).sort((a, b) => b.score - a.score);

    // Select top sentences within maxLength
    let summary = '';
    let currentLength = 0;
    for (const { sentence } of rankedSentences) {
      if (currentLength + sentence.length <= maxLength) {
        summary += `${sentence}. `;
        currentLength += sentence.length + 2;
      } else {
        break;
      }
    }

    return summary.trim();
  }

  /**
   * Creates a markdown table from data.
   * @param {Object} params - { data: Array<Object>, headers: Array<string> }
   * @returns {string} Markdown table
   */
  createTable(params) {
    const { data, headers } = params;
    if (!data || !headers || !Array.isArray(data) || !Array.isArray(headers)) return '';

    // Build header row
    let table = `| ${headers.join(' | ')} |\n`;
    table += `| ${headers.map(() => '---').join(' | ')} |\n`;

    // Build data rows
    data.forEach(row => {
      const rowValues = headers.map(header => row[header] || '');
      table += `| ${rowValues.join(' | ')} |\n`;
    });

    return table;
  }

  /**
   * Simplifies text based on user level.
   * @param {string} text
   * @param {string} userLevel - 'beginner'|'intermediate'|'expert'
   * @returns {string} Simplified text
   */
  _simplifyText(text, userLevel) {
    if (userLevel === 'beginner') {
      // Replace jargon with simpler terms
      const jargonMap = {
        'algorithm': 'method',
        'leverage': 'use',
        'optimize': 'improve'
      };
      let simplified = text;
      Object.entries(jargonMap).forEach(([jargon, simple]) => {
        simplified = simplified.replace(new RegExp(`\\b${jargon}\\b`, 'gi'), simple);
      });
      return simplified;
    }
    return text;
  }

  /**
   * Applies tone-specific formatting.
   * @param {string} text
   * @param {Object} tone - Tone template
   * @returns {string} Formatted markdown
   */
  _applyTone(text, tone) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const bulletPoints = sentences.map(s => `${tone.bullet}${s.trim()}.`);
    return `${tone.intro}\n\n${bulletPoints.join('\n')}\n\n${tone.closing}`;
  }

  /**
   * Fetches formatted output from an external API (placeholder).
   * @param {string} text
   * @param {string} language
   * @returns {Promise<string>} Formatted text
   */
  async _fetchFormattedOutput(text, language) {
    const body = { text, language };
    try {
      const response = await this._fetchWithRetry('/format', body);
      return response.formatted || text;
    } catch (error) {
      this.options.onError(error);
      return text;
    }
  }

  /**
   * Internal method for HTTP requests with retries and timeout.
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>} API response
   */
  async _fetchWithRetry(endpoint, body) {
    let attempts = 0;
    while (attempts < this.options.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

        const response = await fetch(`${this.options.apiUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.options.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        return await response.json();
      } catch (error) {
        attempts++;
        if (attempts >= this.options.maxRetries || error.name === 'AbortError') {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay * Math.pow(2, attempts)));
      }
    }
  }
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseFormatter;
} else {
  window.ResponseFormatter = ResponseFormatter;
}

// Example usage:
// const formatter = new ResponseFormatter({ tone: 'friendly' });
// formatter.format({ content: 'This algorithm leverages optimization techniques.', context: { userLevel: 'beginner' } })
//   .then(result => console.log(result))
//   .catch(err => console.error(err));