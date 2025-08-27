# 📋 Documentation Standards & Guidelines

**Category**: guides  
**Audience**: All contributors  
**Last Updated**: 2025-01-27  
**Status**: Active

## Overview
This document establishes standards for all project documentation to ensure consistency, maintainability, and ease of use across the TTS Extension project.

## 📁 Mandatory Directory Structure

All documentation MUST follow this exact directory structure:

```
docs/
├── README.md                     # Documentation index and overview
├── DOCUMENTATION-STANDARDS.md   # This file - documentation guidelines
├── deployment/                   # Production deployment documentation
│   ├── deployment-checklist.md  # Pre-release validation steps
│   ├── release-notes.md         # Version history and changes
│   └── store-listings.md        # Browser store submission guides
├── guides/                       # User and developer guides
│   ├── development-guide.md     # Complete dev setup and workflows
│   ├── installation-guide.md    # Claude Code installation steps
│   └── project-structure.md     # Project architecture overview
├── implementation/              # Technical implementation details
│   ├── implementation-guide.md  # Step-by-step implementation
│   ├── examples.md             # Code patterns and examples
│   └── api-integration.md      # AI API integration patterns
└── troubleshooting/            # Issue resolution documentation
    ├── extension-fixes.md      # Extension-specific issue fixes
    ├── browser-compatibility.md # Cross-browser issue solutions
    └── debugging-guide.md      # Debug tools and techniques
```

## 📝 File Naming Requirements

### MUST Follow These Rules:
1. **kebab-case only**: `deployment-checklist.md`, never `DeploymentChecklist.md`
2. **Descriptive names**: `browser-compatibility.md`, not `browser-comp.md`
3. **Include purpose**: `installation-guide.md`, not just `install.md`
4. **No spaces or underscores**: Use hyphens only
5. **Lowercase only**: Even for acronyms (`api-integration.md`, not `API-integration.md`)

### File Name Examples:
✅ **Correct**:
- `deployment-checklist.md`
- `extension-fixes.md`
- `api-integration.md`
- `browser-compatibility.md`

❌ **Incorrect**:
- `Deployment_Checklist.md` (mixed case, underscores)
- `extensionFixes.md` (camelCase)
- `API-Integration.md` (mixed case)
- `browser comp.md` (spaces)

## 🏷️ Required Front Matter

Every documentation file MUST start with this exact front matter:

```markdown
# 📄 [Document Title with Emoji]

**Category**: [deployment/guides/implementation/troubleshooting]  
**Audience**: [Developer/DevOps/QA/All/New Contributors]  
**Last Updated**: [YYYY-MM-DD]  
**Status**: [Draft/Review/Active/Deprecated]

## Overview
[Brief 1-2 sentence description of document purpose and scope]
```

### Front Matter Field Definitions:

#### Category (REQUIRED)
- `deployment` - Production deployment procedures
- `guides` - Setup, development, and project guidance  
- `implementation` - Technical implementation details
- `troubleshooting` - Issue resolution and debugging

#### Audience (REQUIRED)
- `Developer` - Software developers working on the project
- `DevOps` - Deployment and infrastructure engineers
- `QA` - Quality assurance and testing teams
- `All` - Everyone working with the project
- `New Contributors` - People new to the project

#### Status (REQUIRED)
- `Draft` - Work in progress, not ready for use
- `Review` - Complete but pending team review
- `Active` - Current and approved for use
- `Deprecated` - Outdated, kept for reference only

## 📐 Content Structure Standards

### Required Sections for All Documents:
1. **Front Matter** (as defined above)
2. **Overview** - Brief purpose and scope
3. **Main Content** - Well-structured with H2/H3 headers
4. **Cross-References** - Links to related documents (when applicable)

### Content Formatting Rules:

#### Headers
- Use emoji in H1 titles: `# 📄 Document Title`
- Use descriptive H2/H3 headers: `## Setup Instructions`, `### Prerequisites`
- No more than 3 header levels (H1, H2, H3)

#### Code Blocks
- Always specify language: ````javascript`, ````bash`, ````json`
- Include comments for complex code
- Show complete, runnable examples

#### Links
- Use relative paths for internal docs: `[Guide](../guides/development-guide.md)`
- Use descriptive link text: `[Development Setup Guide]()`, not `[click here]()`

#### Lists
- Use bullet points for unordered lists
- Use numbers for step-by-step procedures
- Be consistent with indentation (2 spaces)

## 🔄 Document Lifecycle Process

### Creating New Documentation

1. **Determine Correct Directory**:
   ```
   Deployment-related? → docs/deployment/
   Setup/learning guides? → docs/guides/
   Technical details/code? → docs/implementation/
   Bug fixes/debugging? → docs/troubleshooting/
   ```

2. **Create File with Proper Name**:
   - Use kebab-case: `my-new-guide.md`
   - Choose descriptive name: `browser-extension-debugging.md`

3. **Add Required Front Matter**:
   ```markdown
   # 📄 My New Guide
   
   **Category**: guides  
   **Audience**: Developer  
   **Last Updated**: 2025-01-27  
   **Status**: Draft
   
   ## Overview
   This guide explains how to...
   ```

4. **Follow Content Standards** (headers, code blocks, links)

5. **Update Links** in relevant files (README.md, docs/README.md)

### Updating Existing Documentation

1. **Update "Last Updated" field** with current date
2. **Review all content** for accuracy and completeness  
3. **Check all links** to ensure they still work
4. **Update status** if needed (Draft → Review → Active)
5. **Notify team** of significant changes

### Deprecating Documentation

1. **Change status** to `Deprecated`
2. **Add deprecation notice** at top:
   ```markdown
   > **⚠️ DEPRECATED**: This document is outdated. See [new-document.md](new-document.md) instead.
   ```
3. **Keep for one version cycle** then remove
4. **Update all referring links** to point to replacement

## ✅ Quality Checklist

Before publishing any documentation, verify:

- [ ] File is in correct directory (`deployment/`, `guides/`, `implementation/`, `troubleshooting/`)
- [ ] File name follows kebab-case convention
- [ ] Required front matter is complete and accurate
- [ ] Overview section clearly explains purpose
- [ ] Content is well-structured with appropriate headers
- [ ] Code blocks specify language and are properly formatted
- [ ] Internal links use relative paths and work correctly
- [ ] External links are valid and relevant
- [ ] Document is linked from appropriate index files

## 🚫 Common Violations to Avoid

### File Organization Violations:
❌ Creating files in wrong directories  
❌ Using inconsistent naming conventions  
❌ Missing required front matter  

### Content Violations:
❌ Headers without proper structure (H1 → H3, skipping H2)  
❌ Code blocks without language specification  
❌ Broken internal links  
❌ Links using absolute paths instead of relative  

### Maintenance Violations:
❌ Not updating "Last Updated" field when editing  
❌ Leaving documents in "Draft" status indefinitely  
❌ Not removing deprecated documentation  

## 🔍 Enforcement

### Automated Checks
- File naming conventions will be validated in pre-commit hooks
- Link validation will run in CI/CD pipeline
- Front matter validation will be enforced

### Review Process
- All new documentation requires approval before merging
- Documentation changes trigger notifications to relevant teams
- Quarterly documentation review to identify outdated content

## 📞 Questions & Support

For questions about documentation standards:
1. Check this standards document first
2. Review [docs/README.md](README.md) for structure guidance
3. Look at existing documents for examples
4. Ask team for clarification on edge cases

---

**📌 Remember**: Consistent documentation structure makes the project more professional and easier for new contributors to understand and contribute to.