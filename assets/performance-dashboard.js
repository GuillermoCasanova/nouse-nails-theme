/**
 * Performance Dashboard for displaying metrics and suggestions
 * Creates a floating dashboard that can be toggled on/off
 */

class PerformanceDashboard {
  constructor(performanceMonitor) {
    this.monitor = performanceMonitor;
    this.isVisible = false;
    this.dashboard = null;
    this.keyCombo = ['KeyP', 'KeyE', 'KeyR', 'KeyF']; // Type "PERF" to toggle
    this.keySequence = [];
    
    this.init();
  }

  init() {
    this.createDashboard();
    this.setupKeyboardShortcut();
    this.setupAutoRefresh();
    
    // Add CSS styles
    this.injectStyles();
  }

  /**
   * Create the dashboard HTML structure
   */
  createDashboard() {
    this.dashboard = document.createElement('div');
    this.dashboard.id = 'performance-dashboard';
    this.dashboard.innerHTML = `
      <div class="perf-header">
        <h3>⚡ Performance Monitor</h3>
        <button class="perf-close" onclick="window.performanceDashboard.toggle()">&times;</button>
      </div>
      <div class="perf-content">
        <div class="perf-score">
          <div class="score-circle">
            <span class="score-value">--</span>
          </div>
          <p>Performance Score</p>
        </div>
        
        <div class="perf-metrics">
          <div class="metric">
            <label>LCP</label>
            <span class="metric-value lcp-value">--</span>
            <small>Largest Contentful Paint</small>
          </div>
          <div class="metric">
            <label>FID</label>
            <span class="metric-value fid-value">--</span>
            <small>First Input Delay</small>
          </div>
          <div class="metric">
            <label>CLS</label>
            <span class="metric-value cls-value">--</span>
            <small>Cumulative Layout Shift</small>
          </div>
          <div class="metric">
            <label>FCP</label>
            <span class="metric-value fcp-value">--</span>
            <small>First Contentful Paint</small>
          </div>
        </div>

        <div class="perf-resources">
          <h4>Resource Loading</h4>
          <div class="resource-summary">
            <div class="resource-type">
              <span class="resource-count css-count">0</span> CSS
            </div>
            <div class="resource-type">
              <span class="resource-count js-count">0</span> JS
            </div>
            <div class="resource-type">
              <span class="resource-count font-count">0</span> Fonts
            </div>
            <div class="resource-type">
              <span class="resource-count image-count">0</span> Images
            </div>
          </div>
        </div>

        <div class="perf-suggestions">
          <h4>💡 Suggestions</h4>
          <div class="suggestions-list"></div>
        </div>

        <div class="perf-actions">
          <button onclick="window.performanceDashboard.refresh()">🔄 Refresh</button>
          <button onclick="window.performanceDashboard.exportReport()">📊 Export</button>
          <button onclick="window.performanceDashboard.showHistory()">📈 History</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.dashboard);
    this.updateDashboard();
  }

  /**
   * Inject CSS styles for the dashboard
   */
  injectStyles() {
    if (document.getElementById('performance-dashboard-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'performance-dashboard-styles';
    styles.textContent = `
      #performance-dashboard {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        max-height: 80vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 999999;
        transform: translateX(350px);
        transition: transform 0.3s ease;
        overflow: hidden;
      }

      #performance-dashboard.visible {
        transform: translateX(0);
      }

      .perf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .perf-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .perf-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .perf-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .perf-content {
        padding: 20px;
        max-height: calc(80vh - 70px);
        overflow-y: auto;
      }

      .perf-score {
        text-align: center;
        margin-bottom: 24px;
      }

      .score-circle {
        width: 80px;
        height: 80px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        position: relative;
      }

      .score-circle.good { border-color: #4ade80; }
      .score-circle.needs-improvement { border-color: #fbbf24; }
      .score-circle.poor { border-color: #f87171; }

      .score-value {
        font-size: 24px;
        font-weight: bold;
      }

      .perf-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }

      .metric {
        background: rgba(255, 255, 255, 0.1);
        padding: 12px;
        border-radius: 8px;
        text-align: center;
      }

      .metric label {
        display: block;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .metric-value {
        display: block;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .metric-value.good { color: #4ade80; }
      .metric-value.needs-improvement { color: #fbbf24; }
      .metric-value.poor { color: #f87171; }

      .metric small {
        font-size: 11px;
        opacity: 0.8;
      }

      .perf-resources {
        margin-bottom: 24px;
      }

      .perf-resources h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .resource-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .resource-type {
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        text-align: center;
        font-size: 12px;
      }

      .resource-count {
        display: block;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 2px;
      }

      .perf-suggestions {
        margin-bottom: 24px;
      }

      .perf-suggestions h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .suggestion {
        background: rgba(255, 255, 255, 0.1);
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .suggestion.critical {
        border-left: 4px solid #f87171;
      }

      .suggestion.warning {
        border-left: 4px solid #fbbf24;
      }

      .suggestion-title {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .perf-actions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }

      .perf-actions button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        transition: background 0.2s;
      }

      .perf-actions button:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .perf-toggle-hint {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 999998;
        opacity: 0.7;
        transition: opacity 0.3s;
        pointer-events: none;
      }

      .perf-toggle-hint:hover {
        opacity: 1;
      }

      @media (max-width: 768px) {
        #performance-dashboard {
          width: calc(100vw - 40px);
          right: 20px;
          top: 20px;
        }
        
        .perf-metrics {
          grid-template-columns: 1fr;
        }
        
        .resource-summary {
          grid-template-columns: 1fr 1fr;
        }
        
        .perf-actions {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  /**
   * Setup keyboard shortcut to toggle dashboard
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Add key to sequence
      this.keySequence.push(e.code);
      
      // Keep only last 4 keys
      if (this.keySequence.length > 4) {
        this.keySequence.shift();
      }
      
      // Check if sequence matches "PERF"
      if (this.keySequence.length === 4 && 
          this.keySequence.join(',') === this.keyCombo.join(',')) {
        this.toggle();
        this.keySequence = [];
      }
    });

    // Add toggle hint
    const hint = document.createElement('div');
    hint.className = 'perf-toggle-hint';
    hint.textContent = 'Type "PERF" to toggle dashboard';
    document.body.appendChild(hint);

    // Hide hint after 5 seconds
    setTimeout(() => {
      if (hint.parentNode) {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Setup auto-refresh of dashboard data
   */
  setupAutoRefresh() {
    setInterval(() => {
      if (this.isVisible) {
        this.updateDashboard();
      }
    }, 5000); // Refresh every 5 seconds when visible
  }

  /**
   * Toggle dashboard visibility
   */
  toggle() {
    this.isVisible = !this.isVisible;
    
    if (this.isVisible) {
      this.dashboard.classList.add('visible');
      this.updateDashboard();
    } else {
      this.dashboard.classList.remove('visible');
    }
  }

  /**
   * Update dashboard with latest metrics
   */
  updateDashboard() {
    if (!this.monitor || !this.monitor.metrics) return;

    const report = this.monitor.generateReport();
    const metrics = this.monitor.metrics;

    // Update score
    const scoreElement = this.dashboard.querySelector('.score-value');
    const scoreCircle = this.dashboard.querySelector('.score-circle');
    scoreElement.textContent = report.score;
    
    // Update score circle color
    scoreCircle.className = 'score-circle';
    if (report.score >= 90) scoreCircle.classList.add('good');
    else if (report.score >= 50) scoreCircle.classList.add('needs-improvement');
    else scoreCircle.classList.add('poor');

    // Update Core Web Vitals
    this.updateMetric('lcp', metrics.lcp?.value, 'ms', 2500, 4000);
    this.updateMetric('fid', metrics.fid?.value, 'ms', 100, 300);
    this.updateMetric('cls', metrics.cls?.value || 0, '', 0.1, 0.25);
    this.updateMetric('fcp', metrics.fcp?.value, 'ms', 1800, 3000);

    // Update resource counts
    if (metrics.resources) {
      this.dashboard.querySelector('.css-count').textContent = metrics.resources.css?.length || 0;
      this.dashboard.querySelector('.js-count').textContent = metrics.resources.js?.length || 0;
      this.dashboard.querySelector('.font-count').textContent = metrics.resources.fonts?.length || 0;
      this.dashboard.querySelector('.image-count').textContent = metrics.resources.images?.length || 0;
    }

    // Update suggestions
    this.updateSuggestions(report.suggestions);
  }

  /**
   * Update individual metric display
   */
  updateMetric(name, value, unit, goodThreshold, poorThreshold) {
    const element = this.dashboard.querySelector(`.${name}-value`);
    if (!element) return;

    if (value === undefined || value === null) {
      element.textContent = '--';
      element.className = 'metric-value';
      return;
    }

    const displayValue = name === 'cls' ? 
      value.toFixed(3) : 
      Math.round(value) + unit;
    
    element.textContent = displayValue;
    
    // Update color based on thresholds
    element.className = 'metric-value';
    if (value <= goodThreshold) {
      element.classList.add('good');
    } else if (value <= poorThreshold) {
      element.classList.add('needs-improvement');
    } else {
      element.classList.add('poor');
    }
  }

  /**
   * Update suggestions list
   */
  updateSuggestions(suggestions) {
    const container = this.dashboard.querySelector('.suggestions-list');
    
    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = '<p style="opacity: 0.7; font-size: 12px;">🎉 No issues found!</p>';
      return;
    }

    container.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion ${suggestion.type}">
        <div class="suggestion-title">${suggestion.metric}: ${suggestion.issue}</div>
        <div>${suggestion.suggestion}</div>
      </div>
    `).join('');
  }

  /**
   * Refresh dashboard data
   */
  refresh() {
    if (this.monitor) {
      this.monitor.generateReport();
      this.updateDashboard();
    }
  }

  /**
   * Export performance report
   */
  exportReport() {
    if (!this.monitor) return;

    const report = this.monitor.generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  /**
   * Show performance history
   */
  showHistory() {
    const reports = this.monitor.getStoredReports();
    
    if (reports.length === 0) {
      alert('No performance history available yet.');
      return;
    }

    const historyWindow = window.open('', 'performance-history', 'width=800,height=600');
    historyWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Performance History</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
          .report { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .score { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 10px 0; }
          .metric { text-align: center; padding: 10px; background: #f5f5f5; border-radius: 3px; }
          .good { color: #16a34a; }
          .poor { color: #dc2626; }
          .needs-improvement { color: #ca8a04; }
        </style>
      </head>
      <body>
        <h1>📈 Performance History</h1>
        ${reports.map((report, index) => `
          <div class="report">
            <div class="score">Score: ${report.score}/100 - ${new Date(report.timestamp).toLocaleString()}</div>
            <div class="metrics">
              <div class="metric">
                <strong>LCP</strong><br>
                ${report.metrics.lcp?.value ? Math.round(report.metrics.lcp.value) + 'ms' : 'N/A'}
              </div>
              <div class="metric">
                <strong>FID</strong><br>
                ${report.metrics.fid?.value ? Math.round(report.metrics.fid.value) + 'ms' : 'N/A'}
              </div>
              <div class="metric">
                <strong>CLS</strong><br>
                ${report.metrics.cls?.value ? report.metrics.cls.value.toFixed(3) : 'N/A'}
              </div>
              <div class="metric">
                <strong>FCP</strong><br>
                ${report.metrics.fcp?.value ? Math.round(report.metrics.fcp.value) + 'ms' : 'N/A'}
              </div>
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `);
  }
}

// Initialize dashboard when performance monitor is available
if (window.performanceMonitor) {
  window.performanceDashboard = new PerformanceDashboard(window.performanceMonitor);
} else {
  // Wait for performance monitor to be available
  const checkForMonitor = setInterval(() => {
    if (window.performanceMonitor) {
      window.performanceDashboard = new PerformanceDashboard(window.performanceMonitor);
      clearInterval(checkForMonitor);
    }
  }, 100);
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceDashboard;
}