#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, and pipeline failures
IFS=$'\n\t'       # Stricter word splitting

# Flush existing rules and delete existing ipsets
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

# First allow DNS and localhost before any restrictions
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
ipset create allowed-domains hash:net

# Fetch GitHub meta information and aggregate + add their IP ranges
echo "Fetching GitHub IP ranges..."
gh_ranges=$(curl -s https://api.github.com/meta)
if [ -z "$gh_ranges" ]; then
    echo "ERROR: Failed to fetch GitHub IP ranges"
    exit 1
fi

if ! echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null; then
    echo "ERROR: GitHub API response missing required fields"
    exit 1
fi

echo "Processing GitHub IPs..."
while read -r cidr; do
    if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
        echo "ERROR: Invalid CIDR range from GitHub meta: $cidr"
        exit 1
    fi
    echo "Adding GitHub range $cidr"
    ipset add allowed-domains "$cidr"
done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' | aggregate -q)

# Resolve and add TTS extension development domains
for domain in \
    "registry.npmjs.org" \
    "api.anthropic.com" \
    "api.groq.com" \
    "console.groq.com" \
    "addons.mozilla.org" \
    "chrome.google.com" \
    "chromewebstore.google.com" \
    "clients2.google.com" \
    "sentry.io" \
    "statsig.anthropic.com" \
    "statsig.com"; do
    echo "Resolving $domain..."
    ips=$(dig +short A "$domain")
    if [ -z "$ips" ]; then
        echo "ERROR: Failed to resolve $domain"
        exit 1
    fi
    
    while read -r ip; do
        if [[ ! "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "ERROR: Invalid IP from DNS for $domain: $ip"
            exit 1
        fi
        echo "Adding $ip for $domain"
        ipset add allowed-domains "$ip"
    done < <(echo "$ips")
done

# Get host IP from default route
HOST_IP=$(ip route | grep default | cut -d" " -f3)
if [ -z "$HOST_IP" ]; then
    echo "ERROR: Failed to detect host IP"
    exit 1
fi

HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
echo "Host network detected as: $HOST_NETWORK"

# Set up remaining iptables rules
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

echo "TTS Extension firewall configuration complete"
echo "Verifying firewall rules..."

# Test that blocked domains are blocked
if curl --connect-timeout 5 https://example.com >/dev/null 2>&1; then
    echo "ERROR: Firewall verification failed - was able to reach https://example.com"
    exit 1
else
    echo "✓ Firewall verification passed - unable to reach https://example.com as expected"
fi

# Verify GitHub API access
if ! curl --connect-timeout 5 https://api.github.com/zen >/dev/null 2>&1; then
    echo "ERROR: Firewall verification failed - unable to reach https://api.github.com"
    exit 1
else
    echo "✓ Firewall verification passed - able to reach https://api.github.com as expected"
fi

# Verify Groq API access (for TTS extension AI features)
echo "Testing Groq API connectivity..."
if curl --connect-timeout 5 -H "Authorization: Bearer test" https://api.groq.com/openai/v1/models >/dev/null 2>&1; then
    echo "✓ Groq API accessible for TTS extension development"
else
    echo "⚠ Groq API test failed, but this may be due to auth rather than connectivity"
fi

# Verify Anthropic API access
echo "Testing Anthropic API connectivity..."
if curl --connect-timeout 5 https://api.anthropic.com >/dev/null 2>&1; then
    echo "✓ Anthropic API accessible for TTS extension development"
else
    echo "⚠ Anthropic API test failed, but this may be due to auth rather than connectivity"
fi

# Verify Mozilla addons access (for Firefox extension development)
echo "Testing Mozilla add-ons API connectivity..."
if curl --connect-timeout 5 https://addons.mozilla.org >/dev/null 2>&1; then
    echo "✓ Mozilla add-ons API accessible for Firefox extension development"
else
    echo "⚠ Mozilla add-ons API test failed"
fi

echo "🔥 TTS Extension firewall setup complete!"
echo "Allowed services:"
echo "  - GitHub (code repository and API)"
echo "  - NPM registry (package management)"
echo "  - Groq API (AI explanations for TTS)"
echo "  - Anthropic Claude API (AI explanations)"
echo "  - Mozilla Add-ons (Firefox extension publishing)"
echo "  - Chrome Web Store (Chrome extension publishing)"
echo "  - Host network (local development)"