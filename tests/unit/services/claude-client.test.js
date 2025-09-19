/**
 * Claude Client Unit Tests
 * Tests for Claude API integration with rate limiting and tier management
 */

const ClaudeClient = require('../../../src/services/claude-client.js');

// Mock fetch globally
global.fetch = jest.fn();

describe('ClaudeClient', () => {
  let claudeClient;
  const mockApiKey = 'test-claude-api-key';

  beforeEach(() => {
    claudeClient = new ClaudeClient(mockApiKey);
    jest.clearAllMocks();

    // Reset fetch mock
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with API key', () => {
      expect(claudeClient).toBeDefined();
      expect(claudeClient.apiKey).toBe(mockApiKey);
    });

    test('should throw error without API key', () => {
      expect(() => new ClaudeClient()).toThrow('Claude API key is required');
      expect(() => new ClaudeClient('')).toThrow('Claude API key is required');
    });

    test('should initialize rate limiter', () => {
      expect(claudeClient.rateLimiter).toBeDefined();
    });

    test('should set default configuration', () => {
      expect(claudeClient.baseURL).toBe('https://api.anthropic.com/v1');
      expect(claudeClient.model).toBe('claude-3-sonnet-20240229');
      expect(claudeClient.maxRetries).toBe(3);
    });
  });

  describe('API configuration', () => {
    test('should allow model configuration', () => {
      const customClient = new ClaudeClient(mockApiKey, {
        model: 'claude-3-opus-20240229'
      });
      expect(customClient.model).toBe('claude-3-opus-20240229');
    });

    test('should allow base URL configuration', () => {
      const customClient = new ClaudeClient(mockApiKey, {
        baseURL: 'https://custom.claude.endpoint.com'
      });
      expect(customClient.baseURL).toBe('https://custom.claude.endpoint.com');
    });

    test('should allow tier configuration', () => {
      const customClient = new ClaudeClient(mockApiKey, {
        tier: 'paid'
      });
      expect(customClient.tier).toBe('paid');
    });

    test('should set different rate limits for different tiers', () => {
      const freeClient = new ClaudeClient(mockApiKey, { tier: 'free' });
      const paidClient = new ClaudeClient(mockApiKey, { tier: 'paid' });

      expect(freeClient.rateLimiter.tokensPerSecond).toBeLessThan(
        paidClient.rateLimiter.tokensPerSecond
      );
    });
  });

  describe('Text explanation', () => {
    const mockResponse = {
      content: [{
        text: 'This is a Claude explanation.'
      }]
    };

    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });
    });

    test('should explain text successfully', async () => {
      const result = await claudeClient.explainText('test text');

      expect(result).toBe('This is a Claude explanation.');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': mockApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    test('should handle empty text input', async () => {
      await expect(claudeClient.explainText('')).rejects.toThrow('Text is required');
      await expect(claudeClient.explainText(null)).rejects.toThrow('Text is required');
      await expect(claudeClient.explainText(undefined)).rejects.toThrow('Text is required');
    });

    test('should include options in system message', async () => {
      const options = {
        difficulty: 'advanced',
        context: 'technical',
        language: 'detailed'
      };

      await claudeClient.explainText('test text', options);

      const callData = JSON.parse(global.fetch.mock.calls[0][1].body);
      const systemMessage = callData.system;

      expect(systemMessage).toContain('advanced');
      expect(systemMessage).toContain('technical');
      expect(systemMessage).toContain('detailed');
    });

    test('should handle text over token limit', async () => {
      const longText = 'a'.repeat(100000); // Very long text

      await claudeClient.explainText(longText);

      const callData = JSON.parse(global.fetch.mock.calls[0][1].body);
      const userMessage = callData.messages[0].content;

      // Should be truncated but still contain the text
      expect(userMessage.length).toBeLessThan(longText.length);
      expect(userMessage).toContain('aaa'); // Should contain part of the text
    });
  });

  describe('Rate limiting', () => {
    test('should wait for rate limiter before making request', async () => {
      const waitSpy = jest.spyOn(claudeClient.rateLimiter, 'waitForToken');
      waitSpy.mockResolvedValue();

      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          content: [{ text: 'response' }]
        })
      });

      await claudeClient.explainText('test');

      expect(waitSpy).toHaveBeenCalled();
    });

    test('should handle rate limit exceeded error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({
          error: { message: 'Rate limit exceeded' }
        })
      });

      await expect(claudeClient.explainText('test')).rejects.toThrow('Rate limit exceeded');
    });

    test('should respect tier-based limits', async () => {
      const freeClient = new ClaudeClient(mockApiKey, { tier: 'free' });
      const paidClient = new ClaudeClient(mockApiKey, { tier: 'paid' });

      // Verify different rate limiting configurations
      expect(freeClient.rateLimiter.tokensPerSecond).toBeLessThan(
        paidClient.rateLimiter.tokensPerSecond
      );
    });
  });

  describe('Error handling', () => {
    test('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(claudeClient.explainText('test')).rejects.toThrow('Network error');
    });

    test('should handle API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error: { message: 'Invalid request format' }
        })
      });

      await expect(claudeClient.explainText('test')).rejects.toThrow('Invalid request format');
    });

    test('should handle authentication errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({
          error: { message: 'Invalid API key' }
        })
      });

      await expect(claudeClient.explainText('test')).rejects.toThrow('Invalid API key');
    });

    test('should handle quota exceeded errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        json: () => Promise.resolve({
          error: { message: 'Quota exceeded' }
        })
      });

      await expect(claudeClient.explainText('test')).rejects.toThrow('Quota exceeded');
    });

    test('should handle malformed responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      await expect(claudeClient.explainText('test')).rejects.toThrow('Invalid response format');
    });

    test('should retry on temporary failures', async () => {
      let callCount = 0;
      global.fetch.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.resolve({ error: { message: 'Server error' } })
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            content: [{ text: 'Success after retries' }]
          })
        });
      });

      const result = await claudeClient.explainText('test');

      expect(result).toBe('Success after retries');
      expect(callCount).toBe(3);
    });

    test('should fail after max retries', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({
          error: { message: 'Persistent server error' }
        })
      });

      await expect(claudeClient.explainText('test')).rejects.toThrow('Persistent server error');
      expect(global.fetch).toHaveBeenCalledTimes(claudeClient.maxRetries);
    });
  });

  describe('Health check', () => {
    test('should return true for successful health check', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          content: [{ text: 'Health check response' }]
        })
      });

      const isHealthy = await claudeClient.healthCheck();
      expect(isHealthy).toBe(true);
    });

    test('should return false for failed health check', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const isHealthy = await claudeClient.healthCheck();
      expect(isHealthy).toBe(false);
    });

    test('should return false for network errors during health check', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const isHealthy = await claudeClient.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Request formatting', () => {
    test('should format request body correctly', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          content: [{ text: 'response' }]
        })
      });

      await claudeClient.explainText('test text');

      const [, requestInit] = global.fetch.mock.calls[0];
      const body = JSON.parse(requestInit.body);

      expect(body).toHaveProperty('model', claudeClient.model);
      expect(body).toHaveProperty('system');
      expect(body).toHaveProperty('messages');
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
      expect(body.messages[0].content).toContain('test text');
    });

    test('should include correct headers', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          content: [{ text: 'response' }]
        })
      });

      await claudeClient.explainText('test');

      const [, requestInit] = global.fetch.mock.calls[0];

      expect(requestInit.headers['x-api-key']).toBe(mockApiKey);
      expect(requestInit.headers['Content-Type']).toBe('application/json');
      expect(requestInit.headers['anthropic-version']).toBe('2023-06-01');
    });

    test('should include max_tokens', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          content: [{ text: 'response' }]
        })
      });

      await claudeClient.explainText('test');

      const [, requestInit] = global.fetch.mock.calls[0];
      const body = JSON.parse(requestInit.body);

      expect(body).toHaveProperty('max_tokens');
      expect(body.max_tokens).toBeGreaterThan(0);
    });
  });

  describe('Token management', () => {
    test('should estimate token count', () => {
      const text = 'This is a test text for token counting.';
      const tokenCount = claudeClient.estimateTokens(text);

      expect(tokenCount).toBeGreaterThan(0);
      expect(typeof tokenCount).toBe('number');
    });

    test('should truncate text that exceeds token limit', () => {
      const longText = 'word '.repeat(10000); // Should exceed typical limits
      const truncated = claudeClient.truncateText(longText, 1000);

      expect(truncated.length).toBeLessThan(longText.length);
      expect(truncated.endsWith('...')).toBe(true);
    });

    test('should not truncate text within limits', () => {
      const shortText = 'This is a short text.';
      const result = claudeClient.truncateText(shortText, 1000);

      expect(result).toBe(shortText);
    });
  });

  describe('Tier management', () => {
    test('should set free tier limits', () => {
      const freeClient = new ClaudeClient(mockApiKey, { tier: 'free' });

      expect(freeClient.tier).toBe('free');
      expect(freeClient.maxTokensPerRequest).toBe(4000);
      expect(freeClient.requestsPerMinute).toBe(5);
    });

    test('should set paid tier limits', () => {
      const paidClient = new ClaudeClient(mockApiKey, { tier: 'paid' });

      expect(paidClient.tier).toBe('paid');
      expect(paidClient.maxTokensPerRequest).toBeGreaterThan(4000);
      expect(paidClient.requestsPerMinute).toBeGreaterThan(5);
    });

    test('should validate tier names', () => {
      expect(() => {
        new ClaudeClient(mockApiKey, { tier: 'invalid' });
      }).toThrow('Invalid tier');
    });
  });
});