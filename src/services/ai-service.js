/**
 * Multi-Provider AI Service
 * Orchestrates between Groq, Claude, and local fallback services
 * Implements intelligent provider selection and fallback chain
 */

// Import AI clients
const GroqClient = typeof window !== 'undefined' && window.GroqClient
  ? window.GroqClient
  : require('./groq-client.js');

const ClaudeClient = typeof window !== 'undefined' && window.ClaudeClient
  ? window.ClaudeClient
  : require('./claude-client.js');

class AIService {
  constructor() {
    this.providers = {
      groq: new GroqClient(),
      claude: new ClaudeClient()
    };
    
    this.isInitialized = false;
    this.providerStatus = {};
    
    // Provider configuration
    this.defaultFallbackChain = ['groq', 'claude', 'local'];
    this.providerPreferences = {
      explanation: ['groq', 'claude', 'local'],
      summary: ['claude', 'groq', 'local'], // Claude tends to be better at summaries
      conversation: ['claude', 'groq', 'local']
    };
    
    // Cache for recent responses to avoid duplicate API calls
    this.responseCache = new Map();
    this.cacheMaxSize = 100;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    
    // Statistics tracking
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      providerUsage: {
        groq: 0,
        claude: 0,
        local: 0
      },
      averageResponseTime: 0,
      errors: []
    };
  }

  /**
   * Initialize the AI service and all providers
   */
  async initialize() {
    try {
      console.log('🤖 Initializing AI Service...');
      
      // Initialize all providers in parallel
      const initPromises = Object.entries(this.providers).map(async ([name, provider]) => {
        try {
          const initialized = await provider.initialize();
          this.providerStatus[name] = {
            initialized,
            available: initialized,
            lastError: null,
            errorCount: 0
          };
          
          if (initialized) {
            console.log(`✅ ${name} provider initialized successfully`);
          } else {
            console.warn(`⚠️ ${name} provider initialization failed`);
          }
          
          return { name, initialized };
        } catch (error) {
          console.error(`❌ ${name} provider initialization error:`, error);
          this.providerStatus[name] = {
            initialized: false,
            available: false,
            lastError: error.message,
            errorCount: 1
          };
          return { name, initialized: false, error };
        }
      });
      
      const results = await Promise.allSettled(initPromises);
      
      // Check if at least one provider is available
      const availableProviders = Object.values(this.providerStatus).filter(status => status.available);
      
      if (availableProviders.length > 0) {
        this.isInitialized = true;
        console.log(`✅ AI Service initialized with ${availableProviders.length} available providers`);
      } else {
        console.warn('⚠️ AI Service initialized but no providers are available (local fallback only)');
        this.isInitialized = true; // Still initialize for local fallback
      }
      
      // Load user preferences
      await this.loadUserPreferences();
      
      return this.isInitialized;
      
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Generate AI explanation with intelligent provider selection
   * @param {string} text - Text to explain
   * @param {object} options - Options including level, provider preference, etc.
   */
  async explainText(text, options = {}) {
    this.stats.totalRequests++;
    const startTime = Date.now();
    
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for explanation');
      }

      const {
        level = 'simple',
        preferredProvider = null,
        skipCache = false,
        maxRetries = 3
      } = options;

      // Check cache first
      if (!skipCache) {
        const cachedResponse = this.getCachedResponse('explain', text, level);
        if (cachedResponse) {
          console.log('📦 Returning cached explanation');
          return cachedResponse;
        }
      }

      // Determine provider chain
      const providerChain = this.getProviderChain('explanation', preferredProvider);
      
      // Try each provider in the chain
      for (const providerName of providerChain) {
        if (providerName === 'local') {
          const localResponse = await this.getLocalExplanation(text, level);
          this.updateStats(providerName, Date.now() - startTime, true);
          return localResponse;
        }
        
        const provider = this.providers[providerName];
        const status = this.providerStatus[providerName];
        
        if (!provider || !status?.available) {
          console.log(`⏭️ Skipping unavailable provider: ${providerName}`);
          continue;
        }
        
        try {
          console.log(`🔄 Attempting explanation with ${providerName}...`);
          
          const response = await provider.explainText(text, level, options);
          
          // Cache successful response
          this.cacheResponse('explain', text, level, response);
          
          // Update statistics
          this.updateStats(providerName, Date.now() - startTime, true);
          this.markProviderSuccess(providerName);
          
          return response;
          
        } catch (error) {
          console.warn(`❌ ${providerName} explanation failed:`, error.message);
          
          this.markProviderError(providerName, error);
          
          // If rate limited, remove from available providers temporarily
          if (error.message.includes('rate limit') || error.message.includes('quota')) {
            this.temporarilyDisableProvider(providerName, 60000); // 1 minute
          }
          
          continue; // Try next provider
        }
      }
      
      throw new Error('All AI providers failed to generate explanation');
      
    } catch (error) {
      this.updateStats('error', Date.now() - startTime, false);
      console.error('AI explanation error:', error);
      throw error;
    }
  }

  /**
   * Generate text summary
   * @param {string} text - Text to summarize
   * @param {object} options - Summary options
   */
  async summarizeText(text, options = {}) {
    this.stats.totalRequests++;
    const startTime = Date.now();
    
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for summarization');
      }

      const {
        length = 'medium',
        preferredProvider = null,
        skipCache = false
      } = options;

      // Check cache
      if (!skipCache) {
        const cachedResponse = this.getCachedResponse('summarize', text, length);
        if (cachedResponse) {
          console.log('📦 Returning cached summary');
          return cachedResponse;
        }
      }

      // Determine provider chain (Claude preferred for summaries)
      const providerChain = this.getProviderChain('summary', preferredProvider);
      
      for (const providerName of providerChain) {
        if (providerName === 'local') {
          const localResponse = await this.getLocalSummary(text, length);
          this.updateStats(providerName, Date.now() - startTime, true);
          return localResponse;
        }
        
        const provider = this.providers[providerName];
        const status = this.providerStatus[providerName];
        
        if (!provider || !status?.available) {
          continue;
        }
        
        try {
          console.log(`🔄 Attempting summary with ${providerName}...`);
          
          const response = await provider.summarizeText(text, options);
          
          this.cacheResponse('summarize', text, length, response);
          this.updateStats(providerName, Date.now() - startTime, true);
          this.markProviderSuccess(providerName);
          
          return response;
          
        } catch (error) {
          console.warn(`❌ ${providerName} summary failed:`, error.message);
          this.markProviderError(providerName, error);
          continue;
        }
      }
      
      throw new Error('All AI providers failed to generate summary');
      
    } catch (error) {
      this.updateStats('error', Date.now() - startTime, false);
      console.error('AI summary error:', error);
      throw error;
    }
  }

  /**
   * Check rate limits for all providers
   */
  async checkRateLimits() {
    const limits = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        if (provider.getRateLimit) {
          limits[name] = await provider.getRateLimit();
        }
      } catch (error) {
        limits[name] = { error: error.message };
      }
    }
    
    return limits;
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      providerStatus: this.providerStatus,
      cacheSize: this.responseCache.size,
      uptime: Date.now() - (this.initTimestamp || Date.now())
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      availableProviders: Object.entries(this.providerStatus)
        .filter(([name, status]) => status.available)
        .map(([name]) => name),
      totalProviders: Object.keys(this.providers).length,
      cacheEnabled: true,
      statistics: this.getStatistics()
    };
  }

  /**
   * Clear response cache
   */
  clearCache() {
    this.responseCache.clear();
    console.log('🗑️ AI response cache cleared');
  }

  // Private methods

  /**
   * Get provider chain based on task type and preferences
   */
  getProviderChain(taskType, preferredProvider = null) {
    let chain;
    
    if (preferredProvider) {
      // Use preferred provider first, then fall back to task-specific chain
      const taskChain = this.providerPreferences[taskType] || this.defaultFallbackChain;
      chain = [preferredProvider, ...taskChain.filter(p => p !== preferredProvider)];
    } else {
      chain = this.providerPreferences[taskType] || this.defaultFallbackChain;
    }
    
    return chain;
  }

  /**
   * Get cached response if available and not expired
   */
  getCachedResponse(operation, text, level) {
    const cacheKey = this.getCacheKey(operation, text, level);
    const cached = this.responseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.response;
    }
    
    if (cached) {
      this.responseCache.delete(cacheKey); // Remove expired cache
    }
    
    return null;
  }

  /**
   * Cache successful response
   */
  cacheResponse(operation, text, level, response) {
    const cacheKey = this.getCacheKey(operation, text, level);
    
    // Manage cache size
    if (this.responseCache.size >= this.cacheMaxSize) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
    
    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Generate cache key
   */
  getCacheKey(operation, text, level) {
    const textHash = this.simpleHash(text.trim().substring(0, 500));
    return `${operation}_${level}_${textHash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get local explanation fallback
   */
  async getLocalExplanation(text, level) {
    const analysis = this.analyzeText(text);
    
    const explanations = {
      simple: `This appears to be ${analysis.type}. It contains about ${analysis.wordCount} words and discusses ${analysis.topics.join(', ')}. For detailed AI explanations, please configure API keys in the extension settings.`,
      detailed: `Text Analysis: This is ${analysis.type} with ${analysis.wordCount} words, ${analysis.sentenceCount} sentences, and an estimated reading level of ${analysis.readingLevel}. Key topics include: ${analysis.topics.join(', ')}. To get comprehensive AI-powered explanations, please add your API keys in settings.`,
      technical: `Technical Analysis: ${analysis.type} | Length: ${analysis.wordCount} words, ${analysis.sentenceCount} sentences | Reading complexity: ${analysis.readingLevel} | Key terms: ${analysis.keywords.join(', ')} | For advanced technical analysis, configure AI service API keys.`
    };
    
    return {
      explanation: explanations[level] || explanations.simple,
      provider: 'local',
      level,
      timestamp: Date.now(),
      analysis
    };
  }

  /**
   * Get local summary fallback
   */
  async getLocalSummary(text, length) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const analysis = this.analyzeText(text);
    
    let summary;
    if (length === 'short') {
      summary = sentences[0]?.trim() + '.';
    } else if (length === 'medium') {
      const mid = Math.min(3, sentences.length);
      summary = sentences.slice(0, mid).join('. ').trim() + '.';
    } else {
      const max = Math.min(6, sentences.length);
      summary = sentences.slice(0, max).join('. ').trim() + '.';
    }
    
    return {
      summary: summary || text.substring(0, 200) + '...',
      provider: 'local',
      originalLength: text.length,
      summaryLength: summary?.length || 0
    };
  }

  /**
   * Analyze text characteristics
   */
  analyzeText(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Extract potential topics (simple keyword extraction)
    const keywords = words
      .filter(word => word.length > 4)
      .filter(word => !/^(the|and|but|for|are|have|this|that|with|they|been|their)$/i.test(word))
      .slice(0, 5);
    
    // Determine text type
    let type = 'text';
    if (text.includes('http') || text.includes('www')) type = 'web content';
    else if (text.includes('@') && text.includes('.')) type = 'communication';
    else if (words.length < 10) type = 'short phrase';
    else if (words.length < 50) type = 'brief text';
    else if (words.length < 200) type = 'medium text';
    else type = 'long passage';
    
    // Simple reading level estimation
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    let readingLevel = 'Elementary';
    if (avgWordsPerSentence > 20) readingLevel = 'Advanced';
    else if (avgWordsPerSentence > 15) readingLevel = 'Intermediate';
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      keywords: keywords,
      topics: keywords.slice(0, 3),
      type,
      readingLevel,
      avgWordsPerSentence: Math.round(avgWordsPerSentence)
    };
  }

  /**
   * Mark provider as having an error
   */
  markProviderError(providerName, error) {
    const status = this.providerStatus[providerName];
    if (status) {
      status.errorCount = (status.errorCount || 0) + 1;
      status.lastError = error.message;
      
      // Disable provider temporarily if too many errors
      if (status.errorCount >= 3) {
        this.temporarilyDisableProvider(providerName, 300000); // 5 minutes
      }
    }
    
    // Track error in stats
    this.stats.errors.push({
      provider: providerName,
      error: error.message,
      timestamp: Date.now()
    });
    
    // Keep only last 10 errors
    if (this.stats.errors.length > 10) {
      this.stats.errors = this.stats.errors.slice(-10);
    }
  }

  /**
   * Mark provider as successful
   */
  markProviderSuccess(providerName) {
    const status = this.providerStatus[providerName];
    if (status) {
      status.errorCount = 0;
      status.lastError = null;
      status.available = true;
    }
  }

  /**
   * Temporarily disable provider
   */
  temporarilyDisableProvider(providerName, durationMs) {
    const status = this.providerStatus[providerName];
    if (status) {
      status.available = false;
      console.warn(`⏸️ Temporarily disabled ${providerName} for ${durationMs / 1000}s`);
      
      setTimeout(() => {
        status.available = status.initialized;
        console.log(`🔄 Re-enabled ${providerName}`);
      }, durationMs);
    }
  }

  /**
   * Update service statistics
   */
  updateStats(provider, responseTime, success) {
    if (success) {
      this.stats.successfulRequests++;
      this.stats.providerUsage[provider] = (this.stats.providerUsage[provider] || 0) + 1;
      
      // Update average response time
      const totalSuccessful = this.stats.successfulRequests;
      this.stats.averageResponseTime = 
        ((this.stats.averageResponseTime * (totalSuccessful - 1)) + responseTime) / totalSuccessful;
    }
  }

  /**
   * Load user preferences from storage
   */
  async loadUserPreferences() {
    try {
      const api = this.getStorageAPI();
      if (!api) return;

      const result = await this.getStorageData(api, ['aiSettings']);
      const settings = result.aiSettings || {};
      
      // Update provider preferences based on user settings
      if (settings.preferredProvider) {
        // Adjust fallback chains to prefer user's choice
        Object.keys(this.providerPreferences).forEach(taskType => {
          const chain = this.providerPreferences[taskType];
          const preferred = settings.preferredProvider;
          
          if (chain.includes(preferred)) {
            this.providerPreferences[taskType] = [
              preferred,
              ...chain.filter(p => p !== preferred)
            ];
          }
        });
      }
      
    } catch (error) {
      console.warn('Failed to load AI preferences:', error);
    }
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
   * Get data from storage
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
  module.exports = AIService;
} else if (typeof window !== 'undefined') {
  window.AIService = AIService;
}