# Critical Implementation Requirements

## NEVER IGNORE These Requirements

### 1. Manifest V3 Compliance
- All new Chrome extensions must use Manifest V3. No exceptions.
- Service workers instead of persistent background scripts
- Stricter Content Security Policy requirements

### 2. Content Security Policy
- Never use `eval()`, inline scripts, or external resources in content scripts
- All scripts must be loaded from extension package
- Strict CSP prevents XSS attacks

### 3. Privacy First
- Always get user consent before sending data to AI services
- Implement local fallbacks for core functionality
- No user data collected without explicit consent
- All settings stored locally in browser storage

### 4. Cross-Browser Testing
- Test on Chrome, Firefox, Safari, and Edge before each release
- Each browser has slight API differences requiring polyfills
- Handle browser-specific limitations gracefully

### 5. Memory Management
- Extensions can be killed by browsers if they use too much memory
- Implement proper cleanup and garbage collection
- Target: Memory usage stays under 50MB peak

### 6. Rate Limiting
- AI APIs have strict limits - implement queuing and fallback strategies
- Groq: 100 requests/hour, 6,000 requests/day (free tier)
- Claude: 60 requests/minute, 200,000 max tokens
- Implement client-side caching and request deduplication

### 7. Mobile Considerations
- Touch targets must be at least 44px for mobile accessibility
- Overlay positioning critical on mobile viewports
- Performance optimizations essential for mobile browsers
- iOS Safari has specific extension limitations

### 8. Accessibility Requirements
- Screen readers support (ARIA attributes and announcements)
- Full keyboard navigation capability
- High contrast mode support
- WCAG 2.1 AA compliance mandatory

## Performance Targets
- **Extension Load Time**: < 500ms
- **Overlay Display**: < 300ms after text selection
- **TTS Start Delay**: < 200ms
- **AI Response Time**: < 3 seconds
- **Memory Usage**: < 50MB peak
- **CPU Usage**: < 5% during playback

## Security Checklist
- [ ] No inline scripts or `eval()` usage
- [ ] API keys stored securely with encryption
- [ ] All user inputs sanitized
- [ ] Cross-origin requests properly restricted
- [ ] Permission minimization (request only necessary permissions)
- [ ] Content script isolation from website JavaScript

## Quality Gates
- [ ] All unit tests pass (>85% coverage)
- [ ] E2E tests pass on all target browsers
- [ ] No CSP violations
- [ ] AI fallbacks work when APIs are down
- [ ] Keyboard navigation fully functional
- [ ] Screen reader announces all actions
- [ ] Privacy policy covers all data usage

## Code Style Requirements
- **NO COMMENTS** unless explicitly requested
- Follow existing patterns and conventions
- Use JSDoc for API documentation
- Prefer editing existing files over creating new ones
- Never create documentation files unless requested