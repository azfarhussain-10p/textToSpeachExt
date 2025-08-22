#!/bin/bash
# PostToolUse hook: Log file edits for TTS extension development tracking
# This hook runs after Edit, Write, or MultiEdit tool execution

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Create logs directory if it doesn't exist
mkdir -p .claude/logs

# Read input and extract file path
input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "unknown")
tool_name=$(echo "$input" | grep -o '"tool_name":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "unknown")

# Log the file edit with TTS-specific categorization
echo "[$timestamp] Tool: $tool_name | File: $file_path" >> .claude/logs/file-edits.log

# Categorize the edit for TTS extension development
if [[ "$file_path" == *"manifest.json"* ]]; then
    echo "[$timestamp] 📋 Extension manifest modified" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"content-script"* ]] || [[ "$file_path" == *"content.js"* ]]; then
    echo "[$timestamp] 🌐 Content script modified - affects text selection" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"service-worker"* ]] || [[ "$file_path" == *"background"* ]]; then
    echo "[$timestamp] ⚙️ Background service modified - affects extension core" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"tts"* ]] || [[ "$file_path" == *"speech"* ]]; then
    echo "[$timestamp] 🎤 TTS service modified - affects speech synthesis" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"ai"* ]] || [[ "$file_path" == *"groq"* ]] || [[ "$file_path" == *"claude"* ]]; then
    echo "[$timestamp] 🤖 AI service modified - affects explanations" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"overlay"* ]] || [[ "$file_path" == *"popup"* ]] || [[ "$file_path" == *"ui"* ]]; then
    echo "[$timestamp] 🎨 UI component modified - affects user interface" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"test"* ]] || [[ "$file_path" == *"spec"* ]]; then
    echo "[$timestamp] 🧪 Test file modified - remember to run tests" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *".css"* ]]; then
    echo "[$timestamp] 🎨 Styles modified - check cross-browser rendering" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *"package.json"* ]]; then
    echo "[$timestamp] 📦 Dependencies modified - run npm install" >> .claude/logs/tts-development.log
elif [[ "$file_path" == *".env"* ]]; then
    echo "[$timestamp] 🔐 Environment variables modified - check API keys" >> .claude/logs/tts-development.log
else
    echo "[$timestamp] 📝 General file modified: $file_path" >> .claude/logs/tts-development.log
fi

# Track modification statistics
stats_file=".claude/logs/modification-stats.txt"
if [ ! -f "$stats_file" ]; then
    echo "File Modification Statistics for TTS Extension" > "$stats_file"
    echo "==============================================" >> "$stats_file"
fi

# Update statistics
category=""
if [[ "$file_path" == *"manifest"* ]]; then category="Manifest"
elif [[ "$file_path" == *"content"* ]]; then category="Content Scripts"
elif [[ "$file_path" == *"background"* ]] || [[ "$file_path" == *"service"* ]]; then category="Background"
elif [[ "$file_path" == *"tts"* ]] || [[ "$file_path" == *"speech"* ]]; then category="TTS"
elif [[ "$file_path" == *"ai"* ]]; then category="AI"
elif [[ "$file_path" == *"ui"* ]] || [[ "$file_path" == *"overlay"* ]]; then category="UI"
elif [[ "$file_path" == *"test"* ]]; then category="Tests"
else category="Other"
fi

if [ -n "$category" ]; then
    # Increment counter for category (simple implementation)
    echo "[$timestamp] $category" >> "$stats_file"
fi

# Always return success to avoid blocking tools
echo "{}"
