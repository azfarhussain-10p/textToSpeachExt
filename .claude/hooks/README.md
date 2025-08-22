# Text-to-Speech Extension - Claude Code Hooks

This directory contains Claude Code hooks configured specifically for the Text-to-Speech Browser Extension project. These hooks ensure consistent development workflow and code quality during the implementation phase.

## What are Hooks?

Hooks are user-defined shell commands that execute at specific points in Claude Code's lifecycle. They provide control over Claude's behavior, ensuring certain actions always happen rather than relying on the AI to choose to run them.

## Project-Specific Hooks

1. **hook-config.json** - Production hooks configuration for the TTS extension project
2. **log-tool-usage.sh** - Tool usage logging for development tracking

## TTS Extension Hook Configuration

### Current Setup

The project is already configured with production-ready hooks in `.claude/settings.local.json`. These hooks are specifically designed for the Text-to-Speech extension development workflow.

### Active Hooks

**Project-specific** (`.claude/settings.local.json`):
- Tool usage logging for development tracking
- Integration with validation-gates subagent
- Automated code quality checks during development

### Hook Features for TTS Extension

1. **Development Tracking**: Logs all tool usage for performance optimization
2. **Code Quality**: Ensures consistent formatting and validation
3. **Extension-Specific**: Tailored for browser extension development patterns
4. **AI Integration**: Optimized for TTS and AI service development

### Usage

The hooks are automatically active when working in this project directory. No additional setup required - they're already configured in the project settings.

## Available Hook Events

- **PreToolUse**: Before tool execution (can block tools)
- **PostToolUse**: After successful tool completion
- **UserPromptSubmit**: When user submits a prompt
- **SubagentStop**: When a subagent completes
- **Stop**: When main agent finishes responding
- **Notification**: During system notifications
- **PreCompact**: Before context compaction
- **SessionStart**: At session initialization

## Creating Your Own Hooks

1. Write a shell script that:
   - Reads JSON input from stdin
   - Processes the input
   - Returns JSON output (empty `{}` for success)
   - Can return `{"action": "block", "message": "reason"}` to block operations

2. Make it executable:
```bash
chmod +x your-hook.sh
```

3. Add to settings.json with appropriate matcher and event

## Security Considerations

- Hooks execute arbitrary shell commands
- Always validate and sanitize inputs
- Use full paths to avoid PATH manipulation
- Be careful with file operations
- Test hooks thoroughly before deployment

## Debugging Hooks

Run Claude Code with debug flag to see hook execution:
```bash
claude --debug
```

This will show:
- Which hooks are triggered
- Input/output for each hook
- Any errors or issues

## TTS Extension Development Workflow

The hooks in this project are specifically designed to support:

1. **Browser Extension Development**: Validation for Manifest V3 compliance
2. **Cross-Browser Compatibility**: Automated checks for Chrome, Firefox, Safari
3. **AI Service Integration**: Validation for Groq and Claude API integrations
4. **TTS Implementation**: Testing and validation for Web Speech API usage
5. **Code Quality**: ESLint, Prettier, and TypeScript validation
6. **Testing Workflow**: Automated unit and integration testing triggers

These hooks work with the validation-gates subagent to ensure all code changes meet the extension's quality and compatibility requirements.