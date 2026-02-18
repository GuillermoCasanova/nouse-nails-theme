#!/usr/bin/env node

/**
 * Critical CSS Extractor for Shopify Theme
 * 
 * This script scans Liquid files for <link> tags with inline-css="true" attribute,
 * extracts the CSS files, minifies them, and writes to critical-css.liquid
 * 
 * Usage: 
 *   node scripts/extract-critical-css.js           # Extract + comment (production)
 *   node scripts/extract-critical-css.js --restore # Uncomment links (development)
 */

const fs = require('fs');
const path = require('path');

// Directories to scan for Liquid files
const LIQUID_DIRS = [
  'sections',
  'templates',
  'snippets',
  'layout'
];
    
    // Output file
const OUTPUT_FILE = 'snippets/critical-css.liquid';

/**
 * Find all Liquid files in specified directories
 */
function findLiquidFiles(rootDir) {
  const liquidFiles = [];
  
  for (const dir of LIQUID_DIRS) {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath, { recursive: true });
    for (const file of files) {
      if (typeof file === 'string' && file.endsWith('.liquid')) {
        liquidFiles.push(path.join(dir, file));
      }
    }
  }
  
  return liquidFiles;
}

/**
 * Extract CSS filenames from link tags with inline-css="true"
 */
function extractInlineCSSFiles(liquidContent) {
  const cssFiles = new Set();
  
  // Find all link tags, including multiline ones
  // Match from <link to the closing >, handling attributes across multiple lines
  // We need to be careful not to match > inside attribute values
  let pos = 0;
  
  while (pos < liquidContent.length) {
    // Find the start of a link tag
    const linkStart = liquidContent.indexOf('<link', pos);
    if (linkStart === -1) break;
    
    // Find the end of the link tag (closing >)
    // We need to handle multiline tags, so we'll search for > that's not inside quotes
    let linkEnd = linkStart + 5; // Start after "<link"
    let inQuotes = false;
    let quoteChar = null;
    
    while (linkEnd < liquidContent.length) {
      const char = liquidContent[linkEnd];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      } else if (!inQuotes && char === '>') {
        linkEnd++;
        break;
      }
      
      linkEnd++;
    }
    
    if (linkEnd > liquidContent.length) break;
    
    // Extract the link tag
    const linkTag = liquidContent.substring(linkStart, linkEnd);
    
    // Check if this link tag has inline-css="true" (case insensitive, handles quotes)
    if (!/inline-css\s*=\s*["']?true["']?/i.test(linkTag)) {
      pos = linkEnd;
      continue;
    }
    
    // Extract CSS filename directly from the link tag
    // Look for the Liquid pattern: {{ 'filename.css' | asset_url }}
    // This pattern might span multiple lines, so we normalize whitespace first
    const normalizedTag = linkTag.replace(/\s+/g, ' ');
    const liquidMatch = normalizedTag.match(/\{\{\s*['"]([^'"]+\.css)['"]\s*\|\s*asset_url\s*\}\}/);
    if (liquidMatch) {
      cssFiles.add(liquidMatch[1]);
    }
    
    pos = linkEnd;
  }
  
  return Array.from(cssFiles);
}

/**
 * Read a CSS file
 */
function readCSSFile(filePath, rootDir) {
  const fullPath = path.join(rootDir, 'assets', filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read ${filePath}: ${error.message}`);
    return '';
  }
}

/**
 * Remove CSS comments only, preserving all original formatting
 * This ensures all CSS functionality is maintained exactly as written
 */
function minifyCSS(css) {
  if (!css) return '';
  
  let cleaned = css;
  
  // Remove CSS comments (/* ... */) only
  // This preserves all whitespace, formatting, and structure
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Normalize line endings to be consistent
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove any trailing whitespace at the end of the file
  cleaned = cleaned.trimEnd();
  
  return cleaned;
}

/**
 * Comment out link tags with inline-css="true" in a Liquid file
 */
function commentOutInlineCSSLinks(liquidContent) {
  let modifiedContent = liquidContent;
  let pos = 0;
  const replacements = [];
  
  while (pos < liquidContent.length) {
    // Find the start of a link tag
    const linkStart = liquidContent.indexOf('<link', pos);
    if (linkStart === -1) break;
    
    // Find the end of the link tag
    let linkEnd = linkStart + 5;
    let inQuotes = false;
    let quoteChar = null;
    
    while (linkEnd < liquidContent.length) {
      const char = liquidContent[linkEnd];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      } else if (!inQuotes && char === '>') {
        linkEnd++;
        break;
      }
      
      linkEnd++;
    }
    
    if (linkEnd > liquidContent.length) break;
    
    // Extract the link tag
    const linkTag = liquidContent.substring(linkStart, linkEnd);
    
    // Skip if already inside {% comment %}[INLINED]...{% endcomment %} (avoid double-wrap on repeated runs)
    const before = liquidContent.substring(Math.max(0, linkStart - 200), linkStart);
    const lastInlined = before.lastIndexOf('[INLINED]');
    if (lastInlined !== -1 && !before.substring(lastInlined).includes('{% endcomment %}')) {
      pos = linkEnd;
      continue;
    }
    
    // Check if this link tag has inline-css="true"
    if (/inline-css\s*=\s*["']?true["']?/i.test(linkTag)) {
      // Store the replacement
      replacements.push({
        start: linkStart,
        end: linkEnd,
        original: linkTag
      });
    }
    
    pos = linkEnd;
  }
  
  // Apply replacements in reverse order to maintain positions
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end, original } = replacements[i];
    const commented = `{% comment %}[INLINED]${original}{% endcomment %}`;
    modifiedContent = modifiedContent.substring(0, start) + commented + modifiedContent.substring(end);
  }
  
  return {
    modified: modifiedContent,
    changeCount: replacements.length
  };
}

/**
 * Restore (uncomment) link tags that were wrapped in {% comment %}[INLINED]...{% endcomment %}
 */
function restoreInlineCSSLinks(liquidContent) {
  // Match {% comment %}[INLINED]<link ...>{% endcomment %} and replace with the link tag
  const pattern = /\{%\s*comment\s*%\}\[INLINED\](<link[\s\S]*?>)\{%\s*endcomment\s*%\}/g;
  const matches = liquidContent.match(pattern) || [];
  const modified = liquidContent.replace(pattern, '$1');
  return { modified, changeCount: matches.length };
}

/**
 * Main execution
 */
function main() {
  const rootDir = path.join(__dirname, '..');
  
  console.log('\n🚀 Critical CSS Extractor for Shopify Theme\n');
  console.log('📂 Scanning Liquid files for inline-css="true" attributes...\n');
  
  // Find all Liquid files
  const liquidFiles = findLiquidFiles(rootDir);
  console.log(`Found ${liquidFiles.length} Liquid file(s) to scan\n`);
  
  // Extract CSS files from all Liquid files and track which files have inline CSS
  const allCSSFiles = new Set();
  const filesWithInlineCSS = [];
  
  for (const liquidFile of liquidFiles) {
    const filePath = path.join(rootDir, liquidFile);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const cssFiles = extractInlineCSSFiles(content);
      
      if (cssFiles.length > 0) {
        console.log(`📄 ${liquidFile}:`);
        for (const cssFile of cssFiles) {
          console.log(`   ✓ ${cssFile}`);
          allCSSFiles.add(cssFile);
        }
        filesWithInlineCSS.push({ file: liquidFile, path: filePath, content });
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not read ${liquidFile}: ${error.message}`);
    }
  }
  
  if (allCSSFiles.size === 0) {
    console.log('\n❌ No CSS files found with inline-css="true" attribute');
    console.log('   Make sure your <link> tags have inline-css="true" set');
    process.exit(1);
  }
  
  console.log(`\n📦 Found ${allCSSFiles.size} unique CSS file(s) to process\n`);
  
  // Read and concatenate all CSS files
  let combinedCSS = '';
  const cssFileArray = Array.from(allCSSFiles).sort();
  
  for (const cssFile of cssFileArray) {
    console.log(`📄 Reading: assets/${cssFile}`);
    const cssContent = readCSSFile(cssFile, rootDir);
    if (cssContent) {
      combinedCSS += cssContent + '\n';
    }
  }
  
  // Remove comments from CSS (preserving all formatting)
  console.log('\n🔧 Processing CSS (removing comments only, preserving formatting)...');
  const cleanedCSS = minifyCSS(combinedCSS);
  
  // Build snippet - preserve existing timestamp if CSS unchanged (avoids pre-push hook false failures)
  const outputPath = path.join(rootDir, OUTPUT_FILE);
  let timestamp = new Date().toISOString();
  let shouldWrite = true;

  if (fs.existsSync(outputPath)) {
    const existing = fs.readFileSync(outputPath, 'utf8');
    const endcommentIdx = existing.indexOf('{% endcomment %}');
    let existingCSS = endcommentIdx >= 0 ? existing.slice(endcommentIdx + '{% endcomment %}'.length) : '';
    existingCSS = existingCSS.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const normalizedCleaned = cleanedCSS.trim();
    if (existingCSS === normalizedCleaned) {
      const tsMatch = existing.match(/Generated on: ([^\n]+)/);
      if (tsMatch) timestamp = tsMatch[1].trim();
      shouldWrite = false;
    }
  }

  const header = `{% comment %}
  Critical CSS for above-the-fold content
  This CSS is inlined in the template to prevent FOUT
  Full styles load asynchronously via their respective CSS files.
  
  Auto-generated by: scripts/extract-critical-css.js
  Generated on: ${timestamp}
  Source files: ${cssFileArray.join(', ')}
{% endcomment %}

`;
  
  const snippet = header + cleanedCSS;

  if (shouldWrite) {
    try {
      fs.writeFileSync(outputPath, snippet, 'utf8');
      console.log(`\n✅ Success! Critical CSS written to: ${OUTPUT_FILE}`);
    } catch (error) {
      console.error(`\n❌ Error writing output file:`, error.message);
      process.exit(1);
    }
  } else {
    console.log(`\n✅ Critical CSS unchanged, skipped write (no diff)`);
  }
  console.log(`📊 Original size: ${(combinedCSS.length / 1024).toFixed(2)} KB`);
  console.log(`📊 Processed size: ${(cleanedCSS.length / 1024).toFixed(2)} KB`);
  console.log(`📉 Reduction: ${((1 - cleanedCSS.length / combinedCSS.length) * 100).toFixed(1)}%`);
  console.log(`📁 Files processed: ${cssFileArray.length}`);
  
  // Comment out inline-css="true" link tags in Liquid files
  console.log('\n🔧 Commenting out inline-css="true" link tags in Liquid files...\n');
  let totalCommented = 0;
  
  for (const { file, path: filePath, content } of filesWithInlineCSS) {
    const result = commentOutInlineCSSLinks(content);
    
    if (result.changeCount > 0) {
      try {
        fs.writeFileSync(filePath, result.modified, 'utf8');
        console.log(`📝 ${file}: Commented out ${result.changeCount} link tag(s)`);
        totalCommented += result.changeCount;
      } catch (error) {
        console.warn(`⚠️  Warning: Could not update ${file}: ${error.message}`);
      }
    }
  }
  
  if (totalCommented > 0) {
    console.log(`\n✅ Commented out ${totalCommented} link tag(s) across ${filesWithInlineCSS.length} file(s)`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 Tip: Review the generated file and adjusted Liquid files.');
  console.log('   The critical CSS is now inlined and original links are commented out.');
  console.log('='.repeat(60) + '\n');
}

/**
 * Restore mode: uncomment link tags in Liquid files for development
 */
function runRestore() {
  const rootDir = path.join(__dirname, '..');

  console.log('\n🔄 Critical CSS Restore (development mode)\n');
  console.log('📂 Restoring inline-css link tags in Liquid files...\n');

  const liquidFiles = findLiquidFiles(rootDir);
  let totalRestored = 0;

  for (const liquidFile of liquidFiles) {
    const filePath = path.join(rootDir, liquidFile);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = restoreInlineCSSLinks(content);

      if (result.changeCount > 0) {
        fs.writeFileSync(filePath, result.modified, 'utf8');
        console.log(`📝 ${liquidFile}: Restored ${result.changeCount} link tag(s)`);
        totalRestored += result.changeCount;
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not process ${liquidFile}: ${error.message}`);
    }
  }

  // Clear critical-css.liquid in dev mode (styles load from link tags)
  const outputPath = path.join(rootDir, OUTPUT_FILE);
  const clearedContent = `{% comment %}
  Critical CSS (development mode - cleared, styles load from link tags)
  Run: npm run extract-critical-css
{% endcomment %}
`;
  try {
    fs.writeFileSync(outputPath, clearedContent, 'utf8');
    console.log(`📝 ${OUTPUT_FILE}: Cleared (development mode)\n`);
  } catch (error) {
    console.warn(`⚠️  Warning: Could not clear ${OUTPUT_FILE}: ${error.message}\n`);
  }

  if (totalRestored > 0) {
    console.log(`✅ Restored ${totalRestored} link tag(s). Ready for development.\n`);
  } else {
    console.log('✓ No commented link tags found. Files already in development state.\n');
  }
}

// Run the script
if (require.main === module) {
  const isRestore = process.argv.includes('--restore');
  if (isRestore) {
    runRestore();
  } else {
    main();
  }
}

module.exports = {
  extractInlineCSSFiles,
  minifyCSS,
  findLiquidFiles,
  commentOutInlineCSSLinks,
  restoreInlineCSSLinks
};
