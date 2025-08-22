#!/bin/bash
# Cross-Browser Compatibility Checker for TTS Extension
# Validates code for Chrome, Firefox, Safari, and Edge compatibility

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Only process JavaScript, HTML, and CSS files
if [[ "$file_path" != *.js ]] && [[ "$file_path" != *.html ]] && [[ "$file_path" != *.css ]] && [[ "$file_path" != *.json ]]; then
    echo "{}"
    exit 0
fi

# Logging setup
mkdir -p .claude/logs
log_file=".claude/logs/browser-compatibility.log"

log_check() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$log_file"
}

log_check "Checking browser compatibility for: $file_path"

warnings=""
errors=""

# Check JavaScript files
if [[ "$file_path" == *.js ]]; then
    
    # Check for Chrome-only APIs without polyfill
    if grep -q 'chrome\.' "$file_path" 2>/dev/null; then
        if ! grep -E '(browser\.|webextension-polyfill|typeof chrome|typeof browser)' "$file_path" 2>/dev/null; then
            warnings="${warnings}🌐 Chrome-only API detected. Use webextension-polyfill for cross-browser support:\n"
            warnings="${warnings}   import browser from 'webextension-polyfill';\n"
            warnings="${warnings}   Or use: const browserAPI = typeof browser !== 'undefined' ? browser : chrome;\n"
        fi
    fi
    
    # Check for Firefox-specific considerations
    if grep -q 'browser\.' "$file_path" 2>/dev/null; then
        # Check if promises are handled (Firefox uses promises, Chrome uses callbacks)
        if ! grep -E '(async|await|\.then|Promise)' "$file_path" 2>/dev/null; then
            warnings="${warnings}🦊 Firefox uses Promises for extension APIs. Consider using async/await\n"
        fi
    fi
    
    # Check for Safari-specific issues
    if grep -q 'speechSynthesis' "$file_path" 2>/dev/null; then
        # Safari has specific TTS issues
        if ! grep -E '(onvoiceschanged|getVoices.*length)' "$file_path" 2>/dev/null; then
            warnings="${warnings}🧭 Safari: speechSynthesis.getVoices() may return empty initially. Listen for 'voiceschanged' event\n"
        fi
    fi
    
    # Check for storage API usage
    if grep -q 'localStorage' "$file_path" 2>/dev/null; then
        warnings="${warnings}💾 Use chrome.storage or browser.storage instead of localStorage for extension data\n"
    fi
    
    # Check for XMLHttpRequest vs fetch
    if grep -q 'XMLHttpRequest' "$file_path" 2>/dev/null; then
        warnings="${warnings}🔄 Consider using fetch() API for better cross-browser support\n"
    fi
    
    # Check for non-standard DOM methods
    if grep -E '(innerText|outerHTML)' "$file_path" 2>/dev/null; then
        warnings="${warnings}📝 Use textContent instead of innerText for better compatibility\n"
    fi
    
    # Check for ES6+ features that might need transpilation
    if grep -E '(class |=>|`.*\$\{|\.includes\(|\.startsWith\(|\.endsWith\(|\.\.\.)' "$file_path" 2>/dev/null; then
        # Check minimum browser versions in package.json
        warnings="${warnings}🔧 ES6+ features detected. Ensure babel/webpack transpilation for older browsers:\n"
        warnings="${warnings}   • Chrome 88+ ✓\n"
        warnings="${warnings}   • Firefox 78+ ✓\n"
        warnings="${warnings}   • Safari 14+ ✓\n"
        warnings="${warnings}   • Edge 88+ ✓\n"
    fi
    
    # Check for vendor prefixes needed
    if grep -E '(requestAnimationFrame|getUserMedia|Notification)' "$file_path" 2>/dev/null; then
        if ! grep -E '(webkit|moz|ms)' "$file_path" 2>/dev/null; then
            warnings="${warnings}🎨 Some APIs may need vendor prefixes for older browsers\n"
        fi
    fi
    
    # Check for speech synthesis specific issues
    if grep -q 'SpeechSynthesisUtterance' "$file_path" 2>/dev/null; then
        if ! grep -E '(rate.*[0-9]|pitch.*[0-9]|volume.*[0-9])' "$file_path" 2>/dev/null; then
            warnings="${warnings}🎤 TTS parameters have different ranges across browsers:\n"
            warnings="${warnings}   • rate: 0.1-10 (Chrome), 0.1-2 (Firefox)\n"
            warnings="${warnings}   • pitch: 0-2 (all browsers)\n"
            warnings="${warnings}   • volume: 0-1 (all browsers)\n"
        fi
    fi
fi

# Check CSS files
if [[ "$file_path" == *.css ]]; then
    # Check for vendor prefixes
    if grep -E '(display:\s*flex|transform|animation|transition)' "$file_path" 2>/dev/null; then
        if ! grep -E '(-webkit-|-moz-|-ms-)' "$file_path" 2>/dev/null; then
            warnings="${warnings}🎨 CSS properties may need vendor prefixes:\n"
            warnings="${warnings}   • -webkit- for Safari/Chrome\n"
            warnings="${warnings}   • -moz- for Firefox\n"
        fi
    fi
    
    # Check for CSS Grid (needs fallback for older browsers)
    if grep -q 'display:\s*grid' "$file_path" 2>/dev/null; then
        warnings="${warnings}📐 CSS Grid needs fallback for older browsers\n"
    fi
    
    # Check for custom properties (CSS variables)
    if grep -q '--' "$file_path" 2>/dev/null; then
        warnings="${warnings}🎨 CSS custom properties not supported in older browsers\n"
    fi
fi

# Check HTML files
if [[ "$file_path" == *.html ]]; then
    # Check for proper DOCTYPE
    if ! grep -qi '<!DOCTYPE html>' "$file_path" 2>/dev/null; then
        warnings="${warnings}📄 Add <!DOCTYPE html> for standards mode\n"
    fi
    
    # Check for meta viewport (mobile compatibility)
    if ! grep -q 'viewport' "$file_path" 2>/dev/null; then
        warnings="${warnings}📱 Add viewport meta tag for mobile compatibility:\n"
        warnings="${warnings}   <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
    fi
    
    # Check for charset
    if ! grep -q 'charset' "$file_path" 2>/dev/null; then
        warnings="${warnings}🔤 Add charset meta tag: <meta charset=\"UTF-8\">\n"
    fi
fi

# Check manifest.json for browser-specific fields
if [[ "$file_path" == *manifest.json ]]; then
    # Check for browser-specific fields
    if grep -q '"browser_specific_settings"' "$file_path" 2>/dev/null; then
        warnings="${warnings}🦊 browser_specific_settings is Firefox-specific. Consider separate manifests\n"
    fi
    
    if grep -q '"chrome_url_overrides"' "$file_path" 2>/dev/null; then
        warnings="${warnings}🔷 chrome_url_overrides is Chrome-specific\n"
    fi
    
    # Check for cross-browser action API
    if grep -q '"browser_action"' "$file_path" 2>/dev/null; then
        errors="${errors}❌ Use 'action' instead of 'browser_action' for Manifest V3\n"
    fi
fi

# Platform-specific checks
check_mobile_compatibility() {
    if [[ "$file_path" == *.js ]] || [[ "$file_path" == *.css ]]; then
        # Check for touch events
        if grep -q 'click' "$file_path" 2>/dev/null; then
            if ! grep -E '(touch|pointer)' "$file_path" 2>/dev/null; then
                warnings="${warnings}📱 Consider adding touch event support for mobile browsers\n"
            fi
        fi
        
        # Check for viewport units in CSS
        if [[ "$file_path" == *.css ]]; then
            if grep -E '(vw|vh|vmin|vmax)' "$file_path" 2>/dev/null; then
                warnings="${warnings}📏 Viewport units may behave differently on mobile browsers\n"
            fi
        fi
    fi
}

# Check for specific browser version requirements
check_minimum_versions() {
    log_check "Checking minimum browser version requirements"
    
    # Manifest V3 minimum versions
    min_versions="🔢 Minimum Browser Versions for TTS Extension:\n"
    min_versions="${min_versions}   • Chrome 88+ (Manifest V3 support)\n"
    min_versions="${min_versions}   • Firefox 78+ (WebExtensions support)\n"
    min_versions="${min_versions}   • Safari 14+ (Web Extensions support)\n"
    min_versions="${min_versions}   • Edge 88+ (Chromium-based)\n"
    min_versions="${min_versions}   • Mobile Chrome 90+\n"
    min_versions="${min_versions}   • Mobile Safari 14+ (limited support)\n"
    
    # Only show once per session
    if [ ! -f ".claude/logs/.version_shown" ]; then
        warnings="${warnings}${min_versions}"
        touch ".claude/logs/.version_shown"
    fi
}

# Extension API compatibility table
check_api_compatibility() {
    if grep -E '(tabs\.|windows\.|runtime\.|storage\.)' "$file_path" 2>/dev/null; then
        api_table="📊 Extension API Compatibility:\n"
        api_table="${api_table}   API          | Chrome | Firefox | Safari | Edge\n"
        api_table="${api_table}   -------------|--------|---------|--------|-----\n"
        api_table="${api_table}   storage      |   ✓    |    ✓    |   ✓    |  ✓\n"
        api_table="${api_table}   runtime      |   ✓    |    ✓    |   ✓    |  ✓\n"
        api_table="${api_table}   tabs         |   ✓    |    ✓    |   ⚠️    |  ✓\n"
        api_table="${api_table}   windows      |   ✓    |    ✓    |   ⚠️    |  ✓\n"
        api_table="${api_table}   webRequest   |   ✓    |    ✓    |   ❌    |  ✓\n"
        
        # Only show once per file
        if [ ! -f ".claude/logs/.api_table_shown_$file_path" ]; then
            warnings="${warnings}${api_table}"
            touch ".claude/logs/.api_table_shown_$file_path"
        fi
    fi
}

# Run checks
check_mobile_compatibility
check_minimum_versions
check_api_compatibility

# Build response
if [ -n "$errors" ]; then
    log_check "Browser compatibility check failed with errors"
    echo "{\"action\": \"block\", \"message\": \"❌ Browser Compatibility Errors:\\n${errors}${warnings}\"}"
elif [ -n "$warnings" ]; then
    log_check "Browser compatibility check completed with warnings"
    echo "{\"action\": \"info\", \"message\": \"🌐 Browser Compatibility Notes:\\n${warnings}\"}"
else
    log_check "Browser compatibility check passed"
    echo "{}"
fi
