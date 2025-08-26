/**
 * content-analyzer.js - Comprehensive Context Analysis Client for Text Understanding
 * 
 * Provides a robust interface for analyzing text context, including sentiment analysis,
 * theme extraction, and explainable outputs. Designed for browser and Node.js environments.
 * 
 * Usage:
 * - Initialize: const analyzer = new ContentAnalyzer({ sentimentModel: 'basic', apiKey: 'optional-key' });
 * - Analyze Text: await analyzer.analyzeText({ text: 'I love this product!' });
 * - Extract Themes: await analyzer.extractThemes({ texts: ['text1', 'text2'] });
 * - Explain Output: await analyzer.explain({ text: 'Sample text', analysis: {...} });
 * 
 * Supports local sentiment analysis and optional API integration for advanced models.
 */

class ContentAnalyzer {
  constructor(options = {}) {
    this.options = {
      sentimentModel: 'basic', // 'basic' (local) or 'api' (external service)
      apiKey: options.apiKey || null,
      apiUrl: 'https://api.example.com/v1/sentiment', // Replace with actual API
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
      onError: (err) => console.error('ContentAnalyzer Error:', err),
      ...options
    };

    // Simple local sentiment dictionary for basic model
    this.sentimentDict = {
      positive: ['love', 'great', 'awesome', 'happy', 'excellent'],
      negative: ['hate', 'bad', 'terrible', 'sad', 'poor'],
      neutral: ['okay', 'fine', 'average']
    };

    // Common stop words for theme extraction
    this.stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'and', 'or']);
  }

  /**
   * Analyzes text for sentiment, themes, and context.
   * @param {Object} params - { text, analyzeSentiment: true, extractThemes: true }
   * @returns {Promise<Object>} Analysis result with sentiment, themes, and context
   */
  async analyzeText(params) {
    const { text, analyzeSentiment = true, extractThemes = true } = params;
    const result = { text, sentiment: null, themes: [], context: {} };

    if (analyzeSentiment) {
      result.sentiment = await this._getSentiment(text);
    }
    if (extractThemes) {
      result.themes = this._extractThemes([text]);
    }
    result.context = this._inferContext(text);

    return result;
  }

  /**
   * Extracts themes from multiple texts using n-grams and noun phrases.
   * @param {Object} params - { texts: string[], maxN: 3 }
   * @returns {Array} Array of extracted themes
   */
  _extractThemes(params) {
    const { texts, maxN = 3 } = params;
    const themes = new Set();

    texts.forEach(text => {
      const words = text.toLowerCase().split(/\W+/).filter(w => w && !this.stopWords.has(w));
      
      // Generate n-grams (1 to maxN)
      for (let n = 1; n <= maxN; n++) {
        for (let i = 0; i <= words.length - n; i++) {
          const ngram = words.slice(i, i + n).join(' ');
          if (ngram.length > 3) themes.add(ngram);
        }
      }

      // Simple noun phrase detection (basic heuristic)
      const sentences = text.split(/[.!?]+/);
      sentences.forEach(sentence => {
        const words = sentence.toLowerCase().split(/\W+/).filter(w => w);
        words.forEach((word, i) => {
          if (/^[a-z]+$/i.test(word) && i > 0 && !this.stopWords.has(words[i - 1])) {
            themes.add(`${words[i - 1]} ${word}`);
          }
        });
      });
    });

    return Array.from(themes).slice(0, 10); // Limit to top 10 themes
  }

  /**
   * Infers basic contextual metadata (e.g., tone, intent).
   * @param {string} text
   * @returns {Object} Context metadata
   */
  _inferContext(text) {
    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(w => this.sentimentDict.positive.includes(w)).length;
    const negativeCount = words.filter(w => this.sentimentDict.negative.includes(w)).length;
    
    let tone = 'neutral';
    if (positiveCount > negativeCount) tone = 'positive';
    else if (negativeCount > positiveCount) tone = 'negative';

    const intent = text.includes('?') ? 'question' : text.includes('!') ? 'exclamation' : 'statement';

    return { tone, intent };
  }

  /**
   * Performs sentiment analysis (local or API-based).
   * @param {string} text
   * @returns {Promise<Object>} Sentiment result { score, label }
   */
  async _getSentiment(text) {
    if (this.options.sentimentModel === 'api' && this.options.apiKey) {
      return this._fetchSentimentFromApi(text);
    }

    // Local sentiment analysis (basic)
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    words.forEach(word => {
      if (this.sentimentDict.positive.includes(word)) score += 1;
      else if (this.sentimentDict.negative.includes(word)) score -= 1;
      else if (this.sentimentDict.neutral.includes(word)) score += 0.5;
    });

    const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    return { score, label };
  }

  /**
   * Fetches sentiment from an external API (placeholder).
   * @param {string} text
   * @returns {Promise<Object>} Sentiment result
   */
  async _fetchSentimentFromApi(text) {
    const body = { text };
    try {
      const response = await this._fetchWithRetry('/sentiment', body);
      return response.sentiment || { score: 0, label: 'neutral' };
    } catch (error) {
      this.options.onError(error);
      return { score: 0, label: 'neutral', error: error.message };
    }
  }

  /**
   * Provides explanations for analysis results.
   * @param {Object} params - { text, analysis }
   * @returns {Object} Explanation of analysis
   */
  explain(params) {
    const { text, analysis } = params;
    const explanation = {
      text,
      sentiment: analysis.sentiment ? `The text is classified as ${analysis.sentiment.label} (score: ${analysis.sentiment.score}) based on words like '${text.split(/\W+/).filter(w => this.sentimentDict[analysis.sentiment.label]?.includes(w)).join(', ') || 'none'}'.` : 'No sentiment analysis performed.',
      themes: analysis.themes.length ? `Extracted themes include: ${analysis.themes.join(', ')}.` : 'No themes extracted.',
      context: `Inferred context: tone is ${analysis.context.tone}, intent is ${analysis.context.intent}.`
    };
    return explanation;
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
  module.exports = ContentAnalyzer;
} else {
  window.ContentAnalyzer = ContentAnalyzer;
}

// Example usage:
// const analyzer = new ContentAnalyzer();
// analyzer.analyzeText({ text: 'I love this product!' })
//   .then(result => console.log(result))
//   .catch(err => console.error(err));