#!/bin/bash
set -e

echo "🚀 Setting up TTS Extension Development Environment..."

# Update package list
echo "📦 Updating package list..."
sudo apt-get update

# Install browser extension development tools
echo "🌐 Installing browsers and testing tools..."
sudo apt-get install -y \
    chromium-browser \
    firefox-esr \
    xvfb \
    jq \
    unzip

# Install audio and GUI libraries for TTS testing
echo "🎵 Installing audio/GUI libraries..."
sudo apt-get install -y \
    pulseaudio \
    alsa-utils \
    libasound2-dev \
    libnss3-dev \
    libxss1 \
    libxtst6 \
    libgtk-3-0 \
    libxrandr2 \
    libgconf-2-4

# Install network tools for firewall
echo "🔥 Installing network tools..."
sudo apt-get install -y \
    iptables \
    ipset \
    iproute2 \
    dnsutils \
    curl \
    wget

# Install Node.js packages for browser extension development
echo "📝 Installing Node.js development packages..."
npm install -g \
    @types/chrome \
    @types/firefox-webext-browser \
    web-ext \
    jest \
    playwright \
    puppeteer \
    webpack \
    webpack-cli

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium firefox webkit

# Set up browser environment variables
echo "⚙️  Setting up environment..."
echo 'export CHROME_BIN=/usr/bin/chromium-browser' >> ~/.zshrc
echo 'export FIREFOX_BIN=/usr/bin/firefox-esr' >> ~/.zshrc
echo 'export DISPLAY=:99' >> ~/.zshrc

# Set up firewall (if possible)
if [ -f "/usr/local/bin/init-firewall.sh" ]; then
    echo "🔒 Setting up firewall..."
    sudo /usr/local/bin/init-firewall.sh || echo "⚠️  Firewall setup failed, continuing without it"
else
    echo "ℹ️  No firewall script found, skipping firewall setup"
fi

# Clean up
echo "🧹 Cleaning up..."
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

echo "✅ TTS Extension Development Environment setup complete!"
echo ""
echo "🎉 Available tools:"
echo "   - TypeScript, ESLint, Prettier"
echo "   - Chrome & Firefox browsers"
echo "   - web-ext (Mozilla extension tool)"
echo "   - Jest & Playwright for testing"
echo "   - Audio libraries for TTS testing"
echo ""
echo "🚀 Ready for TTS browser extension development!"