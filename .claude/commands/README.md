# 🎛️ Claude Code Commands - Text-to-Speech Extension

This directory contains specialized Claude Code commands designed specifically for the Intelligent Text-to-Speech Browser Extension project. These commands streamline development workflows, automate complex tasks, and ensure consistent implementation patterns across all features.

## 🎯 Command System Overview

### What are Claude Code Commands?

Claude Code commands are custom workflows and procedures that can be invoked using the `/command` syntax. Each command provides a structured approach to specific development tasks, from generating Production Ready Prompts (PRPs) to troubleshooting complex issues.

#### Key Benefits
- **Standardized Workflows**: Consistent procedures for common tasks
- **Context-Aware Processing**: Commands understand TTS extension requirements
- **Quality Automation**: Built-in validation and testing procedures
- **Time Efficiency**: Pre-defined workflows reduce manual work
- **Knowledge Preservation**: Documented procedures that can be repeated

## 📁 Available Commands

### 🚀 Core Development Commands

#### 1. **TTS Generate PRP** (`/tts-generate-prp`)
**File**: `tts-generate-prp.md`

**Purpose**: Generate comprehensive Production Ready Prompts from feature specifications for TTS extension implementation

**Usage**: `/tts-generate-prp feature-spec.md`

**Key Features**:
- ✅ **Feature Analysis**: Reads and analyzes feature specification files
- ✅ **Codebase Research**: Searches for similar patterns and conventions
- ✅ **Context7 Integration**: Includes real-time documentation fetching instructions
- ✅ **TTS-Specific Templates**: Uses specialized browser extension templates
- ✅ **Cross-Browser Focus**: Includes Chrome, Firefox, Safari, Edge considerations
- ✅ **AI Service Integration**: Handles Groq and Claude API requirements
- ✅ **Security & Privacy**: Incorporates CSP compliance and privacy frameworks
- ✅ **File Generation**: Creates actual PRP files in `PRPs/prompts/` directory

**Output Structure**:
```
PRPs/prompts/
├── tts-voice-selection.md       # Generated from voice-selection feature spec
├── ai-powered-explanation.md    # Generated from AI explanation spec
├── cross-browser-speech.md      # Generated from browser compatibility spec
└── multilingual-support.md      # Generated from language support spec
```

**When to Use**:
- Before implementing new TTS extension features
- When creating browser extension components
- For AI service integration tasks
- When planning cross-browser compatibility features

#### 2. **TTS Execute PRP** (`/tts-execute-prp`)
**File**: `tts-execute-prp.md`

**Purpose**: Execute TTS browser extension feature implementation using specified PRP files with comprehensive validation

**Usage**: `/tts-execute-prp tts-voice-selection.md`

**Key Features**:
- ✅ **Progressive Implementation**: Step-by-step feature development
- ✅ **Context7 Documentation**: Real-time API documentation fetching
- ✅ **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge validation
- ✅ **Performance Monitoring**: Memory usage, response time tracking
- ✅ **Security Compliance**: CSP validation, privacy compliance
- ✅ **Accessibility Testing**: WCAG 2.1 AA compliance validation
- ✅ **AI Service Integration**: Groq and Claude API implementation
- ✅ **Iterative Refinement**: Continuous validation and fix cycles

**Implementation Phases**:
1. **Load and Analyze PRP**: Parse requirements and verify dependencies
2. **ULTRATHINK Planning**: Create detailed implementation strategy
3. **Progressive Implementation**: Build features incrementally with validation
4. **Comprehensive Testing**: Cross-browser E2E and performance testing
5. **Quality Validation**: Security, accessibility, and privacy compliance
6. **Documentation & Completion**: Update docs and verify success criteria

**When to Use**:
- After generating a PRP with `/tts-generate-prp`
- For systematic feature implementation
- When implementing complex TTS functionality
- For AI service integration projects

### 🔧 Workflow Management Commands

#### 3. **Smart Workflows** (`smart-workflows.md`)
**Purpose**: Intelligent workflow orchestration for TTS extension development

**Key Capabilities**:
- Automated task sequencing for complex features
- Multi-browser build pipeline orchestration
- AI service integration workflows
- Testing and validation automation
- Cross-platform deployment procedures

### 🔍 Project Management Commands

#### 4. **Branch Management** (`branch-management.md`)
**Purpose**: Git branch management strategies for TTS extension development

**Key Features**:
- Feature branch creation and naming conventions
- Release branch management
- Hotfix branch procedures
- Merge and conflict resolution strategies
- Branch cleanup and maintenance

#### 5. **Create PR** (`create-PR.md`)
**Purpose**: Automated pull request creation with TTS extension-specific templates

**Key Features**:
- **TTS-Specific Templates**: Uses `PRPs/templates/PR/feature-pr-template.md` and `bugfix-pr-template.md`
- **Cross-Browser Testing**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+ validation checklists
- **Web Speech API Validation**: Voice enumeration, speech synthesis, browser compatibility
- **AI Service Integration**: Groq/Claude API testing, rate limiting, privacy compliance
- **Extension Security**: Manifest V3 compliance, CSP validation, secure API key storage
- **Accessibility Compliance**: WCAG 2.1 AA testing, screen reader compatibility
- **Performance Benchmarking**: Response times, memory usage, TTS-specific metrics

#### 6. **Fix GitHub Issue** (`fix-github-issue.md`)
**Purpose**: Structured approach to resolving GitHub issues for the TTS extension

**Key Features**:
- Issue analysis and categorization
- Root cause investigation procedures
- Solution implementation with testing
- Documentation and communication protocols

### 🛠️ Development Support Commands

#### 7. **Primer** (`primer.md`)
**Purpose**: Development environment setup and project initialization

**Key Features**:
- TTS extension development environment setup
- Dependency installation and configuration
- Browser extension tooling installation
- AI service API configuration
- Cross-browser testing setup

#### 8. **Troubleshooting** (`troubleshooting.md`)
**Purpose**: Comprehensive troubleshooting guide for TTS extension development

**Key Areas**:
- Browser extension loading and debugging
- TTS service integration issues
- AI service API connectivity problems
- Cross-browser compatibility issues
- Performance and memory issues
- Security and privacy compliance problems

## 🔄 Command Workflow Integration

### Typical Development Flow

```mermaid
graph TD
    A[Feature Request] --> B[/tts-generate-prp]
    B --> C[Review Generated PRP]
    C --> D[/tts-execute-prp]
    D --> E[Implementation & Testing]
    E --> F[/create-PR]
    F --> G[Code Review]
    G --> H[Merge & Deploy]
    
    I[Bug Report] --> J[/fix-github-issue]
    J --> K[Analysis & Fix]
    K --> L[Testing & Validation]
    L --> M[/create-PR]
```

### Command Coordination Examples

#### **Complete Feature Development**
```bash
# 1. Generate PRP from feature specification
/tts-generate-prp voice-selection-feature.md
# Output: PRPs/prompts/tts-voice-selection.md

# 2. Execute implementation using generated PRP
/tts-execute-prp tts-voice-selection.md
# Comprehensive implementation with validation

# 3. Create pull request with extension-specific template
/create-PR
# Includes cross-browser testing requirements and security checklist

# 4. Handle any issues discovered during review
/fix-github-issue "Voice selection not working in Safari"
```

#### **AI Service Integration Workflow**
```bash
# 1. Generate PRP for AI feature
/tts-generate-prp ai-explanation-service.md
# Includes Context7 instructions for Groq and Claude API docs

# 2. Execute with focus on privacy and security
/tts-execute-prp ai-explanation-service.md
# Implements secure API key storage and rate limiting

# 3. Troubleshoot any API integration issues
/troubleshooting
# Provides specific guidance for AI service connectivity
```

## 🎨 Command Customization

### Creating Custom Commands

To create a new command for the TTS extension:

1. **Create command file**: `.claude/commands/your-command.md`
2. **Define command structure**:
   ```markdown
   # Your Command Title
   
   ## Command: /your-command $ARGUMENTS
   
   ### Purpose
   Brief description of what the command does
   
   ### Steps
   1. Step 1: Description
   2. Step 2: Description
   
   ### Validation
   Commands to verify success
   ```
3. **Test the command**: Use `/your-command test-input`

### TTS Extension-Specific Command Template

```markdown
# TTS Extension Feature Command

## Command: /tts-feature-command $ARGUMENTS

### Purpose
Specialized command for TTS extension feature development with browser extension context.

### Pre-requisites
- [ ] Extension development environment set up
- [ ] Node.js and npm installed
- [ ] Browser extension tools available (web-ext, chrome-launcher)
- [ ] Context7 MCP configured for documentation access

### Steps

#### Phase 1: Analysis
1. **Read Requirements**: Parse input requirements and context
2. **Browser Compatibility Check**: Verify cross-browser requirements
3. **Context7 Integration**: Fetch current documentation for relevant APIs

#### Phase 2: Implementation
1. **Extension Structure**: Create/update extension files
2. **Service Integration**: Implement TTS/AI services as needed
3. **Cross-Browser Support**: Add browser-specific compatibility

#### Phase 3: Validation
1. **Testing**: Run cross-browser tests
2. **Performance**: Validate memory usage and response times
3. **Security**: Check CSP compliance and API key security
4. **Accessibility**: Verify WCAG 2.1 AA compliance

### Success Criteria
- [ ] All browsers supported (Chrome, Firefox, Safari, Edge)
- [ ] Performance within targets (<50MB memory, <300ms overlay)
- [ ] Security compliance (no hardcoded keys, CSP compliant)
- [ ] Accessibility verified (screen reader compatible)

### Context7 Integration Points
- use context7 for Web Speech API browser compatibility
- use context7 for Chrome Extension Manifest V3 requirements
- use context7 for AI service API documentation (Groq/Claude)
```

## 📊 Command Performance Monitoring

### Metrics to Track
- **Execution Time**: How long commands take to complete
- **Success Rate**: Percentage of successful command executions
- **Error Patterns**: Common failure points and resolutions
- **Usage Frequency**: Most commonly used commands

### Performance Optimization
- **Caching**: Store frequently accessed data
- **Parallel Processing**: Run independent steps concurrently
- **Incremental Updates**: Only process changed components
- **Resource Management**: Monitor memory and CPU usage

## 🔒 Security Considerations

### Command Security Best Practices
- **Input Validation**: Sanitize all command arguments
- **Permission Checks**: Verify access to required resources
- **Secure Execution**: Prevent code injection attacks
- **Audit Logging**: Track command usage for security monitoring

### TTS Extension Security Focus
- **API Key Protection**: Never expose API keys in command outputs
- **CSP Compliance**: Ensure all generated code follows Content Security Policy
- **Privacy Compliance**: Implement proper consent management
- **Secure Storage**: Use chrome.storage securely for settings

## 🧪 Testing Commands

### Manual Command Testing
```bash
# Test each command with various inputs
/tts-generate-prp test-feature.md
/tts-execute-prp test-feature.md
/troubleshooting
/create-PR
```

### Automated Command Testing
```bash
# Run command validation tests
npm run test:commands

# Validate command outputs
npm run validate:prp-generation
npm run validate:implementation-quality
```

## 🔧 Command Maintenance

### Regular Updates
- **Documentation Sync**: Keep commands current with project evolution
- **Template Updates**: Update PRP templates with latest best practices
- **Performance Tuning**: Optimize command execution speed
- **Error Handling**: Improve error messages and recovery procedures

### Version Control
- **Command History**: Track changes to command procedures
- **Backward Compatibility**: Maintain compatibility with existing workflows
- **Migration Guides**: Provide guidance when commands change significantly

## 📚 Resources

### Command Development
- [Claude Code Commands Documentation](https://docs.anthropic.com/claude-code/commands)
- [Markdown Command Syntax](https://docs.anthropic.com/claude-code/commands/syntax)

### TTS Extension Context
- [Project Overview](../../README.md)
- [Development Guide](../../CLAUDE.md)
- [Agents Documentation](../agents/README.md)

### Extension Development
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Firefox Extension Development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Safari Extension Development](https://developer.apple.com/documentation/safariservices/safari_web_extensions)

---

## 🔍 Command Reference Quick Guide

| Command | Purpose | Input | Output |
|---------|---------|-------|--------|
| `/tts-generate-prp` | Generate PRP from feature spec | `feature-spec.md` | PRP file in `PRPs/prompts/` |
| `/tts-execute-prp` | Implement feature from PRP | `feature-prp.md` | Complete feature implementation |
| `/create-PR` | Create pull request | Branch/changes | PR with TTS extension template |
| `/fix-github-issue` | Resolve GitHub issue | Issue ID/description | Issue analysis and fix |
| `/troubleshooting` | Debug development issues | Problem description | Diagnostic steps and solutions |

## 🚀 Getting Started with Commands

### First-Time Setup
1. **Verify Environment**: Ensure Claude Code is installed and configured
2. **Review Commands**: Read through available command documentation
3. **Test Basic Commands**: Try `/primer` to set up development environment
4. **Practice Workflow**: Use `/tts-generate-prp` and `/tts-execute-prp` on sample features

### Best Practices
1. **Read Command Documentation**: Understand what each command does before using
2. **Provide Clear Inputs**: Use descriptive file names and clear specifications
3. **Validate Outputs**: Always verify command results meet expectations
4. **Follow Workflows**: Use commands in recommended sequences
5. **Report Issues**: Document any command failures or unexpected behavior

---

## 🤝 Contributing to Command Development

### Adding New Commands
1. **Identify Need**: Determine what workflow needs automation
2. **Design Command**: Define inputs, steps, and outputs
3. **Create Documentation**: Write comprehensive command documentation
4. **Test Thoroughly**: Validate command behavior with various inputs
5. **Integrate with Workflow**: Show how command fits into development flow

### Improving Existing Commands
1. **Monitor Usage**: Track command performance and user feedback
2. **Identify Pain Points**: Find areas where commands could be improved
3. **Update Procedures**: Refine command steps and validation
4. **Test Changes**: Validate improvements don't break existing functionality
5. **Document Updates**: Update command documentation with changes

---

*These commands are specifically designed to accelerate development of the Intelligent Text-to-Speech Browser Extension while maintaining high standards for cross-browser compatibility, security, accessibility, and AI service integration. Each command incorporates TTS extension-specific requirements and best practices.*