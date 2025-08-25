/**
 * Create ZIP packages for browser extensions
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const browsers = ['chrome', 'firefox', 'safari'];
const version = require('../package.json').version;
const releasesDir = path.join(__dirname, '..', 'releases');

// Ensure releases directory exists
if (!fs.existsSync(releasesDir)) {
    fs.mkdirSync(releasesDir, { recursive: true });
}

async function createZip(browser) {
    const distDir = path.join(__dirname, '..', 'dist', browser);
    const outputPath = path.join(releasesDir, `${browser}-extension-v${version}.zip`);

    if (!fs.existsSync(distDir)) {
        console.error(`❌ ${browser} build not found at: ${distDir}`);
        return;
    }

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', () => {
            console.log(`✅ ${browser}: ${archive.pointer()} total bytes`);
            console.log(`📦 Package created: ${outputPath}`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(distDir, false);
        archive.finalize();
    });
}

async function packageAll() {
    console.log(`🚀 Creating packages for version ${version}...\n`);
    
    for (const browser of browsers) {
        try {
            await createZip(browser);
        } catch (error) {
            console.error(`❌ Failed to package ${browser}:`, error.message);
        }
    }
    
    console.log('\n✅ Packaging complete!');
    
    // List created packages
    console.log('\nCreated packages:');
    const packages = fs.readdirSync(releasesDir);
    packages.forEach(pkg => {
        const stats = fs.statSync(path.join(releasesDir, pkg));
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  📦 ${pkg} (${sizeMB} MB)`);
    });
}

// Install archiver if not available, then run
try {
    require('archiver');
    packageAll().catch(console.error);
} catch (error) {
    console.log('Installing archiver dependency...');
    const { exec } = require('child_process');
    exec('npm install --save-dev archiver', (error) => {
        if (error) {
            console.error('Failed to install archiver:', error);
            return;
        }
        console.log('Archiver installed, running packaging...');
        delete require.cache[require.resolve('archiver')];
        packageAll().catch(console.error);
    });
}