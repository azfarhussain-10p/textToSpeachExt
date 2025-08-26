# Package.json Verification Command

## Overview
Independent command for comprehensive package.json dependency validation, ensuring all dependencies are updated to their latest versions and confirming no deprecated dependencies are present. Utilizes Context7 MCP for enhanced dependency intelligence.

## Command Location
- **Script**: `.claude/commands/package-json-verify.sh`
- **Documentation**: `.claude/commands/package-json-verify.md` (this file)

## Usage

```bash
./.claude/commands/package-json-verify.sh [OPTIONS]
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--dry-run` | Analyze without making changes | `true` |
| `--update-all` | Update all dependencies to latest versions | `false` |
| `--security-only` | Only update packages with security vulnerabilities | `false` |
| `--check-deprecated` | Check for deprecated packages using Context7 MCP | `true` |
| `--help` | Show usage information | - |

### Usage Examples

#### Basic Analysis (Dry Run)
```bash
./.claude/commands/package-json-verify.sh
```
Performs comprehensive analysis without making any changes.

#### Update All Dependencies
```bash
./.claude/commands/package-json-verify.sh --update-all
```
Updates all outdated dependencies to their latest versions with automatic backup.

#### Security-Focused Updates
```bash
./.claude/commands/package-json-verify.sh --security-only
```
Only updates packages with known security vulnerabilities.

#### Full Analysis with Deprecation Check
```bash
./.claude/commands/package-json-verify.sh --check-deprecated --dry-run
```
Complete analysis including Context7 MCP deprecation checking without updates.

## Features

### 🔍 Comprehensive Analysis
- **Dependency Inventory**: Complete analysis of production, development, and peer dependencies
- **Outdated Detection**: Identifies packages with newer versions available
- **Security Scanning**: Detects known vulnerabilities using npm audit
- **Version Comparison**: Shows current vs. latest vs. wanted versions

### 📚 Context7 MCP Integration
- **Deprecation Detection**: Identifies deprecated packages and suggests alternatives
- **Migration Intelligence**: Fetches migration guides and breaking change information
- **Ecosystem Insights**: Provides maintenance status and community adoption data
- **Alternative Recommendations**: Suggests modern replacements for outdated packages

### 🚀 Automated Updates
- **Selective Updates**: Choose between all updates, security-only, or manual review
- **Backup Creation**: Automatic package.json backup before any changes
- **Rollback Support**: Easy restoration if updates cause issues
- **Progress Tracking**: Real-time feedback during update process

### 📊 Comprehensive Reporting
- **Markdown Reports**: Human-readable analysis with recommendations
- **JSON Summaries**: Machine-readable data for CI/CD integration
- **Update Logs**: Detailed execution logs for audit trails
- **Historical Tracking**: Timestamped reports for change tracking

## Output Structure

All reports are saved to `.claude/output/reports/validation/`:

```
.claude/output/reports/validation/
├── package-analysis_YYYYMMDD_HHMMSS.md     # Main analysis report
├── package-data_YYYYMMDD_HHMMSS.json       # JSON summary
├── package-updates_YYYYMMDD_HHMMSS.log     # Update execution log
├── npm-outdated_YYYYMMDD_HHMMSS.json       # Raw npm outdated data
└── npm-audit_YYYYMMDD_HHMMSS.json          # Raw npm audit data
```

## Context7 MCP Integration Details

### Dependency Analysis Enhancement
The command leverages Context7 MCP to provide enhanced dependency analysis:

```javascript
// Example Context7 integration for deprecation checking
async function analyzePackageWithContext7(packageName, currentVersion) {
    try {
        // Resolve library ID for Context7
        const libId = await mcp.resolveLibraryId(packageName);
        
        // Get comprehensive package documentation
        const docs = await mcp.getLibraryDocs(libId, {
            topic: 'deprecation,migration,alternatives,security',
            tokens: 6000
        });
        
        return {
            package: packageName,
            currentVersion,
            status: docs.maintenanceStatus || 'active',
            deprecated: docs.deprecated || false,
            deprecationReason: docs.deprecationReason,
            alternatives: docs.recommendedAlternatives || [],
            migrationPath: docs.migrationGuide,
            securityNotes: docs.securityConsiderations,
            communityAdoption: docs.adoptionMetrics,
            lastUpdate: docs.lastMaintained
        };
    } catch (error) {
        return {
            package: packageName,
            currentVersion,
            status: 'unknown',
            error: error.message
        };
    }
}
```

### Migration Recommendation Engine
```javascript
// Generate intelligent migration recommendations
async function generateMigrationRecommendations(deprecatedPackages) {
    const recommendations = [];
    
    for (const pkg of deprecatedPackages) {
        if (pkg.alternatives.length > 0) {
            const bestAlternative = pkg.alternatives[0];
            const migrationDocs = await mcp.getLibraryDocs(
                await mcp.resolveLibraryId(bestAlternative), {
                    topic: 'getting-started,migration-from-' + pkg.package,
                    tokens: 4000
                }
            );
            
            recommendations.push({
                from: pkg.package,
                to: bestAlternative,
                reason: pkg.deprecationReason,
                complexity: migrationDocs.migrationComplexity || 'medium',
                steps: migrationDocs.migrationSteps || [],
                codeExamples: migrationDocs.examples || [],
                estimatedTime: migrationDocs.estimatedMigrationTime
            });
        }
    }
    
    return recommendations;
}
```

## Exit Codes

The command uses standard exit codes for CI/CD integration:

- `0`: All dependencies are current and secure
- `1`: Outdated dependencies detected - updates available
- `2`: Security vulnerabilities detected - immediate attention required
- `3`: Deprecated packages found - migration recommended
- `4`: Command execution error

## Error Handling

### Robust Error Recovery
- **Network Issues**: Graceful handling of npm registry connectivity problems
- **Permission Errors**: Clear messaging for file system permission issues
- **Dependency Conflicts**: Intelligent resolution suggestions for version conflicts
- **Context7 MCP Fallback**: Command continues if MCP services are unavailable

### Backup and Rollback
```bash
# Automatic backup creation before updates
cp package.json package.json.backup.TIMESTAMP

# Easy rollback if issues occur
cp package.json.backup.TIMESTAMP package.json
npm install
```

## Integration Examples

### CI/CD Pipeline Integration
```yaml
# .github/workflows/dependency-check.yml
name: Dependency Validation
on: [push, pull_request]

jobs:
  validate-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Validate package.json
        run: ./.claude/commands/package-json-verify.sh --security-only
      - name: Upload analysis report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-analysis
          path: .claude/output/reports/validation/
```

### Pre-commit Hook Integration
```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running dependency validation..."
./.claude/commands/package-json-verify.sh --dry-run --security-only

exit_code=$?
if [ $exit_code -eq 2 ]; then
    echo "❌ Security vulnerabilities detected. Please run:"
    echo "   ./.claude/commands/package-json-verify.sh --security-only"
    exit 1
fi
```

## Troubleshooting

### Common Issues

#### Permission Denied
```bash
chmod +x ./.claude/commands/package-json-verify.sh
```

#### Missing Dependencies
```bash
# Ensure Node.js and npm are available
node --version
npm --version
```

#### Context7 MCP Connection Issues
The command will continue with standard analysis if Context7 MCP is unavailable, providing degraded but functional dependency checking.

## Advanced Configuration

### Custom Deprecation Rules
You can extend the deprecation detection by modifying the script to include project-specific deprecated packages:

```bash
# Add to the script's deprecated package list
CUSTOM_DEPRECATED_PACKAGES="your-deprecated-package another-old-package"
```

### Integration with Project-Specific Rules
The command can be extended to enforce project-specific dependency policies:

```bash
# Example: Enforce specific version ranges
ENFORCE_VERSION_POLICY=true
ALLOWED_VERSION_RANGES="package-name:^2.0.0 other-package:~1.5.0"
```

This independent command provides focused, powerful package.json validation with intelligent dependency management powered by Context7 MCP integration.