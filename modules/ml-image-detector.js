// ML-Based Image Detector Module
// Uses NSFWJS via offscreen document for actual image classification

const MLImageDetector = {
  // Configuration
  config: {
    enabled: true,
    useML: true,
    threshold: 0.6,
    strictThreshold: 0.4,
    classifyOnHover: false,
    batchSize: 5,
    cacheResults: true
  },

  // Cache for classification results
  cache: new Map(),
  maxCacheSize: 500,

  // Queue for batch processing
  queue: [],
  isProcessing: false,

  // Stats
  stats: {
    imagesScanned: 0,
    imagesBlocked: 0,
    mlClassifications: 0
  },

  // Initialize
  async init() {
    const result = await chrome.storage.sync.get(['mlImageConfig']);
    if (result.mlImageConfig) {
      this.config = { ...this.config, ...result.mlImageConfig };
    }

    // Preload ML model
    if (this.config.useML) {
      this.ensureOffscreenDocument().then(() => {
        this.preloadModel();
      });
    }
  },

  // Save configuration
  async saveConfig(config) {
    this.config = { ...this.config, ...config };
    await chrome.storage.sync.set({ mlImageConfig: this.config });
  },

  // Request background to ensure offscreen document exists
  async ensureOffscreenDocument() {
    try {
      await chrome.runtime.sendMessage({
        action: 'ensureOffscreenDocument'
      });
    } catch (error) {
      console.error('[ML Detector] Failed to ensure offscreen document:', error);
    }
  },

  // Preload model
  async preloadModel() {
    try {
      await this.ensureOffscreenDocument();
      const response = await chrome.runtime.sendMessage({
        action: 'mlClassifyImage',
        mlAction: 'preloadModel'
      });
      console.log('[ML Detector] Model preload:', response);
    } catch (error) {
      console.error('[ML Detector] Preload error:', error);
    }
  },

  // Classify an image using ML
  async classifyWithML(imageUrl) {
    // Check cache first
    if (this.config.cacheResults && this.cache.has(imageUrl)) {
      return this.cache.get(imageUrl);
    }

    try {
      await this.ensureOffscreenDocument();

      const result = await chrome.runtime.sendMessage({
        action: 'mlClassifyImage',
        mlAction: 'classifyImage',
        imageUrl: imageUrl
      });

      this.stats.mlClassifications++;

      // Cache result
      if (this.config.cacheResults) {
        this.addToCache(imageUrl, result);
      }

      return result;
    } catch (error) {
      console.error('[ML Detector] Classification error:', error);
      return { safe: true, error: error.message };
    }
  },

  // Classify base64 image
  async classifyBase64(base64Data) {
    try {
      await this.ensureOffscreenDocument();

      const result = await chrome.runtime.sendMessage({
        action: 'mlClassifyImage',
        mlAction: 'classifyBase64',
        base64Data: base64Data
      });

      this.stats.mlClassifications++;
      return result;
    } catch (error) {
      console.error('[ML Detector] Base64 classification error:', error);
      return { safe: true, error: error.message };
    }
  },

  // Add to cache with size management
  addToCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  },

  // Combined classification (heuristics + ML)
  async classifyImage(imgElement) {
    if (!this.config.enabled) {
      return { safe: true, method: 'disabled' };
    }

    this.stats.imagesScanned++;

    // First, run quick heuristics
    const heuristicResult = this.runHeuristics(imgElement);
    if (!heuristicResult.safe) {
      this.stats.imagesBlocked++;
      return { ...heuristicResult, method: 'heuristic' };
    }

    // If ML is enabled, run classification
    if (this.config.useML) {
      const src = imgElement.src || imgElement.dataset.src;
      if (src && src.startsWith('http')) {
        try {
          const mlResult = await this.classifyWithML(src);
          if (!mlResult.safe) {
            this.stats.imagesBlocked++;
            return { ...mlResult, method: 'ml' };
          }
        } catch (error) {
          // Fall back to heuristics only
          console.warn('[ML Detector] ML failed, using heuristics only');
        }
      }
    }

    return { safe: true, method: this.config.useML ? 'ml+heuristic' : 'heuristic' };
  },

  // Quick heuristic checks (no ML)
  runHeuristics(imgElement) {
    const src = (imgElement.src || '').toLowerCase();
    const alt = (imgElement.alt || '').toLowerCase();
    const title = (imgElement.title || '').toLowerCase();
    const className = (imgElement.className || '').toLowerCase();
    const combined = `${src} ${alt} ${title} ${className}`;

    // NSFW keywords
    const nsfwKeywords = [
      'porn', 'xxx', 'nude', 'naked', 'nsfw', 'adult', 'sex',
      'explicit', 'hentai', 'r34', 'erotic', 'onlyfans', 'fansly',
      'pornhub', 'xvideos', 'xhamster', 'brazzers'
    ];

    for (const keyword of nsfwKeywords) {
      if (combined.includes(keyword)) {
        return {
          safe: false,
          reason: `NSFW keyword: ${keyword}`,
          confidence: 0.9
        };
      }
    }

    // Check URL patterns
    const nsfwPatterns = [
      /\/nsfw\//i, /\/adult\//i, /\/xxx\//i, /\/porn/i,
      /\/nude/i, /\/naked/i, /nsfw\./i, /porn\./i
    ];

    for (const pattern of nsfwPatterns) {
      if (pattern.test(src)) {
        return {
          safe: false,
          reason: 'NSFW URL pattern',
          confidence: 0.85
        };
      }
    }

    // Check parent context
    let parent = imgElement.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      const cls = (parent.className || '').toLowerCase();
      const id = (parent.id || '').toLowerCase();
      if (cls.includes('nsfw') || id.includes('nsfw') ||
          cls.includes('adult') || cls.includes('explicit')) {
        return {
          safe: false,
          reason: 'NSFW parent context',
          confidence: 0.8
        };
      }
      parent = parent.parentElement;
      depth++;
    }

    return { safe: true };
  },

  // Queue image for batch processing
  queueImage(imgElement, callback) {
    this.queue.push({ element: imgElement, callback });

    if (!this.isProcessing) {
      this.processBatch();
    }
  },

  // Process queued images in batches
  async processBatch() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.config.batchSize);

    for (const item of batch) {
      const result = await this.classifyImage(item.element);
      if (item.callback) {
        item.callback(result);
      }
    }

    // Continue processing if more in queue
    if (this.queue.length > 0) {
      setTimeout(() => this.processBatch(), 100);
    } else {
      this.isProcessing = false;
    }
  },

  // Process image and block if unsafe
  async processAndBlock(imgElement) {
    const result = await this.classifyImage(imgElement);

    if (!result.safe) {
      this.blockImage(imgElement, result);
    }

    return result;
  },

  // Block/blur an image
  blockImage(imgElement, result) {
    if (imgElement.dataset.mlBlocked) return;
    imgElement.dataset.mlBlocked = 'true';

    // Store original src
    imgElement.dataset.originalSrc = imgElement.src;

    // Apply blur
    imgElement.style.filter = 'blur(30px)';
    imgElement.style.transition = 'filter 0.3s ease';

    // Create overlay
    const container = imgElement.parentElement;
    if (!container || container.querySelector('.ml-block-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'ml-block-overlay';

    const confidence = result.confidence ? Math.round(result.confidence * 100) : 'N/A';
    const category = result.highestUnsafe || result.reason || 'Inappropriate';

    overlay.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px 28px;
        border-radius: 12px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 1000;
        min-width: 180px;
      ">
        <div style="font-size: 36px; margin-bottom: 8px;">🛡️</div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Content Blocked</div>
        <div style="font-size: 11px; color: #999; margin-bottom: 4px;">${category}</div>
        <div style="font-size: 10px; color: #666; margin-bottom: 12px;">Confidence: ${confidence}%</div>
        <button class="ml-reveal-btn" style="
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        ">Show Image</button>
      </div>
    `;

    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
    `;

    // Reveal button handler
    overlay.querySelector('.ml-reveal-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      imgElement.style.filter = 'none';
      overlay.remove();
      delete imgElement.dataset.mlBlocked;
    });

    container.style.position = 'relative';
    container.appendChild(overlay);
  },

  // Scan page for images
  async scanPage() {
    const images = document.querySelectorAll('img:not([data-ml-scanned])');
    console.log(`[ML Detector] Scanning ${images.length} images`);

    for (const img of images) {
      img.dataset.mlScanned = 'true';

      // Skip tiny images (likely icons)
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (width < 100 || height < 100) continue;

      // Process loaded images immediately, queue others
      if (img.complete && img.src) {
        this.processAndBlock(img);
      } else {
        img.addEventListener('load', () => {
          this.processAndBlock(img);
        }, { once: true });
      }
    }
  },

  // Setup observer for dynamic images
  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNewImages = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG' && !node.dataset.mlScanned) {
              hasNewImages = true;
            } else if (node.querySelectorAll) {
              const imgs = node.querySelectorAll('img:not([data-ml-scanned])');
              if (imgs.length > 0) hasNewImages = true;
            }
          }
        }
      }

      if (hasNewImages) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = setTimeout(() => this.scanPage(), 200);
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  },

  // Get status
  async getStatus() {
    try {
      await this.ensureOffscreenDocument();
      const status = await chrome.runtime.sendMessage({
        action: 'mlClassifyImage',
        mlAction: 'getStatus'
      });
      return {
        ...status,
        config: this.config,
        stats: this.stats,
        cacheSize: this.cache.size
      };
    } catch (error) {
      return {
        modelLoaded: false,
        isLoading: false,
        error: error.message,
        config: this.config,
        stats: this.stats
      };
    }
  },

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
};

// Export for content scripts
if (typeof window !== 'undefined') {
  window.MLImageDetector = MLImageDetector;
}

// Export for background script
if (typeof module !== 'undefined') {
  module.exports = MLImageDetector;
}
