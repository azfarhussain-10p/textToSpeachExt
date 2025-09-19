/**
 * Groq Client Unit Tests
 * Tests for Groq API integration with rate limiting
 */

const GroqClient = require('../../../src/services/groq-client.js');

// Mock fetch globally
global.fetch = jest.fn();

describe('GroqClient', () => {
  let groqClient;
  const mockApiKey = 'test-groq-api-key';

  beforeEach(() => {
    groqClient = new GroqClient(mockApiKey);
    jest.clearAllMocks();

    // Reset fetch mock
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with API key', () => {
      expect(groqClient).toBeDefined();
      expect(groqClient.apiKey).toBe(mockApiKey);
    });

    test('should throw error without API key', () => {
      expect(() => new GroqClient()).toThrow('Groq API key is required');
      expect(() => new GroqClient('')).toThrow('Groq API key is required');
    });

    test('should initialize rate limiter', () => {
      expect(groqClient.rateLimiter).toBeDefined();
    });

    test('should set default configuration', () => {
      expect(groqClient.baseURL).toBe('https://api.groq.com/openai/v1');
      expect(groqClient.model).toBe('llama-3.1-70b-versatile');
      expect(groqClient.maxRetries).toBe(3);
    });
  });

  describe('API configuration', () => {
    test('should allow model configuration', () => {
      const customClient = new GroqClient(mockApiKey, {
        model: 'llama-3.1-8b-instant'
      });
      expect(customClient.model).toBe('llama-3.1-8b-instant');
    });

    test('should allow base URL configuration', () => {
      const customClient = new GroqClient(mockApiKey, {
        baseURL: 'https://custom.groq.endpoint.com'
      });
      expect(customClient.baseURL).toBe('https://custom.groq.endpoint.com');
    });

    test('should allow retry configuration', () => {
      const customClient = new GroqClient(mockApiKey, {
        maxRetries: 5
      });
      expect(customClient.maxRetries).toBe(5);
    });
  });

  describe('Text explanation', () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'This is a test explanation.'
        }
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
      const result = await groqClient.explainText('test text');

      expect(result).toBe('This is a test explanation.');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('should handle empty text input', async () => {
      await expect(groqClient.explainText('')).rejects.toThrow('Text is required');
      await expect(groqClient.explainText(null)).rejects.toThrow('Text is required');
      await expect(groqClient.explainText(undefined)).rejects.toThrow('Text is required');
    });

    test('should include options in prompt', async () => {
      const options = {
        difficulty: 'beginner',
        context: 'scientific',
        language: 'simple'
      };

      await groqClient.explainText('test text', options);

      const callData = JSON.parse(global.fetch.mock.calls[0][1].body);
      const systemMessage = callData.messages[0].content;

      expect(systemMessage).toContain('beginner');
      expect(systemMessage).toContain('scientific');
      expect(systemMessage).toContain('simple');
    });

    test('should handle long text input', async () => {
      const longText = 'a'.repeat(10000);

      await groqClient.explainText(longText);

      const callData = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(callData.messages[1].content).toContain(longText);
    });
  });

  describe('Rate limiting', () => {
    test('should wait for rate limiter before making request', async () => {
      const waitSpy = jest.spyOn(groqClient.rateLimiter, 'waitForToken');
      waitSpy.mockResolvedValue();

      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'response' } }]
        })
      });

      await groqClient.explainText('test');

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

      await expect(groqClient.explainText('test')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Error handling', () => {
    test('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(groqClient.explainText('test')).rejects.toThrow('Network error');
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

      await expect(groqClient.explainText('test')).rejects.toThrow('Invalid request format');
    });

    test('should handle malformed responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      await expect(groqClient.explainText('test')).rejects.toThrow('Invalid response format');
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
            choices: [{ message: { content: 'Success after retries' } }]
          })
        });
      });

      const result = await groqClient.explainText('test');

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

      await expect(groqClient.explainText('test')).rejects.toThrow('Persistent server error');
      expect(global.fetch).toHaveBeenCalledTimes(groqClient.maxRetries);
    });
  });

  describe('Health check', () => {
    test('should return true for successful health check', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Health check response' } }]
        })
      });

      const isHealthy = await groqClient.healthCheck();
      expect(isHealthy).toBe(true);
    });

    test('should return false for failed health check', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const isHealthy = await groqClient.healthCheck();
      expect(isHealthy).toBe(false);
    });

    test('should return false for network errors during health check', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const isHealthy = await groqClient.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Authentication', () => {
    test('should include correct authorization header', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'response' } }]
        })
      });

      await groqClient.explainText('test');

      const [, requestInit] = global.fetch.mock.calls[0];
      expect(requestInit.headers.Authorization).toBe(`Bearer ${mockApiKey}`);
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

      await expect(groqClient.explainText('test')).rejects.toThrow('Invalid API key');
    });
  });

  describe('Request formatting', () => {
    test('should format request body correctly', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'response' } }]
        })
      });

      await groqClient.explainText('test text');

      const [, requestInit] = global.fetch.mock.calls[0];
      const body = JSON.parse(requestInit.body);

      expect(body).toHaveProperty('model', groqClient.model);
      expect(body).toHaveProperty('messages');
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[1].role).toBe('user');
      expect(body.messages[1].content).toContain('test text');
    });

    test('should include temperature and max_tokens', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'response' } }]
        })
      });

      await groqClient.explainText('test');

      const [, requestInit] = global.fetch.mock.calls[0];
      const body = JSON.parse(requestInit.body);

      expect(body).toHaveProperty('temperature');
      expect(body).toHaveProperty('max_tokens');
      expect(body.temperature).toBeGreaterThan(0);
      expect(body.max_tokens).toBeGreaterThan(0);
    });
  });
});