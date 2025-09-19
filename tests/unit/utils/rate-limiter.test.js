/**
 * Rate Limiter Unit Tests
 * Tests for token bucket rate limiting implementation
 */

const { RateLimiter } = require('../../../src/utils/rate-limiter.js');

// Mock timers for testing
jest.useFakeTimers();

describe('RateLimiter', () => {
  let rateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      tokensPerSecond: 2,
      maxTokens: 5
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Constructor', () => {
    test('should initialize with default parameters', () => {
      const defaultLimiter = new RateLimiter();

      expect(defaultLimiter.tokensPerSecond).toBe(1);
      expect(defaultLimiter.maxTokens).toBe(10);
    });

    test('should initialize with custom parameters', () => {
      const customLimiter = new RateLimiter({
        tokensPerSecond: 5,
        maxTokens: 20
      });

      expect(customLimiter.tokensPerSecond).toBe(5);
      expect(customLimiter.maxTokens).toBe(20);
    });

    test('should start with full bucket', () => {
      expect(rateLimiter.tokens).toBe(5);
    });

    test('should record last refill time', () => {
      expect(rateLimiter.lastRefill).toBeCloseTo(Date.now(), -2);
    });
  });

  describe('Token refill', () => {
    test('should refill tokens based on elapsed time', () => {
      rateLimiter.tokens = 0;

      // Simulate 2 seconds passing
      jest.advanceTimersByTime(2000);
      rateLimiter.refillTokens();

      // Should add 4 tokens (2 seconds * 2 tokens/second)
      expect(rateLimiter.tokens).toBe(4);
    });

    test('should not exceed maximum tokens', () => {
      rateLimiter.tokens = 3;

      // Simulate 10 seconds passing (would add 20 tokens)
      jest.advanceTimersByTime(10000);
      rateLimiter.refillTokens();

      // Should cap at maxTokens (5)
      expect(rateLimiter.tokens).toBe(5);
    });

    test('should handle partial seconds correctly', () => {
      rateLimiter.tokens = 0;

      // Simulate 0.5 seconds passing
      jest.advanceTimersByTime(500);
      rateLimiter.refillTokens();

      // Should add 1 token (0.5 seconds * 2 tokens/second)
      expect(rateLimiter.tokens).toBe(1);
    });

    test('should not refill if no time has passed', () => {
      const initialTokens = rateLimiter.tokens;
      rateLimiter.refillTokens();

      expect(rateLimiter.tokens).toBe(initialTokens);
    });
  });

  describe('Token consumption', () => {
    test('should allow request when tokens available', async () => {
      const result = await rateLimiter.waitForToken();

      expect(result).toBe(true);
      expect(rateLimiter.tokens).toBe(4); // 5 - 1
    });

    test('should allow multiple requests with available tokens', async () => {
      await rateLimiter.waitForToken();
      await rateLimiter.waitForToken();
      await rateLimiter.waitForToken();

      expect(rateLimiter.tokens).toBe(2); // 5 - 3
    });

    test('should wait when no tokens available', async () => {
      // Consume all tokens
      rateLimiter.tokens = 0;

      Date.now();
      const promise = rateLimiter.waitForToken();

      // Should not resolve immediately
      let resolved = false;
      promise.then(() => { resolved = true; });

      await Promise.resolve(); // Let promises resolve
      expect(resolved).toBe(false);

      // Advance time to refill tokens
      jest.advanceTimersByTime(500); // 0.5 seconds -> 1 token

      await promise;
      expect(resolved).toBe(true);
    });

    test('should handle concurrent requests', async () => {
      // Start with 2 tokens
      rateLimiter.tokens = 2;

      const promises = [
        rateLimiter.waitForToken(),
        rateLimiter.waitForToken(),
        rateLimiter.waitForToken() // This one should wait
      ];

      // First two should resolve immediately
      await Promise.all(promises.slice(0, 2));
      expect(rateLimiter.tokens).toBe(0);

      // Third should still be pending
      let thirdResolved = false;
      promises[2].then(() => { thirdResolved = true; });

      await Promise.resolve();
      expect(thirdResolved).toBe(false);

      // Advance time to allow third request
      jest.advanceTimersByTime(500);
      await promises[2];
      expect(thirdResolved).toBe(true);
    });
  });

  describe('Queue management', () => {
    test('should process queue in order', async () => {
      rateLimiter.tokens = 0;

      const results = [];
      const promises = [
        rateLimiter.waitForToken().then(() => results.push('first')),
        rateLimiter.waitForToken().then(() => results.push('second')),
        rateLimiter.waitForToken().then(() => results.push('third'))
      ];

      // Advance time to fulfill all requests
      jest.advanceTimersByTime(1500); // 1.5 seconds -> 3 tokens

      await Promise.all(promises);

      expect(results).toEqual(['first', 'second', 'third']);
    });

    test('should handle queue clearing', () => {
      rateLimiter.tokens = 0;

      // Add some pending requests
      rateLimiter.waitForToken();
      rateLimiter.waitForToken();

      expect(rateLimiter.queue.length).toBe(2);

      rateLimiter.clearQueue();
      expect(rateLimiter.queue.length).toBe(0);
    });
  });

  describe('Status and diagnostics', () => {
    test('should return current status', () => {
      rateLimiter.tokens = 3;
      rateLimiter.waitForToken(); // Add one to queue

      const status = rateLimiter.getStatus();

      expect(status).toEqual({
        tokens: 2, // 3 - 1 consumed
        maxTokens: 5,
        tokensPerSecond: 2,
        queueLength: 0, // Request was processed immediately
        lastRefill: expect.any(Number)
      });
    });

    test('should show queue length correctly', async () => {
      rateLimiter.tokens = 0;

      // Add requests that will be queued
      rateLimiter.waitForToken();
      rateLimiter.waitForToken();

      const status = rateLimiter.getStatus();
      expect(status.queueLength).toBe(2);
    });

    test('should estimate wait time', () => {
      rateLimiter.tokens = 0;

      const waitTime = rateLimiter.getEstimatedWaitTime();

      // Should be approximately 0.5 seconds (1 token / 2 tokens per second)
      expect(waitTime).toBeCloseTo(500, -1);
    });

    test('should return zero wait time when tokens available', () => {
      rateLimiter.tokens = 3;

      const waitTime = rateLimiter.getEstimatedWaitTime();
      expect(waitTime).toBe(0);
    });
  });

  describe('Configuration updates', () => {
    test('should allow updating tokens per second', () => {
      rateLimiter.updateConfiguration({
        tokensPerSecond: 10
      });

      expect(rateLimiter.tokensPerSecond).toBe(10);
    });

    test('should allow updating max tokens', () => {
      rateLimiter.updateConfiguration({
        maxTokens: 20
      });

      expect(rateLimiter.maxTokens).toBe(20);
    });

    test('should refill immediately after configuration change', () => {
      rateLimiter.tokens = 0;

      jest.advanceTimersByTime(1000);
      rateLimiter.updateConfiguration({
        tokensPerSecond: 5
      });

      // Should refill based on elapsed time with new rate
      expect(rateLimiter.tokens).toBeGreaterThan(0);
    });

    test('should cap tokens at new maximum', () => {
      rateLimiter.tokens = 5; // Currently at max

      rateLimiter.updateConfiguration({
        maxTokens: 3
      });

      expect(rateLimiter.tokens).toBe(3);
    });
  });

  describe('Persistence', () => {
    test('should save state to storage', async () => {
      const mockStorage = {
        setLocal: jest.fn()
      };

      rateLimiter.tokens = 3;
      await rateLimiter.saveState(mockStorage, 'test-limiter');

      expect(mockStorage.setLocal).toHaveBeenCalledWith('test-limiter', {
        tokens: 3,
        lastRefill: expect.any(Number)
      });
    });

    test('should load state from storage', async () => {
      const mockStorage = {
        getLocal: jest.fn().mockResolvedValue({
          tokens: 2,
          lastRefill: Date.now() - 1000
        })
      };

      await rateLimiter.loadState(mockStorage, 'test-limiter');

      expect(rateLimiter.tokens).toBeGreaterThanOrEqual(2); // May have refilled
    });

    test('should handle missing stored state', async () => {
      const mockStorage = {
        getLocal: jest.fn().mockResolvedValue(null)
      };

      const initialTokens = rateLimiter.tokens;
      await rateLimiter.loadState(mockStorage, 'test-limiter');

      expect(rateLimiter.tokens).toBe(initialTokens); // Should remain unchanged
    });
  });

  describe('Error handling', () => {
    test('should handle invalid configuration gracefully', () => {
      expect(() => {
        new RateLimiter({
          tokensPerSecond: -1
        });
      }).toThrow('Tokens per second must be positive');

      expect(() => {
        new RateLimiter({
          maxTokens: 0
        });
      }).toThrow('Max tokens must be positive');
    });

    test('should handle timer errors gracefully', async () => {
      // Mock setTimeout to throw
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation(() => {
        throw new Error('Timer error');
      });

      rateLimiter.tokens = 0;

      // Should not throw and should handle error gracefully
      await expect(rateLimiter.waitForToken()).rejects.toThrow('Timer error');

      global.setTimeout = originalSetTimeout;
    });
  });
});