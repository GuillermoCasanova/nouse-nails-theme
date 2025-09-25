#!/usr/bin/env node

/**
 * Asset Optimization Script for Shopify Theme
 * Provides automated optimization for CSS and JavaScript files
 */

const fs = require('fs');
const path = require('path');

class AssetOptimizer {
  constructor() {
    this.assetsDir = path.join(__dirname, 'assets');
    this.results = {
      originalSize: 0,
      optimizedSize: 0,
      files: []
    };
  }

  /**
   * Run all optimizations
   */
  async optimize() {
    console.log('🚀 Starting asset optimization...\n');

    await this.analyzeAssets();
    await this.minifyCSS();
    await this.analyzeJavaScript();
    await this.generateOptimizationReport();

    console.log('\n✅ Optimization complete!');
    console.log(`📊 Total savings: ${this.formatBytes(this.results.originalSize - this.results.optimizedSize)}`);
    console.log(`📈 Size reduction: ${((this.results.originalSize - this.results.optimizedSize) / this.results.originalSize * 100).toFixed(1)}%`);
  }

  /**
   * Analyze all assets and provide optimization suggestions
   */
  async analyzeAssets() {
    console.log('📊 Analyzing assets...\n');

    const cssFiles = this.getFilesByExtension('.css');
    const jsFiles = this.getFilesByExtension('.js');

    // Analyze CSS files
    console.log('CSS Files (largest first):');
    const cssSizes = cssFiles
      .map(file => ({
        name: file,
        size: fs.statSync(path.join(this.assetsDir, file)).size,
        type: 'css'
      }))
      .sort((a, b) => b.size - a.size);

    cssSizes.forEach(file => {
      console.log(`  ${file.name.padEnd(40)} ${this.formatBytes(file.size)}`);
    });

    // Analyze JS files  
    console.log('\nJavaScript Files (largest first):');
    const jsSizes = jsFiles
      .map(file => ({
        name: file,
        size: fs.statSync(path.join(this.assetsDir, file)).size,
        type: 'js'
      }))
      .sort((a, b) => b.size - a.size);

    jsSizes.forEach(file => {
      console.log(`  ${file.name.padEnd(40)} ${this.formatBytes(file.size)}`);
    });

    // Calculate totals
    const totalCSS = cssSizes.reduce((sum, file) => sum + file.size, 0);
    const totalJS = jsSizes.reduce((sum, file) => sum + file.size, 0);

    console.log('\n📈 Summary:');
    console.log(`  Total CSS: ${this.formatBytes(totalCSS)}`);
    console.log(`  Total JS:  ${this.formatBytes(totalJS)}`);
    console.log(`  Total:     ${this.formatBytes(totalCSS + totalJS)}\n`);

    this.results.originalSize = totalCSS + totalJS;
  }

  /**
   * Simple CSS minification (remove comments, extra whitespace)
   */
  async minifyCSS() {
    console.log('🗜️  Minifying CSS files...\n');

    const cssFiles = this.getFilesByExtension('.css');
    
    for (const file of cssFiles) {
      const filePath = path.join(this.assetsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const originalSize = Buffer.byteLength(content, 'utf8');

      // Simple minification
      const minified = this.minifyCSS(content);
      const minifiedSize = Buffer.byteLength(minified, 'utf8');
      
      if (minifiedSize < originalSize) {
        // Create backup
        fs.writeFileSync(`${filePath}.backup`, content);
        
        // Write minified version
        fs.writeFileSync(filePath, minified);
        
        const savings = originalSize - minifiedSize;
        const savingsPercent = (savings / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ ${file.padEnd(40)} -${this.formatBytes(savings)} (${savingsPercent}%)`);
        
        this.results.files.push({
          name: file,
          type: 'css',
          originalSize,
          optimizedSize: minifiedSize,
          savings
        });
      }
    }
  }

  /**
   * Analyze JavaScript files for optimization opportunities
   */
  async analyzeJavaScript() {
    console.log('\n🔍 Analyzing JavaScript for optimization opportunities...\n');

    const jsFiles = this.getFilesByExtension('.js')
      .filter(file => !file.includes('performance-')) // Skip our performance files
      .filter(file => !file.includes('.min.'))        // Skip already minified files
      .filter(file => !file.includes('ie11'))         // Skip IE11 polyfill
      .filter(file => !file.includes('lazysizes'));   // Skip third-party

    for (const file of jsFiles) {
      const filePath = path.join(this.assetsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');

      console.log(`📄 ${file} (${this.formatBytes(size)}):`);

      // Analyze content
      const analysis = this.analyzeJavaScriptFile(content);
      
      if (analysis.functions > 20) {
        console.log(`  ⚠️  Large file with ${analysis.functions} functions - consider code splitting`);
      }
      
      if (analysis.dependencies.length > 0) {
        console.log(`  📦 Dependencies: ${analysis.dependencies.join(', ')}`);
      }
      
      if (analysis.eventListeners > 10) {
        console.log(`  🎧 Many event listeners (${analysis.eventListeners}) - check for memory leaks`);
      }
      
      if (analysis.domQueries > 20) {
        console.log(`  🔍 Many DOM queries (${analysis.domQueries}) - consider caching`);
      }

      console.log('');
    }
  }

  /**
   * Generate comprehensive optimization report
   */
  async generateOptimizationReport() {
    const reportPath = path.join(__dirname, 'optimization-results.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        originalSize: this.results.originalSize,
        optimizedSize: this.results.optimizedSize,
        totalSavings: this.results.originalSize - this.results.optimizedSize,
        savingsPercent: ((this.results.originalSize - this.results.optimizedSize) / this.results.originalSize * 100).toFixed(1)
      },
      files: this.results.files,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Detailed report saved to: optimization-results.json`);
  }

  /**
   * Generate specific recommendations based on analysis
   */
  generateRecommendations() {
    const recommendations = [];

    // Check for large files
    const largeFiles = this.results.files.filter(file => file.originalSize > 10000);
    if (largeFiles.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'bundling',
        issue: `${largeFiles.length} files are larger than 10KB`,
        suggestion: 'Consider code splitting or lazy loading for these large files',
        files: largeFiles.map(f => f.name)
      });
    }

    // Check for many small CSS files
    const smallCSSFiles = this.results.files.filter(file => 
      file.type === 'css' && file.originalSize < 2000
    );
    if (smallCSSFiles.length > 10) {
      recommendations.push({
        priority: 'medium',
        type: 'bundling',
        issue: `${smallCSSFiles.length} small CSS files detected`,
        suggestion: 'Bundle small CSS files together to reduce HTTP requests',
        files: smallCSSFiles.map(f => f.name)
      });
    }

    // Check overall bundle size
    if (this.results.originalSize > 500000) { // 500KB
      recommendations.push({
        priority: 'high',
        type: 'size',
        issue: 'Total bundle size exceeds 500KB',
        suggestion: 'Implement aggressive code splitting and lazy loading'
      });
    }

    return recommendations;
  }

  /**
   * Simple CSS minification
   */
  minifyCSS(css) {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around brackets and semicolons
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/\s*}\s*/g, '}')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      // Trim
      .trim();
  }

  /**
   * Analyze JavaScript file content
   */
  analyzeJavaScriptFile(content) {
    const analysis = {
      functions: (content.match(/function\s+\w+/g) || []).length,
      eventListeners: (content.match(/addEventListener/g) || []).length,
      domQueries: (content.match(/querySelector|getElementById|getElementsBy/g) || []).length,
      dependencies: []
    };

    // Look for common dependencies
    if (content.includes('window.Shopify')) analysis.dependencies.push('Shopify');
    if (content.includes('jQuery') || content.includes('$')) analysis.dependencies.push('jQuery');
    if (content.includes('Swiper')) analysis.dependencies.push('Swiper');

    return analysis;
  }

  /**
   * Get files by extension from assets directory
   */
  getFilesByExtension(ext) {
    return fs.readdirSync(this.assetsDir)
      .filter(file => path.extname(file) === ext);
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// CLI interface
if (require.main === module) {
  const optimizer = new AssetOptimizer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      optimizer.analyzeAssets();
      break;
    case 'css':
      optimizer.minifyCSS();
      break;
    case 'js':
      optimizer.analyzeJavaScript();
      break;
    case 'all':
    default:
      optimizer.optimize();
      break;
  }
}

module.exports = AssetOptimizer;