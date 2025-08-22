# Development Commands & Workflows

## Essential Development Commands

### Setup & Installation
```bash
npm install                    # Install dependencies
cp .env.example .env          # Set up environment variables
npm run setup                 # Initial project setup
```

### Development & Building
```bash
# Development (with watch mode)
npm run dev                   # Start development server (defaults to Chrome)
npm run dev:chrome           # Chrome-specific development
npm run dev:firefox          # Firefox-specific development
npm run dev:safari           # Safari-specific development

# Building for production
npm run build                # Build for production (all browsers)
npm run build:all           # Build for all browsers
npm run build:chrome        # Build Chrome extension
npm run build:firefox       # Build Firefox add-on
npm run build:safari        # Build Safari extension

# Clean build artifacts
npm run clean               # Clean build directories
```

### Testing & Quality Assurance
```bash
# Testing
npm run test                 # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:e2e            # End-to-end tests (Chrome)
npm run test:e2e:all        # E2E tests for all browsers
npm run test:coverage       # Generate coverage report

# Specific test suites
npm run test:tts            # Text-to-speech specific tests
npm run test:ai             # AI service tests
npm run test:accessibility  # Accessibility compliance tests
npm run test:performance    # Memory and speed benchmarks

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix           # Fix ESLint errors automatically
npm run format             # Format with Prettier
npm run typecheck          # TypeScript validation
npm run validate           # Run all validation (lint + format + typecheck)
```

### Security & Validation
```bash
# Security
npm run audit              # Dependency vulnerability scan
npm run audit:security     # Security-focused audit

# Extension Validation
npm run validate:manifest    # Manifest.json validation
npm run validate:csp        # Content Security Policy check
npm run validate:permissions # Permission usage analysis
npm run validate:icons      # Icon validation
```

### Packaging & Distribution
```bash
# Packaging
npm run package            # Package for all browsers
npm run package:chrome     # Package Chrome extension
npm run package:firefox    # Package Firefox add-on
npm run package:safari     # Package Safari extension

# Release Management
npm run release            # Create new release (build + test + package)
npm run release:patch      # Patch version release
npm run release:minor      # Minor version release
npm run release:major      # Major version release
```

### Development Utilities
```bash
# Analysis & Documentation
npm run analyze            # Bundle size analysis
npm run docs:generate      # Generate API documentation
npm run docs:serve         # Serve documentation locally

# Extension Loading (for testing)
npm run load:chrome        # Load extension in Chrome
npm run load:firefox       # Load extension in Firefox
npm run load:safari        # Load extension in Safari
```

## Development Workflow
1. **Setup**: `npm install && cp .env.example .env`
2. **Development**: `npm run dev:chrome` (or target browser)
3. **Testing**: `npm run test:unit` during development
4. **Validation**: `npm run validate` before committing
5. **Build**: `npm run build:all` for production
6. **Package**: `npm run package:all` for distribution

## Git Workflow
- Feature branches: `git checkout -b feature/tts-overlay-ui`
- Commit conventions: `feat(tts): add multi-language voice selection`
- Pre-commit hooks run: `lint`, `test`, and `typecheck` automatically