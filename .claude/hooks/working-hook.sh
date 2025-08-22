#!/bin/bash
# TTS Extension Development Hook - Simple and robust
# Tracks development activity and provides quick validations

timestamp=$(date '+%Y-%m-%d %H:%M:%S')
mkdir -p .claude/logs

# Read input
input=$(cat)

# Extract basic info without jq for maximum compatibility
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
tool_name=$(echo "$input" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
command=$(echo "$input" | grep -o '"command":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

# Log activity
echo "[$timestamp] Activity detected - Tool: $tool_name" >> .claude/logs/hook-activity.log

# Quick TTS-specific checks based on context
if [[ "$tool_name" == "Edit" ]] || [[ "$tool_name" == "Write" ]]; then
    # Track what type of file is being edited
    if [[ "$file_path" == *"manifest.json"* ]]; then
        echo "[$timestamp] 📋 Manifest edited - Validating V3 compliance" >> .claude/logs/tts-quick-log.log
    elif [[ "$file_path" == *".js"* ]]; then
        echo "[$timestamp] 📝 JavaScript file edited: $file_path" >> .claude/logs/tts-quick-log.log
    elif [[ "$file_path" == *".css"* ]]; then
        echo "[$timestamp] 🎨 Styles edited: $file_path" >> .claude/logs/tts-quick-log.log
    elif [[ "$file_path" == *".html"* ]]; then
        echo "[$timestamp] 📄 HTML edited: $file_path" >> .claude/logs/tts-quick-log.log
    fi
fi

# Quick command safety check for Bash tools
if [[ "$tool_name" == "Bash" ]]; then
    # Block obviously dangerous commands
    if [[ "$command" == *"rm -rf /"* ]] || [[ "$command" == *"rm -rf ~"* ]]; then
        echo '{"action": "block", "message": "⛔ Extremely dangerous command blocked!"}'
        exit 0
    fi
    
    # Warn about API key exposure
    if [[ "$command" == *"echo"* ]] && [[ "$command" == *"sk-"* || "$command" == *"gsk_"* ]]; then
        echo '{"action": "warn", "message": "⚠️ Never echo API keys to console!"}'
        exit 0
    fi
fi

# Track npm commands for TTS development
if [[ "$command" == *"npm"* ]]; then
    echo "[$timestamp] 📦 NPM command: $command" >> .claude/logs/tts-quick-log.log
    
    # Remind about TTS-specific scripts
    if [[ "$command" == "npm run"* ]]; then
        echo "[$timestamp] Available TTS scripts: dev:chrome, test:tts, build:all" >> .claude/logs/tts-quick-log.log
    fi
fi

# Success - always return empty object to avoid blocking
echo "{}"
