#!/bin/bash
# Simple, robust hook for file edit logging

timestamp=$(date '+%Y-%m-%d %H:%M:%S')
mkdir -p .claude/logs
echo "[$timestamp] File edit detected" >> .claude/logs/hook-activity.log
echo "{}"