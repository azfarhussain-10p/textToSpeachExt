# 📖 User Guide - Intelligent TTS Extension

Complete user guide for the Intelligent Text-to-Speech Browser Extension with AI-powered explanations.

## 🚀 Quick Start

### Installation

1. **Chrome Web Store**: Search for "Intelligent TTS Extension" and click "Add to Chrome"
2. **Firefox Add-ons**: Visit Firefox Add-ons and install the extension
3. **Safari**: Download from Mac App Store and enable in Safari preferences

### First Use

1. **Navigate to any webpage** with text content
2. **Select text** by clicking and dragging over any text
3. **Click the speaker icon** in the popup tooltip that appears
4. **Listen** as the text is read aloud with professional voice synthesis

## 🎤 Using Text-to-Speech

### Basic Text Selection

1. **Highlight Text**: Select any text on any website
2. **Tooltip Appears**: A small control panel appears near your selection
3. **Click Play**: Press the play button (►) to start speech
4. **Control Playback**: Use pause (⏸), stop (⏹), or close (✕) buttons

### Advanced Controls

**Voice Settings**: Access through the extension popup (click extension icon in toolbar)
- **Voice Selection**: Choose from 15+ available voices
- **Speech Rate**: Adjust from 0.5x to 2x speed
- **Pitch Control**: Modify voice pitch for comfort
- **Volume**: Set audio level (0-100%)

**Keyboard Shortcuts**:
- `Ctrl/Cmd + Shift + S`: Start/stop speech for selected text
- `Space`: Pause/resume during playback
- `Escape`: Stop speech and close overlay

### Multi-Language Support

The extension automatically detects text language and uses appropriate voices:

**Supported Languages**:
- **English** (US, UK, Australia, Canada)
- **Spanish** (Spain, Mexico, Argentina)
- **French** (France, Canada)
- **German** (Germany, Austria)
- **Arabic** (Saudi Arabia, Egypt)
- **Hindi** (India)
- **Urdu** (Pakistan)
- **Chinese** (Mandarin, Cantonese)
- **Japanese**, **Korean**, **Russian**
- **Portuguese**, **Italian**, **Dutch**

**Language Selection**:
1. Open extension settings (click extension icon)
2. Choose "Language & Voice" tab
3. Select your preferred language and voice
4. Settings save automatically

## 🤖 AI-Powered Explanations

### Getting Explanations

1. **Select Complex Text**: Highlight technical, academic, or complex content
2. **Click Brain Icon** (🧠): Found in the text selection tooltip
3. **Wait for AI**: Processing usually takes 1-3 seconds
4. **Read Explanation**: Clear, simple explanation appears below
5. **Listen to Explanation**: Use TTS on the explanation text

### AI Features

**Explanation Levels**:
- **Simple**: Easy-to-understand explanations for general audience
- **Intermediate**: More detailed for students and professionals
- **Advanced**: Technical explanations for experts

**AI Providers**:
- **Groq** (Free): Fast, accurate explanations using Llama models
- **Claude** (Premium): Advanced explanations for complex topics
- **Automatic Fallback**: Switches providers if one is unavailable

### Privacy & Consent

**First Time Setup**:
1. When you first click "Explain", you'll see a consent dialog
2. **Accept**: Enables AI explanations with external services
3. **Decline**: Disables AI features, uses local explanations only

**Privacy Controls**:
- **Data**: Only selected text is sent to AI services
- **Storage**: No personal data stored on external servers
- **Consent**: Can be revoked anytime in extension settings
- **Transparency**: View exactly what data is sent

## ⚙️ Settings & Customization

### Opening Settings

**Method 1**: Click the extension icon in your browser toolbar
**Method 2**: Right-click the extension icon → "Options"
**Method 3**: Browser settings → Extensions → Intelligent TTS → Options

### Settings Categories

#### 🎤 Voice & Speech
- **Default Voice**: Choose your preferred voice for all languages
- **Speech Rate**: Adjust speaking speed (0.1x - 2.0x)
- **Speech Pitch**: Modify voice pitch (0.5x - 2.0x)
- **Volume**: Set playback volume (0% - 100%)
- **Auto-language Detection**: Automatically choose voice based on text language

#### 🤖 AI Features
- **Enable AI Explanations**: Turn AI features on/off
- **Preferred AI Provider**: Choose between Groq (free) or Claude (premium)
- **Explanation Level**: Set default complexity level
- **API Keys**: Add your own API keys for unlimited usage

#### 🎨 Interface
- **Overlay Position**: Choose where the control tooltip appears
- **Auto-hide Timer**: Set how long controls stay visible (5-30 seconds)
- **Theme**: Light/Dark mode or system preference
- **Animation Speed**: Adjust interface animation speed

#### 🔒 Privacy
- **AI Consent**: Manage permissions for AI services
- **Analytics**: Enable/disable usage analytics (off by default)
- **Data Retention**: Control how long settings are stored
- **Clear Data**: Remove all stored settings and cache

### Keyboard Shortcuts

You can customize keyboard shortcuts:

1. Open browser settings
2. Navigate to Extensions
3. Find "Keyboard shortcuts" or "Manage shortcuts"
4. Customize TTS extension shortcuts

**Default Shortcuts**:
- `Ctrl/Cmd + Shift + S`: Toggle TTS for selected text
- `Ctrl/Cmd + Shift + E`: Explain selected text with AI
- `Ctrl/Cmd + Shift + X`: Open extension settings

## 📱 Mobile Usage

### Touch Controls

**Text Selection**:
- **Long Press**: Start text selection on mobile
- **Drag Handles**: Adjust selection area
- **Tooltip**: Appears with larger touch-friendly buttons

**Optimized Interface**:
- **44px Touch Targets**: Easy finger navigation
- **Swipe Gestures**: Swipe left/right to adjust volume
- **Haptic Feedback**: Vibration confirmation on supported devices

### Mobile-Specific Features

**Background Playback**: Continues reading when switching apps (browser dependent)
**Lock Screen Controls**: Control playback from lock screen on supported devices
**Accessibility**: Works with mobile screen readers and voice assistants

## ♿ Accessibility Features

### Screen Reader Support

**Full ARIA Implementation**:
- All controls properly labeled
- Status announcements for screen readers
- Semantic HTML structure
- Focus management during playback

**Screen Reader Compatibility**:
- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS/iOS)
- **TalkBack** (Android)
- **Orca** (Linux)

### Keyboard Navigation

**Full Keyboard Control**:
- `Tab`: Navigate between controls
- `Enter/Space`: Activate buttons
- `Arrow Keys`: Adjust sliders (volume, rate, pitch)
- `Escape`: Close overlays and dialogs

### High Contrast Support

**Automatic Detection**: Respects system high contrast settings
**Manual Override**: Force high contrast mode in extension settings
**Custom Colors**: Adjust interface colors for visual comfort

### Visual Accessibility

**Large Text Support**: Interface scales with browser text size
**Motion Reduction**: Respects `prefers-reduced-motion` setting
**Color Blind Friendly**: Uses patterns and text, not just color
**Zoom Support**: Works correctly at 400% zoom level

## 🌍 International Usage

### Right-to-Left (RTL) Languages

**Automatic Detection**: Interface flips for Arabic, Hebrew, Urdu, Farsi
**Proper Text Flow**: Reading follows natural language direction
**Cultural Adaptations**: Date formats, number systems adapted

### Regional Voices

**Accent Selection**: Choose regional accents for supported languages
**Cultural Pronunciation**: Proper pronunciation of local terms
**Currency & Numbers**: Correct reading of monetary values and numbers

## 🔧 Troubleshooting

### Common Issues

#### "Speech Not Working"
**Symptoms**: No audio when clicking play button
**Solutions**:
1. Check browser audio settings
2. Ensure site allows audio playback
3. Try different voice in settings
4. Reload the webpage
5. Check browser TTS support: `chrome://settings/accessibility`

#### "No Voices Available"
**Symptoms**: Voice dropdown is empty or shows "No voices"
**Solutions**:
1. **Windows**: Install additional voices via Settings → Time & Language → Speech
2. **macOS**: System Preferences → Accessibility → Speech → System Voice
3. **Linux**: Install `espeak` or `festival` packages
4. **Browser**: Some voices load after first use

#### "AI Explanations Failing"
**Symptoms**: "AI service unavailable" or timeout errors
**Solutions**:
1. Check internet connection
2. Verify AI consent is granted in settings
3. Try alternative AI provider (Groq ↔ Claude)
4. Check API key configuration if using personal keys
5. Reduce text length (max 4000 characters)

#### "Overlay Not Appearing"
**Symptoms**: No control tooltip after text selection
**Solutions**:
1. Select at least 10 characters of text
2. Check if extension is enabled on current site
3. Disable other extensions temporarily
4. Try refreshing the page
5. Check content script injection in developer tools

#### "Extension Not Loading"
**Symptoms**: Extension icon grayed out or not responding
**Solutions**:
1. **Chrome**: Check `chrome://extensions/` for errors
2. **Firefox**: Check `about:debugging` for issues
3. **Safari**: Verify extension is enabled in Preferences
4. Clear browser cache and cookies
5. Reinstall extension

### Performance Issues

#### "Slow Response Times"
**Symptoms**: Delay between clicking play and speech starting
**Solutions**:
1. Close unused browser tabs
2. Disable other extensions temporarily
3. Check browser memory usage
4. Clear extension storage cache
5. Lower speech quality in settings

#### "High Memory Usage"
**Symptoms**: Browser becomes slow with extension active
**Solutions**:
1. Enable "Memory Optimization" in extension settings
2. Reduce cache size in advanced settings
3. Restart browser periodically
4. Check for browser updates

### Browser-Specific Issues

#### Chrome
- **Manifest V3 Issues**: Update to Chrome 88 or later
- **CSP Errors**: Some sites block extension - try Incognito mode
- **Enterprise Restrictions**: Contact IT administrator

#### Firefox
- **WebExtension Compatibility**: Update to Firefox 78 or later
- **Private Browsing**: Enable extension in private windows if needed
- **Container Tabs**: Extension works in all container contexts

#### Safari
- **Extension Signing**: Ensure extension is properly signed
- **Permission Requests**: Grant all requested permissions
- **macOS Updates**: Keep macOS updated for latest features

## 📞 Support & Feedback

### Getting Help

**Documentation**: Check this guide and [API documentation](API.md)
**FAQ**: Visit our FAQ section for common questions
**Community**: Join our Discord community for peer support
**Bug Reports**: Create issues on GitHub with detailed information

### Reporting Issues

When reporting bugs, please include:
1. **Browser name and version**
2. **Extension version** (found in extension settings)
3. **Operating system**
4. **Steps to reproduce the problem**
5. **Expected vs actual behavior**
6. **Console errors** (F12 → Console tab)
7. **Screenshot or recording** if relevant

### Feature Requests

We welcome feature suggestions! Include:
1. **Clear description** of the proposed feature
2. **Use case**: Why would this feature be useful?
3. **User story**: "As a user, I want to..."
4. **Priority level**: Nice-to-have vs essential
5. **Alternative solutions** you've considered

### Privacy & Data Protection

**Data Collection**: We only collect anonymous usage statistics (if opted in)
**Personal Information**: No personal data is collected or stored
**AI Processing**: Only selected text is sent to AI services with explicit consent
**Deletion**: All data can be cleared from extension settings
**GDPR Compliance**: Fully compliant with EU privacy regulations

## 📈 Tips & Best Practices

### Optimal Usage

**Text Selection**:
- Select complete sentences for best results
- Avoid very long selections (>4000 characters) for AI features
- Select structured text (paragraphs vs scattered words)

**Voice Quality**:
- Use high-quality voices (Google/Microsoft) for best results
- Adjust speech rate based on content complexity
- Lower pitch for better comprehension of technical content

**AI Explanations**:
- Select key sentences or paragraphs rather than entire articles
- Choose appropriate explanation level for your audience
- Use context-specific text for more relevant explanations

### Power User Features

**Custom API Keys**:
1. Get your own Groq API key (free tier: 100 requests/hour)
2. Add Claude API key for premium explanations
3. Configure in extension settings → AI Features → API Keys
4. Enjoy unlimited AI explanations

**Bulk Processing**:
- Use keyboard shortcuts for faster workflow
- Set up custom voices for different content types
- Create bookmarks with specific TTS settings

**Integration with Other Tools**:
- Use with language learning apps
- Combine with translation extensions
- Integrate with note-taking applications

## 🎉 Advanced Features

### Real-Time Text Highlighting

**During Speech**: Watch words highlight in yellow as they're spoken
**Visual Feedback**: See current sentence context with subtle highlighting
**Smooth Animations**: Professional transitions follow speech rhythm
**Performance**: <50ms response time for real-time synchronization

### Multi-Provider AI System

**Intelligent Fallback**: Automatically switches between AI providers
**Rate Limit Management**: Tracks usage across multiple services
**Quality Optimization**: Chooses best provider based on content type
**Cost Efficiency**: Prioritizes free services while maintaining quality

### Cross-Platform Synchronization

**Settings Sync**: Your preferences sync across browsers (Chrome sync)
**Cloud Backup**: Optional backup of settings and preferences
**Multi-Device**: Seamless experience across desktop and mobile
**Offline Support**: Basic features work without internet connection

---

## 📚 Additional Resources

- **Developer API**: [API Documentation](API.md)
- **Implementation Guide**: [Technical Details](implementation-examples.md)
- **Project Structure**: [Architecture Overview](project-structure.md)
- **Development Setup**: [Developer Guide](development-guide.md)

---

*Made with ❤️ for accessibility and powered by cutting-edge AI technology*

**Version**: 1.0.0 | **Last Updated**: August 31, 2025