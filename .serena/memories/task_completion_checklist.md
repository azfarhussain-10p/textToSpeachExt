# Task Completion Checklist

## When a Development Task is Completed

### 1. Code Quality Validation
```bash
npm run lint                # ESLint validation - MUST pass
npm run format:check        # Prettier formatting check
npm run typecheck          # TypeScript validation if applicable
```
**CRITICAL**: Fix all linting errors before proceeding.

### 2. Testing Requirements
```bash
npm run test:unit          # Unit tests - MUST pass
npm run test:integration   # Integration tests if applicable
npm run test:e2e:chrome    # E2E tests for primary browser
```
**Note**: If specific test framework commands are unknown, ask user for proper test commands.

### 3. Build Verification
```bash
npm run build:chrome       # Ensure Chrome build works
npm run build:firefox      # Ensure Firefox build works (if multi-browser)
```
**Verify**: No build errors and extension loads properly.

### 4. Extension-Specific Validation
```bash
npm run validate:manifest   # Manifest.json validation
npm run validate:csp       # Content Security Policy check
npm run validate:permissions # Permission usage analysis
```

### 5. Security & Audit
```bash
npm run audit              # Dependency vulnerability scan
npm run audit:security     # Security-focused audit
```
**Fix**: Any high/critical security vulnerabilities found.

## Before Committing Changes

### Pre-commit Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code formatted properly
- [ ] No security vulnerabilities
- [ ] Extension builds successfully
- [ ] No memory leaks introduced
- [ ] AI API usage optimized (rate limiting respected)

### Git Commit Standards
```bash
# Commit message format
git commit -m "feat(tts): add multi-language voice selection"
git commit -m "fix(overlay): resolve positioning on mobile Safari"  
git commit -m "docs(api): update TTS service documentation"

# Pre-commit hooks automatically run:
npm run pre-commit         # Includes lint, test, and typecheck
```

## Performance Verification
- [ ] Memory usage under 50MB (check DevTools)
- [ ] Extension loads within 1 second
- [ ] Overlay appears within 300ms of text selection
- [ ] TTS starts within 200ms of play button click
- [ ] AI responses complete within 3 seconds

## Cross-Browser Compatibility
- [ ] Chrome: Primary target - full functionality
- [ ] Firefox: WebExtensions API compatibility
- [ ] Safari: Web Extensions API compatibility  
- [ ] Edge: Chromium-based compatibility

## Final Verification
- [ ] Extension installs without errors
- [ ] Core TTS functionality works
- [ ] AI explanations function (if implemented)
- [ ] Overlay positioning correct on different sites
- [ ] Keyboard navigation functional
- [ ] No console errors in browser DevTools

## Emergency Rollback Plan
If critical issues are found:
1. Identify the specific commit that introduced the issue
2. Create a hotfix branch
3. Revert problematic changes
4. Run full test suite
5. Deploy fixed version immediately

**Remember**: Never commit changes unless explicitly asked by the user.