/**
 * claude-client.js - Comprehensive Claude API Client for Paid AI Service Integration
 * 
 * Provides a robust interface for Claude API interactions, supporting chat completions,
 * function calling, and vision processing. Designed for browser and Node.js environments.
 * 
 * Usage:
 * - Initialize: const client = new ClaudeClient({ apiKey: 'your-key', model: 'claude-3-5-sonnet-20241022' });
 * - Chat: await client.chat({ messages: [{ role: 'user', content: 'Hello!' }] });
 * - Function Call: await client.callFunction({ messages: [...], tools: [...] });
 * - Vision: await client.processImage({ messages: [{ role: 'user', content: [{ type: 'text', text: 'Describe this' }, { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: '...' } }] }] });
 * 
 * Requires ANTHROPIC_API_KEY from environment or constructor.
 */

class ClaudeClient {
  constructor(options = {}) {
    this.options = {
      apiKey: process?.env?.ANTHROPIC_API_KEY || options.apiKey,
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-5-sonnet-20241022',
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      anthropicVersion: '2023-06-01',
      onError: (err) => console.error('ClaudeClient Error:', err),
      ...options
    };

    if (!this.options.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.headers = {
      'x-api-key': this.options.apiKey,
      'content-type': 'application/json',
      'anthropic-version': this.options.anthropicVersion
    };
  }

  /**
   * Performs a chat completion request.
   * @param {Object} params - { messages: [{ role, content }], max_tokens, temperature, ... }
   * @returns {Promise<Object>} Response with { content, role, stop_reason }
   */
  async chat(params) {
    const body = {
      model: this.options.model,
      messages: params.messages,
      max_tokens: params.max_tokens || 1024,
      temperature: params.temperature || 0.7,
      ...params
    };

    const response = await this._fetchWithRetry('/messages', body);
    return response.content[0].text;
  }

  /**
   * Performs a function calling request with tool integration.
   * @param {Object} params - { messages, tools: [{ name, description, input_schema }], tool_choice }
   * @returns {Promise<Object>} Response with tool call results or content
   */
  async callFunction(params) {
    const body = {
      model: this.options.model,
      messages: params.messages,
      tools: params.tools,
      tool_choice: params.tool_choice || { type: 'auto' },
      max_tokens: params.max_tokens || 1024
    };

    const response = await this._fetchWithRetry('/messages', body);
    if (response.content.some(item => item.type === 'tool_use')) {
      return this._handleToolCalls(response.content.filter(item => item.type === 'tool_use'), params.tools);
    }
    return response.content[0].text;
  }

  /**
   * Processes image inputs with text prompts.
   * @param {Object} params - { messages: [{ role, content: [{ type: 'text', text }, { type: 'image', source }] }], max_tokens }
   * @returns {Promise<Object>} Response with processed content
   */
  async processImage(params) {
    const body = {
      model: this.options.model,
      messages: params.messages,
      max_tokens: params.max_tokens || 1024
    };

    const response = await this._fetchWithRetry('/messages', body);
    return response.content[0].text;
  }

  /**
   * Internal method to handle tool calls.
   * @param {Array} toolCalls - Array of tool use objects
   * @param {Array} tools - Available tools
   * @returns {Promise<Object>} Tool execution results
   */
  async _handleToolCalls(toolCalls, tools) {
    const results = [];
    for (const call of toolCalls) {
      const tool = tools.find(t => t.name === call.name);
      if (tool && tool.handler) {
        try {
          const args = call.input;
          const result = await tool.handler(args);
          results.push({ tool_call_id: call.id, result });
        } catch (error) {
          results.push({ tool_call_id: call.id, error: error.message });
        }
      }
    }
    return results;
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

        const response = await fetch(`${this.options.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        attempts++;
        if (attempts >= this.options.maxRetries || error.name === 'AbortError') {
          this.options.onError(error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay * Math.pow(2, attempts)));
      }
    }
  }

  /**
   * Sets a new API key.
   * @param {string} apiKey
   */
  setApiKey(apiKey) {
    this.options.apiKey = apiKey;
    this.headers['x-api-key'] = apiKey;
  }

  /**
   * Sets a new model.
   * @param {string} model
   */
  setModel(model) {
    this.options.model = model;
  }
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaudeClient;
} else {
  window.ClaudeClient = ClaudeClient;
}

// Example usage:
// const client = new ClaudeClient({ apiKey: 'your-key' });
// client.chat({ messages: [{ role: 'user', content: 'Hello!' }] })
//   .then(res => console.log(res))
//   .catch(err => console.error(err));