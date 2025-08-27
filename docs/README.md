# 📚 TTS Extension Documentation

This directory contains all project documentation organized by purpose and audience.

## 📁 Directory Structure

```
docs/
├── README.md                    # This file - documentation overview
├── deployment/                  # Deployment and release documentation
│   ├── deployment-checklist.md  # Pre-deployment validation checklist
│   ├── release-notes.md         # Version release notes
│   └── store-listings.md        # Browser store submission guidelines
├── guides/                      # User and developer guides
│   ├── development-guide.md     # Complete development setup and workflows
│   ├── installation-guide.md    # Claude Code installation instructions
│   └── project-structure.md     # Architecture and project organization
├── implementation/              # Technical implementation details
│   ├── implementation-guide.md  # Step-by-step implementation reference
│   ├── examples.md             # Code patterns and implementation examples
│   └── api-integration.md      # AI API integration patterns
└── troubleshooting/            # Issue resolution and debugging
    ├── extension-fixes.md      # Common extension issues and solutions
    ├── browser-compatibility.md # Cross-browser compatibility fixes
    └── debugging-guide.md      # Debugging tools and techniques
```

## 📋 Documentation Categories

### 🚀 Deployment (`docs/deployment/`)
Production-ready deployment procedures, checklists, and release management.
- **Target Audience**: DevOps, Release Managers, Senior Developers
- **Purpose**: Ensure safe, validated deployments to browser stores

### 📖 Guides (`docs/guides/`)
Comprehensive guides for setup, development, and project understanding.
- **Target Audience**: New developers, contributors, project maintainers
- **Purpose**: Enable quick onboarding and consistent development practices

### ⚙️ Implementation (`docs/implementation/`)
Technical implementation details, code examples, and architectural decisions.
- **Target Audience**: Developers, architects, code reviewers
- **Purpose**: Provide detailed technical reference for feature implementation

### 🔧 Troubleshooting (`docs/troubleshooting/`)
Issue resolution, debugging guides, and common problem solutions.
- **Target Audience**: Developers, QA engineers, support team
- **Purpose**: Enable quick resolution of common issues and debugging

## 📝 File Naming Conventions

### Standardized File Names
- Use kebab-case (lowercase with hyphens): `deployment-checklist.md`
- Be descriptive but concise: `browser-compatibility.md` not `browser-comp.md`
- Include purpose in name: `installation-guide.md` not `install.md`

### Required Front Matter
All documentation files should start with:

```markdown
# 📄 [Document Title]

**Category**: [deployment/guides/implementation/troubleshooting]  
**Audience**: [Developer/DevOps/QA/All]  
**Last Updated**: [YYYY-MM-DD]  
**Status**: [Draft/Review/Active/Deprecated]

## Overview
Brief description of document purpose and scope.
```

## 🔄 Documentation Lifecycle

### Creating New Documentation
1. **Determine Category**: Choose appropriate subdirectory
2. **Follow Naming Convention**: Use kebab-case descriptive names  
3. **Add Front Matter**: Include category, audience, date, status
4. **Link from Main README**: Update project root README.md if needed

### Updating Documentation
1. **Update "Last Updated" date**
2. **Review and validate content accuracy**
3. **Update status if document becomes deprecated**
4. **Notify team of significant changes**

### Document Status Levels
- **Draft**: Work in progress, not ready for use
- **Review**: Complete but pending review/approval
- **Active**: Current and approved for use
- **Deprecated**: Outdated, kept for reference only

## 🔗 Quick Links

### For New Developers
1. [Installation Guide](guides/installation-guide.md) - Set up Claude Code
2. [Development Guide](guides/development-guide.md) - Complete development setup
3. [Project Structure](guides/project-structure.md) - Understand the codebase

### For Implementation Work  
1. [Implementation Guide](implementation/implementation-guide.md) - Step-by-step implementation
2. [Code Examples](implementation/examples.md) - Patterns and best practices
3. [Extension Fixes](troubleshooting/extension-fixes.md) - Common issues

### For Deployment
1. [Deployment Checklist](deployment/deployment-checklist.md) - Pre-release validation
2. [Troubleshooting Guide](troubleshooting/) - Issue resolution

## 💡 Best Practices

### Writing Documentation
- **Be Specific**: Include exact commands, file paths, and examples
- **Use Headers**: Structure content with clear H2/H3 headings  
- **Include Code Blocks**: Show exact code/commands with syntax highlighting
- **Add Screenshots**: Visual guides for UI-related documentation
- **Cross-Reference**: Link to related documentation

### Maintenance
- **Regular Reviews**: Update documentation quarterly or after major changes
- **Version Alignment**: Keep docs in sync with code versions
- **Deprecation Process**: Mark outdated docs clearly, maintain for one version cycle
- **Feedback Integration**: Update based on team feedback and common questions

---

**📌 Need Help?** 
- Check existing documentation in appropriate category
- Search for keywords across all markdown files
- Create new documentation following this structure
- Keep this README updated when adding new documentation categories
