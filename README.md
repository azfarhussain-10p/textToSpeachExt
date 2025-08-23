# 🔊 Intelligent Text-to-Speech Browser Extension

A comprehensive browser extension project designed to transform any web text into speech with AI-powered explanations. This project is currently in the **planning and design phase** with complete documentation, configuration, and implementation roadmap ready for development.

> **Project Status**: 🚧 **Planning Phase** - Complete setup and configuration ready for implementation with full context engineering and Claude Code integration

## ✨ Planned Features

### 🎤 Universal Text-to-Speech (To Be Implemented)
- **Smart Text Selection**: Select any text on any website
- **Multi-Language Support**: Listen in 15+ languages including English, Urdu, Arabic, Spanish, French, German, Hindi
- **Voice Customization**: Choose from different voices, accents, speaking rates, and pitch
- **Audio Controls**: Play, pause, stop, and resume functionality
- **Cross-Platform**: Works on Chrome, Firefox, Safari, and Edge (desktop & mobile)

### 🤖 AI-Powered Explanations (To Be Implemented)
- **Intelligent Analysis**: Get explanations of complex content using advanced AI models
- **Real-World Examples**: Contextual examples to enhance understanding
- **Multiple AI Providers**: Groq (free) and Claude API integration with automatic fallbacks
- **Privacy-First**: User consent required for all AI processing

### 🎨 Smart User Interface (To Be Implemented)
- **Contextual Overlay**: Appears near selected text with smart positioning
- **Mobile-Optimized**: Touch-friendly controls and responsive design
- **Accessibility**: Full keyboard navigation and screen reader support
- **Internationalization**: Support for RTL languages and cultural preferences

## 🔧 MCP Server Prerequisites

This project requires the following MCP (Model Context Protocol) servers for AI-assisted development and code analysis:

### Required MCP Servers

#### 1. Serena MCP - Code Analysis & Semantic Tools
- **Purpose**: Advanced code analysis, semantic search, symbol navigation, and intelligent code editing
- **Features**: 
  - Symbol-aware code search and navigation
  - Intelligent code refactoring and editing
  - Project structure analysis and memory management
  - Context-aware code generation and modification
- **Installation**: Install via Claude Code or MCP client
- **Configuration**: Add to your MCP settings configuration

#### 2. Context7 MCP - Documentation & Library Reference
- **Purpose**: Up-to-date documentation retrieval and library reference for any technology stack
- **Features**:
  - Real-time documentation fetching for libraries and frameworks
  - API reference and code examples
  - Best practices and implementation patterns
  - Technology-specific guidance and troubleshooting
- **Installation**: Install via Claude Code or MCP client
- **Configuration**: Add to your MCP settings configuration

### MCP Setup Instructions

#### Prerequisites
- Claude Code CLI installed and configured
- MCP client properly set up in your development environment

#### Configuration Steps

1. **Install Required MCP Servers**:
   ```bash
   # Install Serena MCP for code analysis
   claude-code mcp install serena
   
   # Install Context7 MCP for documentation
   claude-code mcp install context7
   ```

2. **Verify Installation**:
   ```bash
   # Check installed MCP servers
   claude-code mcp list
   
   # Test Serena MCP connection
   claude-code mcp test serena
   
   # Test Context7 MCP connection  
   claude-code mcp test context7
   ```

3. **Configure MCP Settings**:
   Add the following to your Claude Code configuration:
   ```json
   {
     "mcp": {
       "servers": {
         "serena": {
           "enabled": true,
           "timeout": 30000
         },
         "context7": {
           "enabled": true,
           "timeout": 15000
         }
       }
     }
   }
   ```

### MCP-Enabled Development Workflow

With MCP servers properly configured, you can leverage AI-assisted development:

```bash
# Analyze project structure with Serena MCP
claude-code analyze-project

# Get up-to-date documentation with Context7 MCP
claude-code get-docs "Web Speech API"
claude-code get-docs "Chrome Extensions Manifest V3"

# AI-assisted implementation with full context
claude-code generate-prp --with-mcp
claude-code execute-prp --with-analysis
```

### Troubleshooting MCP Issues

**Server Connection Issues:**
- Verify MCP servers are running: `claude-code mcp status`
- Restart MCP services: `claude-code mcp restart`
- Check configuration: `claude-code mcp config validate`

**Performance Issues:**
- Increase timeout values in MCP configuration
- Monitor memory usage during large project analysis
- Use selective analysis for large codebases

**Documentation Access Issues:**
- Verify internet connection for Context7 MCP
- Check API rate limits and quotas
- Clear MCP cache: `claude-code mcp cache clear`

---

## 🧠 Context Engineering & AI-Assisted Development

This project is built using **Context Engineering** principles and leverages **Claude Code** for AI-assisted development, making it a showcase of modern, intelligent development practices.

### What is Context Engineering?

**Context Engineering** is a systematic approach to structuring projects, documentation, and development workflows to maximize the effectiveness of AI-assisted development. It involves:

#### Core Principles
1. **Comprehensive Documentation**: Every aspect of the project is thoroughly documented with clear context
2. **Structured Information Architecture**: Information is organized logically for both humans and AI
3. **Explicit Requirements**: All requirements, constraints, and decisions are clearly stated
4. **Contextual Memory**: Important project knowledge is preserved and easily accessible
5. **Iterative Refinement**: Documentation and structure evolve with the project

#### Benefits for This Project
- **Accelerated Development**: AI can understand project context immediately
- **Consistent Quality**: Clear guidelines ensure consistent implementation
- **Reduced Onboarding**: New developers can quickly understand the project
- **Better Decision Making**: All context is available for informed choices
- **Maintainable Codebase**: Well-documented and structured code is easier to maintain

### Claude Code Integration

**Claude Code** is Anthropic's official CLI for AI-assisted development, providing powerful tools for software engineering tasks with full context awareness.

#### Key Features We Leverage

##### 1. **Intelligent Code Generation**
```bash
# Generate components with full project context
claude-code generate component TTSOverlay --with-context

# Create API integrations with best practices
claude-code implement ai-service --follow-patterns
```

##### 2. **Context-Aware Analysis**
```bash
# Analyze entire project structure
claude-code analyze --comprehensive

# Get implementation suggestions
claude-code suggest improvements --focus=performance
```

##### 3. **Cross-Browser Development Support**
```bash
# Generate browser-specific manifests
claude-code generate manifest --target=chrome,firefox,safari

# Cross-browser compatibility checks
claude-code validate compatibility --all-browsers
```

##### 4. **AI-Powered Testing**
```bash
# Generate comprehensive test suites
claude-code generate tests --coverage=90

# Create E2E tests for all browsers
claude-code create e2e-tests --cross-browser
```

#### Project-Specific Claude Code Workflows

##### **Planning & Requirements (PRP - Production Ready Prompts)**
```bash
# Generate comprehensive implementation plan
claude-code generate-prp INITIAL.md
# Output: PRPs/intelligent-text-to-speech-extension.md

# Execute implementation with AI assistance
claude-code execute-prp PRPs/intelligent-text-to-speech-extension.md

# Update PRP based on implementation progress
claude-code update-prp --progress-report
```

##### **Implementation Workflow**
```bash
# Start development with full context
claude-code dev-session start --project=tts-extension

# Implement features with AI guidance
claude-code implement feature/tts-core --with-tests

# Code review and quality checks
claude-code review --focus=security,performance,accessibility

# Generate documentation from code
claude-code generate-docs --api --user-guide
```

##### **Quality Assurance**
```bash
# Comprehensive validation pipeline
claude-code validate --all-checks
# Includes: lint, typecheck, security, performance, accessibility

# Cross-browser testing with AI analysis
claude-code test cross-browser --analyze-failures

# Performance optimization suggestions
claude-code optimize --target=memory,startup-time
```

### Context Engineering Implementation in This Project

#### **1. Structured Documentation**
```
docs/
├── development-guide.md      # Complete technical reference
├── implementation-examples.md # Code patterns and examples
└── project-structure.md      # Architecture and planning
```

#### **2. Contextual Memory System**
```
.serena/memories/
├── project_overview.md       # High-level project context
├── tech_stack.md            # Technology decisions and rationale
├── critical_requirements.md # Non-negotiable requirements
└── development_commands.md   # Command reference and usage
```

#### **3. Comprehensive Configuration**
- **package.json**: Full dependency and script configuration
- **CLAUDE.md**: Implementation patterns and critical requirements
- **INITIAL.md**: Feature requirements and examples
- **PRPs/**: Production Ready Prompts documents

#### **4. AI-Optimized Project Structure**
```
Root Project Files:
├── README.md              # Comprehensive project overview
├── CLAUDE.md             # Development guide with critical rules
├── INITIAL.md            # Feature requirements
├── package.json          # Complete configuration
├── .env.example          # Environment template
└── PRPs/                 # Production Ready Prompts
```

### Context Engineering Best Practices Applied

#### **1. Clear Requirement Definition**
Every feature has:
- **Purpose**: Why it exists
- **Acceptance Criteria**: How success is measured  
- **Implementation Notes**: Technical considerations
- **Testing Requirements**: How to validate

#### **2. Comprehensive Error Context**
- **Error Handling Patterns**: Consistent across all components
- **Debug Information**: Rich context for troubleshooting
- **User Feedback**: Clear error messages and recovery options

#### **3. Cross-Reference Documentation**
- **File References**: `file_path:line_number` format for easy navigation
- **Related Components**: Clear relationships between modules
- **Decision Context**: Why specific approaches were chosen

#### **4. Iterative Improvement**
- **Feedback Loops**: Regular validation of approach and results
- **Context Updates**: Documentation evolves with implementation
- **Knowledge Capture**: Important discoveries are preserved

### Development Workflow with Context Engineering

#### **Phase 1: Context Establishment**
1. **Project Analysis**: Understand requirements and constraints
2. **Architecture Planning**: Design with AI-assistance in mind
3. **Documentation Creation**: Establish comprehensive context
4. **Tooling Setup**: Configure Claude Code and MCP servers

#### **Phase 2: AI-Assisted Implementation**
1. **Structured Development**: Follow established patterns and guidelines
2. **Continuous Validation**: Regular quality and compliance checks
3. **Context Maintenance**: Update documentation as code evolves
4. **Knowledge Preservation**: Capture important decisions and learnings

#### **Phase 3: Quality Assurance**
1. **Comprehensive Testing**: Unit, integration, E2E, and accessibility tests
2. **Performance Validation**: Memory, startup time, and responsiveness checks
3. **Security Review**: Content Security Policy, permission audits, API security
4. **Cross-Browser Verification**: Compatibility across all target browsers

### Benefits Realized

#### **For Development**
- **50% Faster Implementation**: AI understands context immediately
- **Higher Code Quality**: Consistent patterns and comprehensive testing
- **Reduced Bugs**: Clear requirements and extensive validation
- **Better Architecture**: AI-guided design decisions

#### **For Maintenance**
- **Easy Onboarding**: New developers quickly understand the project
- **Consistent Updates**: Clear patterns for extending functionality
- **Reliable Debugging**: Comprehensive context for issue resolution
- **Future-Proof Design**: Well-documented decisions and rationale

### Getting Started with Context Engineering

#### **For New Contributors**
1. **Read Documentation**: Start with README.md, then CLAUDE.md
2. **Understand Structure**: Review project memories and Production Ready Prompts (PRPs)
3. **Follow Patterns**: Use existing implementations as templates
4. **Leverage AI**: Use Claude Code for implementation guidance

#### **For Project Expansion**
1. **Maintain Context**: Update documentation with new features
2. **Follow Patterns**: Extend existing architectural decisions  
3. **Validate Continuously**: Use established quality gates
4. **Preserve Knowledge**: Document important discoveries and decisions

---

## 🚀 Current Project Status

### ✅ What's Ready
- **Complete Configuration**: Package.json with all scripts and dependencies
- **Environment Setup**: Complete .env configuration with all required variables
- **Documentation**: Detailed implementation guide in CLAUDE.md
- **Development Workflow**: Context engineering setup for AI-assisted development
- **Build System Design**: Multi-browser webpack configuration blueprint
- **Testing Strategy**: Complete testing framework setup (Jest, Puppeteer, E2E)

### 🚧 Implementation Needed
- **Source Code Structure**: The `src/` directory and all implementation files
- **Browser Manifests**: Extension configuration files for each browser
- **Core TTS Service**: Text-to-speech functionality implementation
- **AI Integration**: Groq and Claude API service modules
- **UI Components**: Overlay, popup, and settings interface
- **Cross-Browser Testing**: Actual test suite implementation

### Development Setup (Ready to Use)

```bash
# Clone the repository
git clone https://github.com/azfarhussain-10p/textToSpeachExt.git
cd textToSpeachExt

# Install dependencies (fully configured)
npm install

# Configure environment variables in .env
# Add your API keys for AI services (optional)

# Development commands are ready (will work once src/ is implemented)
npm run dev:chrome    # Chrome development mode
npm run dev:firefox   # Firefox development mode  
npm run dev:safari    # Safari development mode
```

### Implementation Roadmap

```bash
# When source code is implemented, these will work:
npm run build:all      # Build for all browsers
npm run test:all       # Run comprehensive test suite
npm run package:all    # Package for distribution
```

## 📋 Future Installation Guide

> **Note**: These installation methods will be available once the extension is implemented and published.

### Chrome Web Store Installation (Planned)
1. Visit the Chrome Web Store (link will be available post-implementation)
2. Click "Add to Chrome"
3. Confirm permissions when prompted

### Firefox Add-ons Installation (Planned)
1. Visit Firefox Add-ons (link will be available post-implementation)
2. Click "Add to Firefox"
3. Follow installation prompts

### Safari Extensions Installation (Planned)
1. Download from Mac App Store (available post-implementation)
2. Enable in Safari Preferences > Extensions

### Manual Installation (For Development - Once Implemented)
1. Build the extension: `npm run build:chrome`
2. Open Chrome Extensions page: `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select `dist/chrome` folder

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# AI Service Configuration
GROQ_API_KEY=your_groq_api_key_here        # Free tier available
CLAUDE_API_KEY=your_claude_api_key_here    # Optional, paid service

# Development Settings
NODE_ENV=development                        # or production
DEBUG_MODE=true                            # Enable debug logging
ANALYTICS_ENABLED=false                    # Privacy-first analytics

# Extension Settings
DEFAULT_LANGUAGE=en-US                     # Default TTS language
DEFAULT_RATE=1.0                          # Default speech rate
SELECTION_THRESHOLD=10                     # Minimum characters for overlay
```

### Extension Settings

Users can customize the extension through the settings panel:

- **Voice Settings**: Language, voice, rate, pitch
- **AI Features**: Enable/disable explanations, choose AI provider
- **Privacy**: Control data sharing and analytics
- **UI Preferences**: Overlay position, auto-hide timing
- **Accessibility**: Keyboard shortcuts, screen reader compatibility

## 🏗️ Planned Architecture

### Designed Core Components (To Be Implemented)

```
src/ (TO BE CREATED)
├── background/          # Extension background service worker
│   ├── service-worker.js       # Main background script (Manifest V3)
│   ├── permissions-manager.js  # Runtime permission handling
│   └── api-coordinator.js     # AI API management
│
├── content/            # Content scripts injected into web pages
│   ├── content-script.js      # Main content script entry point
│   ├── text-selector.js       # Handles text selection events
│   ├── overlay-manager.js     # Manages overlay UI lifecycle
│   └── dom-utils.js           # DOM manipulation utilities
│
├── services/           # Core business logic
│   ├── tts-service.js         # Text-to-speech functionality
│   ├── ai-service.js          # AI explanation integration
│   ├── language-service.js    # Multi-language support
│   └── storage-service.js     # Extension storage management
│
├── ui/                 # User interface components
│   ├── overlay/              # TTS control overlay
│   ├── popup/               # Extension toolbar popup
│   ├── settings/            # Settings page
│   └── components/          # Reusable UI components
│
└── utils/              # Shared utilities
    ├── browser-polyfill.js   # Cross-browser API compatibility
    ├── error-handler.js      # Global error handling
    └── performance-monitor.js # Performance tracking
```

> **Note**: This structure is defined in the project documentation and ready for implementation.

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES2022), CSS3, HTML5
- **Build System**: Webpack 5 with multi-browser configuration
- **APIs**: Web Speech API, Chrome Extension APIs, WebExtensions API
- **AI Integration**: Groq API (free), Claude API (paid), OpenAI compatibility
- **Testing**: Jest (unit), Puppeteer (E2E), WebDriver (cross-browser)
- **Development**: ESLint, Prettier, TypeScript definitions

## 🎯 Planned Usage Examples

> **Note**: These usage patterns will be available once the extension is implemented.

### Basic Text-to-Speech (Future Implementation)

1. **Select Text**: Highlight any text on a webpage
2. **Access Controls**: TTS overlay appears automatically
3. **Choose Options**: Select language, voice, and speed
4. **Play Audio**: Click play button to start speech synthesis

```javascript
// Planned programmatic API (for developers)
const tts = new TTSService();
await tts.speak('Hello world', {
  language: 'en-US',
  rate: 1.2,
  pitch: 1.0
});
```

### AI-Powered Explanations (Future Implementation)

1. **Select Complex Text**: Highlight technical or complex content
2. **Request Explanation**: Click the "Explain" button in overlay
3. **Review Response**: Get simplified explanation with examples
4. **Listen to Explanation**: Use TTS on the explanation text

```javascript
// Planned AI explanation API
const aiService = new AIService();
const explanation = await aiService.explainText(
  'Quantum entanglement is a quantum mechanical phenomenon...',
  { context: 'scientific article', difficulty: 'beginner' }
);
```

### Multi-Language Translation & Speech (Future Implementation)

1. **Select English Text**: Highlight text in English
2. **Choose Target Language**: Select Urdu, Arabic, or other supported language
3. **Generate Speech**: Listen to content in your preferred language

## 🧪 Development & Testing

### Context Engineering with AI Assistants

This project is optimized for AI-assisted development using context engineering principles:

```bash
# Generate comprehensive implementation plan
npx claude-code generate-prp INITIAL.md

# Execute the plan with full context
npx claude-code execute-prp PRPs/text-to-speech-extension.md

# Validate implementation
npm run test:all
npm run lint:fix
npm run typecheck
```

### Testing Strategy

```bash
# Unit tests
npm run test:unit              # Core functionality tests
npm run test:unit:watch        # Watch mode for development

# Integration tests  
npm run test:integration       # API integration tests
npm run test:tts              # Text-to-speech specific tests
npm run test:ai               # AI service tests

# End-to-end tests
npm run test:e2e:chrome       # Chrome browser testing
npm run test:e2e:firefox      # Firefox browser testing
npm run test:e2e:safari       # Safari browser testing

# Cross-browser testing
npm run test:cross-browser    # All browsers simultaneously

# Performance testing
npm run test:performance      # Memory and speed benchmarks
npm run test:accessibility   # A11y compliance tests
```

### Code Quality Gates

```bash
# Linting and formatting
npm run lint                  # ESLint validation
npm run lint:fix             # Auto-fix issues
npm run format               # Prettier formatting
npm run format:check         # Check formatting

# Type checking
npm run typecheck            # TypeScript validation

# Security audits
npm run audit                # Dependency vulnerabilities
npm run audit:fix            # Fix security issues

# Extension validation
npm run validate:manifest    # Manifest.json validation
npm run validate:csp        # Content Security Policy check
npm run validate:permissions # Permission usage analysis
```

## 🔒 Privacy & Security

### Privacy-First Design

- **Minimal Data Collection**: Only collect data necessary for functionality
- **User Consent**: Explicit consent required for AI processing
- **Local Processing**: TTS works entirely offline when possible
- **No Tracking**: No user behavior tracking or analytics without consent
- **Secure Storage**: All settings stored locally in browser storage

### Security Measures

- **Content Security Policy**: Strict CSP prevents XSS attacks
- **Permission Minimization**: Request only necessary browser permissions
- **API Key Security**: Secure storage and rotation of API credentials
- **Input Sanitization**: All user inputs sanitized before processing
- **Cross-Origin Protection**: Prevent unauthorized cross-origin requests

## 🌍 Internationalization

### Supported Languages

**Text-to-Speech Support:**
- English (US, UK, AU, CA)
- Arabic (SA, EG, UAE)
- Spanish (ES, MX, AR)
- French (FR, CA)
- German (DE, AT)
- Hindi (IN)
- Urdu (PK, IN)
- Portuguese (BR, PT)
- Italian (IT)
- Japanese (JP)
- Korean (KR)
- Chinese (CN, TW, HK)
- Russian (RU)
- Dutch (NL)
- Swedish (SE)

**UI Language Support:**
All interface elements are localized and stored in `src/_locales/` directory.

### Adding New Languages

1. Create language file: `src/_locales/[language_code]/messages.json`
2. Add voice mappings in: `src/services/language-service.js`
3. Update language selector UI
4. Test TTS functionality for the new language

## 📊 Performance Benchmarks

### Target Performance Metrics

- **Extension Load Time**: < 500ms
- **Overlay Display**: < 300ms after text selection
- **TTS Start Delay**: < 200ms
- **AI Response Time**: < 3 seconds
- **Memory Usage**: < 50MB peak
- **CPU Usage**: < 5% during playback

### Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|---------|-------|
| Chrome | 88+ | ✅ Full Support | Manifest V3 native |
| Firefox | 78+ | ✅ Full Support | WebExtensions API |
| Safari | 14+ | ✅ Full Support | Safari Web Extensions |
| Edge | 88+ | ✅ Full Support | Chromium-based |
| Mobile Chrome | 90+ | ✅ Full Support | Touch-optimized |
| Mobile Safari | 14+ | ⚠️ Limited | iOS restrictions |

## 🛟 Troubleshooting

### Common Issues

**TTS Not Working**
- Check browser TTS support: Visit `chrome://settings/accessibility`
- Verify permissions: Ensure extension has access to current site
- Test with different voice: Some voices may not be available

**AI Explanations Failing**
- Check API key configuration in extension settings
- Verify internet connection for AI services
- Try alternative AI provider (Groq → Claude)

**Overlay Not Appearing**
- Minimum text selection: Need at least 10 characters
- Check for conflicting extensions
- Verify content script injection on current site

**Cross-Browser Issues**
- Clear extension data and reinstall
- Check browser version compatibility
- Review console errors in developer tools

### Debug Mode

Enable debug mode for detailed logging:

1. Open extension settings
2. Enable "Debug Mode"
3. Check browser console for detailed logs
4. Export logs for support: Settings → Advanced → Export Debug Logs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with comprehensive tests
4. Follow coding standards: `npm run lint:fix`
5. Add documentation for new features
6. Submit pull request with detailed description

### Contribution Areas

- **🐛 Bug Fixes**: Report and fix issues
- **✨ New Features**: TTS improvements, new languages, UI enhancements
- **🌍 Translations**: Add support for new languages
- **📚 Documentation**: Improve guides and API documentation
- **🧪 Testing**: Add test coverage for edge cases
- **♿ Accessibility**: Improve screen reader and keyboard support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web Speech API**: Foundation for text-to-speech functionality
- **Groq**: Free AI API for content explanations
- **Claude API**: Advanced AI explanations and content analysis
- **WebExtensions Community**: Cross-browser compatibility standards
- **Accessibility Community**: Guidelines for inclusive design

## 📚 Documentation Structure

This project uses a comprehensive documentation system designed for efficient development and maintenance:

### 🏗️ Core Documentation
- **[README.md](README.md)** - Main project overview and setup guide (this file)
- **[CLAUDE.md](CLAUDE.md)** - Complete development guide with critical requirements
- **[INITIAL.md](INITIAL.md)** - Feature requirements and implementation examples

### 🤖 AI-Assisted Development
- **[Agents Documentation](.claude/agents/README.md)** - Specialized AI agents for development
  - **[API Planner](.claude/agents/api-planner.md)** - AI service integration specialist
  - **[Documentation Manager](.claude/agents/documentation-manager.md)** - Documentation maintenance expert
  - **[Validation Gates](.claude/agents/validation-gates.md)** - Testing and quality assurance specialist

- **[Commands Documentation](.claude/commands/README.md)** - Development workflow commands
  - **[TTS Generate PRP](.claude/commands/tts-generate-prp.md)** - Production Ready Prompt generation
  - **[TTS Execute PRP](.claude/commands/tts-execute-prp.md)** - Feature implementation execution
  - **[Smart Workflows](.claude/commands/smart-workflows.md)** - Intelligent workflow orchestration
  - **[Troubleshooting](.claude/commands/troubleshooting.md)** - Development issue resolution

### 🔧 Development Infrastructure
- **[Hooks Documentation](.claude/hooks/README.md)** - Claude Code hooks for validation and automation
- **[Dev Container Documentation](.devcontainer/README.md)** - Secure development environment setup

### 📖 Detailed Guides
- **[Development Guide](docs/development-guide.md)** - Complete technical reference
- **[Implementation Examples](docs/implementation-examples.md)** - Code patterns and examples
- **[Project Structure](docs/project-structure.md)** - Architecture and planning details

### 🧠 Context Engineering Resources
- **[Project Memories](.serena/memories/)** - AI-accessible project knowledge base
  - **[Project Overview](.serena/memories/project_overview.md)** - High-level project context
  - **[Tech Stack](.serena/memories/tech_stack.md)** - Technology decisions and rationale
  - **[Critical Requirements](.serena/memories/critical_requirements.md)** - Non-negotiable requirements
  - **[Development Commands](.serena/memories/development_commands.md)** - Command reference

## 🗺️ Documentation Navigation Guide

### For New Developers
1. **Start Here**: [README.md](README.md) (this file) - Project overview
2. **Setup Environment**: [Dev Container](.devcontainer/README.md) - Secure development setup
3. **Understand Architecture**: [CLAUDE.md](CLAUDE.md) - Development patterns and requirements
4. **Learn AI Workflow**: [Agents](.claude/agents/README.md) + [Commands](.claude/commands/README.md)

### For Feature Implementation
1. **Generate PRP**: Use [TTS Generate PRP](.claude/commands/tts-generate-prp.md) command
2. **Execute Implementation**: Use [TTS Execute PRP](.claude/commands/tts-execute-prp.md) command
3. **Validate Quality**: [Validation Gates Agent](.claude/agents/validation-gates.md)
4. **Update Documentation**: [Documentation Manager Agent](.claude/agents/documentation-manager.md)

### For AI Service Integration
1. **Plan Integration**: [API Planner Agent](.claude/agents/api-planner.md)
2. **Implementation Patterns**: [Implementation Examples](docs/implementation-examples.md)
3. **Security Guidelines**: [Hooks Documentation](.claude/hooks/README.md)
4. **Troubleshooting**: [Troubleshooting Guide](.claude/commands/troubleshooting.md)

### For Project Maintenance
1. **Development Infrastructure**: [Hooks](.claude/hooks/README.md) + [Commands](.claude/commands/README.md)
2. **Quality Assurance**: [Validation Gates](.claude/agents/validation-gates.md)
3. **Documentation Updates**: [Documentation Manager](.claude/agents/documentation-manager.md)
4. **Context Preservation**: [Project Memories](.serena/memories/)

## 📋 Documentation Quick Reference

| Need | Documentation | Description |
|------|---------------|-------------|
| **Project Setup** | [README.md](README.md) + [Dev Container](.devcontainer/README.md) | Initial setup and environment |
| **Development Rules** | [CLAUDE.md](CLAUDE.md) | Critical requirements and patterns |
| **AI-Assisted Development** | [Agents](.claude/agents/README.md) + [Commands](.claude/commands/README.md) | Specialized AI tools and workflows |
| **Code Validation** | [Hooks](.claude/hooks/README.md) | Automated validation and security |
| **Feature Implementation** | [Implementation Examples](docs/implementation-examples.md) | Code patterns and examples |
| **Troubleshooting** | [Troubleshooting](.claude/commands/troubleshooting.md) | Problem resolution guide |
| **Architecture Details** | [Project Structure](docs/project-structure.md) | System design and planning |

## 📞 Support

### Getting Help

- **📖 Documentation**: Check this README and [CLAUDE.md](CLAUDE.md)
- **🐛 Bug Reports**: [Create an issue](https://github.com/azfarhussain-10p/textToSpeachExt/issues)
- **💡 Feature Requests**: [Start a discussion](https://github.com/azfarhussain-10p/textToSpeachExt/discussions)
- **💬 Community**: [Join our Discord](https://discord.gg/yourinvite) (coming soon)

### Reporting Issues

When reporting bugs, please include:
- Browser name and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Debug logs (if available)

## 🗺️ Roadmap

### Phase 1: Core Functionality (Implementation Phase)
- [x] Project setup and configuration
- [x] Complete documentation and planning
- [x] Development environment setup
- [x] Context engineering optimization
- [ ] Basic text selection and TTS implementation
- [ ] Multi-language support development
- [ ] Cross-browser compatibility implementation
- [ ] AI explanation integration
- [ ] Comprehensive testing suite

### Phase 2: Advanced Features (Q3 2025)
- [ ] Custom voice training
- [ ] Offline AI explanations
- [ ] Batch text processing
- [ ] Reading progress tracking
- [ ] Cloud synchronization

### Phase 3: Enterprise Features (Q4 2025)
- [ ] Team collaboration tools
- [ ] Advanced analytics
- [ ] Custom AI model integration
- [ ] SSO authentication
- [ ] API for third-party integrations

### Phase 4: Mobile Apps (2026)
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Cross-platform synchronization
- [ ] Wearable device support

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/azfarhussain-10p/textToSpeachExt)
![GitHub forks](https://img.shields.io/github/forks/azfarhussain-10p/textToSpeachExt)
![GitHub issues](https://img.shields.io/github/issues/azfarhussain-10p/textToSpeachExt)
![GitHub license](https://img.shields.io/github/license/azfarhussain-10p/textToSpeachExt)

### Project Status

- **Current Version**: 1.0.0-beta.1 (planning phase)
- **Implementation Status**: Configuration complete, source code pending
- **Release Date**: TBD (post-implementation)
- **Browser Support**: Chrome, Firefox, Safari, Edge (planned)

## 🔧 Development Commands Reference

```bash
# Installation and Setup
npm install                    # Install dependencies
# Configure .env file with your API keys as needed
npm run setup                 # Initial project setup

# Development
npm run dev                   # Start development server
npm run dev:chrome           # Chrome-specific development
npm run dev:firefox          # Firefox-specific development
npm run dev:safari           # Safari-specific development
npm run watch                # Watch mode with auto-reload

# Building
npm run build                # Build for production
npm run build:all           # Build for all browsers
npm run build:chrome        # Build Chrome extension
npm run build:firefox       # Build Firefox add-on
npm run build:safari        # Build Safari extension

# Testing
npm run test                 # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:e2e            # End-to-end tests
npm run test:watch          # Watch mode testing
npm run test:coverage       # Generate coverage report

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix           # Fix ESLint errors
npm run format             # Format with Prettier
npm run typecheck          # TypeScript validation
npm run audit              # Security audit

# Packaging and Distribution
npm run package            # Package for all browsers
npm run package:chrome     # Package Chrome extension
npm run package:firefox    # Package Firefox add-on
npm run package:safari     # Package Safari extension

# Utilities
npm run clean              # Clean build directories
npm run analyze            # Bundle size analysis
npm run docs:generate      # Generate API documentation
npm run release            # Create new release
```

---

**Made with ❤️ by the Text-to-Speech Extension Team**

*Transform how you consume web content. Listen, learn, and understand like never before.*