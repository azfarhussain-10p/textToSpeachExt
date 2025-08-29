/**
 * Rate limiting utility for API requests
 * Implements token bucket algorithm with persistence across browser sessions
 */

class RateLimiter {
  /**
   * Create a rate limiter
   * @param {number} maxRequests - Maximum number of requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @param {string} identifier - Unique identifier for this rate limiter
   */
  constructor(maxRequests, windowMs, identifier = 'default') {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.identifier = identifier;
    this.storageKey = `rateLimiter_${identifier}`;
    
    // Initialize bucket state
    this.bucket = {
      tokens: maxRequests,
      lastRefill: Date.now(),
      requests: []
    };
    
    // Load persisted state
    this.loadState();
  }

  /**
   * Check if a request can be made and consume a token if available
   * @returns {Promise<boolean>} True if request is allowed
   */
  async checkLimit() {
    await this.refillBucket();
    
    if (this.bucket.tokens > 0) {
      this.bucket.tokens--;
      this.bucket.requests.push(Date.now());
      await this.saveState();
      return true;
    }
    
    return false;
  }

  /**
   * Get current rate limit status
   * @returns {object} Status information
   */
  async getStatus() {
    await this.refillBucket();
    
    const now = Date.now();
    const recentRequests = this.bucket.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    const nextResetTime = this.bucket.lastRefill + this.windowMs;
    const timeUntilReset = Math.max(0, nextResetTime - now);
    
    return {
      identifier: this.identifier,
      tokensRemaining: this.bucket.tokens,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      requestsMade: recentRequests.length,
      nextResetTime,
      timeUntilReset,
      rateLimited: this.bucket.tokens === 0
    };
  }

  /**
   * Wait until a request can be made
   * @param {number} maxWaitMs - Maximum time to wait in milliseconds
   * @returns {Promise<boolean>} True if request is now allowed
   */
  async waitForAvailability(maxWaitMs = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      if (await this.checkLimit()) {
        return true;
      }
      
      const status = await this.getStatus();
      const waitTime = Math.min(
        status.timeUntilReset,
        maxWaitMs - (Date.now() - startTime),
        5000 // Maximum 5 second intervals
      );
      
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }
    
    return false;
  }

  /**
   * Reset the rate limiter (clear all tokens and history)
   * @returns {Promise<void>}
   */
  async reset() {
    this.bucket = {
      tokens: this.maxRequests,
      lastRefill: Date.now(),
      requests: []
    };
    
    await this.saveState();
  }

  /**
   * Check if requests are currently rate limited
   * @returns {Promise<boolean>} True if rate limited
   */
  async isRateLimited() {
    await this.refillBucket();
    return this.bucket.tokens === 0;
  }

  /**
   * Get the time until next token is available
   * @returns {Promise<number>} Time in milliseconds until next token
   */
  async getTimeUntilNextToken() {
    const status = await this.getStatus();
    
    if (status.tokensRemaining > 0) {
      return 0;
    }
    
    // Calculate when the oldest request will expire
    const oldestRequest = Math.min(...this.bucket.requests);
    const tokenAvailableAt = oldestRequest + this.windowMs;
    
    return Math.max(0, tokenAvailableAt - Date.now());
  }

  // Private methods

  /**
   * Refill the token bucket based on elapsed time
   * @private
   */
  async refillBucket() {
    const now = Date.now();
    const timeSinceLastRefill = now - this.bucket.lastRefill;
    
    // Clean up old requests
    this.bucket.requests = this.bucket.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // For sliding window, tokens are based on requests in the window
    const requestsInWindow = this.bucket.requests.length;
    this.bucket.tokens = Math.max(0, this.maxRequests - requestsInWindow);
    
    this.bucket.lastRefill = now;
  }

  /**
   * Load persisted state from browser storage
   * @private
   */
  async loadState() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const api = chrome;
        const result = await new Promise((resolve) => {
          api.storage.local.get([this.storageKey], resolve);
        });
        
        if (result[this.storageKey]) {
          const saved = result[this.storageKey];
          
          // Validate saved data structure
          if (saved.tokens !== undefined && saved.lastRefill && Array.isArray(saved.requests)) {
            this.bucket = {
              tokens: Math.max(0, Math.min(saved.tokens, this.maxRequests)),
              lastRefill: saved.lastRefill,
              requests: saved.requests.filter(req => 
                typeof req === 'number' && req > 0
              )
            };
          }
        }
      } else if (typeof browser !== 'undefined' && browser.storage) {
        const result = await browser.storage.local.get([this.storageKey]);
        
        if (result[this.storageKey]) {
          const saved = result[this.storageKey];
          this.bucket = {
            tokens: Math.max(0, Math.min(saved.tokens, this.maxRequests)),
            lastRefill: saved.lastRefill,
            requests: saved.requests.filter(req => 
              typeof req === 'number' && req > 0
            )
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limiter state:', error);
      // Use default state on error
    }
  }

  /**
   * Save current state to browser storage
   * @private
   */
  async saveState() {
    try {
      const stateToSave = {
        [this.storageKey]: {
          tokens: this.bucket.tokens,
          lastRefill: this.bucket.lastRefill,
          requests: this.bucket.requests.slice(-this.maxRequests) // Keep only recent requests
        }
      };
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const api = chrome;
        await new Promise((resolve, reject) => {
          api.storage.local.set(stateToSave, () => {
            if (api.runtime.lastError) {
              reject(new Error(api.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      } else if (typeof browser !== 'undefined' && browser.storage) {
        await browser.storage.local.set(stateToSave);
      }
    } catch (error) {
      console.warn('Failed to save rate limiter state:', error);
    }
  }

  /**
   * Sleep utility for waiting
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory for creating pre-configured rate limiters for common APIs
 */
class RateLimiterFactory {
  
  /**
   * Create a rate limiter for Groq API (100 requests per hour for free tier)
   * @returns {RateLimiter}
   */
  static createGroqLimiter() {
    return new RateLimiter(100, 3600000, 'groq'); // 100 requests per hour
  }

  /**
   * Create a rate limiter for Claude API (varies by tier)
   * @param {string} tier - API tier ('tier1', 'tier2', 'tier3', 'tier4')
   * @returns {RateLimiter}
   */
  static createClaudeLimiter(tier = 'tier1') {
    const tierLimits = {
      tier1: { requests: 60, window: 60000 },   // 60 RPM
      tier2: { requests: 1000, window: 60000 }, // 1000 RPM
      tier3: { requests: 2000, window: 60000 }, // 2000 RPM
      tier4: { requests: 4000, window: 60000 }  // 4000 RPM
    };
    
    const limits = tierLimits[tier] || tierLimits.tier1;
    return new RateLimiter(limits.requests, limits.window, `claude_${tier}`);
  }

  /**
   * Create a rate limiter for OpenAI API (60 requests per minute for most models)
   * @returns {RateLimiter}
   */
  static createOpenAILimiter() {
    return new RateLimiter(60, 60000, 'openai'); // 60 requests per minute
  }

  /**
   * Create a rate limiter for general API protection
   * @param {number} requests - Requests per window
   * @param {number} windowSeconds - Window size in seconds
   * @param {string} identifier - Unique identifier
   * @returns {RateLimiter}
   */
  static createCustomLimiter(requests, windowSeconds, identifier) {
    return new RateLimiter(requests, windowSeconds * 1000, identifier);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RateLimiter, RateLimiterFactory };
} else if (typeof window !== 'undefined') {
  window.RateLimiter = RateLimiter;
  window.RateLimiterFactory = RateLimiterFactory;
}