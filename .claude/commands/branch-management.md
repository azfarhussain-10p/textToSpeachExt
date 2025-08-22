# Claude Code: Branch Management Reference

## Overview

Branch management in Claude Code provides comprehensive tools for creating, switching, merging, and maintaining Git branches with AI assistance. This guide covers best practices, naming conventions, and automated workflows for effective branch management.

## Table of Contents

- [Quick Start](#quick-start)
- [Branch Creation](#branch-creation)
- [Branch Operations](#branch-operations)
- [Naming Conventions](#naming-conventions)
- [Workflow Patterns](#workflow-patterns)
- [Branch Protection](#branch-protection)
- [Cleanup and Maintenance](#cleanup-and-maintenance)
- [Team Collaboration](#team-collaboration)
- [Advanced Techniques](#advanced-techniques)

## Quick Start

```bash
# Create and switch to feature branch
claude branch create feature/user-authentication

# Create branch from specific commit
claude branch create hotfix/security-patch --from main

# Switch branches with conflict resolution
claude branch switch develop --resolve-conflicts

# Delete merged branches
claude branch cleanup --merged
```

## Branch Creation

### Basic Branch Creation

```bash
# Create new branch from current HEAD
claude branch create <branch-name>

# Create branch from specific branch/commit
claude branch create <branch-name> --from <source>

# Create and immediately switch
claude branch create <branch-name> --switch
```

### Advanced Creation Options

| Flag | Type | Description | Example |
|------|------|-------------|---------|
| `--from` | string | Source branch or commit | `--from develop` |
| `--switch` | boolean | Switch to new branch after creation | `--switch` |
| `--push` | boolean | Push branch to remote after creation | `--push` |
| `--track` | string | Set upstream tracking branch | `--track origin/develop` |
| `--description` | string | Add branch description | `--description "Authentication feature"` |

### Interactive Branch Creation

```bash
# AI-assisted branch naming
claude branch create --interactive
# Prompts for:
# - Branch type (feature/bugfix/hotfix/release)
# - Issue/ticket number
# - Brief description
# - Source branch

# Example output: feature/auth-123-oauth-integration
```

## Branch Operations

### Switching Branches

```bash
# Basic switch
claude branch switch <branch-name>

# Switch with automatic stashing
claude branch switch <branch-name> --stash

# Switch with conflict resolution
claude branch switch <branch-name> --resolve-conflicts

# Switch and create if doesn't exist
claude branch switch <branch-name> --create
```

### Branch Information

```bash
# List all branches
claude branch list

# List with detailed info
claude branch list --verbose

# Show current branch status
claude branch status

# Show branch relationships
claude branch tree
```

### Branch Synchronization

```bash
# Sync with remote
claude branch sync

# Sync specific branch
claude branch sync develop

# Sync all tracking branches
claude branch sync --all

# Rebase current branch on main
claude branch rebase main
```

## Naming Conventions

### Standard Patterns

#### Feature Branches
```bash
# Pattern: feature/<ticket>-<description>
claude branch create feature/AUTH-123-oauth-integration
claude branch create feature/USER-456-profile-settings
claude branch create feature/API-789-rate-limiting

# Pattern: feature/<area>/<description>
claude branch create feature/frontend/user-dashboard
claude branch create feature/backend/payment-processing
claude branch create feature/infrastructure/docker-setup
```

#### Bug Fix Branches
```bash
# Pattern: bugfix/<ticket>-<description>
claude branch create bugfix/BUG-123-login-error
claude branch create bugfix/ISSUE-456-memory-leak
claude branch create bugfix/FIX-789-validation-bug

# Pattern: fix/<area>/<description>
claude branch create fix/auth/session-timeout
claude branch create fix/api/response-format
claude branch create fix/ui/button-alignment
```

#### Hotfix Branches
```bash
# Pattern: hotfix/<version>-<description>
claude branch create hotfix/v1.2.1-security-patch
claude branch create hotfix/v2.0.1-critical-bug
claude branch create hotfix/emergency-login-fix

# Pattern: hotfix/<severity>-<description>
claude branch create hotfix/critical-data-loss
claude branch create hotfix/urgent-payment-fix
```

#### Release Branches
```bash
# Pattern: release/<version>
claude branch create release/v1.2.0
claude branch create release/v2.0.0-beta
claude branch create release/2024.Q1

# Pattern: release/<version>-<name>
claude branch create release/v1.2.0-spring-update
claude branch create release/v2.0.0-major-rewrite
```

### Naming Best Practices

#### Good Branch Names
```bash
✅ feature/AUTH-123-oauth-integration
✅ bugfix/memory-leak-user-service
✅ hotfix/v1.2.1-security-vulnerability
✅ release/v2.0.0-api-redesign
✅ chore/update-dependencies
✅ docs/api-documentation-update
```

#### Avoid These Patterns
```bash
❌ fix-stuff
❌ temp-branch
❌ johns-work
❌ test123
❌ new-feature
❌ updates
```

### Automated Naming

```bash
# Generate branch name from commit message
claude branch create --from-commit HEAD~1

# Generate from issue/ticket
claude branch create --from-issue JIRA-123

# Interactive naming assistant
claude branch create --suggest
```

## Workflow Patterns

### Git Flow Pattern

```bash
# Initialize Git Flow
claude workflow init gitflow

# Start new feature
claude workflow feature start user-authentication
# Creates: feature/user-authentication from develop

# Finish feature
claude workflow feature finish user-authentication
# Merges to develop, deletes feature branch

# Start release
claude workflow release start v1.2.0
# Creates: release/v1.2.0 from develop

# Finish release
claude workflow release finish v1.2.0
# Merges to main and develop, creates tag
```

### GitHub Flow Pattern

```bash
# Simple feature workflow
claude workflow init github

# Create feature branch
claude branch create feature/new-dashboard --from main

# Work and push
git add .
git commit -m "Add dashboard components"
claude branch push

# Create PR when ready
claude create-PR --base main
```

### Custom Workflow Patterns

```bash
# Define custom workflow
claude workflow define team-flow --config .claude/workflows/team.json

# Example team workflow
{
  "branches": {
    "main": { "protected": true, "merge_strategy": "squash" },
    "develop": { "protected": true, "merge_strategy": "merge" },
    "staging": { "auto_deploy": true }
  },
  "patterns": {
    "feature": "feature/{ticket}-{description}",
    "hotfix": "hotfix/{version}-{description}",
    "release": "release/{version}"
  }
}
```

## Branch Protection

### Protection Rules

```bash
# Set up branch protection
claude branch protect main --require-pr --require-reviews 2

# Protect with status checks
claude branch protect main \
  --require-status-checks \
  --required-checks "ci/build,ci/test"

# Protect with admin enforcement
claude branch protect develop \
  --enforce-admins \
  --dismiss-stale-reviews
```

### Protection Patterns

#### Production Branch (main/master)
```bash
claude branch protect main \
  --require-pr \
  --require-reviews 2 \
  --require-status-checks \
  --required-checks "ci/build,ci/test,security/scan" \
  --enforce-admins \
  --restrict-pushes \
  --dismiss-stale-reviews
```

#### Development Branch
```bash
claude branch protect develop \
  --require-pr \
  --require-reviews 1 \
  --require-status-checks \
  --required-checks "ci/build,ci/test" \
  --dismiss-stale-reviews
```

#### Release Branches
```bash
claude branch protect "release/*" \
  --require-pr \
  --require-reviews 1 \
  --require-status-checks \
  --restrict-pushes "release-team"
```

## Cleanup and Maintenance

### Automated Cleanup

```bash
# Clean merged branches
claude branch cleanup --merged

# Clean stale branches (older than 30 days)
claude branch cleanup --stale --days 30

# Clean with confirmation
claude branch cleanup --interactive

# Clean remote tracking branches
claude branch cleanup --remote --prune
```

### Manual Cleanup

```bash
# List candidates for deletion
claude branch list --merged main

# Delete specific branch
claude branch delete feature/old-feature

# Force delete unmerged branch
claude branch delete feature/abandoned --force

# Delete remote branch
claude branch delete origin/feature/old-feature --remote
```

### Maintenance Scripts

```bash
# Weekly cleanup script
#!/bin/bash
echo "Starting weekly branch cleanup..."

# Clean merged branches
claude branch cleanup --merged --exclude main,develop

# Clean stale feature branches
claude branch cleanup --stale --days 14 --pattern "feature/*"

# Update all tracking branches
claude branch sync --all

# Report branch status
claude branch list --stats
```

## Team Collaboration

### Branch Sharing

```bash
# Share branch with team
claude branch share feature/user-auth --team frontend-team

# Create collaborative branch
claude branch create feature/team-project --collaborative

# Set branch permissions
claude branch permissions feature/sensitive \
  --read-only "junior-devs" \
  --write "senior-devs,tech-leads"
```

### Branch Reviews

```bash
# Request branch review before merge
claude branch review feature/payment-system \
  --reviewers "security-team,payment-experts"

# Review branch changes
claude branch diff feature/auth develop

# Review branch status
claude branch status feature/auth --checks
```

### Conflict Resolution

```bash
# Auto-resolve simple conflicts
claude branch merge develop --auto-resolve

# Interactive conflict resolution
claude branch merge develop --resolve-conflicts

# Preview merge conflicts
claude branch merge develop --dry-run

# Resolve with AI assistance
claude branch conflicts resolve --ai-assist
```

## Advanced Techniques

### Branch Templates

```bash
# Create branch from template
claude branch create feature/new-api --template api-feature

# Define branch template
claude branch template create api-feature \
  --structure "src/api/{name}/,tests/api/{name}/" \
  --files "README.md,CHANGELOG.md" \
  --hooks "pre-commit,pre-push"
```

### Branch Policies

```bash
# Set branch policies
claude branch policy set feature/* \
  --max-age 30days \
  --require-tests \
  --auto-cleanup

# Policy configuration
{
  "feature/*": {
    "maxAge": "30d",
    "requireTests": true,
    "autoCleanup": true,
    "requireIssue": true
  },
  "hotfix/*": {
    "maxAge": "7d",
    "requireReview": false,
    "allowDirectPush": true
  }
}
```

### Branch Analytics

```bash
# Branch statistics
claude branch stats

# Branch activity report
claude branch activity --since 30days

# Branch health check
claude branch health-check

# Example output:
# Branch Health Report
# ==================
# 📊 Total branches: 45
# 🟢 Active branches: 12
# 🟡 Stale branches: 8 (>14 days)
# 🔴 Abandoned branches: 3 (>30 days)
# 
# Top active branches:
# - feature/user-dashboard (5 commits, 2 days ago)
# - bugfix/login-error (3 commits, 1 day ago)
# 
# Cleanup recommendations:
# - Delete merged: feature/old-login, bugfix/fixed-bug
# - Review stale: feature/experimental-feature
```

### Integration Patterns

#### CI/CD Integration

```bash
# Branch-specific CI configuration
.claude/ci/branch-patterns.yml
feature/*:
  pipelines:
    - unit-tests
    - integration-tests
    - code-quality
  deploy: staging

hotfix/*:
  pipelines:
    - unit-tests
    - security-scan
    - fast-integration
  deploy: production
  auto-merge: true

release/*:
  pipelines:
    - full-test-suite
    - performance-tests
    - security-scan
    - documentation-build
  deploy: staging
  notifications: release-team
```

#### Issue Tracking Integration

```bash
# Auto-link branches to issues
claude branch create feature/USER-123 --link-issue USER-123

# Update issue status on branch events
claude branch hooks add --on-create "update-issue-status inprogress"
claude branch hooks add --on-merge "update-issue-status done"

# Generate branch from issue
claude branch create --from-issue JIRA-456
# Creates: feature/JIRA-456-implement-user-dashboard
```

### Branch Hooks and Automation

```bash
# Pre-branch-switch hook
claude branch hooks add pre-switch \
  --script ".claude/hooks/pre-switch.sh" \
  --description "Stash changes and run quick tests"

# Post-branch-create hook
claude branch hooks add post-create \
  --script ".claude/hooks/setup-branch.sh" \
  --description "Set up branch environment"

# Branch cleanup automation
claude branch automation add weekly-cleanup \
  --schedule "0 0 * * 1" \
  --action "cleanup --merged --exclude main,develop"
```

## Configuration

### Global Branch Settings

```bash
# Set default branch patterns
claude config set branch.feature-pattern "feature/{ticket}-{description}"
claude config set branch.default-base "develop"
claude config set branch.auto-track true

# Set cleanup preferences
claude config set branch.cleanup.auto true
claude config set branch.cleanup.merged-age "7d"
claude config set branch.cleanup.stale-age "30d"
```

### Repository-Specific Settings

**.claude/branch-config.json**
```json
{
  "patterns": {
    "feature": "feature/{area}/{ticket}-{description}",
    "bugfix": "fix/{severity}/{description}",
    "hotfix": "hotfix/{version}-{description}",
    "release": "release/{version}",
    "chore": "chore/{type}/{description}"
  },
  "protection": {
    "main": {
      "requirePR": true,
      "requireReviews": 2,
      "requireStatusChecks": true,
      "enforceAdmins": true
    },
    "develop": {
      "requirePR": true,
      "requireReviews": 1,
      "requireStatusChecks": true
    }
  },
  "cleanup": {
    "autoCleanup": true,
    "mergedAge": "7d",
    "staleAge": "30d",
    "excludePatterns": ["main", "develop", "release/*"]
  },
  "workflows": {
    "default": "github-flow",
    "featureBase": "develop",
    "hotfixBase": "main",
    "releaseBase": "develop"
  }
}
```

## Troubleshooting

### Common Issues

#### Branch Creation Failures
```bash
# Error: Branch already exists
# Solution: Use different name or delete existing
claude branch delete feature/duplicate --force
claude branch create feature/duplicate-v2

# Error: Invalid branch name
# Solution: Follow naming conventions
claude branch create "feature/valid-name" # ✅
# Not: claude branch create "feature/invalid name!" # ❌
```

#### Merge Conflicts
```bash
# Error: Merge conflicts detected
# Solution: Resolve conflicts interactively
claude branch merge develop --resolve-conflicts
# Or use AI assistance
claude branch conflicts resolve --ai-assist
```

#### Sync Issues
```bash
# Error: Remote branch doesn't exist
# Solution: Push branch to remote first
claude branch push --set-upstream

# Error: Divergent branches
# Solution: Rebase or merge
claude branch rebase origin/main
# Or
claude branch merge origin/main
```

### Debug Commands

```bash
# Check branch status
claude branch status --verbose

# Validate branch configuration
claude branch validate

# Check branch relationships
claude branch tree --all

# Diagnose branch issues
claude branch diagnose feature/problematic-branch
```

## Best Practices Summary

### ✅ Do's
- Use descriptive, consistent naming conventions
- Include ticket/issue numbers in branch names
- Keep branches focused on single features/fixes
- Regularly sync with main/develop branches
- Clean up merged branches promptly
- Use branch protection for important branches
- Document branch purposes and decisions

### ❌ Don'ts
- Don't use generic names like "fix", "temp", "test"
- Don't keep long-running feature branches
- Don't work directly on main/master
- Don't force push to shared branches
- Don't ignore branch protection rules
- Don't leave stale branches indefinitely

---

## See Also

- [Create PR Guide](./create-PR.md)
- [Workflows Documentation](./workflows.md)
- [Team Standards](./team-standards.md)
- [Git Integration](./git-integration.md)

## Support

For branch management issues:
- Check [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- Review Git documentation
- Contact support at support@anthropic.com