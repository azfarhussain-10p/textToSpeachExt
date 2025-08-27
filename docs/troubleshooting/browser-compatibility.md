# 🌐 Browser Compatibility Issues

**Category**: troubleshooting  
**Audience**: Developer  
**Last Updated**: 2025-01-27  
**Status**: Active

## Overview
Common cross-browser compatibility issues and their solutions for the TTS Extension.

## Chrome-Specific Issues

### Manifest V3 Service Worker Limitations
**Problem**: Service workers have limited lifetime and API access
**Symptoms**: Extension stops working after periods of inactivity
**Solution**:
```javascript
// Keep service worker alive with periodic storage updates
let keepAliveInterval;
function startKeepAlive() {
  keepAliveInterval = setInterval(() => {
    chrome.storage.local.set({ keepAlive: Date.now() });
  }, 20000);
}
```

### Content Security Policy Restrictions
**Problem**: Inline scripts and eval() are blocked
**Symptoms**: `Refused to execute inline script` errors
**Solution**:
```javascript
// ❌ Don't use inline handlers
element.onclick = "handleClick()";

// ✅ Use addEventListener instead
element.addEventListener('click', handleClick);
```

## Firefox-Specific Issues

### Manifest V2/V3 Differences
**Problem**: Firefox has different manifest requirements
**Solution**: Create Firefox-specific manifest file
```json
{
  "manifest_version": 2,
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  }
}
```

### Web Speech API Variations
**Problem**: Voice loading behavior differs from Chrome
**Solution**:
```javascript
// Enhanced voice loading for Firefox
async loadVoices() {
  return new Promise((resolve) => {
    const voices = this.synth.getVoices();
    
    if (voices.length > 0) {
      this.availableVoices = voices;
      resolve();
      return;
    }

    // Firefox-specific: longer timeout needed
    setTimeout(() => {
      this.availableVoices = this.synth.getVoices();
      resolve();
    }, 2000); // Increased timeout for Firefox
  });
}
```

## Safari-Specific Issues

### Extension Architecture Differences
**Problem**: Safari requires native app wrapper
**Solution**: Use Safari Web Extension converter or build native Swift app

### API Permission Differences
**Problem**: Some Chrome APIs not available in Safari
**Solution**: Feature detection and graceful degradation
```javascript
if (typeof chrome !== 'undefined' && chrome.contextMenus) {
  // Chrome/Edge context menu implementation
  chrome.contextMenus.create({...});
} else if (typeof browser !== 'undefined' && browser.contextMenus) {
  // Firefox implementation
  browser.contextMenus.create({...});
} else {
  // Safari fallback - use different approach
  console.warn('Context menus not available, using alternative UI');
}
```

## Edge-Specific Issues

### Similar to Chrome Issues
Edge is Chromium-based, so most Chrome solutions apply. Key differences:

### Extension Store Differences
**Problem**: Different review process and requirements
**Solution**: Follow Edge-specific store guidelines in deployment docs

## Common Cross-Browser Issues

### Text Selection Handling
**Problem**: Different selection APIs across browsers
**Solution**: Normalize selection handling
```javascript
getSelectedText() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return '';
  
  // Cross-browser compatible text extraction
  const range = selection.getRangeAt(0);
  return range.toString().trim();
}
```

### Overlay Positioning
**Problem**: Different viewport calculations
**Solution**: Robust positioning logic
```javascript
positionOverlay(x, y) {
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  
  // Account for browser differences in scrolling
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  
  // Adjust positioning with scroll offset
  const finalX = Math.min(x + scrollLeft, viewportWidth - 320);
  const finalY = Math.min(y + scrollTop, viewportHeight - 100);
  
  this.overlay.style.left = `${finalX}px`;
  this.overlay.style.top = `${finalY}px`;
}
```

### Storage API Differences
**Problem**: Different storage quotas and behaviors
**Solution**: Abstract storage layer
```javascript
class StorageManager {
  static async get(key) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise(resolve => {
        chrome.storage.sync.get([key], result => resolve(result[key]));
      });
    } else {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem(key) || 'null');
    }
  }
  
  static async set(key, value) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage.sync.set({ [key]: value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
```

## Testing Cross-Browser Compatibility

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Text selection triggers overlay
- [ ] TTS functionality works with all voice options
- [ ] Settings persist across browser sessions
- [ ] Context menus appear and function
- [ ] AI explanations work (if API keys configured)
- [ ] Overlay positioning works on different screen sizes

### Automated Testing
```javascript
// Browser detection for test configuration
const getBrowser = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
    return 'chrome';
  } else if (typeof browser !== 'undefined' && browser.runtime) {
    return 'firefox';
  } else {
    return 'unknown';
  }
};

// Browser-specific test suites
describe(`TTS Extension - ${getBrowser()}`, () => {
  // Tests adapted for specific browser behavior
});
```

## Debug Tools by Browser

### Chrome DevTools
- Extension page: `chrome://extensions/`
- Service worker inspection: Click "Service worker" link
- Console: Check for extension-specific errors

### Firefox Developer Tools
- Extension debugging: `about:debugging`
- Browser console: Ctrl+Shift+J (Cmd+Shift+J on Mac)

### Safari Web Inspector
- Develop menu → Extension name
- Console and Elements tabs for debugging

### Edge DevTools
- Same as Chrome: `edge://extensions/`
- Similar inspection tools

## Performance Considerations

### Memory Usage
Different browsers have different memory management:
```javascript
// Clean up resources properly for all browsers
destroy() {
  if (this.tts) {
    this.tts.stop();
    this.tts = null;
  }
  
  // Remove all event listeners
  document.removeEventListener('mouseup', this.handleSelection);
  
  // Clear any intervals/timeouts
  if (this.keepAliveInterval) {
    clearInterval(this.keepAliveInterval);
  }
}
```

## Getting Help

For browser-specific issues:
1. Check the browser's official extension documentation
2. Test in browser's development/beta channels
3. Use browser-specific developer communities
4. File bug reports with browser vendors when necessary

---

*This guide covers the most common compatibility issues. Add new issues as they're discovered during testing.*