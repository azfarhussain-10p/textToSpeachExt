# 🔑 API Setup Guide - TTS Extension

This guide will help you set up the required API keys for AI-powered explanations in your TTS Extension.

## 🚀 Quick Setup

### 1. Groq API (Free - Recommended)

**Groq** provides fast, free AI inference perfect for text explanations.

#### Steps:
1. **Visit**: [https://console.groq.com](https://console.groq.com)
2. **Sign up** for a free account
3. **Create API Key**:
   - Go to "API Keys" section
   - Click "Create API Key"
   - Copy the key (starts with `gsk_`)

#### Free Tier Limits:
- ✅ **100 requests/hour** (perfect for personal use)
- ✅ **Fast response times** (~500ms)
- ✅ **No credit card required**
- ✅ **Multiple models available**

### 2. Claude API (Premium - Optional)

**Claude API** provides high-quality explanations as a premium fallback option.

#### Steps:
1. **Visit**: [https://console.anthropic.com](https://console.anthropic.com)
2. **Sign up** and **add billing information**
3. **Create API Key**:
   - Go to "API Keys" section
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-`)

#### Pricing:
- 💰 **$0.25 per 1M input tokens**
- 💰 **$1.25 per 1M output tokens**
- ⚡ **High-quality responses**
- 🎯 **Best for detailed explanations**

## 🔧 Extension Setup

### Method 1: Through Extension Options (Recommended)

1. **Install the extension** in Chrome
2. **Right-click the extension icon** → "Options"
3. **Go to "AI Features" tab**
4. **Check "Enable AI Explanations"**
5. **Enter your API keys**:
   - Paste Groq key in "Groq API Key" field
   - (Optional) Paste Claude key in "Claude API Key" field
6. **Click "Test AI Explanation"** to verify

### Method 2: Direct Storage (Advanced)

```javascript
// Open Chrome DevTools console on any page
// Run this code with your actual API keys:

chrome.storage.sync.set({
  'groqApiKey': 'gsk_YOUR_GROQ_API_KEY_HERE',
  'claudeApiKey': 'sk-ant-YOUR_CLAUDE_KEY_HERE' // Optional
});
```

## ⚙️ Configuration Options

### AI Provider Selection
- **Default**: Groq (free and fast)
- **Fallback**: Claude (if Groq fails)
- **Switch**: Change in Options → AI Features → AI Provider

### Explanation Settings
- **Length**: Short (1-2 sentences) | Medium (paragraph) | Long (detailed)
- **Style**: Simple | Detailed | Academic | Conversational
- **Language**: Automatically matches your browser language

## ✅ Validation Steps

### Test Your Setup:

1. **Install Extension**
2. **Add API Key** (at minimum, Groq)
3. **Open any website**
4. **Select text** you want explained
5. **Click "Explain" button** in the overlay
6. **Verify**: You should see an AI explanation appear

### Expected Behavior:
- ✅ **Fast response** (1-3 seconds)
- ✅ **Clear explanation** in overlay
- ✅ **"Speak" button** to hear the explanation
- ✅ **Provider indication** (Groq/Claude)

## 🔒 Privacy & Security

### Your Data is Safe:
- 🔒 **API keys stored locally** on your device only
- 🔒 **No data collection** by the extension
- 🔒 **Text sent only when you request explanations**
- 🔒 **No persistent storage** of explained content
- 🔒 **Direct API communication** (no middleman servers)

### Data Flow:
1. You select text and click "Explain"
2. Text is sent directly to Groq/Claude API
3. Response is displayed in overlay
4. No data is stored permanently

## 🚨 Troubleshooting

### Common Issues:

#### "API key not configured"
- **Solution**: Add your Groq API key in Options → AI Features

#### "Failed to generate explanation"
- **Check**: API key is correct
- **Check**: Internet connection
- **Check**: Groq service status
- **Try**: Switch to Claude API as fallback

#### "User consent required"
- **Solution**: Enable "Consent to AI data processing" in Options → Privacy

#### Rate Limit Exceeded
- **Groq**: Wait an hour (100/hour limit)
- **Claude**: Check your billing account
- **Solution**: Use both APIs for redundancy

### Debug Information:
1. **Open Options page**
2. **Go to "Advanced" tab**
3. **Enable "Debug mode"**
4. **Copy debug info** for support

## 💡 Best Practices

### For Optimal Performance:
1. **Use Groq as primary** (free and fast)
2. **Add Claude as backup** (for when Groq is unavailable)
3. **Start with "Medium" explanations**
4. **Adjust style based on content type**

### For Privacy:
1. **Review consent settings** in Privacy tab
2. **Only enable analytics if you want to help improve the extension**
3. **API keys are stored securely** in browser's sync storage

## 📞 Support

### Need Help?
- 📧 **GitHub Issues**: [Report a problem](https://github.com/azfarhussain-10p/textToSpeachExt/issues)
- 📚 **Documentation**: [Full docs](docs/)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/azfarhussain-10p/textToSpeachExt/discussions)

### Free API Alternatives:
If you prefer not to use Groq/Claude, the extension works perfectly **without AI features** - just disable AI explanations and enjoy the core TTS functionality!

---

🎉 **You're all set!** Start selecting text on any website and enjoy AI-powered explanations with natural speech synthesis.