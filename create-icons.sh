#!/bin/bash
# Create minimal PNG icon files for Chrome extension

cd "$(dirname "$0")/dist/chrome/assets/icons"

# Create a minimal 1x1 transparent PNG (base64 encoded)
base64 -d <<< "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" > icon16.png
cp icon16.png icon24.png
cp icon16.png icon32.png
cp icon16.png icon48.png
cp icon16.png icon128.png

echo "✅ Icon files created successfully"