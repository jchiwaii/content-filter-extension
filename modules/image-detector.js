// Enhanced Image Detection Module
// Advanced heuristics-based image filtering without ML

const ImageDetector = {
  // Configuration
  config: {
    enabled: true,
    checkKeywords: true,
    checkDimensions: true,
    checkUrlPatterns: true,
    strictMode: false,
    placeholderEnabled: true
  },

  // NSFW keywords for metadata checking
  nsfwKeywords: [
    'porn', 'xxx', 'nude', 'naked', 'nsfw', 'adult', 'sex', 'sexy',
    'explicit', 'hentai', 'r34', 'rule34', 'erotic', 'lingerie',
    'bikini', 'topless', 'bottomless', 'boobs', 'tits', 'ass',
    'pussy', 'cock', 'dick', 'penis', 'vagina', 'nipple',
    'onlyfans', 'fansly', 'playboy', 'penthouse', 'brazzers',
    'pornhub', 'xvideos', 'xhamster', 'redtube', 'youporn',
    'camgirl', 'webcam', 'stripper', 'escort', 'hooker',
    'fetish', 'bdsm', 'bondage', 'dominatrix', 'submissive',
    'lewd', 'slutty', 'whore', 'thot', 'milf', 'dilf'
  ],

  // NSFW URL patterns
  nsfwUrlPatterns: [
    /\/nsfw\//i,
    /\/adult\//i,
    /\/xxx\//i,
    /\/porn/i,
    /\/nude/i,
    /\/naked/i,
    /\/explicit/i,
    /\/18\+/i,
    /\/mature/i,
    /\/erotic/i,
    /nsfw\./i,
    /porn\./i,
    /xxx\./i,
    /adult\./i,
    /_nsfw/i,
    /-nsfw/i,
    /\.nsfw\./i
  ],

  // Suspicious dimension ratios (common for adult content)
  suspiciousDimensions: {
    // Very wide images (banners on adult sites)
    minAspectRatio: 3.0,
    // Specific common sizes used by adult sites
    suspiciousSizes: [
      { width: 300, height: 250 },  // Common ad size
      { width: 728, height: 90 },   // Banner ad
      { width: 160, height: 600 },  // Skyscraper ad
      { width: 300, height: 600 },  // Half page ad
    ]
  },

  // Known adult CDN domains
  adultCdnDomains: [
    'phncdn.com', 'xvideos-cdn.com', 'xnxx-cdn.com',
    'pornhub.com', 'xhamster.com', 'redtube.com',
    'xvideos.com', 'xnxx.com', 'youporn.com',
    'pornimg.com', 'pornpics.com', 'nudevista.com',
    'thumbzilla.com', 'ypncdn.com', 'rdtcdn.com'
  ],

  // Initialize
  async init() {
    const result = await chrome.storage.sync.get(['imageDetectorConfig']);
    if (result.imageDetectorConfig) {
      this.config = { ...this.config, ...result.imageDetectorConfig };
    }
  },

  // Save configuration
  async saveConfig(config) {
    this.config = { ...this.config, ...config };
    await chrome.storage.sync.set({ imageDetectorConfig: this.config });
  },

  // Main classification function
  async classifyImage(imgElement) {
    if (!this.config.enabled || !imgElement) {
      return { safe: true, reason: 'Disabled or invalid element' };
    }

    const results = [];

    // 1. Check keywords in metadata
    if (this.config.checkKeywords) {
      const keywordResult = this.checkKeywords(imgElement);
      if (!keywordResult.safe) {
        results.push(keywordResult);
      }
    }

    // 2. Check URL patterns
    if (this.config.checkUrlPatterns) {
      const urlResult = this.checkUrl(imgElement);
      if (!urlResult.safe) {
        results.push(urlResult);
      }
    }

    // 3. Check dimensions (loaded images only)
    if (this.config.checkDimensions && imgElement.complete) {
      const dimResult = this.checkDimensions(imgElement);
      if (!dimResult.safe) {
        results.push(dimResult);
      }
    }

    // 4. Check parent context
    const contextResult = this.checkContext(imgElement);
    if (!contextResult.safe) {
      results.push(contextResult);
    }

    // 5. Check for adult CDN domains
    const cdnResult = this.checkCdnDomain(imgElement);
    if (!cdnResult.safe) {
      results.push(cdnResult);
    }

    // Determine final result
    if (results.length > 0) {
      const highestConfidence = Math.max(...results.map(r => r.confidence || 0.5));
      const reasons = results.map(r => r.reason).join(', ');

      return {
        safe: false,
        reason: reasons,
        confidence: highestConfidence,
        method: 'heuristic',
        details: results
      };
    }

    return {
      safe: true,
      reason: 'No issues detected',
      method: 'heuristic'
    };
  },

  // Check keywords in image metadata
  checkKeywords(imgElement) {
    const src = (imgElement.src || '').toLowerCase();
    const alt = (imgElement.alt || '').toLowerCase();
    const title = (imgElement.title || '').toLowerCase();
    const className = (imgElement.className || '').toLowerCase();
    const id = (imgElement.id || '').toLowerCase();

    // Also check data attributes
    const dataAttrs = Array.from(imgElement.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .map(attr => attr.value.toLowerCase())
      .join(' ');

    const combined = `${src} ${alt} ${title} ${className} ${id} ${dataAttrs}`;

    for (const keyword of this.nsfwKeywords) {
      if (combined.includes(keyword)) {
        return {
          safe: false,
          reason: `NSFW keyword: ${keyword}`,
          confidence: 0.8,
          keyword
        };
      }
    }

    return { safe: true };
  },

  // Check URL patterns
  checkUrl(imgElement) {
    const src = imgElement.src || '';
    const srcset = imgElement.srcset || '';
    const dataSrc = imgElement.dataset.src || '';

    const urls = [src, srcset, dataSrc].join(' ');

    for (const pattern of this.nsfwUrlPatterns) {
      if (pattern.test(urls)) {
        return {
          safe: false,
          reason: `NSFW URL pattern detected`,
          confidence: 0.85,
          pattern: pattern.toString()
        };
      }
    }

    return { safe: true };
  },

  // Check image dimensions
  checkDimensions(imgElement) {
    const width = imgElement.naturalWidth || imgElement.width;
    const height = imgElement.naturalHeight || imgElement.height;

    if (!width || !height) return { safe: true };

    // Check for suspicious ad-like dimensions
    for (const size of this.suspiciousDimensions.suspiciousSizes) {
      if (width === size.width && height === size.height) {
        // Only flag if also from suspicious domain
        if (this.checkCdnDomain(imgElement).safe === false) {
          return {
            safe: false,
            reason: `Suspicious ad dimensions: ${width}x${height}`,
            confidence: 0.4
          };
        }
      }
    }

    return { safe: true };
  },

  // Check parent context for NSFW indicators
  checkContext(imgElement) {
    // Check parent elements for NSFW classes/attributes
    let parent = imgElement.parentElement;
    let depth = 0;
    const maxDepth = 5;

    while (parent && depth < maxDepth) {
      const className = (parent.className || '').toLowerCase();
      const id = (parent.id || '').toLowerCase();
      const combined = `${className} ${id}`;

      for (const keyword of ['nsfw', 'adult', 'mature', 'explicit', 'xxx', 'porn']) {
        if (combined.includes(keyword)) {
          return {
            safe: false,
            reason: `NSFW context: parent has ${keyword}`,
            confidence: 0.7
          };
        }
      }

      // Check for blur/warning overlays (site's own NSFW handling)
      if (combined.includes('blur') || combined.includes('sensitive') || combined.includes('warning')) {
        return {
          safe: false,
          reason: 'Site-marked sensitive content',
          confidence: 0.9
        };
      }

      parent = parent.parentElement;
      depth++;
    }

    return { safe: true };
  },

  // Check if image is from adult CDN
  checkCdnDomain(imgElement) {
    const src = imgElement.src || '';

    try {
      const url = new URL(src);
      const hostname = url.hostname.toLowerCase();

      for (const domain of this.adultCdnDomains) {
        if (hostname.includes(domain)) {
          return {
            safe: false,
            reason: `Adult CDN: ${domain}`,
            confidence: 0.95
          };
        }
      }
    } catch {
      // Invalid URL
    }

    return { safe: true };
  },

  // Process and optionally block an image
  async processImage(imgElement) {
    const result = await this.classifyImage(imgElement);

    if (!result.safe) {
      this.blockImage(imgElement, result);
      return { blocked: true, result };
    }

    return { blocked: false, result };
  },

  // Block/blur an image
  blockImage(imgElement, result) {
    if (imgElement.dataset.blocked) return;
    imgElement.dataset.blocked = 'true';

    if (this.config.placeholderEnabled) {
      // Replace with placeholder
      this.showPlaceholder(imgElement, result);
    } else {
      // Just blur
      imgElement.style.filter = 'blur(30px)';
      imgElement.style.transition = 'filter 0.3s ease';
    }
  },

  // Show placeholder for blocked image
  showPlaceholder(imgElement, result) {
    const container = imgElement.parentElement;
    if (!container) return;

    // Store original src
    imgElement.dataset.originalSrc = imgElement.src;

    // Create placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'cf-image-placeholder';
    placeholder.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        min-height: 100px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Image Blocked</div>
        <div style="font-size: 11px; color: #a0a0a0; margin-bottom: 12px;">${result.reason}</div>
        <button class="cf-reveal-btn" style="
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        ">Show Image</button>
      </div>
    `;

    // Copy dimensions
    const width = imgElement.width || imgElement.naturalWidth || 200;
    const height = imgElement.height || imgElement.naturalHeight || 150;
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;

    // Add reveal functionality
    placeholder.querySelector('.cf-reveal-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      imgElement.style.display = '';
      imgElement.style.filter = 'none';
      placeholder.remove();
    });

    // Hide original and insert placeholder
    imgElement.style.display = 'none';
    container.insertBefore(placeholder, imgElement);
  },

  // Batch process images
  async processImages(imgElements) {
    const results = [];

    for (const img of imgElements) {
      const result = await this.processImage(img);
      results.push(result);
    }

    return results;
  },

  // Scan page for images
  scanPage() {
    const images = document.querySelectorAll('img:not([data-scanned])');

    images.forEach(img => {
      img.dataset.scanned = 'true';

      // Process immediately if loaded, otherwise wait
      if (img.complete) {
        this.processImage(img);
      } else {
        img.addEventListener('load', () => {
          this.processImage(img);
        });
      }
    });

    return images.length;
  },

  // Setup observer for dynamic images
  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNewImages = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG' && !node.dataset.scanned) {
              hasNewImages = true;
            } else if (node.querySelectorAll) {
              const imgs = node.querySelectorAll('img:not([data-scanned])');
              if (imgs.length > 0) hasNewImages = true;
            }
          }
        }
      }

      if (hasNewImages) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = setTimeout(() => {
          this.scanPage();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  // Get statistics
  getStats() {
    return {
      scanned: document.querySelectorAll('img[data-scanned]').length,
      blocked: document.querySelectorAll('img[data-blocked]').length
    };
  },

  // Check if ready
  isReady() {
    return true;
  },

  // Get status
  getStatus() {
    return {
      enabled: this.config.enabled,
      mode: 'heuristic',
      stats: this.getStats()
    };
  }
};

// Export
if (typeof window !== 'undefined') {
  window.ImageDetector = ImageDetector;
  // Also expose as mlDetector for backward compatibility
  window.mlDetector = ImageDetector;
}
if (typeof module !== 'undefined') {
  module.exports = ImageDetector;
}
