// Content Filter - Main Content Script
// Filters images and text content in real-time

// Configuration
let config = {
  filterImages: true,
  filterText: true,
  blurLevel: 20,
  strictMode: true,
  customWords: [],
  whitelistedDomains: []
};

// Wait for both DOM and profanity database to be ready
function initialize() {
  console.log('[Content Filter] Initializing... readyState:', document.readyState);

  // Load configuration from storage
  chrome.storage.sync.get(['config'], function(result) {
    if (result.config) {
      config = { ...config, ...result.config };
    }
    console.log('[Content Filter] Config loaded:', config);

    // Wait for profanity database to load before initializing
    waitForProfanityDB().then(() => {
      // Ensure DOM is ready before filtering
      if (document.readyState === 'loading') {
        console.log('[Content Filter] DOM still loading, waiting...');
        document.addEventListener('DOMContentLoaded', () => {
          console.log('[Content Filter] DOM ready (via event), starting filter');
          initializeFilter();
        });
      } else {
        // DOM is already interactive or complete
        console.log('[Content Filter] DOM already ready, starting filter immediately');
        initializeFilter();
      }
    });
  });
}

// Start initialization
initialize();

// Wait for profanity database to be ready
function waitForProfanityDB() {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.containsProfanity && typeof window.containsProfanity === 'function') {
      console.log('[Content Filter] Profanity DB already loaded');
      resolve();
      return;
    }

    // Wait for it to load (check every 50ms, timeout after 5 seconds)
    let attempts = 0;
    const maxAttempts = 100; // 5 seconds

    const checkInterval = setInterval(() => {
      attempts++;

      if (window.containsProfanity && typeof window.containsProfanity === 'function') {
        clearInterval(checkInterval);
        console.log('[Content Filter] Profanity DB loaded after', attempts * 50, 'ms');
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error('[Content Filter] Profanity DB failed to load - timeout');
        resolve(); // Continue anyway
      }
    }, 50);
  });
}

// Statistics for blocked content
let statistics = {
  imagesBlocked: 0,
  wordsFiltered: 0,
  lastUpdate: Date.now()
};

// Performance optimization: Queue for batch image processing
let imageProcessingQueue = [];
let isProcessingQueue = false;
const BATCH_SIZE = 5;
const BATCH_DELAY = 100; // ms

// Initialize the filter
function initializeFilter() {
  if (isWhitelisted()) return;
  
  // Start filtering
  filterExistingContent();
  observeNewContent();
  
  // Listen for dynamic content changes
  setupMutationObserver();
}

// Check if current domain is whitelisted
function isWhitelisted() {
  const currentDomain = window.location.hostname;
  return config.whitelistedDomains.includes(currentDomain);
}

// Filter all existing content
function filterExistingContent() {
  if (config.filterImages) {
    filterImages();
  }
  if (config.filterText) {
    filterTextContent();
  }
}

// Filter images with batching for performance
function filterImages() {
  const images = document.querySelectorAll('img, video, picture, iframe');
  images.forEach(img => queueImageForProcessing(img));
}

// Queue image for batch processing
function queueImageForProcessing(element) {
  // Skip if already queued or processed
  if (element.dataset.queued || element.dataset.filtered || element.dataset.filtering === 'true') {
    return;
  }

  element.dataset.queued = 'true';
  imageProcessingQueue.push(element);

  // Start processing queue if not already processing
  if (!isProcessingQueue) {
    processImageQueue();
  }
}

// Process image queue in batches
async function processImageQueue() {
  if (isProcessingQueue || imageProcessingQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (imageProcessingQueue.length > 0) {
    // Process batch
    const batch = imageProcessingQueue.splice(0, BATCH_SIZE);

    // Process batch in parallel
    await Promise.all(batch.map(async (element) => {
      element.dataset.queued = 'false';
      await analyzeAndFilterImage(element);
    }));

    // Small delay between batches to avoid blocking UI
    if (imageProcessingQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  isProcessingQueue = false;
}

// Analyze and filter individual image using keyword detection
async function analyzeAndFilterImage(element) {
  // Skip if already filtered
  if (element.dataset.filtered) return;

  // Skip if element is not visible
  if (element.offsetWidth === 0 && element.offsetHeight === 0) return;

  // Mark as being processed
  element.dataset.filtering = 'true';

  try {
    // ML detector disabled due to CSP restrictions
    // Use keyword-based detection only
    const isNSFW = checkElementForNSFWKeywords(element);
    if (isNSFW) {
      blockElement(element, { reason: 'NSFW keywords detected', method: 'keyword' });
      statistics.imagesBlocked++;
      updateStatistics();
    }
  } catch (error) {
    console.warn('[Content Filter] Error analyzing image:', error);
  } finally {
    element.dataset.filtering = 'false';
  }
}

// Fallback keyword checking
function checkElementForNSFWKeywords(element) {
  const attributes = ['src', 'alt', 'title', 'data-src', 'srcset'];

  for (const attr of attributes) {
    const value = element.getAttribute(attr);
    if (value && containsProfanity(value, 'all')) {
      return true;
    }
  }

  // Check parent elements for context
  const parentText = element.parentElement ? element.parentElement.textContent : '';
  if (containsProfanity(parentText, 'all')) {
    return true;
  }

  return false;
}

// Update statistics to background script
function updateStatistics() {
  if (Date.now() - statistics.lastUpdate > 5000) { // Update every 5 seconds
    chrome.runtime.sendMessage({
      action: 'updateStatistics',
      data: {
        imagesBlocked: statistics.imagesBlocked,
        wordsFiltered: statistics.wordsFiltered
      }
    });
    statistics.lastUpdate = Date.now();
  }
}

// Block an element
function blockElement(element, detectionResult = {}) {
  element.dataset.filtered = 'true';
  element.dataset.filterReason = detectionResult.reason || 'Inappropriate content detected';
  element.dataset.filterConfidence = detectionResult.confidence || 0;

  if (config.strictMode) {
    // Complete removal
    element.style.display = 'none';
  } else {
    // Blur mode
    element.style.filter = `blur(${config.blurLevel}px)`;
    element.style.overflow = 'hidden';
    element.style.transition = 'filter 0.3s ease';

    // Add click to unblur
    element.style.cursor = 'pointer';
    element.title = `Content filtered: ${detectionResult.reason || 'Inappropriate content'}\nClick to view`;

    // Remove old listeners
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);

    newElement.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`This content was filtered:\n${detectionResult.reason || 'Inappropriate content'}\n\nAre you sure you want to view it?`)) {
        newElement.style.filter = 'none';
        newElement.dataset.filtered = 'unblurred';
      }
    });
  }

  // Add warning overlay for larger images
  if (element.offsetWidth > 200 && element.offsetHeight > 200) {
    addWarningOverlay(element, detectionResult);
  }

  // Report blocked content
  chrome.runtime.sendMessage({
    action: 'reportBlocked',
    data: {
      type: element.tagName.toLowerCase(),
      url: element.src || element.href || window.location.href,
      reason: detectionResult.reason,
      confidence: detectionResult.confidence,
      category: detectionResult.category
    }
  });
}

// Add warning overlay
function addWarningOverlay(element, detectionResult = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'content-filter-overlay';

  const confidence = detectionResult.confidence ?
    Math.round(detectionResult.confidence * 100) : '?';

  overlay.innerHTML = `
    <div class="filter-message">
      <span class="filter-icon">🚫</span>
      <span>Content Filtered</span>
      ${detectionResult.category ? `<span class="filter-category">${detectionResult.category}</span>` : ''}
      ${detectionResult.confidence ? `<span class="filter-confidence">${confidence}% confidence</span>` : ''}
    </div>
  `;

  // Position overlay
  const rect = element.getBoundingClientRect();
  overlay.style.position = 'absolute';
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.pointerEvents = 'none';

  document.body.appendChild(overlay);

  // Update position on scroll/resize
  const updatePosition = () => {
    const newRect = element.getBoundingClientRect();
    overlay.style.top = `${newRect.top + window.scrollY}px`;
    overlay.style.left = `${newRect.left + window.scrollX}px`;
  };

  window.addEventListener('scroll', updatePosition);
  window.addEventListener('resize', updatePosition);
}

// Filter text content using ML-enhanced profanity detection
function filterTextContent() {
  console.log('[Content Filter] Starting text filtering...');

  // Check if profanity functions are available
  if (!window.containsProfanity || !window.censorProfanity) {
    console.error('[Content Filter] Profanity functions not available!');
    return;
  }

  // Check if document.body exists
  if (!document.body) {
    console.error('[Content Filter] document.body is null! DOM not ready.');
    return;
  }

  // Use the profanity detection from profanity-data.js
  const filterLevel = config.strictMode ? 'all' : 'moderate';
  console.log('[Content Filter] Filter level:', filterLevel);
  console.log('[Content Filter] Config:', JSON.stringify(config));

  let nodesProcessed = 0;
  let wordsFiltered = 0;

  // Walk through all text nodes
  walkTextNodes(document.body, (node) => {
    nodesProcessed++;

    if (window.containsProfanity(node.textContent, filterLevel)) {
      const originalText = node.textContent;
      const censoredText = window.censorProfanity(node.textContent, filterLevel, '*');

      if (originalText !== censoredText) {
        console.log('[Content Filter] Filtering:', originalText, '→', censoredText);
        console.log('[Content Filter] Node parent:', node.parentElement?.tagName);
        console.log('[Content Filter] Node visible:', node.parentElement?.offsetParent !== null);

        // Store original text before modifying
        const beforeChange = node.textContent;
        node.textContent = censoredText;

        // Verify the change stuck
        const afterChange = node.textContent;
        console.log('[Content Filter] Change verified:', afterChange === censoredText, 'Before:', beforeChange, 'After:', afterChange);

        // Mark the parent element so we know it was filtered
        if (node.parentElement) {
          node.parentElement.dataset.contentFiltered = 'true';
        }

        statistics.wordsFiltered++;
        wordsFiltered++;
      }
    }
  });

  console.log('[Content Filter] Text filtering complete:', nodesProcessed, 'nodes processed,', wordsFiltered, 'words filtered');
  updateStatistics();

  // Verify changes persist after 1 second
  setTimeout(() => {
    console.log('[Content Filter] Verifying changes persisted after 1 second...');
    const filteredElements = document.querySelectorAll('[data-content-filtered="true"]');
    let changesReverted = 0;

    filteredElements.forEach(element => {
      walkTextNodes(element, (node) => {
        if (window.containsProfanity(node.textContent, filterLevel)) {
          console.warn('[Content Filter] ⚠️ Change was reverted! Element:', element.tagName, 'Text:', node.textContent);
          changesReverted++;

          // Re-apply filter
          const censoredText = window.censorProfanity(node.textContent, filterLevel, '*');
          node.textContent = censoredText;
        }
      });
    });

    if (changesReverted > 0) {
      console.warn('[Content Filter] ⚠️', changesReverted, 'changes were reverted by page JavaScript. Re-applied filters.');
    } else {
      console.log('[Content Filter] ✅ All changes persisted successfully!');
    }
  }, 1000);
}

// Walk through text nodes
function walkTextNodes(element, callback) {
  // Safety check for null/undefined elements
  if (!element || !element.nodeType) {
    return;
  }

  if (element.nodeType === 3) { // Text node
    callback(element);
  } else if (element.nodeType === 1) { // Element node
    // Skip script and style elements
    if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
      for (let child of element.childNodes) {
        walkTextNodes(child, callback);
      }
    }
  }
}

// Setup mutation observer for dynamic content
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Handle added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (config.filterImages) {
            const images = node.querySelectorAll ?
              node.querySelectorAll('img, video, picture, iframe') : [];
            images.forEach(img => queueImageForProcessing(img));

            if (node.tagName && ['IMG', 'VIDEO', 'PICTURE', 'IFRAME'].includes(node.tagName)) {
              queueImageForProcessing(node);
            }
          }
          
          if (config.filterText) {
            const filterLevel = config.strictMode ? 'all' : 'moderate';
            walkTextNodes(node, (textNode) => {
              if (window.containsProfanity && window.containsProfanity(textNode.textContent, filterLevel)) {
                const originalText = textNode.textContent;
                textNode.textContent = window.censorProfanity(textNode.textContent, filterLevel, '*');
                if (originalText !== textNode.textContent) {
                  statistics.wordsFiltered++;
                }
              }
            });
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for configuration updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.config) {
    config = { ...config, ...changes.config.newValue };
    // Refilter content with new config
    filterExistingContent();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMLStatus') {
    sendResponse({
      mlDetectorReady: false,
      mlDetectorLoading: false,
      mlDetectorDisabled: true,
      mlDetectorReason: 'CSP restrictions in Manifest V3',
      profanityReady: typeof window.containsProfanity === 'function'
    });
    return true;
  }
});

// Observe for new content with Intersection Observer (lazy loading optimization)
function observeNewContent() {
  // Observe for lazy-loaded images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && config.filterImages) {
          queueImageForProcessing(entry.target);
        }
      });
    }, {
      // Only trigger when image is 200px from viewport
      rootMargin: '200px'
    });

    document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Log initialization complete
setTimeout(() => {
  console.log('═══════════════════════════════════════════');
  console.log('✅ Content Filter: Active and filtering content');
  console.log('⚠️  ML Detector Status: Disabled (CSP restrictions - use text filtering only)');
  console.log('✅ Profanity Detection:', window.containsProfanity ? 'Loaded and Ready' : '❌ NOT LOADED');
  console.log('📊 Config:', JSON.stringify(config, null, 2));
  console.log('═══════════════════════════════════════════');
}, 1000);
