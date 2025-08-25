/**
 * API Manager for Intelligent TTS Extension
 * Handles AI API integration with Groq and Claude APIs
 */

export class APIManager {
    constructor() {
        this.groqClient = new GroqClient();
        this.claudeClient = new ClaudeClient();
        this.rateLimiter = new RateLimiter();
        this.isInitialized = false;
    }

    async initialize() {
        try {
            await this.groqClient.initialize();
            await this.claudeClient.initialize();
            this.isInitialized = true;
            console.log('API Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize API Manager:', error);
            throw error;
        }
    }

    async getExplanation(text, options = {}) {
        try {
            const { 
                language = 'en-US',
                provider = 'groq', // 'groq' or 'claude'
                complexity = 'simple', // 'simple', 'detailed', 'technical'
                context = 'general' // 'general', 'academic', 'business'
            } = options;

            // Try primary provider first
            let result;
            if (provider === 'groq') {
                result = await this.getGroqExplanation(text, { language, complexity, context });
            } else {
                result = await this.getClaudeExplanation(text, { language, complexity, context });
            }

            return result;
        } catch (error) {
            console.warn(`Primary provider (${options.provider || 'groq'}) failed, trying fallback:`, error);
            
            // Fallback to alternative provider
            try {
                if (options.provider === 'groq') {
                    return await this.getClaudeExplanation(text, options);
                } else {
                    return await this.getGroqExplanation(text, options);
                }
            } catch (fallbackError) {
                console.error('Both AI providers failed:', fallbackError);
                throw new Error('Unable to generate explanation. Please try again later.');
            }
        }
    }

    async getGroqExplanation(text, options = {}) {
        await this.rateLimiter.checkGroqLimit();
        return await this.groqClient.getExplanation(text, options);
    }

    async getClaudeExplanation(text, options = {}) {
        await this.rateLimiter.checkClaudeLimit();
        return await this.claudeClient.getExplanation(text, options);
    }
}

/**
 * Groq API Client
 */
class GroqClient {
    constructor() {
        this.baseURL = 'https://api.groq.com/openai/v1';
        this.apiKey = null;
        this.model = 'llama3-8b-8192';
    }

    async initialize() {
        this.apiKey = await this.getApiKey('groq');
        if (!this.apiKey) {
            throw new Error('Groq API key not configured');
        }
    }

    async getApiKey(provider) {
        try {
            const result = await chrome.storage.sync.get([`${provider}ApiKey`]);
            return result[`${provider}ApiKey`];
        } catch (error) {
            console.error('Failed to get API key:', error);
            return null;
        }
    }

    async getExplanation(text, options = {}) {
        const prompt = this.buildPrompt(text, options);
        
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant that provides clear, accurate explanations of text content. Always respond in the requested language and complexity level.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.3,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return {
                provider: 'groq',
                explanation: data.choices[0].message.content,
                model: this.model,
                usage: data.usage
            };
        } catch (error) {
            console.error('Groq API request failed:', error);
            throw error;
        }
    }

    buildPrompt(text, options) {
        const { language, complexity, context } = options;
        const languageMap = {
            'en-US': 'English',
            'es-ES': 'Spanish',
            'fr-FR': 'French',
            'de-DE': 'German',
            'it-IT': 'Italian',
            'pt-BR': 'Portuguese',
            'ru-RU': 'Russian',
            'zh-CN': 'Chinese',
            'ja-JP': 'Japanese',
            'ko-KR': 'Korean',
            'ar-SA': 'Arabic',
            'hi-IN': 'Hindi',
            'ur-PK': 'Urdu'
        };

        const targetLanguage = languageMap[language] || 'English';
        
        let complexityInstruction = '';
        switch (complexity) {
            case 'simple':
                complexityInstruction = 'Explain in simple terms that anyone can understand.';
                break;
            case 'detailed':
                complexityInstruction = 'Provide a detailed explanation with examples.';
                break;
            case 'technical':
                complexityInstruction = 'Give a technical explanation with precise terminology.';
                break;
        }

        let contextInstruction = '';
        switch (context) {
            case 'academic':
                contextInstruction = 'Frame the explanation in an academic context.';
                break;
            case 'business':
                contextInstruction = 'Provide a business-oriented explanation.';
                break;
        }

        return `Please explain the following text in ${targetLanguage}. ${complexityInstruction} ${contextInstruction}

Text to explain: "${text}"

Provide a clear, concise explanation that helps the reader understand the meaning and context of this text.`;
    }
}

/**
 * Claude API Client
 */
class ClaudeClient {
    constructor() {
        this.baseURL = 'https://api.anthropic.com/v1';
        this.apiKey = null;
        this.model = 'claude-3-sonnet-20240229';
    }

    async initialize() {
        this.apiKey = await this.getApiKey('claude');
        if (!this.apiKey) {
            throw new Error('Claude API key not configured');
        }
    }

    async getApiKey(provider) {
        try {
            const result = await chrome.storage.sync.get([`${provider}ApiKey`]);
            return result[`${provider}ApiKey`];
        } catch (error) {
            console.error('Failed to get API key:', error);
            return null;
        }
    }

    async getExplanation(text, options = {}) {
        const prompt = this.buildPrompt(text, options);
        
        try {
            const response = await fetch(`${this.baseURL}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 500,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`Claude API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return {
                provider: 'claude',
                explanation: data.content[0].text,
                model: this.model,
                usage: data.usage
            };
        } catch (error) {
            console.error('Claude API request failed:', error);
            throw error;
        }
    }

    buildPrompt(text, options) {
        const { language, complexity, context } = options;
        const languageMap = {
            'en-US': 'English',
            'es-ES': 'Spanish',
            'fr-FR': 'French',
            'de-DE': 'German',
            'it-IT': 'Italian',
            'pt-BR': 'Portuguese',
            'ru-RU': 'Russian',
            'zh-CN': 'Chinese',
            'ja-JP': 'Japanese',
            'ko-KR': 'Korean',
            'ar-SA': 'Arabic',
            'hi-IN': 'Hindi',
            'ur-PK': 'Urdu'
        };

        const targetLanguage = languageMap[language] || 'English';
        
        let complexityInstruction = '';
        switch (complexity) {
            case 'simple':
                complexityInstruction = 'Use simple language and basic concepts.';
                break;
            case 'detailed':
                complexityInstruction = 'Provide comprehensive details and examples.';
                break;
            case 'technical':
                complexityInstruction = 'Use technical terminology and precise definitions.';
                break;
        }

        let contextInstruction = '';
        switch (context) {
            case 'academic':
                contextInstruction = 'Approach from an academic perspective.';
                break;
            case 'business':
                contextInstruction = 'Focus on business applications and implications.';
                break;
        }

        return `Please explain the following text in ${targetLanguage}. ${complexityInstruction} ${contextInstruction}

Text: "${text}"

Provide a clear explanation that helps understand the meaning, context, and significance of this text.`;
    }
}

/**
 * Rate Limiter for API calls
 */
class RateLimiter {
    constructor() {
        this.groqLimits = {
            requestsPerHour: 100,
            requestsCount: 0,
            resetTime: Date.now() + 3600000 // 1 hour from now
        };
        
        this.claudeLimits = {
            requestsPerMinute: 60,
            requestsCount: 0,
            resetTime: Date.now() + 60000 // 1 minute from now
        };
        
        this.loadLimits();
    }

    async loadLimits() {
        try {
            const stored = await chrome.storage.local.get(['groqLimits', 'claudeLimits']);
            if (stored.groqLimits) {
                this.groqLimits = { ...this.groqLimits, ...stored.groqLimits };
            }
            if (stored.claudeLimits) {
                this.claudeLimits = { ...this.claudeLimits, ...stored.claudeLimits };
            }
        } catch (error) {
            console.error('Failed to load rate limits:', error);
        }
    }

    async saveLimits() {
        try {
            await chrome.storage.local.set({
                groqLimits: this.groqLimits,
                claudeLimits: this.claudeLimits
            });
        } catch (error) {
            console.error('Failed to save rate limits:', error);
        }
    }

    async checkGroqLimit() {
        const now = Date.now();
        
        if (now > this.groqLimits.resetTime) {
            this.groqLimits.requestsCount = 0;
            this.groqLimits.resetTime = now + 3600000; // Reset for next hour
        }
        
        if (this.groqLimits.requestsCount >= this.groqLimits.requestsPerHour) {
            throw new Error('Groq API rate limit exceeded. Please try again later.');
        }
        
        this.groqLimits.requestsCount++;
        await this.saveLimits();
    }

    async checkClaudeLimit() {
        const now = Date.now();
        
        if (now > this.claudeLimits.resetTime) {
            this.claudeLimits.requestsCount = 0;
            this.claudeLimits.resetTime = now + 60000; // Reset for next minute
        }
        
        if (this.claudeLimits.requestsCount >= this.claudeLimits.requestsPerMinute) {
            throw new Error('Claude API rate limit exceeded. Please try again later.');
        }
        
        this.claudeLimits.requestsCount++;
        await this.saveLimits();
    }

    getRemainingRequests() {
        const now = Date.now();
        
        return {
            groq: {
                remaining: Math.max(0, this.groqLimits.requestsPerHour - this.groqLimits.requestsCount),
                resetTime: this.groqLimits.resetTime,
                resetIn: Math.max(0, this.groqLimits.resetTime - now)
            },
            claude: {
                remaining: Math.max(0, this.claudeLimits.requestsPerMinute - this.claudeLimits.requestsCount),
                resetTime: this.claudeLimits.resetTime,
                resetIn: Math.max(0, this.claudeLimits.resetTime - now)
            }
        };
    }
}