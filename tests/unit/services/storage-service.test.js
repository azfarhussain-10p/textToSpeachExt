/**
 * Storage Service Unit Tests
 * Tests for cross-browser storage abstraction layer
 */

const StorageService = require('../../../src/services/storage-service.js');

describe('StorageService', () => {
  let storageService;
  let mockChromeStorage;
  let mockBrowserStorage;

  beforeEach(() => {
    // Mock Chrome API
    mockChromeStorage = {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      },
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      }
    };

    // Mock Browser API (Firefox)
    mockBrowserStorage = {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      },
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      }
    };

    global.chrome = { storage: mockChromeStorage };
    global.browser = { storage: mockBrowserStorage };

    storageService = new StorageService();
  });

  afterEach(() => {
    delete global.chrome;
    delete global.browser;
    jest.resetAllMocks();
  });

  describe('Constructor and browser detection', () => {
    test('should detect Chrome environment', () => {
      delete global.browser;
      const service = new StorageService();
      expect(service.storageAPI).toBe(global.chrome);
    });

    test('should detect Firefox environment', () => {
      delete global.chrome;
      const service = new StorageService();
      expect(service.storageAPI).toBe(global.browser);
    });

    test('should handle no browser APIs available', () => {
      delete global.chrome;
      delete global.browser;
      expect(() => new StorageService()).toThrow('Browser storage API not available');
    });
  });

  describe('Sync storage operations', () => {
    describe('get operations', () => {
      test('should get single value from sync storage', async () => {
        const testData = { testKey: 'testValue' };
        mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
          callback(testData);
        });

        const result = await storageService.get('testKey');
        expect(result).toBe('testValue');
        expect(mockChromeStorage.sync.get).toHaveBeenCalledWith(['testKey'], expect.any(Function));
      });

      test('should get multiple values from sync storage', async () => {
        const testData = { key1: 'value1', key2: 'value2' };
        mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
          callback(testData);
        });

        const result = await storageService.get(['key1', 'key2']);
        expect(result).toEqual(testData);
        expect(mockChromeStorage.sync.get).toHaveBeenCalledWith(['key1', 'key2'], expect.any(Function));
      });

      test('should return null for non-existent key', async () => {
        mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
          callback({});
        });

        const result = await storageService.get('nonExistentKey');
        expect(result).toBeNull();
      });

      test('should handle Firefox promise-based API', async () => {
        delete global.chrome;
        const service = new StorageService();

        const testData = { testKey: 'testValue' };
        mockBrowserStorage.sync.get.mockResolvedValue(testData);

        const result = await service.get('testKey');
        expect(result).toBe('testValue');
        expect(mockBrowserStorage.sync.get).toHaveBeenCalledWith(['testKey']);
      });
    });

    describe('set operations', () => {
      test('should set single value in sync storage', async () => {
        mockChromeStorage.sync.set.mockImplementation((data, callback) => {
          callback();
        });

        await storageService.set('testKey', 'testValue');
        expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
          { testKey: 'testValue' },
          expect.any(Function)
        );
      });

      test('should set multiple values in sync storage', async () => {
        const testData = { key1: 'value1', key2: 'value2' };
        mockChromeStorage.sync.set.mockImplementation((data, callback) => {
          callback();
        });

        await storageService.set(testData);
        expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(testData, expect.any(Function));
      });

      test('should handle Firefox promise-based set', async () => {
        delete global.chrome;
        const service = new StorageService();

        mockBrowserStorage.sync.set.mockResolvedValue();

        await service.set('testKey', 'testValue');
        expect(mockBrowserStorage.sync.set).toHaveBeenCalledWith({ testKey: 'testValue' });
      });
    });

    describe('remove operations', () => {
      test('should remove single key from sync storage', async () => {
        mockChromeStorage.sync.remove.mockImplementation((keys, callback) => {
          callback();
        });

        await storageService.remove('testKey');
        expect(mockChromeStorage.sync.remove).toHaveBeenCalledWith(['testKey'], expect.any(Function));
      });

      test('should remove multiple keys from sync storage', async () => {
        mockChromeStorage.sync.remove.mockImplementation((keys, callback) => {
          callback();
        });

        await storageService.remove(['key1', 'key2']);
        expect(mockChromeStorage.sync.remove).toHaveBeenCalledWith(['key1', 'key2'], expect.any(Function));
      });
    });
  });

  describe('Local storage operations', () => {
    test('should get from local storage', async () => {
      const testData = { localKey: 'localValue' };
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      const result = await storageService.getLocal('localKey');
      expect(result).toBe('localValue');
      expect(mockChromeStorage.local.get).toHaveBeenCalledWith(['localKey'], expect.any(Function));
    });

    test('should set to local storage', async () => {
      mockChromeStorage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      await storageService.setLocal('localKey', 'localValue');
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(
        { localKey: 'localValue' },
        expect.any(Function)
      );
    });

    test('should remove from local storage', async () => {
      mockChromeStorage.local.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await storageService.removeLocal('localKey');
      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith(['localKey'], expect.any(Function));
    });
  });

  describe('Clear operations', () => {
    test('should clear sync storage', async () => {
      mockChromeStorage.sync.clear.mockImplementation((callback) => {
        callback();
      });

      await storageService.clear();
      expect(mockChromeStorage.sync.clear).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should clear local storage', async () => {
      mockChromeStorage.local.clear.mockImplementation((callback) => {
        callback();
      });

      await storageService.clearLocal();
      expect(mockChromeStorage.local.clear).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('High-level settings operations', () => {
    test('should get TTS settings', async () => {
      const mockSettings = {
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      };

      mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
        callback({ ttsSettings: mockSettings });
      });

      const result = await storageService.getTTSSettings();
      expect(result).toEqual(mockSettings);
    });

    test('should save TTS settings', async () => {
      const settings = {
        voice: 'custom voice',
        rate: 1.2,
        pitch: 0.8,
        volume: 0.9
      };

      mockChromeStorage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      await storageService.saveTTSSettings(settings);
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        { ttsSettings: settings },
        expect.any(Function)
      );
    });

    test('should get AI settings', async () => {
      const mockSettings = {
        enabled: true,
        preferredProvider: 'groq',
        groqApiKey: 'test-key'
      };

      mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
        callback({ aiSettings: mockSettings });
      });

      const result = await storageService.getAISettings();
      expect(result).toEqual(mockSettings);
    });

    test('should save AI settings', async () => {
      const settings = {
        enabled: false,
        preferredProvider: 'claude',
        claudeApiKey: 'test-claude-key'
      };

      mockChromeStorage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      await storageService.saveAISettings(settings);
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        { aiSettings: settings },
        expect.any(Function)
      );
    });
  });

  describe('Error handling', () => {
    test('should handle storage get errors', async () => {
      mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
        // Simulate Chrome error
        global.chrome.runtime = { lastError: { message: 'Storage error' } };
        callback({});
      });

      await expect(storageService.get('testKey')).rejects.toThrow('Storage error');
    });

    test('should handle storage set errors', async () => {
      mockChromeStorage.sync.set.mockImplementation((data, callback) => {
        global.chrome.runtime = { lastError: { message: 'Storage quota exceeded' } };
        callback();
      });

      await expect(storageService.set('testKey', 'testValue')).rejects.toThrow('Storage quota exceeded');
    });

    test('should handle Firefox promise rejections', async () => {
      delete global.chrome;
      const service = new StorageService();

      mockBrowserStorage.sync.get.mockRejectedValue(new Error('Firefox storage error'));

      await expect(service.get('testKey')).rejects.toThrow('Firefox storage error');
    });
  });

  describe('Utility methods', () => {
    test('should check if key exists', async () => {
      mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
        callback({ existingKey: 'value' });
      });

      const exists = await storageService.has('existingKey');
      const notExists = await storageService.has('nonExistentKey');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    test('should get all keys', async () => {
      const testData = { key1: 'value1', key2: 'value2', key3: 'value3' };
      mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      const keys = await storageService.getAllKeys();
      expect(keys).toEqual(['key1', 'key2', 'key3']);
    });

    test('should get storage size estimate', async () => {
      const testData = { key1: 'value1', key2: 'value2' };
      mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      const size = await storageService.getStorageSize();
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });
  });
});