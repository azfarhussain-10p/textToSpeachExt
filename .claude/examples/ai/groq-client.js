/**
 * groq-client.js - Comprehensive Groq API Client for Free AI Model Integration
 * 
 * Provides a simple interface for Groq API interactions, supporting chat completions,
 * function calling, and error handling. Designed for browser and Node.js environments.
 * 
 * Usage:
 * - Initialize: const client = new GroqClient({ apiKey: 'your-key', model: 'llama-3.3-70b-versatile' });
 * - Chat: await client.chat({ messages: [{ role: 'user', content: 'Hello!' }] });
 * - Function Call: await client.callFunction({ messages: [...], tools: [...] });
 * 
 * Requires GROQ_API_KEY from environment or constructor.
 */

class GroqClient {
  constructor(options = {}) {
    this.options = {
      apiKey: process?.env?.GROQ_API_KEY || options.apiKey,
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      onError: (err) => console.error('GroqClient Error:', err),
      ...options
    };

    if (!this.options.apiKey) {
      throw new Error('GROQ_API_KEY is required');
    }

    this.headers = {
      'Authorization': `Bearer ${this.options.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Performs a chat completion request.
   * @param {Object} params - { messages: [{ role, content, ... }], max_tokens, temperature, ... }
   * @returns {Promise<Object>} Response with { content, role, finish_reason }
   */
  async chat(params) {
    const body = {
      model: this.options.model,
      messages: params.messages,
      max_tokens: params.max_tokens || 1024,
      temperature: params.temperature || 0.7,
      ...params
    };

    return this._fetchWithRetry('/chat/completions', body);
  }

  /**
   * Performs a function calling request with tool integration.
   * @param {Object} params - { messages, tools: [{ name, description, parameters }], tool_choice }
   * @returns {Promise<Object>} Response with tool call results or content
   */
  async callFunction(params) {
    const body = {
      model: this.options.model,
      messages: params.messages,
      tools: params.tools,
      tool_choice: params.tool_choice || 'auto',
      max_tokens: params.max_tokens || 1024
    };

    const response = await this._fetchWithRetry('/chat/completions', body);
    if (response.choices[0].message.tool_calls) {
      return this._handleToolCalls(response.choices[0].message.tool_calls, params.tools);
    }
    return response.choices[0].message;
  }

  /**
   * Internal method to handle tool calls.
   * @param {Array} toolCalls - Array of tool call objects
   * @param {Array} tools - Available tools
   * @returns {Promise<Object>} Tool execution results
   */
  async _handleToolCalls(toolCalls, tools) {
    const results = [];
    for (const call of toolCalls) {
      const tool = tools.find(t => t.name === call.function.name);
      if (tool && tool.handler) {
        try {
          const args = JSON.parse(call.function.arguments);
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
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        return await response.json();
      } catch (error) {
        attempts++;
        if (attempts >= this.options.maxRetries) {
          this.options.onError(error);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay * attempts));
      }
    }
  }

  /**
   * Sets a new API key.
   * @param {string} apiKey
   */
  setApiKey(apiKey) {
    this.options.apiKey = apiKey;
    this.headers['Authorization'] = `Bearer ${apiKey}`;
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
  module.exports = GroqClient;
} else {
  window.GroqClient = GroqClient;
}

// Example usage:
// const client = new GroqClient({ apiKey: 'your-key' });
// client.chat({ messages: [{ role: 'user', content: 'Hello!' }] })
//   .then(res => console.log(res.choices[0].message.content))
//   .catch(err => console.error(err));