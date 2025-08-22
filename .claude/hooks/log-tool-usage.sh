#!/bin/bash
# PostToolUse hook: Log file edits for TTS extension development tracking
# This hook runs after Edit, Write, or MultiEdit tool execution

timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Create logs directory if it doesn't exist
mkdir -p .claude/logs

# Simple logging - just log that a file edit occurred
echo "[$timestamp] File edit detected by hook" >> .claude/logs/file-edits.log

# Read and discard input to avoid hanging
cat > /dev/null

# Always return success to avoid blocking tools
echo "{}"