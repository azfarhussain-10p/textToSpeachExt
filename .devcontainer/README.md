# 🐳 Text-to-Speech Extension Dev Container

A secure, production-ready development container specifically designed for the Text-to-Speech Browser Extension project. Provides browser extension development tools, AI service access, and cross-browser testing capabilities.

## 🎯 Overview

This Dev Container setup creates a secure, isolated environment optimized for Text-to-Speech browser extension development. It includes all necessary tools for multi-browser extension development, AI service integration, and cross-browser testing while maintaining security through network isolation.

## ✨ Key Features

- **🔒 Enhanced Security**: Custom firewall with AI service endpoints whitelisted
- **🌐 Browser Extension Tools**: Chrome, Firefox extension development and testing
- **🤖 AI Integration Ready**: Groq, Claude API access pre-configured
- **🎤 TTS Development**: Web Speech API testing and audio tools
- **🧪 Cross-Browser Testing**: Puppeteer, Playwright, and web-ext included
- **📦 VS Code Integration**: Extension-specific tools and settings
- **💾 Session Persistence**: Command history and configurations preserved
- **🔄 Multi-Platform**: Works on macOS, Windows, and Linux

## 📋 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [VS Code](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Git for cloning the repository

## 🚀 Quick Start

### Option 1: VS Code (Recommended)

1. **Open your project in VS Code**
   ```bash
   code your-project-folder
   ```

2. **Open Command Palette** (`Cmd/Ctrl + Shift + P`)

3. **Select** "Dev Containers: Reopen in Container"

4. **Wait** for the container to build (first time takes ~2-3 minutes)

5. **Open integrated terminal** (`Ctrl + J`) and start development:
   ```bash
   # Start Claude Code for TTS extension development
   claude --dangerously-skip-permissions
   
   # Or run extension development commands
   npm run dev:chrome    # Start Chrome development mode
   npm run test:e2e      # Run cross-browser tests
   ```

### Option 2: Command Line

```bash
# Clone the TTS extension project
git clone https://github.com/azfarhussain-10p/textToSpeachExt.git
cd textToSpeachExt

# Build and run the TTS development container
docker build -t tts-extension-dev .devcontainer/
docker run -it --cap-add=NET_ADMIN --cap-add=NET_RAW \
  -v $(pwd):/workspace \
  -v tts-extension-history:/commandhistory \
  -v tts-extension-config:/home/node/.claude \
  tts-extension-dev
```

## 🏗️ Architecture

### File Structure
```
.devcontainer/
├── devcontainer.json    # Container configuration and VS Code settings
├── Dockerfile          # Container image definition
└── init-firewall.sh    # Network security setup script
```

### Components Breakdown

#### 📄 devcontainer.json
Configures the TTS extension development environment:
- **Container name**: `TTS Extension Development`
- **Build context**: Uses local Dockerfile with extension tools
- **Network capabilities**: `NET_ADMIN` and `NET_RAW` for firewall management
- **Volume mounts**: Persistent storage for history and extension data
- **VS Code extensions**: ESLint, Prettier, WebExtensions, TypeScript
- **Terminal**: ZSH as default with Powerlevel10k theme
- **Post-create**: Firewall initialization + extension environment setup

#### 🐋 Dockerfile
Creates the TTS extension development image with:
- **Base image**: Node.js 20 (official)
- **Development tools**: git, gh (GitHub CLI), jq, fzf, zsh
- **Browser extension tools**: web-ext, webstore-upload-cli, chrome-launcher
- **Testing tools**: puppeteer, playwright, jest
- **Network tools**: iptables, ipset, iproute2, dnsutils
- **Claude Code**: Pre-installed globally via npm
- **Delta**: Git diff viewer for better code reviews
- **User setup**: Non-root `node` user with sudo access for firewall

#### 🔥 init-firewall.sh
Implements network security optimized for TTS extension development:
- **Default policy**: DENY all outbound traffic
- **Whitelisted services**:
  - GitHub API and repositories
  - NPM registry
  - Groq AI API endpoints (api.groq.com)
  - Anthropic Claude API endpoints
  - Chrome Web Store APIs
  - Firefox Add-ons APIs
  - DNS resolution
  - Host network communication
- **Verification**: Automated testing of firewall rules and AI service connectivity

## 🔒 Security Features

### Network Isolation
The container implements a strict firewall optimized for TTS extension development:
1. **Blocks all outbound traffic by default**
2. **Allows only TTS extension development domains**:
   - `github.com`, `api.github.com` (version control)
   - `registry.npmjs.org` (package management)
   - `api.groq.com` (Groq AI API for explanations)
   - `api.anthropic.com` (Claude AI API)
   - `addons.mozilla.org` (Firefox extension APIs)
   - `chrome.google.com` (Chrome Web Store APIs)
   - `sentry.io`, `statsig.com` (telemetry)
3. **Maintains host connectivity** for local development servers and browser testing
4. **Permits DNS resolution** for domain lookups

### Verification Process
On startup, the firewall:
- Fetches and aggregates GitHub's IP ranges from their API
- Resolves and adds IPs for TTS extension development domains
- Tests blocking (attempts to reach `example.com` - should fail)
- Tests allowing (attempts to reach `api.github.com` - should succeed)
- Verifies AI service connectivity (Groq and Claude APIs)
- Confirms extension store API access

### Security Best Practices
- ✅ Run as non-root user (`node`)
- ✅ Sudo access limited to firewall script only
- ✅ No access to host filesystem outside mounted workspace
- ✅ Network traffic logged and restricted
- ✅ Credentials stored in isolated volumes

## ⚙️ Customization

### Adding AI Service Domains
Edit `init-firewall.sh` to add new AI or extension service domains:
```bash
# Add your domain to the TTS extension development domains
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "api.groq.com" \
    "addons.mozilla.org" \
    "chrome.google.com" \
    "your-ai-service.com"; do  # Add here
    # ... existing resolution code
done
```

### VS Code Extensions
The container includes TTS extension development extensions. Modify `devcontainer.json` to add more:
```json
"customizations": {
  "vscode": {
    "extensions": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode", 
      "eamodio.gitlens",
      "ms-vscode.vscode-typescript-next",
      "firefox-devtools.vscode-firefox-debug",
      "google.chrome-extension-development",
      "your.extension-id"  // Add here
    ]
  }
}
```

### Environment Variables
TTS extension environment variables in `devcontainer.json`:
```json
"remoteEnv": {
  "NODE_OPTIONS": "--max-old-space-size=4096",
  "CLAUDE_CONFIG_DIR": "/home/node/.claude",
  "GROQ_API_KEY": "${localEnv:GROQ_API_KEY}",
  "CLAUDE_API_KEY": "${localEnv:CLAUDE_API_KEY}",
  "CHROME_EXTENSION_ID": "${localEnv:CHROME_EXTENSION_ID}",
  "FIREFOX_API_KEY": "${localEnv:FIREFOX_API_KEY}",
  "YOUR_ENV_VAR": "value"  // Add here
}
```

### TTS Extension Development Tools
The Dockerfile includes TTS-specific tools. Add more if needed:
```dockerfile
# Add after existing apt install for TTS extension development
RUN apt update && apt install -y \
  chromium-browser \
  firefox-esr \
  pulseaudio \
  alsa-utils \
  your-new-tool
```

## 🧪 Testing the TTS Extension Setup

### Verify Claude Code Installation
```bash
claude --version
# Should output: Claude Code version X.X.X
```

### Test TTS Extension Development Environment
```bash
# Test Node.js and npm
node --version && npm --version

# Test extension development tools
web-ext --version
webstore upload --version

# Test browser automation tools
npx puppeteer --version
npx playwright --version
```

### Test Network Restrictions
```bash
# Should fail (blocked)
curl https://example.com

# Should succeed (TTS development allowed domains)
curl https://api.github.com/zen
curl https://api.groq.com/openai/v1/models
curl https://api.anthropic.com/v1/messages
```

### Test Extension Development Workflow
```bash
# Run TTS extension development commands
npm run dev:chrome     # Should work
npm run test:unit      # Should work
npm run lint           # Should work

# Run Claude Code in development mode
claude --dangerously-skip-permissions
```
The `--dangerously-skip-permissions` flag is safe in the container due to network isolation.

## 🐛 Troubleshooting

### Container Won't Start
- **Check Docker is running**: Docker Desktop should be active
- **Verify capabilities**: Ensure Docker has permission for `NET_ADMIN`
- **Review logs**: Check Docker logs for specific errors

### Firewall Verification Fails
- **DNS issues**: Ensure DNS resolution works (`nslookup github.com`)
- **IP changes**: GitHub/npm IPs may change; rebuild container
- **Permissions**: Verify sudo setup for firewall script

### Claude Code Not Found
- **Installation failed**: Check npm install logs in Dockerfile build
- **PATH issues**: Ensure `/usr/local/share/npm-global/bin` is in PATH
- **Rebuild container**: Force rebuild with no cache

### VS Code Extensions Not Loading
- **Reload window**: Cmd/Ctrl + Shift + P → "Developer: Reload Window"
- **Extension sync**: Check VS Code settings sync is not overriding
- **Manual install**: Install extensions manually if needed

## 📊 Performance Considerations

- **First build**: Takes 2-3 minutes (downloading dependencies)
- **Subsequent starts**: ~10 seconds (using cached image)
- **Memory usage**: ~500MB baseline + your application
- **CPU usage**: Minimal overhead from containerization

## 🚢 Deployment Scenarios

### TTS Extension Team Development
Share the `.devcontainer` folder for consistent TTS extension development:
1. Team members clone the TTS extension repository
2. Open in VS Code
3. Automatic prompt to reopen in container
4. Consistent TTS development environment with all tools pre-configured
5. All team members have same browser extension development setup

### CI/CD Integration for TTS Extension
Use the same Dockerfile for TTS extension CI environments:
```yaml
# GitHub Actions example for TTS extension
jobs:
  test-extension:
    runs-on: ubuntu-latest
    container:
      image: your-registry/tts-extension-dev:latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run TTS extension tests
        run: |
          npm run test:unit
          npm run test:e2e:chrome
          npm run lint
      - name: Build extension
        run: npm run build:all
```

### Client Isolation
Create separate containers for different clients:
```bash
# Client A
docker run -it --name client-a-dev ...

# Client B  
docker run -it --name client-b-dev ...
```

## 📚 Advanced Usage

### Multi-Container Setup
Extend `devcontainer.json` for microservices:
```json
"dockerComposeFile": "docker-compose.yml",
"service": "claude-code",
"workspaceFolder": "/workspace"
```

### GPU Support
For ML/AI workloads, add GPU access:
```json
"runArgs": [
  "--gpus", "all",
  "--cap-add=NET_ADMIN",
  "--cap-add=NET_RAW"
]
```

### Custom Shell Configuration
The container includes ZSH with Powerlevel10k. Customize in:
- `/home/node/.zshrc` - ZSH configuration
- `/home/node/.p10k.zsh` - Powerlevel10k theme

## 🤝 Contributing

To improve this Dev Container setup:

1. **Test changes thoroughly** in isolated environment
2. **Document new features** in this README
3. **Maintain security focus** - don't add unnecessary network access
4. **Consider backwards compatibility** for existing users

## 📝 License

This Dev Container configuration is provided as-is for use with Claude Code. Adapt it freely for your projects.

## 🔗 Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Dev Containers Specification](https://containers.dev/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

**Security Note**: While this container provides substantial isolation and security, no system is completely immune to all attacks. Always:
- Review Claude's actions in logs
- Keep Docker and dependencies updated
- Use additional security layers for sensitive work
- Never store production credentials in containers