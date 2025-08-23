# Claude Code: create-PR Command Reference

## Overview

The `create-PR` command in Claude Code enables developers to create pull requests directly from the command line with AI assistance. This command streamlines the PR creation process by automatically generating titles, descriptions, and managing branch operations.

## Table of Contents

- [Quick Start](#quick-start)
- [Command Syntax](#command-syntax)
- [Options and Flags](#options-and-flags)
- [Workflow Examples](#workflow-examples)
- [Best Practices](#best-practices)
- [Integration Patterns](#integration-patterns)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Quick Start

```bash
# Basic PR creation
claude create-PR

# Create PR with custom title and description
claude create-PR --title "Feature: Add user authentication" --description "Implements OAuth2 login system"

# Create draft PR for review
claude create-PR --draft --reviewers "team-lead,senior-dev"
```

## Command Syntax

```bash
claude create-PR [options] [target-branch]
```

### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `target-branch` | string | Target branch for the pull request | `main` or repository default |

## Options and Flags

### Core Options

| Flag | Short | Type | Description | Example |
|------|-------|------|-------------|---------|
| `--title` | `-t` | string | Pull request title | `--title "Fix authentication bug"` |
| `--description` | `-d` | string | Pull request description | `--description "Resolves issue #123"` |
| `--body` | `-b` | string | Alias for description | `--body "Detailed PR description"` |
| `--draft` | | boolean | Create as draft PR | `--draft` |
| `--auto-merge` | | boolean | Enable auto-merge when checks pass | `--auto-merge` |

### Branch Management

| Flag | Type | Description | Example |
|------|------|-------------|---------|
| `--source-branch` | string | Source branch (current branch if not specified) | `--source-branch feature/auth` |
| `--base` | string | Base branch for the PR | `--base develop` |
| `--create-branch` | string | Create new branch before PR | `--create-branch feature/new-feature` |

### Review and Assignment

| Flag | Type | Description | Example |
|------|------|-------------|---------|
| `--reviewers` | string | Comma-separated list of reviewers | `--reviewers "user1,user2,team"` |
| `--assignees` | string | Comma-separated list of assignees | `--assignees "maintainer"` |
| `--labels` | string | Comma-separated list of labels | `--labels "bug,priority-high"` |

### Content Generation

| Flag | Type | Description | Example |
|------|------|-------------|---------|
| `--generate-title` | boolean | AI-generate title from changes | `--generate-title` |
| `--generate-description` | boolean | AI-generate description from changes | `--generate-description` |
| `--template` | string | Use PR template file | `--template .github/pull_request_template.md` |

### Output and Behavior

| Flag | Type | Description | Example |
|------|------|-------------|---------|
| `--open` | boolean | Open PR in browser after creation | `--open` |
| `--json` | boolean | Output PR details in JSON format | `--json` |
| `--verbose` | `-v` | Enable verbose output | `--verbose` |
| `--dry-run` | boolean | Preview PR without creating | `--dry-run` |

## Workflow Examples

### Basic Workflows

#### 1. Simple Feature PR
```bash
# Create PR from current branch to main
claude create-PR --title "Add user dashboard" --open
```

#### 2. Bug Fix with Auto-generated Content
```bash
# Let AI generate title and description
claude create-PR --generate-title --generate-description --labels "bug,hotfix"
```

#### 3. Draft PR for Early Feedback
```bash
# Create draft PR with specific reviewers
claude create-PR --draft \
  --title "WIP: Refactor authentication system" \
  --reviewers "security-team,lead-dev" \
  --labels "work-in-progress,security"
```

### Advanced Workflows

#### 1. Feature Branch with Complete Setup
```bash
# Create branch, commit changes, and create PR
git checkout -b feature/user-profiles
# ... make changes ...
git add .
git commit -m "Implement user profile functionality"
claude create-PR \
  --title "Feature: User Profile Management" \
  --description "Adds comprehensive user profile system with avatar upload and settings" \
  --reviewers "frontend-team,backend-team" \
  --labels "feature,frontend,backend" \
  --auto-merge
```

#### 2. Release PR with Template
```bash
# Create release PR using template
claude create-PR \
  --base main \
  --source-branch develop \
  --template .github/RELEASE_TEMPLATE.md \
  --title "Release v2.1.0" \
  --reviewers "release-team" \
  --labels "release"
```

#### 3. Cross-Fork Contribution
```bash
# Create PR from fork to upstream
claude create-PR \
  --base upstream/main \
  --title "Fix memory leak in data processor" \
  --description "Resolves issue #456 by properly cleaning up resources" \
  --labels "bugfix,performance"
```

## Best Practices

### 1. Title and Description Guidelines

**Good Titles:**
```bash
# Descriptive and action-oriented
claude create-PR --title "Add Redis caching for user sessions"
claude create-PR --title "Fix null pointer exception in payment processor"
claude create-PR --title "Update dependency versions for security patches"
```

**Good Descriptions:**
```bash
# Include context and impact
claude create-PR \
  --title "Implement rate limiting" \
  --description "
## Changes
- Added rate limiting middleware
- Configured Redis for rate limit storage
- Added tests for rate limiting scenarios

## Impact
- Prevents API abuse
- Improves system stability
- Reduces server load

## Testing
- Unit tests added
- Integration tests updated
- Load testing performed

Closes #234
"
```

### 2. Reviewer Assignment Strategy

```bash
# Small changes - single reviewer
claude create-PR --reviewers "tech-lead"

# Feature changes - domain experts
claude create-PR --reviewers "frontend-team,ux-designer"

# Security changes - security team
claude create-PR --reviewers "security-team" --labels "security"

# Infrastructure changes - devops team
claude create-PR --reviewers "devops-team,platform-team"
```

### 3. Label Management

```bash
# Categorize by type and priority
claude create-PR --labels "feature,high-priority,frontend"

# Bug fixes with severity
claude create-PR --labels "bug,critical,hotfix"

# Documentation updates
claude create-PR --labels "documentation,no-review-needed"
```

## Integration Patterns

### 1. CI/CD Integration

```bash
# Create PR that triggers specific CI pipeline
claude create-PR \
  --labels "deploy-staging" \
  --description "
## Deployment Notes
- Safe to deploy to staging
- Database migrations included
- Feature flags configured

/deploy staging
"
```

### 2. Issue Linking

```bash
# Link to specific issues
claude create-PR \
  --description "
Fixes #123
Closes #124
Resolves #125

## Summary
This PR addresses multiple related authentication issues.
"
```

### 3. Automated Workflows

```bash
# PR that triggers automated testing
claude create-PR \
  --labels "run-full-test-suite" \
  --auto-merge \
  --description "
## Automated Testing
- Unit tests: ✅
- Integration tests: ✅
- Performance tests: pending

Auto-merge enabled after all checks pass.
"
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Permission Errors
```bash
# Error: Insufficient permissions
# Solution: Check repository access
gh auth status
claude auth status
```

#### 2. Branch Not Found
```bash
# Error: Source branch doesn't exist
# Solution: Verify branch name and push to remote
git push -u origin feature-branch
claude create-PR --source-branch feature-branch
```

#### 3. Merge Conflicts
```bash
# Error: Conflicts with base branch
# Solution: Resolve conflicts before creating PR
git fetch origin
git rebase origin/main
# Resolve conflicts
claude create-PR
```

#### 4. Review Assignment Failures
```bash
# Error: Reviewer not found
# Solution: Use valid GitHub usernames or team names
claude create-PR --reviewers "@org/team-name,valid-username"
```

### Debug Mode

```bash
# Enable verbose logging
claude create-PR --verbose --dry-run

# Check configuration
claude config list

# Validate repository state
git status
git remote -v
```

## Advanced Usage

### 1. TTS Extension Custom Templates

The project includes specialized PR templates optimized for TTS extension development:

```bash
# Use TTS-specific feature template
claude create-PR --template PRPs/templates/PR/feature-pr-template.md

# Use TTS-specific bugfix template  
claude create-PR --template PRPs/templates/PR/bugfix-pr-template.md
```

**Available TTS Extension Templates:**

#### **Feature PR Template** (`PRPs/templates/PR/feature-pr-template.md`):
- Comprehensive feature documentation structure
- Cross-browser testing requirements (Chrome, Firefox, Safari, Edge)
- AI service integration validation (Groq/Claude APIs)
- Web Speech API considerations
- Manifest V3 compliance checks
- Accessibility testing (WCAG 2.1 AA)
- Extension security requirements (CSP, API keys)
- Performance benchmarking for TTS functionality

#### **Bug Fix PR Template** (`PRPs/templates/PR/bugfix-pr-template.md`):
- Detailed root cause analysis framework
- TTS-specific debugging procedures
- Cross-browser bug reproduction steps
- AI service error handling validation
- Extension-specific monitoring and rollback procedures
- Privacy and security impact assessment
- Performance regression testing for speech synthesis

**TTS Extension Template Usage Examples:**
```bash
# Feature development with full TTS context
claude create-PR \
  --template PRPs/templates/PR/feature-pr-template.md \
  --title "Feature: Multi-language Voice Selection" \
  --reviewers "tts-team,accessibility-team" \
  --labels "feature,tts,accessibility,cross-browser"

# Bug fix with comprehensive validation
claude create-PR \
  --template PRPs/templates/PR/bugfix-pr-template.md \
  --title "Fix: Safari speech synthesis voice loading" \
  --reviewers "tts-team,qa-team" \
  --labels "bug,safari,speech-synthesis,cross-browser"
```

### 2. Scripted PR Creation

```bash
#!/bin/bash
# automated-pr.sh

BRANCH_NAME="feature/$(date +%Y%m%d)-enhancement"
TICKET_ID=$1

git checkout -b "$BRANCH_NAME"
# ... make changes ...
git add .
git commit -m "Implement enhancement for $TICKET_ID"

claude create-PR \
  --title "Enhancement: $TICKET_ID implementation" \
  --generate-description \
  --reviewers "team-lead" \
  --labels "enhancement,automated" \
  --open
```

### 3. Bulk Operations

```bash
# Create multiple related PRs
for component in auth api frontend; do
  git checkout -b "update-$component-deps"
  # Update dependencies for component
  claude create-PR \
    --title "Update $component dependencies" \
    --labels "dependencies,$component" \
    --reviewers "${component}-team"
  git checkout main
done
```

### 4. Integration with External Tools

```bash
# Jira integration
claude create-PR \
  --title "$(jira issue get PROJ-123 --field summary)" \
  --description "
$(jira issue get PROJ-123 --field description)

Jira: https://company.atlassian.net/browse/PROJ-123
"

# Slack notification after PR creation
claude create-PR --json | jq -r '.html_url' | xargs -I {} \
  slack-cli send "#dev-team" "New PR created: {}"
```

## Configuration

### Global Settings

```bash
# Set default base branch
claude config set pr.default-base develop

# Set default reviewers
claude config set pr.default-reviewers "team-lead,senior-dev"

# Enable auto-open by default
claude config set pr.auto-open true
```

### Repository-Specific Settings

Create `.claude.json` in repository root:

```json
{
  "pr": {
    "defaultBase": "develop",
    "defaultReviewers": ["@org/frontend-team"],
    "defaultLabels": ["frontend"],
    "template": ".github/pr_template.md",
    "autoOpen": true
  }
}
```

## API Reference

### Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Permission error |
| 4 | Network error |
| 5 | Repository error |

### JSON Output Format

```json
{
  "id": 123,
  "number": 456,
  "title": "Feature: Add user authentication",
  "body": "Implements OAuth2 login system...",
  "state": "open",
  "html_url": "https://github.com/org/repo/pull/456",
  "head": {
    "ref": "feature/auth",
    "sha": "abc123..."
  },
  "base": {
    "ref": "main",
    "sha": "def456..."
  },
  "user": {
    "login": "developer"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "draft": false,
  "mergeable": true
}
```

---

## See Also

- [Claude Code Authentication](./auth.md)
- [Branch Management](./branch-management.md)
- [GitHub Integration](./github-integration.md)
- [Configuration Guide](./configuration.md)

## Support

For issues or questions:
- Check [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- Submit issues on [GitHub](https://github.com/anthropics/claude-code)
- Contact support at support@anthropic.com