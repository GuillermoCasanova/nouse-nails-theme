#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to format CSS comments with 5 line breaks before section headers
function formatCssComments(content) {
  // Split content into lines to better track position
  const lines = content.split('\n');
  let result = [];
  let isFirstComment = true;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a comment block
    if (line.trim().startsWith('/*------------------------------------*\\')) {
      if (isFirstComment) {
        // First comment - no extra line breaks
        result.push(line);
        isFirstComment = false;
      } else {
        // Subsequent comment - add 5 line breaks before it
        // Count existing empty lines before this comment
        let emptyLinesBefore = 0;
        for (let j = result.length - 1; j >= 0; j--) {
          if (result[j].trim() === '') {
            emptyLinesBefore++;
          } else {
            break;
          }
        }
        
        // Add the needed line breaks (5 total)
        const neededBreaks = 5 - emptyLinesBefore;
        for (let k = 0; k < neededBreaks; k++) {
          result.push('');
        }
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const formatted = formatCssComments(content);
    
    if (content !== formatted) {
      fs.writeFileSync(filePath, formatted);
      console.log(`Formatted: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to process all CSS files in assets directory
function processAllCssFiles() {
  const assetsDir = path.join(__dirname, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found');
    return;
  }
  
  const files = fs.readdirSync(assetsDir);
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  console.log(`Found ${cssFiles.length} CSS files to process...`);
  
  cssFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    processFile(filePath);
  });
  
  console.log('CSS comment formatting complete!');
}

// Run the formatter
processAllCssFiles();
