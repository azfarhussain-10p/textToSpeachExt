# Claude Code: Development Workflows Reference

## Overview

This guide provides comprehensive development workflows for teams using Claude Code. It covers standard workflow patterns, custom implementations, automation strategies, and best practices for different team structures and project types.

## Table of Contents

- [Quick Start](#quick-start)
- [Standard Workflows](#standard-workflows)
- [Custom Workflows](#custom-workflows)
- [Team-Specific Patterns](#team-specific-patterns)
- [Automation Integration](#automation-integration)
- [Quality Gates](#quality-gates)
- [Release Management](#release-management)
- [Troubleshooting Workflows](#troubleshooting-workflows)
- [Performance Optimization](#performance-optimization)

## Quick Start

```bash
# Initialize standard GitHub Flow
claude workflow init github-flow

# Start feature development
claude workflow start feature "user authentication"

# Complete feature workflow
claude workflow complete --with-pr --reviewers "team-lead"

# Initialize custom team workflow
claude workflow init --from-template .claude/workflows/team-workflow.json
```

## Standard Workflows

### 1. GitHub Flow

**Best for:** Simple projects, continuous deployment, small teams

```bash
# Initialize GitHub Flow
claude workflow init github-flow

# Configuration
{
  "name": "github-flow",
  "branches": {
    "main": {
      "protected": true,
      "default": true,
      "deploy_target": "production"
    }
  },
  "pattern": {
    "feature": "feature/{description}",
    "hotfix": "hotfix/{description}",
    "pr_required": true,
    "auto_delete_merged": true
  }
}
```

**Workflow Steps:**
```bash
# 1. Create feature branch from main
claude workflow feature start "add-user-dashboard"
# Creates: feature/add-user-dashboard

# 2. Develop and commit
git add .
git commit -m "Implement user dashboard components"

# 3. Push and create PR
claude workflow feature push
claude workflow feature pr --reviewers "frontend-team"

# 4. Merge and cleanup
claude workflow feature complete
# Merges PR, deletes branch, updates main
```

### 2. Git Flow

**Best for:** Large projects, scheduled releases, formal release cycles

```bash
# Initialize Git Flow
claude workflow init git-flow

# Configuration
{
  "name": "git-flow",
  "branches": {
    "main": {
      "protected": true,
      "stable": true,
      "deploy_target": "production"
    },
    "develop": {
      "protected": true,
      "integration": true,
      "deploy_target": "staging"
    }
  },
  "patterns": {
    "feature": "feature/{ticket}-{description}",
    "release": "release/{version}",
    "hotfix": "hotfix/{version}-{description}"
  }
}
```

**Feature Workflow:**
```bash
# 1. Start feature from develop
claude workflow feature start AUTH-123 "oauth integration"
# Creates: feature/AUTH-123-oauth-integration from develop

# 2. Develop feature
git add .
git commit -m "Add OAuth2 provider configuration"

# 3. Finish feature
claude workflow feature finish AUTH-123
# Merges to develop, deletes feature branch
```

**Release Workflow:**
```bash
# 1. Start release
claude workflow release start v1.2.0
# Creates: release/v1.2.0 from develop

# 2. Release preparation
claude workflow release prepare
# Runs tests, updates versions, generates changelog

# 3. Finish release
claude workflow release finish v1.2.0
# Merges to main and develop, creates tag, deploys
```

**Hotfix Workflow:**
```bash
# 1. Start hotfix from main
claude workflow hotfix start v1.1.1 "security patch"
# Creates: hotfix/v1.1.1-security-patch from main

# 2. Apply fix
git add .
git commit -m "Fix security vulnerability in auth"

# 3. Finish hotfix
claude workflow hotfix finish v1.1.1
# Merges to main and develop, creates tag, deploys
```

### 3. GitLab Flow

**Best for:** Environment-based deployments, feature flags

```bash
# Initialize GitLab Flow
claude workflow init gitlab-flow

# Configuration with environment branches
{
  "name": "gitlab-flow",
  "branches": {
    "main": { "protected": true, "default": true },
    "staging": { "protected": true, "deploy_target": "staging" },
    "production": { "protected": true, "deploy_target": "production" }
  },
  "deployment": {
    "strategy": "environment-branches",
    "auto_promote": true
  }
}
```

**Environment Promotion:**
```bash
# 1. Feature to main
claude workflow feature complete --target main

# 2. Promote to staging
claude workflow promote main staging
# Merges main to staging, triggers staging deployment

# 3. Promote to production
claude workflow promote staging production
# Merges staging to production, triggers production deployment
```

### 4. Forking Workflow

**Best for:** Open source projects, external contributors

```bash
# Initialize forking workflow
claude workflow init forking

# For contributors
claude workflow fork upstream/repo
claude workflow feature start "improve-documentation"
claude workflow feature pr --upstream

# For maintainers
claude workflow review --pr 123
claude workflow merge --pr 123 --strategy squash
```

## Custom Workflows

### Team-Specific Workflow Design

```bash
# Create custom workflow template
claude workflow create team-workflow --interactive

# Example: Agile Sprint Workflow
{
  "name": "agile-sprint",
  "description": "Two-week sprint cycle with feature branches",
  "branches": {
    "main": {
      "protected": true,
      "deploy_target": "production",
      "merge_strategy": "squash"
    },
    "develop": {
      "protected": true,
      "deploy_target": "staging",
      "auto_test": true
    },
    "sprint/{number}": {
      "temporary": true,
      "merge_target": "develop",
      "auto_cleanup": true
    }
  },
  "patterns": {
    "feature": "feature/{sprint}/{story}-{description}",
    "bugfix": "fix/{severity}/{description}",
    "spike": "spike/{research-topic}"
  },
  "automation": {
    "sprint_start": "create_sprint_branch",
    "sprint_end": "merge_and_cleanup",
    "daily_sync": "update_feature_branches"
  }
}
```

### Advanced Custom Workflow

```bash
# Multi-service microservice workflow
{
  "name": "microservice-workflow",
  "services": ["auth", "api", "frontend", "payment"],
  "branches": {
    "main": { "protected": true },
    "develop": { "protected": true },
    "integration": { "auto_cleanup": "weekly" }
  },
  "patterns": {
    "feature": "feature/{service}/{ticket}-{description}",
    "integration": "integration/{epic}-{services}",
    "release": "release/{service}/v{version}"
  },
  "dependencies": {
    "auth": [],
    "api": ["auth"],
    "frontend": ["api", "auth"],
    "payment": ["auth", "api"]
  },
  "testing": {
    "unit": "per_service",
    "integration": "cross_service",
    "e2e": "full_stack"
  }
}
```

**Usage:**
```bash
# Start cross-service feature
claude workflow feature start --services auth,api "unified-login"
# Creates:
# - feature/auth/LOGIN-123-unified-login
# - feature/api/LOGIN-123-unified-login

# Coordinate integration
claude workflow integration create LOGIN-123 --services auth,api,frontend

# Test service dependencies
claude workflow test --service frontend --dependencies
```

## Team-Specific Patterns

### Small Team (2-5 developers)

```bash
# Simple workflow with minimal overhead
{
  "name": "small-team",
  "complexity": "low",
  "branches": {
    "main": { "protected": true }
  },
  "rules": {
    "pr_required": true,
    "review_required": 1,
    "auto_merge": true,
    "delete_merged": true
  },
  "patterns": {
    "feature": "feature/{developer}-{description}",
    "fix": "fix/{issue}-{description}"
  }
}

# Daily workflow
claude workflow daily-standup
# - Shows active branches per developer
# - Identifies merge conflicts
# - Suggests PR reviews needed
```

### Medium Team (6-15 developers)

```bash
# Structured workflow with role-based reviews
{
  "name": "medium-team",
  "complexity": "medium",
  "roles": {
    "senior": ["alice", "bob"],
    "junior": ["charlie", "diana"],
    "tech_lead": ["eve"]
  },
  "branches": {
    "main": { "protected": true, "require_admin": true },
    "develop": { "protected": true, "require_senior": true }
  },
  "review_rules": {
    "junior_prs": { "require": "senior", "min_reviews": 2 },
    "senior_prs": { "require": "tech_lead", "min_reviews": 1 },
    "hotfix": { "require": "tech_lead", "emergency_override": true }
  }
}

# Team coordination
claude workflow team-sync
# - Cross-team dependency checks
# - Review assignment optimization
# - Bottleneck identification
```

### Large Team (15+ developers)

```bash
# Enterprise workflow with governance
{
  "name": "enterprise-team",
  "complexity": "high",
  "governance": {
    "security_review": "required",
    "architecture_review": "for_major_changes",
    "compliance_check": "automated"
  },
  "teams": {
    "frontend": { "lead": "alice", "reviewers": ["bob", "charlie"] },
    "backend": { "lead": "diana", "reviewers": ["eve", "frank"] },
    "devops": { "lead": "grace", "reviewers": ["henry"] }
  },
  "approval_matrix": {
    "frontend_only": { "require": "frontend_lead" },
    "backend_only": { "require": "backend_lead" },
    "cross_team": { "require": "all_leads" },
    "infrastructure": { "require": "devops_lead + security" }
  }
}

# Enterprise coordination
claude workflow enterprise-governance
# - Multi-team impact analysis
# - Compliance verification
# - Security review automation
```

## Automation Integration

### CI/CD Pipeline Integration

```bash
# Workflow-triggered CI/CD
{
  "automation": {
    "on_feature_start": [
      "create_feature_environment",
      "setup_database_schema",
      "deploy_dependencies"
    ],
    "on_pr_create": [
      "run_unit_tests",
      "run_integration_tests",
      "security_scan",
      "performance_baseline"
    ],
    "on_merge_to_main": [
      "run_full_test_suite",
      "build_production_artifacts",
      "deploy_to_staging",
      "run_smoke_tests"
    ],
    "on_release": [
      "deploy_to_production",
      "run_acceptance_tests",
      "notify_stakeholders",
      "update_documentation"
    ]
  }
}

# Trigger automation manually
claude workflow trigger deploy-staging --branch feature/new-api
claude workflow trigger security-scan --full
```

### Issue Tracking Integration

```bash
# JIRA Integration
{
  "issue_tracking": {
    "provider": "jira",
    "project": "MYPROJECT",
    "automation": {
      "branch_create": "transition_to_in_progress",
      "pr_create": "transition_to_review",
      "merge": "transition_to_done",
      "release": "transition_to_deployed"
    },
    "linking": {
      "branch_pattern": "{ticket}-{description}",
      "commit_pattern": "{ticket}: {message}",
      "pr_template": "jira_template.md"
    }
  }
}

# Work with issues
claude workflow issue start PROJ-123
# Creates feature/PROJ-123-implement-user-auth
# Updates JIRA status to "In Progress"

claude workflow issue complete PROJ-123
# Merges PR, updates JIRA to "Done"
# Links commits and PR in JIRA
```

### Communication Integration

```bash
# Slack/Teams Integration
{
  "notifications": {
    "slack": {
      "webhook": "https://hooks.slack.com/...",
      "channels": {
        "dev-team": ["pr_created", "merge_conflicts", "deployment"],
        "qa-team": ["ready_for_testing", "deployment_staging"],
        "product": ["release_notes", "feature_complete"]
      }
    },
    "email": {
      "stakeholders": ["product@company.com"],
      "events": ["release", "hotfix", "critical_bug"]
    }
  }
}

# Custom notifications
claude workflow notify --channel dev-team \
  --message "Feature branch ready for review" \
  --pr-link
```

## Quality Gates

### Automated Quality Checks

```bash
# Quality gate configuration
{
  "quality_gates": {
    "code_quality": {
      "tools": ["eslint", "sonarqube", "codeclimate"],
      "thresholds": {
        "coverage": 80,
        "maintainability": "A",
        "security_rating": "A"
      },
      "blocking": true
    },
    "security": {
      "tools": ["snyk", "semgrep", "dependency_check"],
      "severity_threshold": "medium",
      "blocking": true
    },
    "performance": {
      "tools": ["lighthouse", "loadtest"],
      "thresholds": {
        "page_load": "3s",
        "api_response": "500ms"
      },
      "blocking": false
    }
  }
}

# Run quality gates
claude workflow quality-check --gate all
claude workflow quality-check --gate security --strict
```

### Manual Review Gates

```bash
# Review gate configuration
{
  "review_gates": {
    "code_review": {
      "required_reviewers": 2,
      "reviewer_types": ["senior_dev", "domain_expert"],
      "review_checklist": [
        "Code follows style guidelines",
        "Tests are comprehensive",
        "Documentation is updated",
        "Security considerations addressed"
      ]
    },
    "architecture_review": {
      "triggers": ["new_service", "database_changes", "api_changes"],
      "reviewers": ["tech_lead", "architect"],
      "required_artifacts": ["design_doc", "impact_analysis"]
    },
    "security_review": {
      "triggers": ["auth_changes", "data_handling", "external_apis"],
      "reviewers": ["security_team"],
      "checklist": "security_review_template.md"
    },
    "ux_review": {
      "triggers": ["ui_changes", "user_flow_changes"],
      "reviewers": ["ux_designer", "product_manager"],
      "artifacts": ["mockups", "user_stories"]
    }
  }
}