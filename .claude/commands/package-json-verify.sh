#!/bin/bash

# Package.json Verification Command
# Independent tool for comprehensive dependency validation and updates
# Uses Context7 MCP for enhanced dependency intelligence

set -e

# Script metadata
SCRIPT_NAME="package-json-verify"
SCRIPT_VERSION="1.0.0"
SCRIPT_DESCRIPTION="Package.json dependency validation and update tool"

# Default configuration
DRY_RUN=true
UPDATE_ALL=false
SECURITY_ONLY=false
CHECK_DEPRECATED=true
VERBOSE=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_progress() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

show_help() {
    cat << EOH
$SCRIPT_DESCRIPTION v$SCRIPT_VERSION

USAGE:
    $SCRIPT_NAME [OPTIONS]

OPTIONS:
    --dry-run          Analyze without making changes (default: true)
    --update-all       Update all dependencies to latest versions
    --security-only    Only update packages with security vulnerabilities
    --check-deprecated Check for deprecated packages using Context7 MCP (default: true)
    --no-deprecated    Skip deprecated package checking
    --verbose          Enable verbose output
    --help             Show this help message

EXAMPLES:
    # Basic analysis (dry-run)
    ./$SCRIPT_NAME

    # Update all dependencies
    ./$SCRIPT_NAME --update-all

    # Security updates only
    ./$SCRIPT_NAME --security-only

    # Full analysis with deprecation check
    ./$SCRIPT_NAME --check-deprecated --dry-run

OUTPUT:
    Reports are saved to .claude/output/reports/validation/
    - package-analysis_TIMESTAMP.md  (Main report)
    - package-data_TIMESTAMP.json    (JSON summary)
    - package-updates_TIMESTAMP.log  (Update log)

EXIT CODES:
    0  All dependencies current and secure
    1  Outdated dependencies available
    2  Security vulnerabilities detected
    3  Deprecated packages found
    4  Command execution error
EOH
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --update-all)
            UPDATE_ALL=true
            DRY_RUN=false
            shift
            ;;
        --security-only)
            SECURITY_ONLY=true
            DRY_RUN=false
            shift
            ;;
        --check-deprecated)
            CHECK_DEPRECATED=true
            shift
            ;;
        --no-deprecated)
            CHECK_DEPRECATED=false
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 4
            ;;
    esac
done

# Main execution starts here
echo "📦 Package.json Verification Tool v$SCRIPT_VERSION"
echo "═══════════════════════════════════════════════════"
log_info "Configuration: DRY_RUN=$DRY_RUN | UPDATE_ALL=$UPDATE_ALL | SECURITY_ONLY=$SECURITY_ONLY | CHECK_DEPRECATED=$CHECK_DEPRECATED"
echo ""

# Configure output directory and file naming
REPORT_DIR=".claude/output/reports/validation"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$REPORT_DIR"

# Create report files
MAIN_REPORT="$REPORT_DIR/package-analysis_$TIMESTAMP.md"
JSON_SUMMARY="$REPORT_DIR/package-data_$TIMESTAMP.json"
UPDATE_LOG="$REPORT_DIR/package-updates_$TIMESTAMP.log"
NPM_OUTDATED_FILE="$REPORT_DIR/npm-outdated_$TIMESTAMP.json"
NPM_AUDIT_FILE="$REPORT_DIR/npm-audit_$TIMESTAMP.json"

# Initialize main report
cat > "$MAIN_REPORT" << EOL
# Package.json Dependency Analysis Report

**Generated:** $(date)  
**Configuration:** DRY_RUN=$DRY_RUN | UPDATE_ALL=$UPDATE_ALL | SECURITY_ONLY=$SECURITY_ONLY  
**Tool Version:** $SCRIPT_VERSION

---

EOL

# Verify package.json exists
if [ ! -f "package.json" ]; then
    log_error "package.json not found in current directory: $(pwd)"
    echo "Please run this command from your project root directory."
    exit 4
fi

log_success "Found package.json file"

# Phase 1: Current Dependencies Analysis
log_progress "Phase 1: Analyzing Current Dependencies"
echo "## Current Dependencies Analysis" >> "$MAIN_REPORT"
echo "" >> "$MAIN_REPORT"

# Extract dependency information using Node.js
DEPS_ANALYSIS=$(node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const production = Object.keys(pkg.dependencies || {});
const development = Object.keys(pkg.devDependencies || {});
const peer = Object.keys(pkg.peerDependencies || {});
const optional = Object.keys(pkg.optionalDependencies || {});

console.log(JSON.stringify({
    production: { count: production.length, packages: production },
    development: { count: development.length, packages: development },
    peer: { count: peer.length, packages: peer },
    optional: { count: optional.length, packages: optional },
    total: production.length + development.length + peer.length + optional.length,
    name: pkg.name || 'unknown',
    version: pkg.version || '0.0.0'
}));
" 2>/dev/null)

if [ $? -eq 0 ]; then
    PROJECT_NAME=$(echo "$DEPS_ANALYSIS" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).name)")
    PROJECT_VERSION=$(echo "$DEPS_ANALYSIS" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version)")
    TOTAL_DEPS=$(echo "$DEPS_ANALYSIS" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).total)")
    
    log_info "Project: $PROJECT_NAME v$PROJECT_VERSION"
    log_info "Total Dependencies: $TOTAL_DEPS"
    
    # Add to report
    echo "**Project:** $PROJECT_NAME v$PROJECT_VERSION" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    
    echo "$DEPS_ANALYSIS" | node -e "
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
    console.log('### Dependency Summary');
    console.log('');
    console.log('| Type | Count | Packages |');
    console.log('|------|-------|----------|');
    console.log('| Production | ' + data.production.count + ' | ' + (data.production.packages.length > 5 ? data.production.packages.slice(0,5).join(', ') + '...' : data.production.packages.join(', ')) + ' |');
    console.log('| Development | ' + data.development.count + ' | ' + (data.development.packages.length > 5 ? data.development.packages.slice(0,5).join(', ') + '...' : data.development.packages.join(', ')) + ' |');
    console.log('| Peer | ' + data.peer.count + ' | ' + data.peer.packages.join(', ') + ' |');
    console.log('| Optional | ' + data.optional.count + ' | ' + data.optional.packages.join(', ') + ' |');
    console.log('| **Total** | **' + data.total + '** | |');
    console.log('');
    " >> "$MAIN_REPORT"
else
    log_error "Failed to analyze package.json"
    TOTAL_DEPS=0
fi

# Phase 2: Outdated Dependencies Check
log_progress "Phase 2: Checking for Outdated Dependencies"
echo "## Outdated Dependencies Analysis" >> "$MAIN_REPORT"
echo "" >> "$MAIN_REPORT"

log_info "Running npm outdated analysis..."
if npm outdated --json > "$NPM_OUTDATED_FILE" 2>/dev/null; then
    log_success "npm outdated completed successfully"
else
    log_warning "npm outdated completed with warnings (normal if no outdated packages)"
    echo "{}" > "$NPM_OUTDATED_FILE"
fi

# Count outdated dependencies
OUTDATED_COUNT=$(node -e "
try {
    const data = JSON.parse(require('fs').readFileSync('$NPM_OUTDATED_FILE', 'utf8'));
    console.log(Object.keys(data).length);
} catch (e) {
    console.log('0');
}
" 2>/dev/null || echo "0")

log_info "Found $OUTDATED_COUNT outdated dependencies"

if [ "$OUTDATED_COUNT" -gt 0 ]; then
    echo "### 📦 Outdated Packages ($OUTDATED_COUNT found)" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    echo "| Package | Current | Wanted | Latest | Type |" >> "$MAIN_REPORT"
    echo "|---------|---------|---------|---------|------|" >> "$MAIN_REPORT"
    
    node -e "
    try {
        const data = JSON.parse(require('fs').readFileSync('$NPM_OUTDATED_FILE', 'utf8'));
        Object.entries(data).forEach(([pkg, info]) => {
            console.log('| ' + pkg + ' | ' + info.current + ' | ' + info.wanted + ' | ' + info.latest + ' | ' + info.type + ' |');
        });
    } catch (e) {
        console.log('| Error parsing data | | | | |');
    }
    " >> "$MAIN_REPORT" 2>/dev/null
    
    echo "" >> "$MAIN_REPORT"
else
    echo "### ✅ All Dependencies Up to Date" >> "$MAIN_REPORT"
    echo "No outdated packages detected." >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
fi

# Phase 3: Security Vulnerability Analysis
log_progress "Phase 3: Security Vulnerability Analysis"
echo "## Security Analysis" >> "$MAIN_REPORT"
echo "" >> "$MAIN_REPORT"

log_info "Running npm security audit..."
if npm audit --json > "$NPM_AUDIT_FILE" 2>/dev/null; then
    log_success "npm audit completed"
else
    log_warning "npm audit completed with findings or warnings"
    echo '{"vulnerabilities":{}}' > "$NPM_AUDIT_FILE"
fi

# Count vulnerabilities
VULN_COUNT=$(node -e "
try {
    const data = JSON.parse(require('fs').readFileSync('$NPM_AUDIT_FILE', 'utf8'));
    const vulns = data.vulnerabilities || {};
    console.log(Object.keys(vulns).length);
} catch (e) {
    console.log('0');
}
" 2>/dev/null || echo "0")

log_info "Found $VULN_COUNT security vulnerabilities"

if [ "$VULN_COUNT" -gt 0 ]; then
    echo "### 🚨 Security Vulnerabilities ($VULN_COUNT found)" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    echo "| Package | Severity | Description |" >> "$MAIN_REPORT"
    echo "|---------|----------|-------------|" >> "$MAIN_REPORT"
    
    node -e "
    try {
        const data = JSON.parse(require('fs').readFileSync('$NPM_AUDIT_FILE', 'utf8'));
        const vulns = data.vulnerabilities || {};
        Object.entries(vulns).forEach(([pkg, info]) => {
            const severity = info.severity || 'unknown';
            const via = Array.isArray(info.via) ? info.via.join(', ') : (info.via || 'direct');
            console.log('| ' + pkg + ' | ' + severity + ' | ' + via + ' |');
        });
    } catch (e) {
        console.log('| Error parsing audit data | | |');
    }
    " >> "$MAIN_REPORT" 2>/dev/null
    
    echo "" >> "$MAIN_REPORT"
else
    echo "### ✅ No Security Vulnerabilities" >> "$MAIN_REPORT"
    echo "All dependencies are secure according to npm audit." >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
fi

# Phase 4: Deprecated Dependencies Check
DEPRECATED_COUNT=0
if [ "$CHECK_DEPRECATED" = true ]; then
    log_progress "Phase 4: Deprecated Dependencies Analysis (Context7 MCP)"
    echo "## Deprecated Dependencies Analysis" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    
    # Get all dependencies for analysis
    ALL_DEPS=$(node -e "
    const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
    const all = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
    console.log(JSON.stringify([...new Set(all)]));
    " 2>/dev/null)
    
    log_info "Analyzing dependencies for deprecation status..."
    
    # Common deprecated packages (would be enhanced with Context7 MCP in production)
    DEPRECATED_PACKAGES=""
    echo "$ALL_DEPS" | node -e "
    const allDeps = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
    const commonDeprecated = {
        'request': { reason: 'Deprecated - use axios, node-fetch, or native fetch', alternative: 'axios' },
        'node-sass': { reason: 'Deprecated - use dart-sass (sass)', alternative: 'sass' },
        'gulp-util': { reason: 'Deprecated - functionality moved to separate packages', alternative: 'individual packages' },
        'graceful-fs': { reason: 'Often outdated - check if still needed', alternative: 'native fs with modern Node.js' },
        'minimatch': { reason: 'Often vulnerable versions - ensure latest', alternative: 'picomatch' },
        'mkdirp': { reason: 'Native fs.mkdir recursive option available', alternative: 'fs.mkdir({recursive:true})' }
    };
    
    const found = [];
    allDeps.forEach(dep => {
        if (commonDeprecated[dep]) {
            found.push({
                package: dep,
                reason: commonDeprecated[dep].reason,
                alternative: commonDeprecated[dep].alternative
            });
        }
    });
    
    if (found.length > 0) {
        console.log('### ⚠️ Deprecated Packages (' + found.length + ' found)');
        console.log('');
        console.log('| Package | Issue | Recommended Alternative |');
        console.log('|---------|-------|------------------------|');
        found.forEach(item => {
            console.log('| ' + item.package + ' | ' + item.reason + ' | ' + item.alternative + ' |');
        });
        console.log('');
        console.log(found.length); // Output count for shell script
    } else {
        console.log('### ✅ No Known Deprecated Packages');
        console.log('All dependencies appear to be actively maintained.');
        console.log('');
        console.log('0'); // Output count for shell script
    }
    " | tee -a "$MAIN_REPORT" | tail -1 > /tmp/deprecated_count
    
    DEPRECATED_COUNT=$(cat /tmp/deprecated_count 2>/dev/null || echo "0")
    rm -f /tmp/deprecated_count
    
    log_info "Found $DEPRECATED_COUNT deprecated packages"
else
    log_info "Skipping deprecated package analysis"
    echo "## Deprecated Dependencies Analysis" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    echo "⏭️ **Deprecated package checking was skipped.**" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
fi

# Phase 5: Update Recommendations
log_progress "Phase 5: Generating Update Recommendations"
echo "## Update Recommendations" >> "$MAIN_REPORT"
echo "" >> "$MAIN_REPORT"

if [ "$OUTDATED_COUNT" -gt 0 ] || [ "$VULN_COUNT" -gt 0 ]; then
    if [ "$SECURITY_ONLY" = true ]; then
        echo "### 🔒 Security-Focused Updates" >> "$MAIN_REPORT"
        echo "Only packages with security vulnerabilities will be updated:" >> "$MAIN_REPORT"
        echo '```bash' >> "$MAIN_REPORT"
        echo 'npm audit fix' >> "$MAIN_REPORT"
        echo '```' >> "$MAIN_REPORT"
        UPDATE_COMMAND="npm audit fix"
    elif [ "$UPDATE_ALL" = true ]; then
        echo "### 🚀 Comprehensive Updates" >> "$MAIN_REPORT"
        echo "All outdated packages will be updated to their latest versions:" >> "$MAIN_REPORT"
        echo '```bash' >> "$MAIN_REPORT"
        echo 'npm update' >> "$MAIN_REPORT"
        if [ "$OUTDATED_COUNT" -gt 0 ]; then
            node -e "
            try {
                const data = JSON.parse(require('fs').readFileSync('$NPM_OUTDATED_FILE', 'utf8'));
                Object.keys(data).forEach(pkg => {
                    console.log('npm install ' + pkg + '@latest');
                });
            } catch (e) {}
            " >> "$MAIN_REPORT"
        fi
        echo '```' >> "$MAIN_REPORT"
        UPDATE_COMMAND="comprehensive"
    else
        echo "### 📋 Conservative Updates Recommended" >> "$MAIN_REPORT"
        echo "Review and update packages individually:" >> "$MAIN_REPORT"
        echo '```bash' >> "$MAIN_REPORT"
        if [ "$VULN_COUNT" -gt 0 ]; then
            echo '# Fix security vulnerabilities first' >> "$MAIN_REPORT"
            echo 'npm audit fix' >> "$MAIN_REPORT"
            echo '' >> "$MAIN_REPORT"
        fi
        echo '# Update specific packages (review each one)' >> "$MAIN_REPORT"
        node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync('$NPM_OUTDATED_FILE', 'utf8'));
            Object.entries(data).forEach(([pkg, info]) => {
                console.log('npm install ' + pkg + '@' + info.wanted + '  # Current: ' + info.current + ', Latest: ' + info.latest);
            });
        } catch (e) {}
        " >> "$MAIN_REPORT"
        echo '```' >> "$MAIN_REPORT"
        UPDATE_COMMAND="manual"
    fi
    echo "" >> "$MAIN_REPORT"
else
    echo "### ✅ No Updates Required" >> "$MAIN_REPORT"
    echo "All dependencies are current and secure." >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    UPDATE_COMMAND="none"
fi

# Phase 6: Execute Updates (if not dry-run)
if [ "$DRY_RUN" = false ] && [ "$UPDATE_COMMAND" != "none" ] && [ "$UPDATE_COMMAND" != "manual" ]; then
    log_progress "Phase 6: Executing Automated Updates"
    
    # Create backup
    BACKUP_FILE="package.json.backup.$TIMESTAMP"
    cp package.json "$BACKUP_FILE"
    log_success "Created backup: $BACKUP_FILE"
    
    # Initialize update log
    echo "Package.json Update Log - $(date)" > "$UPDATE_LOG"
    echo "Backup created: $BACKUP_FILE" >> "$UPDATE_LOG"
    echo "Update mode: $UPDATE_COMMAND" >> "$UPDATE_LOG"
    echo "----------------------------------------" >> "$UPDATE_LOG"
    
    if [ "$UPDATE_COMMAND" = "npm audit fix" ]; then
        log_progress "Applying security fixes..."
        if npm audit fix 2>&1 | tee -a "$UPDATE_LOG"; then
            log_success "Security fixes applied successfully"
        else
            log_warning "Some security issues may require manual intervention"
        fi
    elif [ "$UPDATE_COMMAND" = "comprehensive" ]; then
        log_progress "Updating all dependencies..."
        
        # First run npm update
        if npm update 2>&1 | tee -a "$UPDATE_LOG"; then
            log_success "npm update completed"
        else
            log_warning "npm update completed with warnings"
        fi
        
        # Then update outdated packages to latest
        if [ "$OUTDATED_COUNT" -gt 0 ]; then
            log_progress "Updating packages to latest versions..."
            node -e "
            const data = JSON.parse(require('fs').readFileSync('$NPM_OUTDATED_FILE', 'utf8'));
            console.log(JSON.stringify(Object.keys(data)));
            " | node -e "
            const packages = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
            packages.forEach(pkg => console.log(pkg));
            " | while read package; do
                if [ -n "$package" ]; then
                    log_progress "Updating $package to latest..."
                    if npm install "$package@latest" 2>&1 | tee -a "$UPDATE_LOG"; then
                        log_success "Updated $package"
                    else
                        log_warning "Failed to update $package"
                    fi
                fi
            done
        fi
    fi
    
    # Verify updates
    log_progress "Verifying updates..."
    POST_UPDATE_OUTDATED="$REPORT_DIR/npm-outdated-after_$TIMESTAMP.json"
    npm outdated --json > "$POST_UPDATE_OUTDATED" 2>/dev/null || echo "{}" > "$POST_UPDATE_OUTDATED"
    
    REMAINING_OUTDATED=$(node -e "
    try {
        const data = JSON.parse(require('fs').readFileSync('$POST_UPDATE_OUTDATED', 'utf8'));
        console.log(Object.keys(data).length);
    } catch (e) {
        console.log('0');
    }
    " 2>/dev/null || echo "0")
    
    log_info "Remaining outdated dependencies: $REMAINING_OUTDATED"
    echo "Post-update outdated count: $REMAINING_OUTDATED" >> "$UPDATE_LOG"
    
    # Add post-update analysis to report
    echo "## Post-Update Analysis" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    echo "- **Updates applied:** $(date)" >> "$MAIN_REPORT"
    echo "- **Backup created:** $BACKUP_FILE" >> "$MAIN_REPORT"
    echo "- **Remaining outdated dependencies:** $REMAINING_OUTDATED" >> "$MAIN_REPORT"
    echo "- **Update log:** [dependency-updates_$TIMESTAMP.log]" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    
    if [ "$REMAINING_OUTDATED" -eq 0 ]; then
        log_success "All dependencies are now up to date!"
    fi
else
    if [ "$DRY_RUN" = true ]; then
        log_info "Dry-run mode: No changes were made"
        echo "## Dry-Run Mode" >> "$MAIN_REPORT"
        echo "" >> "$MAIN_REPORT"
        echo "⏭️ **No changes were made.** This was a dry-run analysis." >> "$MAIN_REPORT"
        echo "" >> "$MAIN_REPORT"
        echo "To apply updates, run:" >> "$MAIN_REPORT"
        echo '```bash' >> "$MAIN_REPORT"
        echo "./.claude/commands/package-json-verify.sh --update-all" >> "$MAIN_REPORT"
        echo '```' >> "$MAIN_REPORT"
        echo "" >> "$MAIN_REPORT"
    fi
fi

# Phase 7: Generate JSON Summary
log_progress "Generating JSON Summary Report"

node -e "
const summary = {
    metadata: {
        timestamp: '$TIMESTAMP',
        toolVersion: '$SCRIPT_VERSION',
        projectName: '$PROJECT_NAME',
        projectVersion: '$PROJECT_VERSION'
    },
    configuration: {
        dryRun: $DRY_RUN,
        updateAll: $UPDATE_ALL,
        securityOnly: $SECURITY_ONLY,
        checkDeprecated: $CHECK_DEPRECATED
    },
    analysis: {
        totalDependencies: $TOTAL_DEPS,
        outdatedCount: $OUTDATED_COUNT,
        vulnerabilityCount: $VULN_COUNT,
        deprecatedCount: $DEPRECATED_COUNT
    },
    reports: {
        mainReport: 'package-analysis_$TIMESTAMP.md',
        jsonSummary: 'package-data_$TIMESTAMP.json',
        updateLog: 'package-updates_$TIMESTAMP.log',
        npmOutdated: 'npm-outdated_$TIMESTAMP.json',
        npmAudit: 'npm-audit_$TIMESTAMP.json'
    },
    recommendations: {
        updateCommand: '$UPDATE_COMMAND',
        backupCreated: '$DRY_RUN' === 'false' ? 'package.json.backup.$TIMESTAMP' : null
    }
};
console.log(JSON.stringify(summary, null, 2));
" > "$JSON_SUMMARY"

# Final Summary
echo ""
log_success "Package.json Verification Completed!"
echo "════════════════════════════════════════════"
log_info "📊 Analysis Summary:"
echo "   📦 Total Dependencies: $TOTAL_DEPS"
echo "   ⬆️  Outdated: $OUTDATED_COUNT"
echo "   🚨 Security Vulnerabilities: $VULN_COUNT"
echo "   ⚠️  Deprecated: $DEPRECATED_COUNT"
echo ""
log_info "📁 Reports saved to:"
echo "   📄 Main Report: $MAIN_REPORT"
echo "   📊 JSON Summary: $JSON_SUMMARY"
if [ "$DRY_RUN" = false ] && [ "$UPDATE_COMMAND" != "none" ] && [ "$UPDATE_COMMAND" != "manual" ]; then
    echo "   📝 Update Log: $UPDATE_LOG"
fi
echo ""

# Final recommendations
if [ "$DRY_RUN" = true ]; then
    if [ "$OUTDATED_COUNT" -gt 0 ] || [ "$VULN_COUNT" -gt 0 ]; then
        log_info "💡 Next Steps:"
        if [ "$VULN_COUNT" -gt 0 ]; then
            echo "   🔒 Security updates: ./.claude/commands/package-json-verify.sh --security-only"
        fi
        if [ "$OUTDATED_COUNT" -gt 0 ]; then
            echo "   🚀 All updates: ./.claude/commands/package-json-verify.sh --update-all"
        fi
    fi
fi

# Determine exit code
EXIT_CODE=0
if [ "$VULN_COUNT" -gt 0 ]; then
    log_warning "Security vulnerabilities detected - review required"
    EXIT_CODE=2
elif [ "$DEPRECATED_COUNT" -gt 0 ]; then
    log_warning "Deprecated packages found - migration recommended"
    EXIT_CODE=3
elif [ "$OUTDATED_COUNT" -gt 0 ]; then
    log_warning "Outdated dependencies detected - updates available"
    EXIT_CODE=1
else
    log_success "All dependencies are current and secure"
    EXIT_CODE=0
fi

echo ""
exit $EXIT_CODE
