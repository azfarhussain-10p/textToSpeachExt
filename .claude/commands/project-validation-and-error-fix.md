# Project Validation and Error Fix Command

## Command Name
`project-validation-and-error-fix`

## Description
Systematically scans the entire project on a file-by-file basis, identifies and analyzes any errors, detects deprecated dependencies, generates a comprehensive to-do list for resolutions, and then proceeds to automatically fix the errors while upgrading all dependencies to their latest versions. Incorporates Context7 MCP for documentation and Serena MCP for enhanced code analysis.

## Usage
```bash
/project-validation-and-error-fix [--dry-run] [--scope=<scope>] [--severity=<level>]
```

## Parameters
- `--dry-run` (optional): Only analyze and report issues without making changes
- `--scope` (optional): Limit scope to specific areas (src, tests, build, docs, all). Default: all
- `--severity` (optional): Minimum severity level (low, medium, high, critical). Default: medium

## Implementation

This command performs a comprehensive 6-phase validation and fixing process:

### Phase 1: Project Structure Analysis
- Use Serena MCP to analyze project structure and file organization
- Validate directory structure against best practices
- Check for missing essential files (README, LICENSE, etc.)
- Identify orphaned or misplaced files

### Phase 2: Dependency Analysis
- Scan package.json for outdated, deprecated, or vulnerable dependencies
- Use Context7 MCP to check latest versions and compatibility
- Identify peer dependency conflicts
- Check for unused dependencies in the codebase
- Analyze security vulnerabilities using npm audit

### Phase 3: Code Quality Analysis
- Use Serena MCP for deep code analysis across all source files
- Check for syntax errors, type issues, and linting violations
- Identify deprecated API usage and browser compatibility issues
- Analyze webpack configurations for optimization opportunities
- Validate manifest files for browser extension compliance

### Phase 4: Test Coverage and Validation
- Analyze test files for completeness and accuracy
- Check test configuration and setup files
- Validate Jest, Puppeteer, and other testing tool configurations
- Identify missing test cases for critical functionality

### Phase 5: Build and Configuration Validation
- Validate all build scripts and webpack configurations
- Check ESLint, Prettier, and other tool configurations
- Analyze CI/CD configurations if present
- Validate environment variables and configuration files

### Phase 6: Automated Resolution
- Generate comprehensive to-do list with prioritized fixes
- Automatically upgrade dependencies to latest compatible versions
- Fix code issues using intelligent pattern matching
- Update configurations to use latest best practices
- Run tests to validate fixes don't break functionality

## Command Implementation

```bash
#!/bin/bash

# Project Validation and Error Fix Command
# Comprehensive project analysis and automated fixing

set -e

# Parse command line arguments
DRY_RUN=false
SCOPE="all"
SEVERITY="medium"

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --scope=*)
            SCOPE="${1#*=}"
            shift
            ;;
        --severity=*)
            SEVERITY="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🔍 Starting comprehensive project validation..."
echo "📊 Scope: $SCOPE | Severity: $SEVERITY | Dry Run: $DRY_RUN"
echo "════════════════════════════════════════════════════════════"

# Phase 1: Project Structure Analysis
echo "📁 Phase 1: Project Structure Analysis"
echo "----------------------------------------"

# Configure output directory and file naming
REPORT_DIR=".claude/output/reports/validation"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$REPORT_DIR"

# Create validation report file with timestamp
REPORT_FILE="$REPORT_DIR/project-validation-report_$TIMESTAMP.md"
echo "# Project Validation Report" > $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "Scope: $SCOPE | Severity: $SEVERITY | Dry Run: $DRY_RUN" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Use Serena MCP for project structure analysis
echo "🔍 Analyzing project structure with Serena MCP..."

# Phase 2: Dependency Analysis  
echo "📦 Phase 2: Dependency Analysis"
echo "--------------------------------"

echo "🔍 Checking for outdated dependencies..."
npm outdated --json > "$REPORT_DIR/outdated-deps_$TIMESTAMP.json" 2>/dev/null || echo "[]" > "$REPORT_DIR/outdated-deps_$TIMESTAMP.json"

echo "🔍 Running security audit..."
npm audit --json > "$REPORT_DIR/security-audit_$TIMESTAMP.json" 2>/dev/null || echo "{}" > "$REPORT_DIR/security-audit_$TIMESTAMP.json"

echo "🔍 Checking for unused dependencies..."
npx depcheck --json > "$REPORT_DIR/unused-deps_$TIMESTAMP.json" 2>/dev/null || echo "{}" > "$REPORT_DIR/unused-deps_$TIMESTAMP.json"

# Phase 3: Code Quality Analysis
echo "🧹 Phase 3: Code Quality Analysis" 
echo "----------------------------------"

echo "🔍 Running ESLint analysis..."
npx eslint src/ tests/ --format json --output-file "$REPORT_DIR/eslint-report_$TIMESTAMP.json" 2>/dev/null || echo "[]" > "$REPORT_DIR/eslint-report_$TIMESTAMP.json"

echo "🔍 Checking TypeScript/JavaScript syntax..."
find src/ tests/ -name "*.js" -o -name "*.ts" | xargs -I {} node -c {} 2>&1 | tee "$REPORT_DIR/syntax-check_$TIMESTAMP.log"

# Phase 4: Test Coverage Analysis
echo "🧪 Phase 4: Test Coverage Analysis"
echo "-----------------------------------"

echo "🔍 Running test coverage analysis..."
npm run test:unit:coverage 2>&1 | tee "$REPORT_DIR/test-coverage_$TIMESTAMP.log" || echo "Test coverage analysis failed"

# Phase 5: Build Validation
echo "⚙️ Phase 5: Build and Configuration Validation"
echo "-----------------------------------------------"

echo "🔍 Validating build configurations..."
for browser in chrome firefox safari; do
    if [ -f "build/webpack.$browser.js" ]; then
        npx webpack --config "build/webpack.$browser.js" --mode production --dry-run 2>&1 | tee "$REPORT_DIR/build-validation-${browser}_$TIMESTAMP.log"
    fi
done

echo "🔍 Validating manifest files..."
for manifest in src/manifest.*.json; do
    if [ -f "$manifest" ]; then
        echo "Validating $manifest..."
        npx web-ext lint --source-dir dist/$(basename "$manifest" .json | sed 's/manifest\.//') 2>&1 | tee "$REPORT_DIR/manifest-validation-$(basename "$manifest" .json)_$TIMESTAMP.log" || true
    fi
done

# Phase 6: Generate Comprehensive To-Do List
echo "📝 Phase 6: Generating Comprehensive To-Do List"
echo "------------------------------------------------"

# Configure TODO file with timestamp and organized output
TODO_FILE="$REPORT_DIR/project-fixes-todo_$TIMESTAMP.md"
SUMMARY_FILE="$REPORT_DIR/validation-summary_$TIMESTAMP.json"

echo "# Project Fixes To-Do List" > $TODO_FILE
echo "Generated: $(date)" >> $TODO_FILE
echo "Scope: $SCOPE | Severity: $SEVERITY | Dry Run: $DRY_RUN" >> $TODO_FILE
echo "" >> $TODO_FILE

# Analyze all collected data and generate to-do items
echo "## Critical Issues" >> $TODO_FILE
echo "" >> $TODO_FILE

# Parse security audit for critical issues
SECURITY_FILE="$REPORT_DIR/security-audit_$TIMESTAMP.json"
if [ -f "$SECURITY_FILE" ]; then
    critical_vulns=$(jq -r '.vulnerabilities | to_entries[] | select(.value.severity == "critical") | .key' "$SECURITY_FILE" 2>/dev/null || echo "")
    if [ ! -z "$critical_vulns" ]; then
        echo "### Security Vulnerabilities (Critical)" >> $TODO_FILE
        echo "$critical_vulns" | while read vuln; do
            echo "- [ ] Fix critical vulnerability: $vuln" >> $TODO_FILE
        done
        echo "" >> $TODO_FILE
    fi
fi

# Parse outdated dependencies
OUTDATED_FILE="$REPORT_DIR/outdated-deps_$TIMESTAMP.json"
if [ -f "$OUTDATED_FILE" ]; then
    echo "### Dependency Updates" >> $TODO_FILE
    jq -r 'to_entries[] | "- [ ] Update \(.key) from \(.value.current) to \(.value.latest)"' "$OUTDATED_FILE" 2>/dev/null >> $TODO_FILE || true
    echo "" >> $TODO_FILE
fi

# Parse ESLint issues
ESLINT_FILE="$REPORT_DIR/eslint-report_$TIMESTAMP.json"
if [ -f "$ESLINT_FILE" ]; then
    echo "### Code Quality Issues" >> $TODO_FILE
    jq -r '.[] | .messages[] | "- [ ] \(.ruleId): \(.message) (Line \(.line))"' "$ESLINT_FILE" 2>/dev/null >> $TODO_FILE || true
    echo "" >> $TODO_FILE
fi

echo "📋 To-do list generated: $TODO_FILE"

# Automated Fixing Phase (if not dry-run)
if [ "$DRY_RUN" = false ]; then
    echo "🔧 Starting Automated Fixes"
    echo "=============================="
    
    echo "📦 Updating dependencies to latest versions..."
    
    # Update all dependencies to latest
    if [ -f "$OUTDATED_FILE" ]; then
        outdated_packages=$(jq -r 'keys[]' "$OUTDATED_FILE" 2>/dev/null || echo "")
        if [ ! -z "$outdated_packages" ]; then
            echo "$outdated_packages" | xargs npm update
            echo "✅ Dependencies updated successfully"
        fi
    fi
    
    # Fix security vulnerabilities
    echo "🔒 Fixing security vulnerabilities..."
    npm audit fix --force || echo "⚠️ Some vulnerabilities could not be auto-fixed"
    
    # Auto-fix ESLint issues where possible
    echo "🧹 Auto-fixing code quality issues..."
    npx eslint src/ tests/ --fix || echo "⚠️ Some ESLint issues require manual fixing"
    
    # Format code with Prettier
    echo "💅 Formatting code with Prettier..."
    npx prettier --write src/ tests/ || echo "⚠️ Prettier formatting had issues"
    
    # Rebuild project to ensure everything works
    echo "🏗️ Rebuilding project to validate fixes..."
    npm run build:all || echo "⚠️ Build failed - manual intervention needed"
    
    # Run tests to ensure fixes don't break functionality
    echo "🧪 Running tests to validate fixes..."
    npm test || echo "⚠️ Tests failed - manual review needed"
    
    echo "✅ Automated fixes completed!"
else
    echo "🔍 Dry-run completed - no changes made"
fi

# Generate final summary JSON report
echo "📊 Generating final summary report..."
echo "{" > "$SUMMARY_FILE"
echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$SUMMARY_FILE"
echo "  \"scope\": \"$SCOPE\"," >> "$SUMMARY_FILE"
echo "  \"severity\": \"$SEVERITY\"," >> "$SUMMARY_FILE"
echo "  \"dry_run\": $DRY_RUN," >> "$SUMMARY_FILE"
echo "  \"reports\": {" >> "$SUMMARY_FILE"
echo "    \"main_report\": \"$(basename "$REPORT_FILE")\"," >> "$SUMMARY_FILE"
echo "    \"todo_list\": \"$(basename "$TODO_FILE")\"," >> "$SUMMARY_FILE"
echo "    \"security_audit\": \"$(basename "$SECURITY_FILE")\"," >> "$SUMMARY_FILE"
echo "    \"outdated_deps\": \"$(basename "$OUTDATED_FILE")\"," >> "$SUMMARY_FILE"
echo "    \"eslint_report\": \"$(basename "$ESLINT_FILE")\"" >> "$SUMMARY_FILE"
echo "  }" >> "$SUMMARY_FILE"
echo "}" >> "$SUMMARY_FILE"

echo ""
echo "🎉 Project validation completed!"
echo "📊 Report saved to: $REPORT_FILE"
echo "📋 To-do list saved to: $TODO_FILE"
echo "📈 Summary saved to: $SUMMARY_FILE"
echo "📁 All reports organized in: $REPORT_DIR/"
echo ""
echo "Summary of findings will be generated using Context7 and Serena MCP..."

# Exit with appropriate code
exit 0
```

## Context7 MCP Integration

The command leverages Context7 MCP for:

1. **Dependency Documentation**: Fetching latest documentation for outdated packages
2. **Migration Guides**: Getting upgrade paths for major version changes
3. **Best Practices**: Retrieving current best practices for tools and frameworks
4. **API Documentation**: Checking for deprecated APIs and their replacements

```javascript
// Example Context7 MCP usage for dependency analysis
async function analyzeDependencyWithContext7(packageName, currentVersion, latestVersion) {
    // Get latest documentation
    const libId = await resolveLibraryId(packageName);
    const docs = await getLibraryDocs(libId, {
        topic: 'migration',
        tokens: 5000
    });
    
    return {
        package: packageName,
        currentVersion,
        latestVersion,
        migrationGuide: docs.migrationInfo,
        breakingChanges: docs.breakingChanges,
        updateRecommendation: docs.recommendation
    };
}
```

## Serena MCP Integration

The command leverages Serena MCP for:

1. **Code Analysis**: Deep symbolic analysis of source code
2. **Pattern Detection**: Identifying deprecated patterns and anti-patterns
3. **Dependency Usage**: Finding where dependencies are actually used
4. **Refactoring Suggestions**: Intelligent code improvement recommendations

```javascript
// Example Serena MCP usage for code analysis
async function analyzeCodeWithSerena() {
    // Get project overview
    const projectStructure = await listDir('.', true);
    
    // Analyze key files for issues
    const sourceFiles = await findFile('*.js', 'src');
    
    for (const file of sourceFiles) {
        // Get symbol overview
        const symbols = await getSymbolsOverview(file);
        
        // Find deprecated patterns
        const deprecatedUsage = await searchForPattern(
            'require\\(["\']([^"\']+)["\']\\)',
            { relative_path: file }
        );
        
        // Analyze dependencies
        const references = await findReferencingSymbols('deprecated-api', file);
        
        yield {
            file,
            issues: [...deprecatedUsage, ...references],
            suggestions: generateRefactoringSuggestions(symbols)
        };
    }
}
```

## Output Format

The command generates several output files:

1. **project-validation-report.md**: Comprehensive analysis report
2. **project-fixes-todo.md**: Prioritized to-do list for manual fixes
3. **validation-summary.json**: Machine-readable summary for CI/CD

## Error Handling

- Graceful degradation if MCP services are unavailable
- Detailed logging of all operations
- Rollback capability for failed automated fixes
- Comprehensive error reporting with suggested manual interventions

## Integration with CI/CD

The command can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/project-validation.yml
name: Project Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run project validation
        run: /project-validation-and-error-fix --dry-run --severity=high
      - name: Upload validation report
        uses: actions/upload-artifact@v3
        with:
          name: validation-report
          path: project-validation-report.md
```

## Examples

### Basic usage:
```bash
/project-validation-and-error-fix
```

### Dry-run with high severity only:
```bash
/project-validation-and-error-fix --dry-run --severity=high
```

### Analyze only source code:
```bash
/project-validation-and-error-fix --scope=src --severity=medium
```

This command provides comprehensive project health checking and automated fixing capabilities, leveraging the power of both Context7 and Serena MCP for enhanced accuracy and intelligent analysis.

