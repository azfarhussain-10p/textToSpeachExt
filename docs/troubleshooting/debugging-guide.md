# 🐛 Debugging Guide

**Category**: troubleshooting  
**Audience**: Developer  
**Last Updated**: 2025-01-27  
**Status**: Active

## Overview
Comprehensive debugging guide for the TTS Extension, covering tools, techniques, and common debugging scenarios.

## Browser Extension Debugging Basics

### Chrome Extension Debugging

#### Service Worker Debugging
```bash
# Navigate to Chrome extensions page
chrome://extensions/

# Enable Developer mode (toggle in top right)
# Find TTS Extension → Click "Service worker" link
# Opens dedicated DevTools for service worker
```

#### Content Script Debugging
1. Open any web page where extension is active
2. Right-click → Inspect (F12)
3. Console tab shows content script logs
4. Sources tab → Content scripts → Extension files

#### Popup/Options Debugging
```bash
# For popup: Right-click extension icon → Inspect popup
# For options: Right-click extension icon → Options → F12
```

### Firefox Extension Debugging
```bash
# Navigate to debugging page
about:debugging

# This Firefox → TTS Extension → Inspect
# Opens dedicated debugging tools
```

### Extension Console Logs
Add debugging statements throughout the codebase:
```javascript
// Service worker debugging
console.log('[SW] Message received:', message.type);
console.error('[SW] Error in AI request:', error);

// Content script debugging  
console.log('[CS] Text selected:', text);
console.warn('[CS] Overlay positioning failed:', coordinates);

// Popup debugging
console.log('[POPUP] Settings loaded:', settings);
```

## Debugging TTS Functionality

### Web Speech API Issues

#### Voice Loading Problems
```javascript
// Debug voice loading
class TTSService {
  async loadVoices() {
    console.log('[TTS] Starting voice loading...');
    
    const voices = this.synth.getVoices();
    console.log('[TTS] Initial voices count:', voices.length);
    
    if (voices.length === 0) {
      console.warn('[TTS] No voices found, waiting for voiceschanged event...');
      
      return new Promise((resolve) => {
        const onVoicesChanged = () => {
          const newVoices = this.synth.getVoices();
          console.log('[TTS] Voices after event:', newVoices.length);
          
          if (newVoices.length > 0) {
            this.availableVoices = newVoices;
            this.synth.removeEventListener('voiceschanged', onVoicesChanged);
            console.log('[TTS] Voice loading complete');
            resolve();
          }
        };
        
        this.synth.addEventListener('voiceschanged', onVoicesChanged);
        
        // Debug timeout
        setTimeout(() => {
          console.error('[TTS] Voice loading timeout, using fallback');
          this.synth.removeEventListener('voiceschanged', onVoicesChanged);
          resolve();
        }, 3000);
      });
    }
  }
}
```

#### Speech Synthesis Debugging
```javascript
async speak(text, settings = {}) {
  console.log('[TTS] Speech request:', { text: text.substring(0, 50), settings });
  
  try {
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Debug event handlers
    this.currentUtterance.onstart = (event) => {
      console.log('[TTS] Speech started:', event);
    };
    
    this.currentUtterance.onend = (event) => {
      console.log('[TTS] Speech ended:', event);
    };
    
    this.currentUtterance.onerror = (event) => {
      console.error('[TTS] Speech error:', {
        error: event.error,
        message: event.message,
        voice: this.currentUtterance.voice?.name
      });
    };
    
    this.synth.speak(this.currentUtterance);
    
  } catch (error) {
    console.error('[TTS] Failed to start speech:', error);
    throw error;
  }
}
```

## Debugging Overlay Issues

### Overlay Visibility Problems
```javascript
showOverlay(x, y) {
  console.log('[OVERLAY] Show request at:', { x, y });
  
  if (!this.overlay) {
    console.error('[OVERLAY] Overlay element not found');
    return;
  }
  
  // Debug positioning
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  console.log('[OVERLAY] Viewport:', { viewportWidth, viewportHeight });
  
  // Debug computed styles
  const computedStyle = window.getComputedStyle(this.overlay);
  console.log('[OVERLAY] Current styles:', {
    display: computedStyle.display,
    position: computedStyle.position,
    zIndex: computedStyle.zIndex,
    opacity: computedStyle.opacity,
    visibility: computedStyle.visibility
  });
  
  // Apply styles with debugging
  this.overlay.style.cssText = `
    position: fixed !important;
    top: ${y + 10}px !important;
    left: ${x + 10}px !important;
    display: block !important;
    z-index: 2147483647 !important;
    opacity: 1 !important;
    visibility: visible !important;
  `;
  
  // Verify styles were applied
  setTimeout(() => {
    const finalStyle = window.getComputedStyle(this.overlay);
    console.log('[OVERLAY] Final styles:', {
      display: finalStyle.display,
      position: finalStyle.position,
      top: finalStyle.top,
      left: finalStyle.left,
      zIndex: finalStyle.zIndex
    });
  }, 100);
}
```

### Text Selection Debugging
```javascript
handleTextSelection(event) {
  const selection = window.getSelection();
  console.log('[SELECTION] Selection object:', {
    rangeCount: selection.rangeCount,
    isCollapsed: selection.isCollapsed,
    type: selection.type
  });
  
  if (selection.rangeCount === 0) {
    console.warn('[SELECTION] No selection ranges found');
    return;
  }
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();
  
  console.log('[SELECTION] Selected text:', {
    text: selectedText.substring(0, 100),
    length: selectedText.length,
    startContainer: range.startContainer.nodeName,
    endContainer: range.endContainer.nodeName
  });
  
  // Debug bounding rect
  const rect = range.getBoundingClientRect();
  console.log('[SELECTION] Bounding rect:', {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  });
}
```

## Debugging AI Integration

### API Request Debugging
```javascript
async getGroqExplanation(text, context, settings) {
  console.log('[AI] Groq request started:', {
    textLength: text.length,
    context: context?.substring(0, 50),
    settings
  });
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [/* ... */]
      })
    });
    
    console.log('[AI] Response status:', response.status);
    console.log('[AI] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI] API error response:', errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[AI] API response:', {
      choices: data.choices?.length,
      usage: data.usage,
      model: data.model
    });
    
    return data.choices[0]?.message?.content;
    
  } catch (error) {
    console.error('[AI] Request failed:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Cross-Context Messaging Debug
```javascript
// Service worker message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[SW] Received message:', {
    type: message.type,
    from: sender.tab?.url || 'popup',
    data: message.data
  });
  
  try {
    switch (message.type) {
      case 'AI_EXPLAIN':
        console.log('[SW] Processing AI explanation request');
        handleAIExplanation(message.data, sender, sendResponse);
        break;
      
      default:
        console.warn('[SW] Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[SW] Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

// Content script message sending
async requestExplanation() {
  console.log('[CS] Sending AI explanation request');
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'AI_EXPLAIN',
      data: {
        text: this.selectedText,
        context: this.getContextualInfo()
      }
    });
    
    console.log('[CS] AI explanation response:', response);
    
    if (response.success) {
      this.displayExplanation(response.explanation);
    } else {
      console.error('[CS] AI explanation failed:', response.error);
    }
  } catch (error) {
    console.error('[CS] Message sending failed:', error);
  }
}
```

## Performance Debugging

### Memory Usage Monitoring
```javascript
class PerformanceMonitor {
  static logMemoryUsage() {
    if (performance.memory) {
      console.log('[PERF] Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
      });
    }
  }
  
  static measureExecutionTime(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`[PERF] ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

// Usage
PerformanceMonitor.logMemoryUsage();
PerformanceMonitor.measureExecutionTime('TTS Initialization', () => {
  return ttsService.initialize();
});
```

### Network Request Monitoring
```javascript
// Monitor API request performance
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const start = performance.now();
  const url = typeof args[0] === 'string' ? args[0] : args[0].url;
  
  console.log('[NETWORK] Request started:', url);
  
  try {
    const response = await originalFetch.apply(this, args);
    const end = performance.now();
    
    console.log('[NETWORK] Request completed:', {
      url,
      status: response.status,
      time: `${(end - start).toFixed(2)}ms`
    });
    
    return response;
  } catch (error) {
    const end = performance.now();
    console.error('[NETWORK] Request failed:', {
      url,
      error: error.message,
      time: `${(end - start).toFixed(2)}ms`
    });
    throw error;
  }
};
```

## Common Debugging Scenarios

### Extension Not Loading
1. Check `chrome://extensions/` for error messages
2. Verify manifest.json syntax
3. Check for missing permissions
4. Validate file paths in manifest

### Overlay Not Appearing
1. Check text selection detection logs
2. Verify overlay creation and positioning
3. Check CSS conflicts with page styles
4. Validate z-index and display properties

### TTS Not Working
1. Check Web Speech API availability
2. Verify voice loading completion
3. Test with different voices
4. Check browser's speech synthesis settings

### AI Explanations Failing
1. Verify API key configuration
2. Check network requests in Network tab
3. Validate request/response format
4. Test with simple text first

## Debug Configuration

Create a debug configuration file:

```javascript
// debug-config.js
const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  levels: {
    TTS: true,
    OVERLAY: true,
    AI: true,
    NETWORK: false,
    PERFORMANCE: false
  }
};

function debugLog(category, message, data = null) {
  if (!DEBUG_CONFIG.enabled || !DEBUG_CONFIG.levels[category]) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category}] ${message}`, data || '');
}

// Usage
debugLog('TTS', 'Voice loading started');
debugLog('OVERLAY', 'Positioning overlay', { x: 100, y: 200 });
```

## Production Debugging

For production issues:

### Error Tracking
```javascript
class ErrorTracker {
  static captureError(error, context) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store locally for debugging (don't send to external service)
    const errors = JSON.parse(localStorage.getItem('tts_errors') || '[]');
    errors.push(errorInfo);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }
    
    localStorage.setItem('tts_errors', JSON.stringify(errors));
  }
}

// Use in try-catch blocks
try {
  await ttsService.speak(text);
} catch (error) {
  ErrorTracker.captureError(error, 'TTS speech synthesis');
  throw error;
}
```

## Getting Help

When debugging issues:
1. Enable all debug logging
2. Reproduce the issue with console open
3. Save console output and network requests
4. Check browser-specific developer documentation
5. Search existing GitHub issues
6. Create detailed bug report with reproduction steps

---

*This debugging guide covers the most common scenarios. Update as new debugging techniques and issues are discovered.*