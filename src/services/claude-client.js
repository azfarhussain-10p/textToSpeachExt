/**
 * Claude API Client
 * Implementation based on context7 Claude documentation with tier-based rate limiting
 */

// Import rate limiter utility
const { RateLimiterFactory } = typeof window !== 'undefined' && window.RateLimiterFactory
  ? window
  : require('../utils/rate-limiter.js');

class ClaudeClient {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.rateLimiter = null; // Will be set based on tier
    this.isInitialized = false;
    this.tier = 'tier1'; // Default tier
    this.supportedModels = [
      'claude-3-sonnet-20240229',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ];
    this.defaultModel = 'claude-3-sonnet-20240229';
    this.apiVersion = '2023-06-01';
  }

  /**
   * Initialize the Claude client with API key from storage
   */
  async initialize() {
    try {
      const apiKey = await this.loadAPIKey();
      
      if (!apiKey) {
        console.warn('⚠️ Claude API key not found in storage');
        this.isInitialized = false;
        return false;
      }
      
      this.apiKey = apiKey;
      
      // Detect tier and set up rate limiter
      await this.detectTierAndSetupRateLimiter();
      
      // Test the API key with a minimal request
      const isValid = await this.validateAPIKey();
      
      if (isValid) {
        this.isInitialized = true;
        console.log('✅ Claude client initialized successfully');
        return true;
      } else {
        console.error('❌ Claude API key validation failed');
        this.isInitialized = false;
        return false;
      }
      
    } catch (error) {
      console.error('❌ Claude client initialization failed:', error);
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
      throw new Error('Claude client not initialized. Please configure API key.');
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
      
      const response = await this.makeRequest('/messages', {
        model,
        max_tokens: options.maxTokens || 500,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: options.temperature || 0.3,
        top_p: options.top_p || 0.9
      });

      const explanation = response.content?.[0]?.text;
      
      if (!explanation) {
        throw new Error('No explanation received from Claude API');
      }

      return {
        explanation: explanation.trim(),
        provider: 'claude',
        model,
        level,
        tokensUsed: response.usage?.output_tokens || 0,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Claude explanation error:', error);
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
      throw new Error('Claude client not initialized');
    }

    if (!await this.rateLimiter.checkLimit()) {
      const status = await this.rateLimiter.getStatus();
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(status.timeUntilReset / 1000)} seconds.`);
    }

    try {
      const prompt = this.buildSummaryPrompt(text, options.length || 'medium');
      
      const response = await this.makeRequest('/messages', {
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || 300,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3
      });

      return {
        summary: response.content[0].text.trim(),
        provider: 'claude',
        originalLength: text.length,
        tokensUsed: response.usage?.output_tokens || 0
      };

    } catch (error) {
      console.error('Claude summary error:', error);
      throw this.handleAPIError(error);
    }
  }

  /**
   * Check if the API key is valid
   */
  async validateAPIKey() {
    try {
      // Make a minimal request to validate the key
      const response = await this.makeRequest('/messages', {
        model: 'claude-3-haiku-20240307', // Use smallest model for validation
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Hi'
        }]
      });
      
      return response && response.content && Array.isArray(response.content);
    } catch (error) {
      console.error('Claude API key validation failed:', error);
      return false;
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
   * Set API tier for rate limiting
   * @param {string} tier - API tier: 'tier1', 'tier2', 'tier3', 'tier4'
   */
  setTier(tier) {
    this.tier = tier;
    this.rateLimiter = RateLimiterFactory.createClaudeLimiter(tier);
    console.log(`🔧 Claude rate limiter set to ${tier}`);
  }

  /**
   * Get client status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasAPIKey: !!this.apiKey,
      tier: this.tier,
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

      const result = await this.getStorageData(api, ['apiKeys', 'claudeSettings']);
      const apiKey = result.apiKeys?.claudeApiKey;
      
      // Also load tier settings if available
      if (result.claudeSettings?.tier) {
        this.tier = result.claudeSettings.tier;
      }
      
      return apiKey || null;

    } catch (error) {
      console.error('Failed to load Claude API key:', error);
      return null;
    }
  }

  /**
   * Detect tier from API response headers or settings
   */
  async detectTierAndSetupRateLimiter() {
    try {
      // First try to get tier from stored settings
      const api = this.getStorageAPI();
      if (api) {
        const result = await this.getStorageData(api, ['claudeSettings']);
        if (result.claudeSettings?.tier) {
          this.tier = result.claudeSettings.tier;
        }
      }
      
      // Set up rate limiter based on tier
      this.rateLimiter = RateLimiterFactory.createClaudeLimiter(this.tier);
      
      console.log(`🔧 Claude client using ${this.tier} rate limits`);
      
    } catch (error) {
      console.warn('Failed to detect Claude tier, using tier1:', error);
      this.tier = 'tier1';
      this.rateLimiter = RateLimiterFactory.createClaudeLimiter('tier1');
    }
  }

  /**
   * Make HTTP request to Claude API
   */
  async makeRequest(endpoint, data) {
    if (!this.apiKey) {
      throw new Error('No API key available');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': this.apiVersion
    };

    const config = {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    };

    const response = await fetch(url, config);

    // Check for rate limit headers to potentially adjust tier
    this.updateTierFromHeaders(response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update tier information from response headers
   */
  updateTierFromHeaders(headers) {
    try {
      // Claude API may include rate limit information in headers
      const rateLimitLimit = headers.get('anthropic-ratelimit-requests-limit');
      const rateLimitRemaining = headers.get('anthropic-ratelimit-requests-remaining');
      
      if (rateLimitLimit) {
        const limit = parseInt(rateLimitLimit);
        
        // Detect tier based on rate limit
        let detectedTier = 'tier1';
        if (limit >= 4000) {
          detectedTier = 'tier4';
        } else if (limit >= 2000) {
          detectedTier = 'tier3';
        } else if (limit >= 1000) {
          detectedTier = 'tier2';
        }
        
        if (detectedTier !== this.tier) {
          console.log(`🔄 Detected Claude tier change: ${this.tier} → ${detectedTier}`);
          this.setTier(detectedTier);
          
          // Save updated tier to storage
          this.saveTierToStorage(detectedTier);
        }
      }
    } catch (error) {
      console.warn('Failed to parse rate limit headers:', error);
    }
  }

  /**
   * Save tier information to storage
   */
  async saveTierToStorage(tier) {
    try {
      const api = this.getStorageAPI();
      if (!api) return;

      const claudeSettings = { tier };
      await this.setStorageData(api, { claudeSettings });
      
    } catch (error) {
      console.warn('Failed to save Claude tier to storage:', error);
    }
  }

  /**
   * Build explanation prompt based on level
   */
  buildExplanationPrompt(text, level) {
    const levelInstructions = {
      simple: 'Explain this text in simple, clear terms that anyone can understand. Use everyday language and avoid technical jargon. Focus on the main ideas.',
      detailed: 'Provide a comprehensive explanation of this text. Include relevant context, background information, and explain any technical terms or concepts in detail.',
      technical: 'Give a technical analysis of this text. Explain methodologies, technical concepts, and provide detailed insights suitable for an expert audience.'
    };

    const instruction = levelInstructions[level] || levelInstructions.simple;
    
    return `${instruction}\n\nText to explain:\n"${text}"\n\nPlease provide your explanation:`;
  }

  /**
   * Build summary prompt
   */
  buildSummaryPrompt(text, length) {
    const lengthInstructions = {
      short: 'Summarize this text in 1-2 concise sentences, capturing only the most essential points.',
      medium: 'Summarize this text in 3-4 sentences, covering the main ideas and key details.',
      long: 'Provide a comprehensive summary of this text in 1-2 paragraphs, including important details and context.'
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
      return new Error('Invalid API key. Please check your Claude API key in settings.');
    } else if (message.includes('429') || message.includes('rate limit')) {
      return new Error('Rate limit exceeded. Please wait before making another request.');
    } else if (message.includes('402') || message.includes('quota')) {
      return new Error('API quota exceeded. Please check your Claude account billing.');
    } else if (message.includes('400') || message.includes('bad request')) {
      return new Error('Invalid request. Please try again with different text.');
    } else if (message.includes('503') || message.includes('service unavailable')) {
      return new Error('Claude service temporarily unavailable. Please try again later.');
    } else if (message.includes('overloaded')) {
      return new Error('Claude is currently overloaded. Please try again in a moment.');
    }
    
    return new Error(`Claude API error: ${message}`);
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

  /**
   * Set data in storage with promise handling
   */
  setStorageData(api, data) {
    if (api === chrome) {
      return new Promise((resolve, reject) => {
        api.storage.sync.set(data, () => {
          if (api.runtime.lastError) {
            reject(new Error(api.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      return api.storage.sync.set(data);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaudeClient;
} else if (typeof window !== 'undefined') {
  window.ClaudeClient = ClaudeClient;
}