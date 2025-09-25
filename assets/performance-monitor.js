/**
 * Performance Monitoring System for Shopify Theme
 * Tracks Core Web Vitals, page load times, and provides optimization suggestions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.startTime = performance.now();
    this.isDevMode = false; // Set to true for development debugging
    
    // Initialize monitoring
    this.init();
  }

  init() {
    if (!this.isSupported()) {
      console.warn('Performance API not supported in this browser');
      return;
    }

    this.trackPageLoad();
    this.trackCoreWebVitals();
    this.trackResourceTiming();
    this.trackMemoryUsage();
    this.trackNetworkConditions();
    this.setupVisibilityChangeTracking();
    
    // Log initial metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.generateReport();
      }, 1000);
    });
  }

  isSupported() {
    return 'performance' in window && 'PerformanceObserver' in window;
  }

  /**
   * Track Core Web Vitals (LCP, FID, CLS)
   */
  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry) => {
      this.metrics.lcp = {
        value: entry.startTime,
        element: entry.element,
        url: entry.url,
        timestamp: Date.now()
      };
      this.logMetric('LCP', entry.startTime);
    });

    // First Input Delay (FID) 
    this.observeMetric('first-input', (entry) => {
      this.metrics.fid = {
        value: entry.processingStart - entry.startTime,
        inputType: entry.name,
        timestamp: Date.now()
      };
      this.logMetric('FID', entry.processingStart - entry.startTime);
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.metrics.cls = (this.metrics.cls?.value || 0) + entry.value;
        this.logMetric('CLS', entry.value);
      }
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        this.metrics.fcp = {
          value: entry.startTime,
          timestamp: Date.now()
        };
        this.logMetric('FCP', entry.startTime);
      }
    });
  }

  /**
   * Track page load performance metrics
   */
  trackPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      this.metrics.pageLoad = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.connectEnd - navigation.secureConnectionStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParsing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        resources: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
        total: navigation.loadEventEnd - navigation.navigationStart
      };
    }

    // Track DOM ready and window load times
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domReady = performance.now() - this.startTime;
    });

    window.addEventListener('load', () => {
      this.metrics.windowLoad = performance.now() - this.startTime;
    });
  }

  /**
   * Track resource loading performance
   */
  trackResourceTiming() {
    this.observeMetric('resource', (entry) => {
      const resourceType = this.getResourceType(entry.name);
      
      if (!this.metrics.resources) {
        this.metrics.resources = {
          css: [],
          js: [],
          fonts: [],
          images: [],
          other: []
        };
      }

      const resourceMetric = {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
        type: resourceType,
        timestamp: Date.now()
      };

      this.metrics.resources[resourceType].push(resourceMetric);
      
      // Track slow loading resources
      if (entry.duration > 1000) {
        this.logSlowResource(entry.name, entry.duration);
      }
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if ('memory' in performance) {
      this.metrics.memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Track network conditions
   */
  trackNetworkConditions() {
    if ('connection' in navigator) {
      this.metrics.network = {
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Track visibility changes for performance context
   */
  setupVisibilityChangeTracking() {
    document.addEventListener('visibilitychange', () => {
      if (!this.metrics.visibility) {
        this.metrics.visibility = [];
      }
      
      this.metrics.visibility.push({
        state: document.visibilityState,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Generic metric observer
   */
  observeMetric(type, callback) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn(`Could not observe ${type}:`, e);
    }
  }

  /**
   * Determine resource type from URL
   */
  getResourceType(url) {
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0];
    
    if (['css'].includes(extension)) return 'css';
    if (['js'].includes(extension)) return 'js';
    if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(extension)) return 'fonts';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'images';
    
    return 'other';
  }

  /**
   * Log performance metrics (only in dev mode)
   */
  logMetric(name, value) {
    if (this.isDevMode) {
      console.log(`🚀 ${name}:`, Math.round(value), 'ms');
    }
  }

  /**
   * Log slow loading resources
   */
  logSlowResource(name, duration) {
    if (this.isDevMode) {
      console.warn(`⚠️ Slow resource: ${name} took ${Math.round(duration)}ms`);
    }
  }

  /**
   * Get performance score based on Core Web Vitals
   */
  getPerformanceScore() {
    let score = 100;
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 }
    };

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = this.metrics[metric]?.value || 0;
      if (value > threshold.poor) {
        score -= 25;
      } else if (value > threshold.good) {
        score -= 10;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Generate performance suggestions
   */
  generateSuggestions() {
    const suggestions = [];
    
    // LCP suggestions
    if (this.metrics.lcp?.value > 4000) {
      suggestions.push({
        type: 'critical',
        metric: 'LCP',
        issue: 'Largest Contentful Paint is too slow',
        suggestion: 'Optimize images, reduce server response time, eliminate render-blocking resources'
      });
    }

    // FID suggestions  
    if (this.metrics.fid?.value > 300) {
      suggestions.push({
        type: 'critical',
        metric: 'FID',
        issue: 'First Input Delay is too high',
        suggestion: 'Break up long-running JavaScript tasks, use web workers, optimize third-party scripts'
      });
    }

    // CLS suggestions
    if (this.metrics.cls?.value > 0.25) {
      suggestions.push({
        type: 'critical',
        metric: 'CLS',
        issue: 'Cumulative Layout Shift is too high',
        suggestion: 'Add dimensions to images and videos, avoid inserting content above existing content'
      });
    }

    // Resource suggestions
    if (this.metrics.resources) {
      const slowResources = Object.values(this.metrics.resources)
        .flat()
        .filter(r => r.duration > 1000);
        
      if (slowResources.length > 0) {
        suggestions.push({
          type: 'warning',
          metric: 'Resources',
          issue: `${slowResources.length} slow loading resources detected`,
          suggestion: 'Consider optimizing, compressing, or lazy loading these resources'
        });
      }
    }

    // Memory suggestions
    if (this.metrics.memory && this.metrics.memory.used > 50000000) { // 50MB
      suggestions.push({
        type: 'warning',
        metric: 'Memory',
        issue: 'High JavaScript memory usage detected',
        suggestion: 'Review for memory leaks, optimize data structures, implement pagination'
      });
    }

    return suggestions;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const score = this.getPerformanceScore();
    const suggestions = this.generateSuggestions();
    
    const report = {
      score,
      timestamp: Date.now(),
      url: window.location.href,
      metrics: this.metrics,
      suggestions,
      thresholds: {
        lcp: { good: '<2.5s', poor: '>4.0s' },
        fid: { good: '<100ms', poor: '>300ms' },
        cls: { good: '<0.1', poor: '>0.25' },
        fcp: { good: '<1.8s', poor: '>3.0s' }
      }
    };

    // Log report in dev mode
    if (this.isDevMode) {
      console.group('🎯 Performance Report');
      console.log('Score:', score + '/100');
      console.log('Metrics:', this.metrics);
      console.log('Suggestions:', suggestions);
      console.groupEnd();
    }

    // Send to analytics if available
    this.sendToAnalytics(report);
    
    // Store locally for dashboard
    this.storeReport(report);

    return report;
  }

  /**
   * Send performance data to analytics
   */
  sendToAnalytics(report) {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        custom_parameter: {
          lcp: this.metrics.lcp?.value,
          fid: this.metrics.fid?.value,
          cls: this.metrics.cls?.value,
          score: report.score
        }
      });
    }

    // Send to other analytics platforms as needed
    // Example: Shopify analytics
    if (typeof analytics !== 'undefined' && analytics.track) {
      analytics.track('Performance Metrics', {
        score: report.score,
        lcp: this.metrics.lcp?.value,
        fid: this.metrics.fid?.value,
        cls: this.metrics.cls?.value,
        page: window.location.pathname
      });
    }
  }

  /**
   * Store report in localStorage for dashboard
   */
  storeReport(report) {
    try {
      const key = 'performance_reports';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Keep only last 10 reports
      stored.push(report);
      if (stored.length > 10) {
        stored.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (e) {
      console.warn('Could not store performance report:', e);
    }
  }

  /**
   * Get stored performance reports
   */
  getStoredReports() {
    try {
      return JSON.parse(localStorage.getItem('performance_reports') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Enable dev mode for debugging
   */
  enableDevMode() {
    this.isDevMode = true;
    console.log('🚀 Performance Monitor: Dev mode enabled');
  }

  /**
   * Clean up observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Auto-initialize performance monitoring
window.PerformanceMonitor = PerformanceMonitor;

// Initialize if not in development mode
if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
  window.performanceMonitor = new PerformanceMonitor();
} else {
  // Enable dev mode for local development
  window.performanceMonitor = new PerformanceMonitor();
  window.performanceMonitor.enableDevMode();
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}