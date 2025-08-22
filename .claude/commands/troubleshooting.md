# Claude Code: Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide helps resolve common issues with Claude Code, provides diagnostic tools, and offers solutions for various error scenarios. Use this guide to quickly identify and fix problems in your development workflow.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Git Integration Issues](#git-integration-issues)
- [Branch Management Problems](#branch-management-problems)
- [PR Creation Failures](#pr-creation-failures)
- [Workflow Execution Errors](#workflow-execution-errors)
- [Performance Issues](#performance-issues)
- [Configuration Problems](#configuration-problems)
- [Advanced Debugging](#advanced-debugging)

## Quick Diagnostics

### Health Check Command

```bash
# Comprehensive system check
claude health-check

# Example output:
# Claude Code Health Check
# ========================
# ✅ Installation: OK (v1.0.81)
# ✅ Authentication: GitHub authenticated
# ✅ Git repository: Valid (.git found)
# ⚠️  Network: Slow connection detected
# ❌ Configuration: Missing .claude/config.json
# 
# Issues found: 2
# Warnings: 1
# 
# Recommendations:
# 1. Create configuration file: claude config init
# 2. Check network connectivity
```

### Quick Fix Commands

```bash
# Reset to known good state
claude reset --soft

# Refresh authentication
claude auth refresh

# Clear cache and temporary files
claude cache clear

# Validate current setup
claude validate --all
```

### Status Overview

```bash
# Check current status
claude status

# Verbose status with debugging info
claude status --verbose --debug

# Export diagnostic information
claude diagnose --export debug-report.json
```

## Installation Issues

### Permission Errors

**Problem**: Cannot install or update Claude Code due to permission issues

```bash
# Error examples:
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@anthropic-ai'
Error: Insufficient permissions to install update
```

**Solutions**:

```bash
# Option 1: Fix npm permissions (Recommended)
sudo chown -R $USER:$(id -gn) $(npm -g config get prefix)

# Option 2: Use migration tool
claude migrate-installer

# Option 3: Configure npm prefix (Clean solution)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @anthropic-ai/claude-code

# Option 4: Use npx (No installation)
npx @anthropic-ai/claude-code --version
```

### Installation Verification

```bash
# Verify installation
claude --version
which claude

# Check npm global packages
npm list -g --depth=0 | grep claude

# Reinstall if necessary
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code@latest
```

### Path Issues

**Problem**: `claude` command not found after installation

```bash
# Check if installed globally
npm list -g @anthropic-ai/claude-code

# Check PATH
echo $PATH
npm config get prefix

# Add to PATH if missing
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Version Conflicts

**Problem**: Multiple versions or conflicting installations

```bash
# Check all Claude installations
which -a claude
npm list -g | grep claude

# Clean installation
npm uninstall -g @anthropic-ai/claude-code
npm cache clean --force
npm install -g @anthropic-ai/claude-code@latest

# Verify clean installation
claude --version
claude health-check
```

## Authentication Problems

### GitHub Authentication Failures

**Problem**: Cannot authenticate with GitHub

```bash
# Common error messages:
Error: Authentication failed
Error: Invalid token
Error: Insufficient permissions
```

**Diagnosis**:

```bash
# Check authentication status
claude auth status
gh auth status

# Test GitHub connectivity
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

**Solutions**:

```bash
# Re-authenticate with GitHub
claude auth login --github

# Use GitHub CLI integration
gh auth login
claude auth sync

# Manual token setup
claude auth token --github YOUR_PERSONAL_ACCESS_TOKEN

# Check token permissions
claude auth permissions --check
```

### Token Permissions

**Problem**: Insufficient token permissions for operations

**Required Permissions**:
- `repo` (Full repository access)
- `workflow` (GitHub Actions)
- `write:packages` (Package publishing)
- `read:org` (Organization access)

```bash
# Check current permissions
claude auth permissions --list

# Update token with required permissions
# Go to GitHub → Settings → Developer settings → Personal access tokens
# Or use GitHub CLI
gh auth refresh -s repo,workflow,write:packages,read:org
```

### Authentication Expiry

**Problem**: Token expired or revoked

```bash
# Check token validity
claude auth validate

# Refresh authentication
claude auth refresh

# Re-authenticate if refresh fails
claude auth logout
claude auth login --github
```

### Organization Access

**Problem**: Cannot access organization repositories

```bash
# Check organization access
claude auth orgs --list

# Request organization access
claude auth orgs --request ORG_NAME

# Use organization token
claude auth token --org ORG_NAME --token ORG_TOKEN
```

## Git Integration Issues

### Repository Detection

**Problem**: Claude Code cannot detect Git repository

```bash
# Error: Not a git repository
# Check git status
git status
git remote -v

# Initialize git if needed
git init
git remote add origin https://github.com/user/repo.git

# Verify Claude can detect repository
claude status
```

### Remote Configuration

**Problem**: Issues with Git remotes

```bash
# Check remote configuration
git remote -v
claude remote status

# Fix remote URLs
git remote set-url origin https://github.com/user/repo.git

# Add missing remotes
git remote add upstream https://github.com/original/repo.git

# Test remote connectivity
git fetch origin
claude remote test
```

### Branch Synchronization

**Problem**: Local and remote branches out of sync

```bash
# Diagnose sync issues
claude branch sync --dry-run
git status
git branch -vv

# Fix sync issues
git fetch origin
git branch --set-upstream-to=origin/main main

# Force sync (use carefully)
claude branch sync --force
```

### Merge Conflicts

**Problem**: Unresolved merge conflicts blocking operations

```bash
# Check for conflicts
git status
claude conflicts status

# Resolve conflicts interactively
claude conflicts resolve --interactive

# Use AI assistance for conflict resolution
claude conflicts resolve --ai-assist

# Abort merge if needed
git merge --abort
claude workflow reset --to-last-good
```

## Branch Management Problems

### Branch Creation Failures

**Problem**: Cannot create new branches

```bash
# Common errors:
Error: Branch already exists
Error: Invalid branch name
Error: Cannot create branch from detached HEAD
```

**Solutions**:

```bash
# Check branch name validity
claude branch validate-name "feature/my-branch"

# Delete existing branch if needed
claude branch delete old-branch --force

# Ensure on valid base branch
git checkout main
claude branch create feature/new-feature

# Fix detached HEAD
git checkout main
```

### Branch Protection Issues

**Problem**: Cannot push to protected branches

```bash
# Check protection rules
claude branch protection status main

# View protection details
claude branch protection list --verbose

# Bypass protection (if authorized)
claude branch protection bypass --branch main --reason "Emergency fix"
```

### Stale Branch Problems

**Problem**: Too many stale or abandoned branches

```bash
# Identify stale branches
claude branch list --stale --days 30

# Clean up safely
claude branch cleanup --dry-run
claude branch cleanup --merged --confirm

# Force cleanup (use carefully)
claude branch cleanup --stale --force --days 60
```

### Upstream Tracking Issues

**Problem**: Branch not tracking remote properly

```bash
# Check tracking status
git branch -vv
claude branch tracking status

# Set upstream tracking
git branch --set-upstream-to=origin/feature-branch
claude branch track origin/feature-branch

# Push with upstream
git push -u origin feature-branch
claude branch push --set-upstream
```

## PR Creation Failures

### Permission Errors

**Problem**: Cannot create pull requests

```bash
# Check repository permissions
claude auth permissions --repo

# Check if repository is fork
git remote -v
claude repo status

# Use correct base repository for forks
claude create-PR --base upstream/main
```

### Invalid PR Parameters

**Problem**: PR creation fails due to invalid parameters

```bash
# Validate PR parameters
claude create-PR --dry-run \
  --title "Feature: Add authentication" \
  --base main

# Check reviewer validity
claude reviewers validate user1,user2,@org/team

# Verify label existence
claude labels list --repo
```

### Template Issues

**Problem**: PR template not found or invalid

```bash
# Check available templates
claude templates list

# Validate template
claude templates validate .github/pull_request_template.md

# Use custom template
claude create-PR --template .claude/templates/feature.md
```

### Branch Conflicts

**Problem**: Cannot create PR due to conflicts with base branch

```bash
# Check for conflicts before PR creation
claude create-PR --check-conflicts

# Resolve conflicts first
git fetch origin
git rebase origin/main
# Resolve conflicts
git rebase --continue

# Create PR after resolution
claude create-PR --title "Feature: Resolved conflicts"
```

## Workflow Execution Errors

### Workflow Configuration Issues

**Problem**: Workflow fails to load or execute

```bash
# Validate workflow configuration
claude workflow validate --config .claude/workflows/team.json

# Check workflow syntax
claude workflow lint --all

# Test workflow execution
claude workflow test --dry-run --workflow feature-flow
```

### State Corruption

**Problem**: Workflow in inconsistent state

```bash
# Check workflow state
claude workflow state --check

# Diagnose corruption
claude workflow diagnose --verbose

# Recover from backup
claude workflow recover --from-backup
claude workflow reset --to-clean-state
```

### Hook Failures

**Problem**: Git hooks or workflow hooks failing

```bash
# Check hook status
claude hooks status

# Validate hook scripts
claude hooks validate --all

# Skip hooks temporarily
claude commit --no-hooks
claude workflow run --skip-hooks

# Fix hook permissions
chmod +x .git/hooks/*
chmod +x .claude/hooks/*
```

### Automation Failures

**Problem**: Automated workflow steps failing

```bash
# Check automation status
claude automation status

# View automation logs
claude automation logs --last 10

# Retry failed automation
claude automation retry --step deploy

# Disable problematic automation
claude automation disable --step problematic-step
```

## Performance Issues

### Slow Command Execution

**Problem**: Claude Code commands running slowly

**Diagnosis**:

```bash
# Performance profiling
claude profile --command "create-PR"

# Network connectivity test
claude network test

# Cache statistics
claude cache stats
```

**Solutions**:

```bash
# Clear cache
claude cache clear

# Optimize configuration
claude config optimize

# Use performance mode
claude config set performance.mode optimized

# Reduce verbosity
claude config set logging.level error
```

### Memory Issues

**Problem**: High memory usage or out-of-memory errors

```bash
# Check memory usage
claude memory usage

# Clean up temporary files
claude cleanup --temp-files

# Reduce memory footprint
claude config set memory.limit 512mb
claude config set cache.max-size 100mb
```

### Network Timeouts

**Problem**: Operations timing out due to network issues

```bash
# Configure timeouts
claude config set network.timeout 60s
claude config set network.retries 3

# Use offline mode when possible
claude config set offline.enabled true

# Test connectivity
claude network diagnose --verbose
```

### Large Repository Issues

**Problem**: Performance problems with large repositories

```bash
# Enable shallow clone mode
claude config set git.shallow true

# Limit history depth
claude config set git.depth 100

# Use sparse checkout
claude config set git.sparse-checkout true

# Skip heavy operations
claude config set performance.skip-large-files true
```

## Configuration Problems

### Missing Configuration

**Problem**: Configuration file not found or incomplete

```bash
# Initialize default configuration
claude config init

# Create from template
claude config init --template team

# Validate configuration
claude config validate

# Show current configuration
claude config show --all
```

### Invalid Configuration

**Problem**: Configuration file contains errors

```bash
# Validate configuration syntax
claude config validate --strict

# Fix common issues
claude config fix --auto

# Reset to defaults
claude config reset --confirm

# Backup before changes
claude config backup --output config-backup.json
```

### Environment Variables

**Problem**: Environment-specific configuration issues

```bash
# Check environment variables
claude env list

# Set required variables
export CLAUDE_API_KEY=your_key
export GITHUB_TOKEN=your_token

# Use environment-specific config
claude config use --env production
```

### Permission Configuration

**Problem**: File or directory permission issues

```bash
# Check permissions
ls -la .claude/
ls -la ~/.claude/

# Fix permissions
chmod 755 ~/.claude/
chmod 644 ~/.claude/config.json

# Set secure permissions for sensitive files
chmod 600 ~/.claude/auth/tokens
```

## Advanced Debugging

### Debug Mode

```bash
# Enable debug logging
claude --debug command args

# Set debug level
export CLAUDE_DEBUG=verbose
claude command args

# Debug specific components
export CLAUDE_DEBUG=auth,git,workflow
claude create-PR --title "Debug test"
```

### Logging and Monitoring

```bash
# View logs
claude logs --tail 50
claude logs --filter error --since 1h

# Export logs for support
claude logs export --output support-logs.txt

# Monitor real-time
claude logs --follow --level debug
```

### Network Debugging

```bash
# Capture network traffic
claude network capture --output network.log

# Test API endpoints
claude api test --endpoint github
claude api test --endpoint anthropic

# Check proxy settings
claude network proxy --check
```

### Configuration Debugging

```bash
# Dump effective configuration
claude config dump --effective

# Trace configuration loading
claude config trace --verbose

# Compare configurations
claude config diff --env staging production
```

### Performance Profiling

```bash
# Profile command execution
claude profile create-PR --output profile.json

# Memory profiling
claude profile --memory branch create feature/test

# CPU profiling
claude profile --cpu workflow run complete-feature
```

### State Inspection

```bash
# Inspect internal state
claude state dump --output state.json

# Check state consistency
claude state validate --fix-issues

# Compare states
claude state diff --before state1.json --after state2.json
```

## Error Reference

### Common Error Codes

| Code | Description | Common Cause | Solution |
|------|-------------|--------------|----------|
| `EAUTH001` | Authentication failed | Invalid or expired token | `claude auth refresh` |
| `EGIT002` | Git repository not found | Not in git directory | `git init` or `cd` to repo |
| `ENET003` | Network connection timeout | Poor connectivity | Check internet, increase timeout |
| `EPERM004` | Permission denied | Insufficient file permissions | Fix permissions or run with sudo |
| `ECONF005` | Configuration invalid | Malformed config file | `claude config validate --fix` |
| `EBRANCH006` | Branch operation failed | Protected branch or conflicts | Resolve conflicts, check protection |
| `EPR007` | Pull request creation failed | Invalid parameters or permissions | Validate parameters, check access |
| `EWORK008` | Workflow execution failed | State corruption or missing deps | Reset workflow state |
| `ECACHE009` | Cache corruption detected | Corrupted cache files | `claude cache clear` |
| `EAPI010` | API rate limit exceeded | Too many requests | Wait or use different token |

### Authentication Errors

```bash
# EAUTH001: Authentication Failed
Error: Authentication failed. Please check your credentials.
Solution: claude auth login --github

# EAUTH002: Token Expired
Error: GitHub token has expired.
Solution: claude auth refresh

# EAUTH003: Insufficient Permissions
Error: Token lacks required permissions for this operation.
Solution: Update token permissions in GitHub settings

# EAUTH004: Organization Access Denied
Error: Cannot access organization repositories.
Solution: Request organization access or use personal token
```

### Git Integration Errors

```bash
# EGIT001: Not a Git Repository
Error: fatal: not a git repository (or any of the parent directories): .git
Solution: git init && git remote add origin <url>

# EGIT002: Remote Not Found
Error: fatal: 'origin' does not appear to be a git repository
Solution: git remote add origin <url>

# EGIT003: Merge Conflicts
Error: Automatic merge failed; fix conflicts and then commit the result.
Solution: claude conflicts resolve --interactive

# EGIT004: Detached HEAD
Error: You are in 'detached HEAD' state.
Solution: git checkout main && claude branch create feature/new
```

### Network and API Errors

```bash
# ENET001: Connection Timeout
Error: connect ETIMEDOUT
Solution: claude config set network.timeout 120s

# ENET002: DNS Resolution Failed
Error: getaddrinfo ENOTFOUND api.github.com
Solution: Check DNS settings, try different network

# EAPI001: Rate Limit Exceeded
Error: API rate limit exceeded for user.
Solution: Wait 1 hour or use different token

# EAPI002: Resource Not Found
Error: 404 - Repository not found
Solution: Check repository name and permissions
```

## Self-Recovery Procedures

### Automatic Recovery

```bash
# Enable automatic recovery
claude config set recovery.auto true
claude config set recovery.create-backups true

# Configure recovery strategies
{
  "recovery": {
    "auto": true,
    "strategies": {
      "auth_failure": "retry_with_refresh",
      "network_timeout": "increase_timeout_and_retry",
      "git_conflict": "attempt_auto_resolution",
      "config_corruption": "restore_from_backup"
    },
    "backup": {
      "frequency": "daily",
      "retention": "30d",
      "location": ".claude/backups/"
    }
  }
}
```

### Manual Recovery Steps

```bash
# Step 1: Create recovery point
claude backup create --name "before-recovery"

# Step 2: Attempt automatic recovery
claude recover --auto

# Step 3: Manual intervention if needed
claude recover --interactive

# Step 4: Validate recovery
claude validate --all
claude health-check
```

### Emergency Recovery

```bash
# Nuclear option: Complete reset
claude emergency-reset --confirm

# Restore from known good state
claude restore --from .claude/backups/last-known-good.json

# Rebuild from scratch
claude rebuild --from-git-history
```

## Preventive Measures

### Health Monitoring

```bash
# Setup health checks
claude monitor setup --schedule "0 */6 * * *"  # Every 6 hours

# Configure alerts
claude alerts configure \
  --email admin@company.com \
  --slack "#dev-alerts" \
  --threshold error

# Health check script
#!/bin/bash
# .claude/scripts/health-check.sh
claude health-check --json > /tmp/claude-health.json
if ! jq -e '.status == "healthy"' /tmp/claude-health.json; then
  echo "Claude Code health issue detected"
  claude diagnose --export /tmp/claude-debug.json
  # Send alert notification
fi
```

### Backup Strategy

```bash
# Automated backups
claude backup configure \
  --schedule daily \
  --retention 30d \
  --location ~/.claude/backups/ \
  --include-config \
  --include-state \
  --include-auth

# Manual backup before major changes
claude backup create --name "before-workflow-update"

# Verify backup integrity
claude backup verify --all
```

### Configuration Validation

```bash
# Pre-commit hooks for configuration
#!/bin/bash
# .git/hooks/pre-commit
if [ -f .claude/config.json ]; then
  claude config validate --strict || {
    echo "Claude configuration validation failed"
    exit 1
  }
fi

# Continuous validation
claude config watch --auto-fix --notify-changes
```

### Update Management

```bash
# Safe update procedure
#!/bin/bash
# Update script with rollback capability

# 1. Backup current state
claude backup create --name "pre-update-$(date +%Y%m%d)"

# 2. Check for updates
CURRENT=$(claude --version)
LATEST=$(npm view @anthropic-ai/claude-code version)

if [ "$CURRENT" != "$LATEST" ]; then
  echo "Updating from $CURRENT to $LATEST"
  
  # 3. Update
  npm update -g @anthropic-ai/claude-code
  
  # 4. Validate update
  if ! claude health-check --quiet; then
    echo "Update validation failed, rolling back"
    npm install -g @anthropic-ai/claude-code@$CURRENT
    claude restore --from "pre-update-$(date +%Y%m%d)"
    exit 1
  fi
  
  echo "Update successful"
fi
```

## Team Troubleshooting

### Collaborative Debugging

```bash
# Share debugging session
claude debug share --session-id team-debug-001

# Join debugging session
claude debug join team-debug-001

# Export team diagnostic report
claude team diagnose --export team-report.json
```

### Common Team Issues

#### Conflicting Configurations

**Problem**: Team members have different Claude Code configurations

```bash
# Standardize team configuration
claude config template create team-standard \
  --from .claude/config.json \
  --share-with team

# Apply team configuration
claude config apply team-standard --confirm

# Verify team alignment
claude team config-check --report-differences
```

#### Workflow Synchronization Issues

**Problem**: Team workflows out of sync

```bash
# Check workflow consistency across team
claude workflow team-status

# Synchronize workflows
claude workflow sync --team --source main

# Validate team workflow compliance
claude workflow validate --team-rules
```

#### Permission Conflicts

**Problem**: Inconsistent repository permissions across team

```bash
# Audit team permissions
claude team permissions audit

# Standardize access levels
claude team permissions sync --template .claude/team-permissions.json

# Report permission issues
claude team permissions report --issues-only
```

## Support and Escalation

### Self-Service Resources

```bash
# Built-in help system
claude help --topic troubleshooting
claude help --search "authentication error"

# Interactive troubleshooter
claude troubleshoot --interactive

# Common solutions wizard
claude wizard fix-common-issues
```

### Documentation and Examples

```bash
# Access local documentation
claude docs open troubleshooting
claude docs search "merge conflicts"

# Example solutions
claude examples show --category troubleshooting
claude examples run auth-recovery
```

### Community Support

```bash
# Check community solutions
claude community search "permission denied"

# Submit issue to community
claude community post-issue \
  --title "Authentication failing after update" \
  --include-diagnostics

# Browse known issues
claude community issues --status open --labels bug
```

### Professional Support

```bash
# Generate support ticket
claude support ticket create \
  --priority high \
  --category authentication \
  --include-logs \
  --include-config

# Upload diagnostic bundle
claude support upload-diagnostics \
  --ticket-id SUP-12345 \
  --include-environment

# Schedule support session
claude support schedule \
  --type screen-share \
  --timezone America/New_York
```

### Escalation Procedures

#### Level 1: Self-Service (0-30 minutes)
1. Run `claude health-check`
2. Check this troubleshooting guide
3. Try automatic recovery: `claude recover --auto`
4. Search community solutions

#### Level 2: Team Support (30 minutes - 2 hours)
1. Consult team lead or senior developer
2. Check team-specific documentation
3. Review recent team changes
4. Use collaborative debugging

#### Level 3: Professional Support (2+ hours)
1. Create detailed support ticket
2. Include comprehensive diagnostics
3. Provide reproduction steps
4. Schedule support session if needed

#### Level 4: Emergency Escalation (Critical issues)
1. Contact emergency support line
2. Use backup systems if available
3. Implement temporary workarounds
4. Document incident for post-mortem

## Best Practices for Troubleshooting

### ✅ Effective Troubleshooting

- **Start with basics**: Check authentication, network, and git status
- **Use diagnostic tools**: Leverage built-in health checks and validation
- **Document issues**: Keep track of errors and solutions
- **Test incrementally**: Make small changes and test each step
- **Backup first**: Always backup before making major changes
- **Read error messages**: Error messages often contain solution hints
- **Check recent changes**: Problems often relate to recent modifications
- **Use verbose mode**: Enable detailed logging for complex issues

### ❌ Troubleshooting Mistakes

- **Don't panic**: Avoid making hasty changes that could worsen issues
- **Don't skip diagnostics**: Running health checks saves time
- **Don't ignore warnings**: Address warnings before they become errors
- **Don't work in isolation**: Collaborate with team on complex issues
- **Don't forget to validate**: Always verify fixes work completely
- **Don't skip documentation**: Document solutions for future reference
- **Don't assume root cause**: Investigate thoroughly before implementing fixes

### Troubleshooting Checklist

```bash
# Quick troubleshooting checklist
□ Run claude health-check
□ Check authentication status
□ Verify git repository state
□ Test network connectivity
□ Validate configuration files
□ Check for recent changes
□ Review error logs
□ Try automatic recovery
□ Search for known solutions
□ Document findings

# Before escalating:
□ Attempted self-service solutions
□ Gathered comprehensive diagnostics
□ Documented reproduction steps
□ Checked with team members
□ Reviewed recent changes
□ Created backup of current state
```

## Debugging Tools Reference

### Built-in Diagnostic Commands

```bash
# Comprehensive diagnostics
claude diagnose --full --export debug-full.json

# Specific component diagnostics
claude diagnose auth --verbose
claude diagnose git --check-connectivity
claude diagnose workflow --validate-state
claude diagnose network --test-endpoints

# Performance diagnostics
claude diagnose performance --profile
claude diagnose memory --usage-report
claude diagnose cache --efficiency-stats
```

### External Tools Integration

```bash
# Git debugging
git config --list | grep claude
git log --oneline --graph --decorate

# Network debugging
curl -I https://api.github.com
nslookup api.github.com
ping -c 4 github.com

# System debugging
node --version
npm --version
echo $PATH
env | grep -i claude
```

### Log Analysis Tools

```bash
# Built-in log analysis
claude logs analyze --pattern error
claude logs analyze --timeline --last 24h
claude logs analyze --performance --slow-commands

# External log analysis
tail -f ~/.claude/logs/claude.log | grep ERROR
grep -n "authentication" ~/.claude/logs/*.log
awk '/ERROR/ {print $1, $2, $NF}' ~/.claude/logs/claude.log
```

---

## Quick Reference Card

### Emergency Commands
```bash
claude health-check          # Check system health
claude auth refresh          # Fix authentication
claude cache clear           # Clear corrupted cache
claude reset --soft          # Reset to clean state
claude recover --auto        # Attempt automatic recovery
claude backup create         # Create recovery point
```

### Diagnostic Commands
```bash
claude diagnose --full       # Complete system diagnostic
claude status --verbose      # Detailed status information
claude validate --all        # Validate all configurations
claude logs --tail 20        # Recent log entries
claude network test          # Network connectivity test
```

### Recovery Commands
```bash
claude restore --interactive # Interactive state restoration
claude config reset          # Reset configuration to defaults
claude workflow reset        # Reset workflow to clean state
claude team sync             # Synchronize with team settings
```

---

## See Also

- [Installation Guide](./installation.md)
- [Authentication Setup](./authentication.md)
- [Configuration Reference](./configuration.md)
- [Workflows Guide](./workflows.md)
- [Team Standards](./team-standards.md)

## Support

For additional help:
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Community Forums](https://community.anthropic.com)
- [Support Portal](https://support.anthropic.com)
- Emergency Support: support@anthropic.com