#!/bin/bash
# AI Service Integration Validator for TTS Extension
# Validates Groq, Claude, and OpenAI API integrations

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Only process AI-related files
if [[ "$file_path" != *"ai"* ]] && [[ "$file_path" != *"groq"* ]] && [[ "$file_path" != *"claude"* ]] && [[ "$file_path" != *"openai"* ]] && [[ "$file_path" != *"service"* ]]; then
    echo "{}"
    exit 0
fi

# Logging setup
mkdir -p .claude/logs
log_file=".claude/logs/ai-service-validation.log"

log_event() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$log_file"
}

log_event "Validating AI service in: $file_path"

# Security checks
check_api_key_security() {
    # Check for hardcoded API keys (major security issue)
    if grep -E '(sk-[a-zA-Z0-9]{48}|gsk_[a-zA-Z0-9]{56}|anthropic_[a-zA-Z0-9]{40})' "$file_path" 2>/dev/null; then
        log_event "CRITICAL: Hardcoded API key detected!"
        echo '{"action": "block", "message": "🚨 SECURITY ALERT: API key detected in code! Never hardcode API keys. Use environment variables or chrome.storage.sync"}'
        exit 0
    fi
    
    # Check for API key in comments (still risky)
    if grep -E '//.*?(sk-|gsk_|anthropic_)' "$file_path" 2>/dev/null; then
        echo '{"action": "warn", "message": "⚠️ API key found in comments. Remove before committing"}'
    fi
}

# Rate limiting implementation check
check_rate_limiting() {
    if grep -q 'fetch.*api\.(groq|anthropic|openai)' "$file_path" 2>/dev/null; then
        has_rate_limit=false
        
        # Check for rate limiting patterns
        if grep -E '(rate|limit|throttle|queue|delay|debounce|RateLimiter)' "$file_path" 2>/dev/null; then
            has_rate_limit=true
        fi
        
        if [ "$has_rate_limit" = false ]; then
            log_event "WARNING: No rate limiting detected for AI API calls"
            echo '{"action": "warn", "message": "📊 AI API Rate Limits:\n• Groq: 100 req/hour (free tier)\n• Claude: 60 req/minute\n• OpenAI: 60 req/minute\nImplement rate limiting to avoid hitting limits"}'
        fi
    fi
}

# Error handling check
check_error_handling() {
    if grep -q 'fetch.*api\.' "$file_path" 2>/dev/null; then
        has_error_handling=false
        
        # Check for try-catch or .catch()
        if grep -E '(try.*{|\.catch\(|\.then\(.*,)' "$file_path" 2>/dev/null; then
            has_error_handling=true
        fi
        
        if [ "$has_error_handling" = false ]; then
            echo '{"action": "warn", "message": "🔧 Add error handling for AI API calls. Handle network errors, rate limits, and API failures gracefully"}'
        fi
    fi
}

# Fallback mechanism check
check_fallback_mechanism() {
    # Check if multiple AI services are configured (for fallback)
    has_groq=false
    has_claude=false
    has_openai=false
    
    if grep -q 'groq' "$file_path" 2>/dev/null; then
        has_groq=true
    fi
    if grep -q 'anthropic\|claude' "$file_path" 2>/dev/null; then
        has_claude=true
    fi
    if grep -q 'openai' "$file_path" 2>/dev/null; then
        has_openai=true
    fi
    
    # Count how many services are configured
    service_count=0
    [ "$has_groq" = true ] && ((service_count++))
    [ "$has_claude" = true ] && ((service_count++))
    [ "$has_openai" = true ] && ((service_count++))
    
    if [ "$service_count" -eq 1 ]; then
        echo '{"action": "info", "message": "💡 Consider implementing fallback to another AI service. Current priority: Groq (free) → Claude → OpenAI"}'
    fi
}

# Privacy and consent check
check_privacy_compliance() {
    if grep -q 'fetch.*api\.' "$file_path" 2>/dev/null; then
        # Check for user consent mechanism
        if ! grep -E '(consent|permission|privacy|opt-in|getUserConsent)' "$file_path" 2>/dev/null; then
            log_event "WARNING: No explicit consent mechanism found"
            echo '{"action": "warn", "message": "🔐 Privacy: Ensure user consent before sending text to AI services. Implement opt-in mechanism for GDPR compliance"}'
        fi
    fi
}

# Token/context limit check
check_token_limits() {
    # Check if token counting is implemented
    if grep -q 'fetch.*api\.' "$file_path" 2>/dev/null; then
        if ! grep -E '(token|maxTokens|max_tokens|context|length|truncate|slice)' "$file_path" 2>/dev/null; then
            echo '{"action": "info", "message": "📝 Token Limits:\n• Groq: 8,192 tokens\n• Claude: 200,000 tokens\n• OpenAI: 4,096-128,000 tokens\nConsider implementing token counting"}'
        fi
    fi
}

# API endpoint validation
check_api_endpoints() {
    # Check Groq endpoint
    if grep -q 'api\.groq\.com' "$file_path" 2>/dev/null; then
        if ! grep -q 'api\.groq\.com/openai/v1' "$file_path" 2>/dev/null; then
            echo '{"action": "warn", "message": "⚠️ Groq API endpoint should be: https://api.groq.com/openai/v1/chat/completions"}'
        fi
    fi
    
    # Check Claude endpoint
    if grep -q 'anthropic' "$file_path" 2>/dev/null; then
        if ! grep -q 'api\.anthropic\.com/v1/messages' "$file_path" 2>/dev/null; then
            echo '{"action": "warn", "message": "⚠️ Claude API endpoint should be: https://api.anthropic.com/v1/messages"}'
        fi
    fi
    
    # Check OpenAI endpoint
    if grep -q 'openai' "$file_path" 2>/dev/null; then
        if ! grep -q 'api\.openai\.com/v1' "$file_path" 2>/dev/null; then
            echo '{"action": "warn", "message": "⚠️ OpenAI API endpoint should be: https://api.openai.com/v1/chat/completions"}'
        fi
    fi
}

# Response caching check
check_caching_implementation() {
    if grep -q 'fetch.*api\.' "$file_path" 2>/dev/null; then
        # Check for caching mechanism
        if ! grep -E '(cache|Cache|localStorage|chrome\.storage|IndexedDB)' "$file_path" 2>/dev/null; then
            echo '{"action": "info", "message": "💾 Consider implementing response caching to reduce API calls and improve performance"}'
        fi
    fi
}

# Retry mechanism check
check_retry_logic() {
    if grep -q 'fetch.*api\.' "$file_path" 2>/dev/null; then
        # Check for retry logic
        if ! grep -E '(retry|Retry|attemp|backoff|exponential)' "$file_path" 2>/dev/null; then
            echo '{"action": "info", "message": "🔄 Consider implementing retry logic with exponential backoff for failed API calls"}'
        fi
    fi
}

# Model selection check
check_model_configuration() {
    # Groq models
    if grep -q 'groq' "$file_path" 2>/dev/null; then
        if ! grep -E '(llama|mixtral|gemma)' "$file_path" 2>/dev/null; then
            echo '{"action": "info", "message": "🤖 Groq Models (free):\n• llama3-8b-8192 (fast)\n• llama3-70b-8192 (quality)\n• mixtral-8x7b-32768 (balance)"}'
        fi
    fi
    
    # Claude models
    if grep -q 'claude' "$file_path" 2>/dev/null; then
        if ! grep -E '(claude-3|haiku|sonnet|opus)' "$file_path" 2>/dev/null; then
            echo '{"action": "info", "message": "🤖 Claude Models:\n• claude-3-haiku (fast, cheap)\n• claude-3-sonnet (balanced)\n• claude-3-opus (best quality)"}'
        fi
    fi
}

# Main execution
log_event "Starting AI service validation"

check_api_key_security
check_rate_limiting
check_error_handling
check_fallback_mechanism
check_privacy_compliance
check_token_limits
check_api_endpoints
check_caching_implementation
check_retry_logic
check_model_configuration

log_event "AI service validation completed"

# Return success if no blocking errors
echo "{}"
