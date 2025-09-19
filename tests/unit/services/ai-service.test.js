/**
 * AI Service Unit Tests
 * Tests for AI service integration and explanation functionality
 */

const AIService = require('../../../src/services/ai-service.js');

// Mock the client implementations
jest.mock('../../../src/services/groq-client.js');
jest.mock('../../../src/services/claude-client.js');

describe('AIService', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default settings', () => {
      expect(aiService).toBeDefined();
      expect(aiService.groqClient).toBeDefined();
      expect(aiService.claudeClient).toBeDefined();
      expect(aiService.isEnabled).toBe(false);
    });

    test('should set initial provider preferences', () => {
      expect(aiService.preferredProvider).toBe('groq');
    });
  });

  describe('Enable/Disable functionality', () => {
    test('should enable AI service', async () => {
      await aiService.enable();
      expect(aiService.isEnabled).toBe(true);
    });

    test('should disable AI service', async () => {
      await aiService.enable();
      await aiService.disable();
      expect(aiService.isEnabled).toBe(false);
    });
  });

  describe('Text explanation', () => {
    beforeEach(async () => {
      await aiService.enable();
    });

    test('should throw error when disabled', async () => {
      await aiService.disable();

      await expect(
        aiService.explainText('test text')
      ).rejects.toThrow('AI Service is not enabled');
    });

    test('should handle empty text input', async () => {
      await expect(
        aiService.explainText('')
      ).rejects.toThrow('No text provided');

      await expect(
        aiService.explainText(null)
      ).rejects.toThrow('No text provided');
    });

    test('should use Groq as primary provider', async () => {
      const mockResponse = 'Test explanation';
      aiService.groqClient.explainText = jest.fn().mockResolvedValue(mockResponse);

      const result = await aiService.explainText('test text');

      expect(result).toBe(mockResponse);
      expect(aiService.groqClient.explainText).toHaveBeenCalledWith('test text', {});
    });

    test('should fallback to Claude when Groq fails', async () => {
      const mockResponse = 'Claude explanation';
      aiService.groqClient.explainText = jest.fn().mockRejectedValue(new Error('Groq failed'));
      aiService.claudeClient.explainText = jest.fn().mockResolvedValue(mockResponse);

      const result = await aiService.explainText('test text');

      expect(result).toBe(mockResponse);
      expect(aiService.groqClient.explainText).toHaveBeenCalled();
      expect(aiService.claudeClient.explainText).toHaveBeenCalledWith('test text', {});
    });

    test('should handle both providers failing', async () => {
      aiService.groqClient.explainText = jest.fn().mockRejectedValue(new Error('Groq failed'));
      aiService.claudeClient.explainText = jest.fn().mockRejectedValue(new Error('Claude failed'));

      await expect(
        aiService.explainText('test text')
      ).rejects.toThrow('All AI providers failed');
    });

    test('should pass options to providers', async () => {
      const options = { difficulty: 'beginner', context: 'scientific' };
      aiService.groqClient.explainText = jest.fn().mockResolvedValue('explanation');

      await aiService.explainText('test text', options);

      expect(aiService.groqClient.explainText).toHaveBeenCalledWith('test text', options);
    });
  });

  describe('Provider switching', () => {
    test('should switch preferred provider', async () => {
      await aiService.setPreferredProvider('claude');
      expect(aiService.preferredProvider).toBe('claude');
    });

    test('should validate provider names', async () => {
      await expect(
        aiService.setPreferredProvider('invalid')
      ).rejects.toThrow('Invalid provider');
    });

    test('should use Claude as primary when set', async () => {
      await aiService.enable();
      await aiService.setPreferredProvider('claude');

      const mockResponse = 'Claude explanation';
      aiService.claudeClient.explainText = jest.fn().mockResolvedValue(mockResponse);

      const result = await aiService.explainText('test text');

      expect(result).toBe(mockResponse);
      expect(aiService.claudeClient.explainText).toHaveBeenCalledWith('test text', {});
    });
  });

  describe('Settings management', () => {
    test('should load settings from storage', async () => {
      const mockSettings = {
        enabled: true,
        preferredProvider: 'claude',
        groqApiKey: 'test-groq-key',
        claudeApiKey: 'test-claude-key'
      };

      // Mock storage
      global.chrome = {
        storage: {
          sync: {
            get: jest.fn().mockImplementation((keys, callback) => {
              callback({ aiSettings: mockSettings });
            })
          }
        }
      };

      await aiService.loadSettings();

      expect(aiService.isEnabled).toBe(mockSettings.enabled);
      expect(aiService.preferredProvider).toBe(mockSettings.preferredProvider);
    });

    test('should save settings to storage', async () => {
      const mockSet = jest.fn();
      global.chrome = {
        storage: {
          sync: {
            set: mockSet
          }
        }
      };

      await aiService.enable();
      await aiService.setPreferredProvider('claude');
      await aiService.saveSettings();

      expect(mockSet).toHaveBeenCalledWith({
        aiSettings: expect.objectContaining({
          enabled: true,
          preferredProvider: 'claude'
        })
      });
    });
  });

  describe('Error handling', () => {
    test('should handle rate limiting gracefully', async () => {
      await aiService.enable();

      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.status = 429;

      aiService.groqClient.explainText = jest.fn().mockRejectedValue(rateLimitError);
      aiService.claudeClient.explainText = jest.fn().mockResolvedValue('fallback explanation');

      const result = await aiService.explainText('test text');

      expect(result).toBe('fallback explanation');
      expect(aiService.claudeClient.explainText).toHaveBeenCalled();
    });

    test('should handle network errors', async () => {
      await aiService.enable();

      const networkError = new Error('Network error');
      aiService.groqClient.explainText = jest.fn().mockRejectedValue(networkError);
      aiService.claudeClient.explainText = jest.fn().mockRejectedValue(networkError);

      await expect(
        aiService.explainText('test text')
      ).rejects.toThrow('All AI providers failed');
    });
  });

  describe('Status and diagnostics', () => {
    test('should return correct status', async () => {
      const status = aiService.getStatus();

      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('preferredProvider');
      expect(status).toHaveProperty('availableProviders');
      expect(status.availableProviders).toContain('groq');
      expect(status.availableProviders).toContain('claude');
    });

    test('should provide health check', async () => {
      await aiService.enable();

      aiService.groqClient.healthCheck = jest.fn().mockResolvedValue(true);
      aiService.claudeClient.healthCheck = jest.fn().mockResolvedValue(true);

      const health = await aiService.healthCheck();

      expect(health).toHaveProperty('groq');
      expect(health).toHaveProperty('claude');
      expect(health.groq).toBe(true);
      expect(health.claude).toBe(true);
    });
  });
});