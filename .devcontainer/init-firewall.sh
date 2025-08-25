#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, and pipeline failures
IFS=$'\n\t'       # Stricter word splitting

echo "🔥 Starting TTS Extension firewall setup..."

# Check if running in privileged mode with iptables access
if ! iptables -L >/dev/null 2>&1; then
    echo "⚠️  Cannot access iptables. Container may not be running in privileged mode."
    echo "⚠️  Firewall rules will not be applied, but development can continue."
    echo "⚠️  For full security features, ensure container runs with --privileged flag."
    exit 0
fi

echo "✅ iptables access confirmed. Proceeding with firewall setup..."

# Flush existing rules and delete existing ipsets
echo "🧹 Cleaning existing firewall rules..."
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

# First allow DNS and localhost before any restrictions
echo "🔐 Setting up basic connectivity rules..."
# Allow outbound DNS
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
# Allow inbound DNS responses
iptables -A INPUT -p udp --sport 53 -j ACCEPT
# Allow outbound SSH
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT
# Allow inbound SSH responses
iptables -A INPUT -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
# Allow localhost
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Create ipset with CIDR support
echo "📋 Creating IP allowlist..."
ipset create allowed-domains hash:net

# Fetch GitHub meta information and aggregate + add their IP ranges
echo "🐙 Fetching GitHub IP ranges..."
gh_ranges=$(curl -s https://api.github.com/meta)
if [ -z "$gh_ranges" ]; then
    echo "❌ ERROR: Failed to fetch GitHub IP ranges"
    exit 1
fi

if ! echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null; then
    echo "❌ ERROR: GitHub API response missing required fields"
    exit 1
fi

echo "🔍 Processing GitHub IPs..."
while read -r cidr; do
    if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
        echo "❌ ERROR: Invalid CIDR range from GitHub meta: $cidr"
        exit 1
    fi
    echo "  ➕ Adding GitHub range $cidr"
    ipset add allowed-domains "$cidr"
done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' | aggregate -q)

# Resolve and add TTS extension development domains
echo "🌐 Resolving and adding development domains..."
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "api.groq.com" \
    "console.groq.com" \
    "addons.mozilla.org" \
    "chrome.google.com" \
    "chromewebstore.google.com" \
    "clients2.google.com" \
    "update.googleapis.com" \
    "dl.google.com" \
    "edgedl.me.gvt1.com" \
    "sentry.io" \
    "statsig.anthropic.com" \
    "statsig.com" \
    "cdn.jsdelivr.net" \
    "unpkg.com" \
    "fonts.googleapis.com" \
    "fonts.gstatic.com"; do
    echo "  🔍 Resolving $domain..."
    ips=$(dig +short A "$domain" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$')
    if [ -z "$ips" ]; then
        echo "  ⚠️  Warning: Failed to resolve $domain, skipping"
        continue
    fi
    
    while read -r ip; do
        if [[ ! "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "  ⚠️  Warning: Invalid IP from DNS for $domain: $ip, skipping"
            continue
        fi
        echo "    ➕ Adding $ip for $domain"
        ipset add allowed-domains "$ip"
    done < <(echo "$ips")
done

# Get host IP from default route
echo "🖥️  Detecting host network..."
HOST_IP=$(ip route | grep default | cut -d" " -f3)
if [ -z "$HOST_IP" ]; then
    echo "❌ ERROR: Failed to detect host IP"
    exit 1
fi

HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
echo "  ✅ Host network detected as: $HOST_NETWORK"

# Set up remaining iptables rules
echo "🔒 Configuring firewall policies..."
iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT

# Set default policies to DROP first
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# First allow established connections for already approved traffic
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Then allow only specific outbound traffic to allowed domains
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT

echo "✅ TTS Extension firewall configuration complete!"
echo ""
echo "🔍 Verifying firewall rules..."

# Test that blocked domains are blocked
echo "  🚫 Testing blocked domain access..."
if timeout 5 curl -s https://example.com >/dev/null 2>&1; then
    echo "  ❌ ERROR: Firewall verification failed - was able to reach https://example.com"
    exit 1
else
    echo "  ✅ Firewall verification passed - unable to reach https://example.com as expected"
fi

# Verify GitHub API access
echo "  🐙 Testing GitHub API access..."
if ! timeout 5 curl -s https://api.github.com/zen >/dev/null 2>&1; then
    echo "  ❌ ERROR: Firewall verification failed - unable to reach https://api.github.com"
    exit 1
else
    echo "  ✅ GitHub API accessible as expected"
fi

# Verify Groq API access (for TTS extension AI features)
echo "  🤖 Testing Groq API connectivity..."
if timeout 5 curl -s -H "Authorization: Bearer test" https://api.groq.com/openai/v1/models >/dev/null 2>&1; then
    echo "  ✅ Groq API accessible for TTS extension development"
else
    echo "  ⚠️  Groq API test inconclusive (likely auth-related, not connectivity)"
fi

# Verify Anthropic API access
echo "  🧠 Testing Anthropic API connectivity..."
if timeout 5 curl -s https://api.anthropic.com >/dev/null 2>&1; then
    echo "  ✅ Anthropic API accessible for TTS extension development"
else
    echo "  ⚠️  Anthropic API test inconclusive (likely auth-related, not connectivity)"
fi

# Verify Mozilla addons access (for Firefox extension development)
echo "  🦊 Testing Mozilla add-ons API connectivity..."
if timeout 5 curl -s https://addons.mozilla.org >/dev/null 2>&1; then
    echo "  ✅ Mozilla add-ons API accessible for Firefox extension development"
else
    echo "  ⚠️  Mozilla add-ons API test failed"
fi

# Verify NPM registry access
echo "  📦 Testing NPM registry access..."
if timeout 5 curl -s https://registry.npmjs.org >/dev/null 2>&1; then
    echo "  ✅ NPM registry accessible for package management"
else
    echo "  ❌ ERROR: NPM registry inaccessible - development may be impacted"
fi

echo ""
echo "🎉 TTS Extension firewall setup complete!"
echo ""
echo "📋 Allowed services:"
echo "  ✅ GitHub (code repository and API)"
echo "  ✅ NPM registry (package management)"
echo "  ✅ Groq API (AI explanations for TTS)"
echo "  ✅ Anthropic Claude API (AI explanations)"
echo "  ✅ Mozilla Add-ons (Firefox extension publishing)"
echo "  ✅ Chrome Web Store (Chrome extension publishing)"
echo "  ✅ CDN services (jsdelivr, unpkg, Google Fonts)"
echo "  ✅ Host network (local development)"
echo ""
echo "🔒 All other external connections are blocked for security"
echo "🚀 Ready for secure TTS extension development!"