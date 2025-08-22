#!/bin/bash
# TTS Extension Core Validation Hooks
# Main hook script for Text-to-Speech Browser Extension development

# Read JSON input from stdin
input=$(cat)

# Extract relevant information using grep for compatibility
tool_name=$(echo "$input" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
command=$(echo "$input" | grep -o '"command":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Create logs directory if it doesn't exist
mkdir -p .claude/logs

# Logging function
log_event() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> .claude/logs/tts-extension-hooks.log
}

# Manifest V3 Validation
validate_manifest() {
    if [[ "$file_path" == *"manifest.json"* ]]; then
        log_event "Validating manifest.json for V3 compliance"
        
        # Check for Manifest V3
        if grep -q '"manifest_version".*2' "$file_path" 2>/dev/null; then
            echo '{"action": "block", "message": "❌ Manifest V2 detected! TTS extension requires Manifest V3 for Chrome Web Store"}'
            exit 0
        fi
        
        # Check for required TTS permissions
        if ! grep -q '"permissions"' "$file_path" 2>/dev/null; then
            echo '{"action": "warn", "message": "⚠️ No permissions declared. TTS extension needs activeTab and storage permissions"}'
        fi
        
        # Check for service worker (required in V3)
        if ! grep -q '"service_worker"' "$file_path" 2>/dev/null && grep -q '"background"' "$file_path" 2>/dev/null; then
            echo '{"action": "warn", "message": "⚠️ Background scripts should use service_worker in Manifest V3"}'
        fi
    fi
}

# Content Security Policy Validation
validate_csp() {
    if [[ "$file_path" == *"content"* ]] || [[ "$file_path" == *".js"* ]]; then
        # Check for eval() usage (CSP violation)
        if grep -E '\beval\s*\(' "$file_path" 2>/dev/null; then
            log_event "CSP violation: eval() detected in $file_path"
            echo '{"action": "block", "message": "🔒 CSP Violation: eval() is not allowed in extensions. Use alternative methods"}'
            exit 0
        fi
        
        # Check for inline event handlers
        if grep -E 'on(click|load|change|submit|focus|blur|keydown|keyup)=' "$file_path" 2>/dev/null; then
            echo '{"action": "warn", "message": "⚠️ Inline event handlers detected. Use addEventListener() for CSP compliance"}'
        fi
        
        # Check for innerHTML with script tags
        if grep -E 'innerHTML.*<script' "$file_path" 2>/dev/null; then
            echo '{"action": "block", "message": "🔒 Security Risk: Never inject scripts via innerHTML"}'
            exit 0
        fi
    fi
}

# TTS-specific validation
validate_tts_implementation() {
    if [[ "$file_path" == *"tts"* ]] || [[ "$file_path" == *"speech"* ]]; then
        log_event "Validating TTS implementation in $file_path"
        
        # Check for speechSynthesis API usage
        if grep -q 'speechSynthesis' "$file_path" 2>/dev/null; then
            # Ensure proper error handling
            if ! grep -E '(onerror|catch|try)' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "⚠️ TTS implementation should include error handling for speechSynthesis API"}'
            fi
        fi
        
        # Check for utterance cleanup
        if grep -q 'SpeechSynthesisUtterance' "$file_path" 2>/dev/null; then
            if ! grep -E '(onend|cancel|pause)' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "💡 Remember to implement utterance lifecycle methods (onend, cancel, pause)"}'
            fi
        fi
    fi
}

# AI Service Integration Validation
validate_ai_services() {
    if [[ "$file_path" == *"ai"* ]] || [[ "$file_path" == *"groq"* ]] || [[ "$file_path" == *"claude"* ]]; then
        log_event "Validating AI service integration in $file_path"
        
        # Check for API key exposure
        if grep -E '(sk-|gsk_|anthropic_)[a-zA-Z0-9]{20,}' "$file_path" 2>/dev/null; then
            echo '{"action": "block", "message": "🚨 SECURITY: API key detected in code! Use environment variables or secure storage"}'
            exit 0
        fi
        
        # Check for rate limiting implementation
        if grep -q 'fetch.*api\.(groq|anthropic|openai)' "$file_path" 2>/dev/null; then
            if ! grep -E '(rate|limit|throttle|queue|delay)' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "📊 AI APIs have rate limits. Implement throttling for Groq (100/hr) and Claude (60/min)"}'
            fi
        fi
    fi
}

# Cross-browser compatibility check
validate_browser_compatibility() {
    if [[ "$file_path" == *".js"* ]]; then
        # Check for chrome-only APIs without polyfill
        if grep -q 'chrome\.' "$file_path" 2>/dev/null; then
            if ! grep -E '(browser\.|webextension-polyfill)' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "🌐 Use browser.* API or webextension-polyfill for cross-browser support"}'
            fi
        fi
    fi
}

# Performance monitoring
check_performance() {
    if [[ "$file_path" == *".js"* ]] || [[ "$file_path" == *".css"* ]]; then
        # Check file size (warn if > 100KB)
        if [ -f "$file_path" ]; then
            file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo 0)
            if [ "$file_size" -gt 102400 ]; then
                echo '{"action": "warn", "message": "📦 Large file detected (>100KB). Consider code splitting for better performance"}'
            fi
        fi
    fi
}

# Memory leak prevention
check_memory_management() {
    if [[ "$file_path" == *".js"* ]]; then
        # Check for event listener cleanup
        if grep -q 'addEventListener' "$file_path" 2>/dev/null; then
            if ! grep -q 'removeEventListener' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "🧹 Remember to remove event listeners to prevent memory leaks"}'
            fi
        fi
        
        # Check for interval/timeout cleanup
        if grep -E 'set(Interval|Timeout)' "$file_path" 2>/dev/null; then
            if ! grep -E 'clear(Interval|Timeout)' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "⏱️ Clear intervals/timeouts to prevent memory leaks"}'
            fi
        fi
    fi
}

# Accessibility validation
check_accessibility() {
    if [[ "$file_path" == *".html"* ]] || [[ "$file_path" == *"overlay"* ]] || [[ "$file_path" == *"ui"* ]]; then
        log_event "Checking accessibility in $file_path"
        
        # Check for ARIA labels
        if grep -E '<button|<input|<select' "$file_path" 2>/dev/null; then
            if ! grep -E 'aria-label|aria-describedby|role=' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "♿ Add ARIA labels for accessibility (screen readers need them)"}'
            fi
        fi
        
        # Check for keyboard navigation
        if grep -q 'onclick' "$file_path" 2>/dev/null; then
            if ! grep -E '(onkeydown|onkeyup|tabindex)' "$file_path" 2>/dev/null; then
                echo '{"action": "warn", "message": "⌨️ Ensure keyboard navigation support for accessibility"}'
            fi
        fi
    fi
}

# Test reminder for critical files
remind_testing() {
    critical_files=("tts-service" "ai-service" "content-script" "service-worker" "overlay")
    for pattern in "${critical_files[@]}"; do
        if [[ "$file_path" == *"$pattern"* ]]; then
            log_event "Critical file modified: $file_path"
            echo '{"action": "info", "message": "🧪 Critical file modified. Remember to run: npm test:unit && npm test:e2e"}'
            break
        fi
    done
}

# Bundle size check
check_bundle_size() {
    if [[ "$command" == *"build"* ]] || [[ "$command" == *"webpack"* ]]; then
        echo '{"action": "info", "message": "📊 After build, check bundle size stays under 2MB for extension stores"}'
    fi
}

# Main execution
case "$tool_name" in
    "Edit"|"Write"|"MultiEdit")
        validate_manifest
        validate_csp
        validate_tts_implementation
        validate_ai_services
        validate_browser_compatibility
        check_performance
        check_memory_management
        check_accessibility
        remind_testing
        log_event "File edited: $file_path"
        ;;
    
    "Bash")
        # Check for dangerous commands
        if [[ "$command" == *"rm -rf"* ]] && [[ "$command" != *"node_modules"* ]]; then
            echo '{"action": "block", "message": "⛔ Dangerous command blocked. Use with caution"}'
            exit 0
        fi
        
        # Check for build commands
        check_bundle_size
        ;;
    
    *)
        # Default action
        ;;
esac

# Success - return empty object
echo "{}"
