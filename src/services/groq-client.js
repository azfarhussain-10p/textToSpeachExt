/**
 * Groq API Client
 * Implementation based on context7 Groq documentation with rate limiting and error handling
 */

// Import rate limiter utility
const { RateLimiterFactory } = typeof window !== 'undefined' && window.RateLimiterFactory
  ? window
  : require('../utils/rate-limiter.js');

class GroqClient {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.rateLimiter = RateLimiterFactory.createGroqLimiter(); // 100 requests per hour
    this.isInitialized = false;
    this.supportedModels = [
      'mixtral-8x7b-32768',
      'llama2-70b-4096',
      'gemma-7b-it',
      'llama3-8b-8192',
      'llama3-70b-8192'
    ];
    this.defaultModel = 'mixtral-8x7b-32768';
  }

  /**
   * Initialize the Groq client with API key from storage
   */
  async initialize() {
    try {
      const apiKey = await this.loadAPIKey();
      
      if (!apiKey) {
        console.warn('⚠️ Groq API key not found in storage');
        this.isInitialized = false;
        return false;
      }
      
      this.apiKey = apiKey;
      
      // Test the API key with a minimal request
      const isValid = await this.validateAPIKey();
      
      if (isValid) {
        this.isInitialized = true;
        console.log('✅ Groq client initialized successfully');
        return true;
      } else {
        console.error('❌ Groq API key validation failed');
        this.isInitialized = false;
        return false;
      }
      
    } catch (error) {
      console.error('❌ Groq client initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Generate AI explanation for given text
   * @param {string} text - Text to explain
   * @param {string} level - Explanation level: 'simple', 'detailed', 'technical'
   * @param {object} options - Additional options
   */
  async explainText(text, level = 'simple', options = {}) {
    if (!this.isInitialized) {
      throw new Error('Groq client not initialized. Please configure API key.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for explanation');
    }

    // Check rate limits
    if (!await this.rateLimiter.checkLimit()) {
      const status = await this.rateLimiter.getStatus();
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(status.timeUntilReset / 1000)} seconds.`);
    }

    try {
      const prompt = this.buildExplanationPrompt(text, level);
      const model = options.model || this.defaultModel;
      
      const response = await this.makeRequest('/chat/completions', {
        model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.3,
        top_p: options.top_p || 0.9,
        stream: false
      });

      const explanation = response.choices?.[0]?.message?.content;
      
      if (!explanation) {
        throw new Error('No explanation received from Groq API');
      }

      return {
        explanation: explanation.trim(),
        provider: 'groq',
        model,
        level,
        tokensUsed: response.usage?.total_tokens || 0,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Groq explanation error:', error);
      throw this.handleAPIError(error);
    }
  }

  /**
   * Generate summary for long text
   * @param {string} text - Text to summarize
   * @param {object} options - Summary options
   */
  async summarizeText(text, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Groq client not initialized');
    }

    if (!await this.rateLimiter.checkLimit()) {
      const status = await this.rateLimiter.getStatus();
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(status.timeUntilReset / 1000)} seconds.`);
    }

    try {
      const prompt = this.buildSummaryPrompt(text, options.length || 'medium');
      
      const response = await this.makeRequest('/chat/completions', {
        model: options.model || this.defaultModel,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: options.maxTokens || 300,
        temperature: 0.3
      });

      return {
        summary: response.choices[0].message.content.trim(),
        provider: 'groq',
        originalLength: text.length,
        tokensUsed: response.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('Groq summary error:', error);
      throw this.handleAPIError(error);
    }
  }

  /**
   * Check if the API key is valid
   */
  async validateAPIKey() {
    try {
      const response = await this.makeRequest('/models', null, 'GET');
      return response && response.data && Array.isArray(response.data);
    } catch (error) {
      console.error('Groq API key validation failed:', error);
      return false;
    }
  }

  /**
   * Get available models
   */
  async getModels() {
    if (!this.isInitialized) {
      return this.supportedModels;
    }

    try {
      const response = await this.makeRequest('/models', null, 'GET');
      const models = response.data?.map(model => model.id) || this.supportedModels;
      return models.filter(model => this.supportedModels.includes(model));
    } catch (error) {
      console.warn('Failed to fetch Groq models, using defaults:', error);
      return this.supportedModels;
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimit() {
    return await this.rateLimiter.getStatus();
  }

  /**
   * Wait for rate limit availability
   */
  async waitForAvailability(maxWaitMs = 60000) {
    return await this.rateLimiter.waitForAvailability(maxWaitMs);
  }

  /**
   * Get client status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasAPIKey: !!this.apiKey,
      supportedModels: this.supportedModels,
      defaultModel: this.defaultModel,
      rateLimited: this.rateLimiter ? this.rateLimiter.isRateLimited() : false
    };
  }

  // Private methods

  /**
   * Load API key from browser storage
   */
  async loadAPIKey() {
    try {
      const api = this.getStorageAPI();
      if (!api) return null;

      const result = await this.getStorageData(api, ['apiKeys']);
      return result.apiKeys?.groqApiKey || null;

    } catch (error) {
      console.error('Failed to load Groq API key:', error);
      return null;
    }
  }

  /**
   * Make HTTP request to Groq API
   */
  async makeRequest(endpoint, data = null, method = 'POST') {
    if (!this.apiKey) {
      throw new Error('No API key available');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers
    };

    if (method === 'POST' && data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Build explanation prompt based on level
   */
  buildExplanationPrompt(text, level) {
    const levelInstructions = {
      simple: 'Explain this text in simple terms that a 12-year-old could understand. Use everyday language and avoid jargon.',
      detailed: 'Provide a comprehensive explanation of this text. Include context, background information, and explain any technical terms or concepts.',
      technical: 'Give a technical analysis of this text. Explain technical concepts, methodologies, and provide detailed insights for an expert audience.'
    };

    const instruction = levelInstructions[level] || levelInstructions.simple;
    
    return `${instruction}\n\nText to explain:\n"${text}"\n\nExplanation:`;
  }

  /**
   * Build summary prompt
   */
  buildSummaryPrompt(text, length) {
    const lengthInstructions = {
      short: 'Summarize this text in 1-2 sentences.',
      medium: 'Summarize this text in 3-4 sentences.',
      long: 'Provide a detailed summary of this text in 1-2 paragraphs.'
    };

    const instruction = lengthInstructions[length] || lengthInstructions.medium;
    
    return `${instruction}\n\nText to summarize:\n"${text}"\n\nSummary:`;
  }

  /**
   * Handle API errors with specific error types
   */
  handleAPIError(error) {
    const message = error.message || 'Unknown error';
    
    if (message.includes('401') || message.includes('unauthorized')) {
      return new Error('Invalid API key. Please check your Groq API key in settings.');
    } else if (message.includes('429') || message.includes('rate limit')) {
      return new Error('Rate limit exceeded. Please wait before making another request.');
    } else if (message.includes('402') || message.includes('quota')) {
      return new Error('API quota exceeded. Please check your Groq account billing.');
    } else if (message.includes('400') || message.includes('bad request')) {
      return new Error('Invalid request. Please try again with different text.');
    } else if (message.includes('503') || message.includes('service unavailable')) {
      return new Error('Groq service temporarily unavailable. Please try again later.');
    }
    
    return new Error(`Groq API error: ${message}`);
  }

  /**
   * Get storage API
   */
  getStorageAPI() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome;
    } else if (typeof browser !== 'undefined' && browser.storage) {
      return browser;
    }
    return null;
  }

  /**
   * Get data from storage with promise handling
   */
  getStorageData(api, keys) {
    if (api === chrome) {
      return new Promise((resolve) => {
        api.storage.sync.get(keys, resolve);
      });
    } else {
      return api.storage.sync.get(keys);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroqClient;
} else if (typeof window !== 'undefined') {
  window.GroqClient = GroqClient;
}