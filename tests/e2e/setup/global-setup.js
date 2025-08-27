/**
 * Global Setup for E2E Tests
 * Prepares environment and builds extensions before testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function globalSetup() {
  console.log('🚀 Starting E2E test setup...');
  
  try {
    // Ensure dist directories exist
    const distDirs = ['dist/chrome', 'dist/firefox', 'dist/edge'];
    distDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        console.log(`📁 Creating ${dir} directory...`);
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Build extensions for testing
    console.log('🔨 Building extensions for testing...');
    
    try {
      execSync('npm run build:chrome', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minute timeout
      });
      console.log('✅ Chrome extension built successfully');
    } catch (error) {
      console.warn('⚠️ Chrome build failed:', error.message);
    }
    
    try {
      execSync('npm run build:firefox', { 
        stdio: 'inherit',
        timeout: 120000
      });
      console.log('✅ Firefox extension built successfully');
    } catch (error) {
      console.warn('⚠️ Firefox build failed:', error.message);
    }
    
    // Verify essential files exist
    const requiredFiles = [
      'dist/chrome/manifest.json',
      'dist/chrome/background/service-worker.js',
      'dist/chrome/content/content-script.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    if (missingFiles.length > 0) {
      console.error('❌ Missing required files:', missingFiles);
      throw new Error('Extension build incomplete - missing required files');
    }
    
    // Create test data directory
    const testDataDir = 'tests/e2e/fixtures';
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Create test HTML files for extension testing
    createTestFixtures();
    
    console.log('✅ E2E setup completed successfully');
    
  } catch (error) {
    console.error('❌ E2E setup failed:', error.message);
    throw error;
  }
}

function createTestFixtures() {
  console.log('📄 Creating test fixtures...');
  
  // Create a simple test page
  const testPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTS Extension Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .test-content {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .selectable-text {
            background: #f9f9f9;
            padding: 10px;
            margin: 10px 0;
            border-left: 3px solid #0066cc;
        }
    </style>
</head>
<body>
    <h1>TTS Extension Test Page</h1>
    
    <div class="test-content" id="test-content-1">
        <h2>Simple Text Selection Test</h2>
        <p class="selectable-text" id="simple-text">
            This is a simple text that can be selected for text-to-speech testing.
        </p>
    </div>
    
    <div class="test-content" id="test-content-2">
        <h2>Complex Content Test</h2>
        <p class="selectable-text" id="complex-text">
            Artificial Intelligence (AI) refers to the simulation of human intelligence 
            in machines that are programmed to think and learn like humans. The term 
            may also be applied to any machine that exhibits traits associated with 
            a human mind such as learning and problem-solving.
        </p>
    </div>
    
    <div class="test-content" id="test-content-3">
        <h2>Multilingual Content Test</h2>
        <p class="selectable-text" id="multilingual-text" lang="es">
            La inteligencia artificial es una tecnología revolucionaria que está 
            transformando múltiples sectores de la economía global.
        </p>
    </div>
    
    <div class="test-content" id="test-content-4">
        <h2>Long Text Test</h2>
        <p class="selectable-text" id="long-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo 
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse 
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
            non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
    </div>
    
    <div class="test-content" id="test-content-5">
        <h2>Interactive Elements Test</h2>
        <button id="test-button">Click Me</button>
        <input type="text" id="test-input" placeholder="Type here..." value="Editable text content">
        <textarea id="test-textarea" placeholder="Text area content">This text is in a textarea element.</textarea>
    </div>
    
    <script>
        // Add some interactivity for testing
        document.getElementById('test-button').addEventListener('click', function() {
            alert('Button clicked! Extension should work with dynamic content.');
        });
        
        // Mark page as loaded for test detection
        document.body.setAttribute('data-test-ready', 'true');
        
        // Expose test utilities
        window.testUtils = {
            selectText: function(elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    const range = document.createRange();
                    range.selectNodeContents(element);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return element.textContent;
                }
                return null;
            },
            
            getSelectedText: function() {
                return window.getSelection().toString();
            },
            
            clearSelection: function() {
                window.getSelection().removeAllRanges();
            }
        };
    </script>
</body>
</html>`;
  
  fs.writeFileSync('tests/e2e/fixtures/test-page.html', testPageContent);
  console.log('✅ Test fixtures created');
}

module.exports = globalSetup;