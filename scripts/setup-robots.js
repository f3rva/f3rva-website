/**
 * Script to set up the appropriate robots.txt file based on environment
 * Usage: node scripts/setup-robots.js [dev|prod]
 */

import fs from 'fs';
import path from 'path';

const environment = process.argv[2] || 'dev';
const validEnvironments = ['dev', 'prod'];

if (!validEnvironments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`✅ Valid options: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

const publicDir = path.join(process.cwd(), 'public');
const sourceFile = path.join(publicDir, `robots-${environment}.txt`);
const targetFile = path.join(publicDir, 'robots.txt');

function setupRobots() {
  try {
    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
      console.error(`❌ Source file not found: ${sourceFile}`);
      process.exit(1);
    }

    // Copy the appropriate robots file
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ Copied ${sourceFile} to ${targetFile}`);
    
    // Show content preview
    const content = fs.readFileSync(targetFile, 'utf8');
    const lines = content.split('\n').slice(0, 5);
    console.log(`📄 Content preview:`);
    lines.forEach(line => console.log(`   ${line}`));
    if (content.split('\n').length > 5) {
      console.log(`   ... (${content.split('\n').length - 5} more lines)`);
    }

    if (environment === 'dev') {
      console.log(`🚫 Development mode: All crawlers blocked`);
    } else {
      console.log(`🤖 Production mode: Crawlers allowed with restrictions`);
    }
  } catch (error) {
    console.error(`❌ Error setting up robots.txt:`, error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupRobots();
}

export { setupRobots };