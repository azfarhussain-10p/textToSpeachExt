/**
 * Global Teardown for E2E Tests
 * Cleanup after all tests complete
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown() {
  console.log('🧹 Starting E2E test cleanup...');
  
  try {
    // Clean up any temporary files created during testing
    const tempFiles = [
      'tests/e2e/fixtures/test-page.html'
    ];
    
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`🗑️ Removed ${file}`);
        } catch (error) {
          console.warn(`⚠️ Could not remove ${file}:`, error.message);
        }
      }
    });
    
    // Clean up test results if they're too old
    const testResultsDir = 'test-results';
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      files.forEach(file => {
        const filePath = path.join(testResultsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          try {
            if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true });
            } else {
              fs.unlinkSync(filePath);
            }
            console.log(`🗑️ Removed old test result: ${file}`);
          } catch (error) {
            console.warn(`⚠️ Could not remove old result ${file}:`, error.message);
          }
        }
      });
    }
    
    // Generate test summary
    generateTestSummary();
    
    console.log('✅ E2E cleanup completed');
    
  } catch (error) {
    console.error('❌ E2E cleanup failed:', error.message);
    // Don't throw error in teardown to avoid masking test failures
  }
}

function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  const summaryData = {
    timestamp: new Date().toISOString(),
    testRun: 'E2E Browser Extension Tests',
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    notes: [
      'E2E tests completed',
      'Check test-results/ directory for detailed reports',
      'Extension builds available in dist/ directories'
    ]
  };
  
  try {
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    fs.writeFileSync(
      'test-results/test-summary.json', 
      JSON.stringify(summaryData, null, 2)
    );
    
    console.log('✅ Test summary generated at test-results/test-summary.json');
  } catch (error) {
    console.warn('⚠️ Could not generate test summary:', error.message);
  }
}

module.exports = globalTeardown;