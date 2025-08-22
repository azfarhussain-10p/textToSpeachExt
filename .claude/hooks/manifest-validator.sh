#!/bin/bash
# Manifest V3 Compliance Validator for TTS Extension
# Ensures the extension manifest follows Chrome Web Store requirements

# Read input
input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Only process manifest.json files
if [[ "$file_path" != *"manifest.json"* ]]; then
    echo "{}"
    exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
    echo "{}"
    exit 0
fi

# Logging
mkdir -p .claude/logs
log_file=".claude/logs/manifest-validation.log"

log_validation() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$log_file"
}

log_validation "Validating manifest: $file_path"

# Read manifest content
manifest_content=$(cat "$file_path" 2>/dev/null)

# Critical validations
errors=""
warnings=""

# 1. Check Manifest Version
if ! echo "$manifest_content" | grep -q '"manifest_version".*3'; then
    errors="${errors}❌ Must use Manifest V3 (found V2 or missing)\n"
    log_validation "ERROR: Not using Manifest V3"
fi

# 2. Check for service worker (background scripts deprecated in V3)
if echo "$manifest_content" | grep -q '"scripts".*\['; then
    if echo "$manifest_content" | grep -q '"background"'; then
        errors="${errors}❌ Background scripts array deprecated. Use service_worker\n"
        log_validation "ERROR: Using deprecated background scripts"
    fi
fi

# 3. Check required fields for TTS extension
if ! echo "$manifest_content" | grep -q '"name"'; then
    errors="${errors}❌ Missing 'name' field\n"
fi

if ! echo "$manifest_content" | grep -q '"version"'; then
    errors="${errors}❌ Missing 'version' field\n"
fi

if ! echo "$manifest_content" | grep -q '"description"'; then
    warnings="${warnings}⚠️ Missing 'description' field (required for store)\n"
fi

# 4. Check permissions for TTS functionality
if ! echo "$manifest_content" | grep -q '"permissions"'; then
    warnings="${warnings}⚠️ No permissions declared. TTS needs 'activeTab' and 'storage'\n"
else
    # Check for specific TTS-related permissions
    if ! echo "$manifest_content" | grep -q 'activeTab'; then
        warnings="${warnings}⚠️ Consider adding 'activeTab' permission for text selection\n"
    fi
    
    if ! echo "$manifest_content" | grep -q 'storage'; then
        warnings="${warnings}⚠️ Consider adding 'storage' permission for settings\n"
    fi
fi

# 5. Check content scripts configuration
if echo "$manifest_content" | grep -q '"content_scripts"'; then
    # Check for matches pattern
    if ! echo "$manifest_content" | grep -q '"matches"'; then
        errors="${errors}❌ Content scripts must have 'matches' pattern\n"
    fi
    
    # Check for js files
    if ! echo "$manifest_content" | grep -q '"js"'; then
        warnings="${warnings}⚠️ Content scripts defined but no JS files specified\n"
    fi
fi

# 6. Check for host permissions (V3 uses host_permissions, not permissions)
if echo "$manifest_content" | grep -q 'http://\*\|https://\*' | grep -q '"permissions"'; then
    warnings="${warnings}⚠️ Host permissions should be in 'host_permissions' array in V3\n"
fi

# 7. Check for CSP (Content Security Policy)
if echo "$manifest_content" | grep -q '"content_security_policy"'; then
    # V3 uses object format for CSP
    if ! echo "$manifest_content" | grep -q '"extension_pages"\|"sandbox"'; then
        warnings="${warnings}⚠️ CSP in V3 should use object format with 'extension_pages' or 'sandbox'\n"
    fi
    
    # Check for unsafe-eval (not allowed)
    if echo "$manifest_content" | grep -q 'unsafe-eval'; then
        errors="${errors}❌ 'unsafe-eval' is not allowed in Manifest V3\n"
    fi
fi

# 8. Check icons
if ! echo "$manifest_content" | grep -q '"icons"'; then
    warnings="${warnings}⚠️ Missing icons (required for extension stores)\n"
else
    # Check for required icon sizes
    if ! echo "$manifest_content" | grep -q '"128"'; then
        warnings="${warnings}⚠️ Missing 128x128 icon (required for Chrome Web Store)\n"
    fi
fi

# 9. Check action (V3 uses action, not browser_action or page_action)
if echo "$manifest_content" | grep -q '"browser_action"\|"page_action"'; then
    errors="${errors}❌ Use 'action' instead of 'browser_action' or 'page_action' in V3\n"
fi

# 10. Check for web_accessible_resources (V3 format)
if echo "$manifest_content" | grep -q '"web_accessible_resources"'; then
    # V3 requires array of objects with 'resources' and 'matches'
    if ! echo "$manifest_content" | grep -q '"resources".*\['; then
        warnings="${warnings}⚠️ web_accessible_resources in V3 needs 'resources' array\n"
    fi
fi

# 11. TTS-specific checks
# Check for minimum required APIs
if ! echo "$manifest_content" | grep -q 'content_scripts\|action\|background'; then
    warnings="${warnings}⚠️ TTS extension typically needs content_scripts and background service\n"
fi

# 12. Check version format (should be x.y.z)
if echo "$manifest_content" | grep -q '"version"'; then
    version=$(echo "$manifest_content" | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '[0-9.]*')
    if ! echo "$version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        warnings="${warnings}⚠️ Version should follow x.y.z format (found: $version)\n"
    fi
fi

# 13. Check for optional but recommended fields
if ! echo "$manifest_content" | grep -q '"author"'; then
    warnings="${warnings}💡 Consider adding 'author' field\n"
fi

if ! echo "$manifest_content" | grep -q '"homepage_url"'; then
    warnings="${warnings}💡 Consider adding 'homepage_url' for support\n"
fi

# Build response
if [ -n "$errors" ]; then
    log_validation "Validation failed with errors"
    response_message="🚫 Manifest V3 Validation Failed:\n${errors}"
    if [ -n "$warnings" ]; then
        response_message="${response_message}\nWarnings:\n${warnings}"
    fi
    echo "{\"action\": \"block\", \"message\": \"$response_message\"}"
    exit 0
elif [ -n "$warnings" ]; then
    log_validation "Validation passed with warnings"
    echo "{\"action\": \"warn\", \"message\": \"📋 Manifest V3 Warnings:\n${warnings}\"}"
    exit 0
else
    log_validation "Validation passed successfully"
    echo "{\"action\": \"info\", \"message\": \"✅ Manifest V3 validation passed!\"}"
fi
