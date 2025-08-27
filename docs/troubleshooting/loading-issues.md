# 🚀 Extension Loading Guide

Step-by-step instructions to load and test the TTS extension in different browsers.

## 🔧 Chrome Loading Instructions

### Method 1: Load Unpacked Extension (Development)

1. **Open Chrome** and navigate to `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top right)
3. **Click "Load unpacked"**
4. **Navigate to**: `/mnt/d/OfficialStuff/10Pearls/POC/AI/textToSpeachExt/dist/chrome`
5. **Select the folder** and click "Select Folder"

### Method 2: Using npm Script
```bash
# From project root
npm run load:chrome
```

### Expected Result:
- ✅ Extension appears in extensions list
- ✅ TTS icon visible in toolbar
- ✅ No error messages in console
- ✅ Service worker shows "Active"

## 🧪 Basic Functionality Test

### 1. Test TTS Core Features

1. **Visit any webpage** (e.g., wikipedia.org)
2. **Select some text** with your mouse
3. **Look for the TTS overlay** appearing near selection
4. **Click "Speak" button**
5. **Verify**: Text is spoken aloud

### 2. Test Extension Popup

1. **Click the TTS extension icon** in toolbar
2. **Verify**: Popup opens with settings
3. **Try "Test Current Voice Settings"**
4. **Verify**: Test speech plays

### 3. Test Context Menu (if enabled)

1. **Right-click on selected text**
2. **Look for "Speak selected text"** option
3. **Click it and verify speech**

### 4. Test Keyboard Shortcuts

1. **Select text**
2. **Press Ctrl+Shift+S** (Windows/Linux) or **Cmd+Shift+S** (Mac)
3. **Verify**: Text is spoken

## 🎛️ Settings Configuration

### Access Settings:
1. **Right-click extension icon** → "Options"
2. **Or click extension icon** → "Settings button"

### Key Settings to Configure:
1. **General Tab**:
   - ✅ Enable TTS Extension
   - ✅ Enable context menu

2. **Voice & Speech Tab**:
   - 🎵 Choose preferred voice
   - ⚡ Set speech rate (0.5x - 2.0x)
   - 🎵 Adjust pitch and volume

3. **AI Features Tab** (Optional):
   - 🔑 Add Groq API key for explanations
   - ✅ Enable AI explanations

## 🔍 Troubleshooting

### Extension Won't Load
- **Check**: Manifest V3 compliance
- **Check**: File permissions
- **Try**: Refresh extensions page
- **Try**: Restart Chrome

### No Sound/Speech
- **Check**: System volume and browser permissions
- **Check**: Extension permissions for "activeTab"
- **Try**: Different website
- **Check**: Available voices in browser

### TTS Overlay Doesn't Appear
- **Check**: Text is properly selected
- **Check**: Content script loaded (DevTools → Sources)
- **Try**: Refresh webpage
- **Check**: Extension is enabled

### Performance Issues
- **Check**: Browser memory usage
- **Try**: Close other extensions temporarily
- **Check**: Chrome DevTools Console for errors

## 📊 Performance Validation

### Expected Performance:
- 🚀 **Overlay appears**: <300ms after text selection
- 🚀 **Speech starts**: <500ms after clicking "Speak"
- 🚀 **Memory usage**: <50MB during operation
- 🚀 **CPU usage**: <10% during speech

### Monitor Performance:
1. **Open Chrome DevTools** (F12)
2. **Go to Performance tab**
3. **Record while using extension**
4. **Check for memory leaks or high CPU usage**

## 🧪 Advanced Testing

### Test Cross-Site Functionality:
1. **Test on different domains**:
   - ✅ News sites (cnn.com, bbc.com)
   - ✅ Social media (twitter.com, reddit.com)
   - ✅ Documentation (github.com, stackoverflow.com)

2. **Test different content types**:
   - ✅ Plain text
   - ✅ Links and buttons
   - ✅ Lists and tables
   - ✅ Code blocks

### Test Edge Cases:
1. **Very long text** (>1000 characters)
2. **Special characters** and **emojis**
3. **Multiple languages** on same page
4. **Dynamic content** (SPAs, AJAX loaded)

## 🐛 Debug Mode

### Enable Debug Mode:
1. **Open Options** → **Advanced tab**
2. **Enable "Debug mode"**
3. **Check browser console** for detailed logs

### Debug Information:
- Extension loads and initializes
- Voice selection and settings
- API calls and responses
- Performance metrics

## 📱 Mobile Testing (Chrome Mobile)

### For Android Chrome:
1. **Enable Developer Options** on Android device
2. **Connect via USB** debugging
3. **Use chrome://inspect** on desktop
4. **Test touch interactions** with overlay

## ✅ Success Checklist

Before considering the extension ready:

- [ ] ✅ Loads without errors in Chrome
- [ ] ✅ Text selection triggers overlay
- [ ] ✅ "Speak" button works with audible speech
- [ ] ✅ Voice settings can be changed
- [ ] ✅ Popup interface is functional
- [ ] ✅ Context menu works (if enabled)
- [ ] ✅ Keyboard shortcuts work
- [ ] ✅ Options page saves settings
- [ ] ✅ No console errors during normal use
- [ ] ✅ Performance is acceptable (<50MB, <10% CPU)
- [ ] ✅ Works across different websites
- [ ] ✅ AI explanations work (if API keys provided)

## 🎯 Next Steps

Once basic loading works:
1. **Set up API keys** for AI features
2. **Test comprehensive functionality**
3. **Run automated test suite**
4. **Package for distribution**

---

**Need Help?** Check the [troubleshooting guide](troubleshooting.md) or [create an issue](https://github.com/azfarhussain-10p/textToSpeachExt/issues).