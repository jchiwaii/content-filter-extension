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
    console.log('[Content Filter] 📦 Storage result:', result);

    if (result.config) {
      config = { ...config, ...result.config };
    }

    console.log('[Content Filter] ✅ Config loaded:', config);
    console.log('[Content Filter] 📝 Custom words from storage:', config.customWords);

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

  // Listen for SPA route changes
  setupSPADetection();
}

// Detect SPA route changes (for React, Vue, Angular, etc.)
function setupSPADetection() {
  let lastUrl = location.href;

  console.log('[Content Filter] Setting up SPA route detection for:', lastUrl);

  // Detect history pushState/replaceState (used by SPAs)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    handleRouteChange();
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    handleRouteChange();
  };

  // Detect popstate (back/forward buttons)
  window.addEventListener('popstate', handleRouteChange);

  // Fallback: Check URL every second
  setInterval(() => {
    if (location.href !== lastUrl) {
      console.log('[Content Filter] URL changed (polling):', lastUrl, '→', location.href);
      lastUrl = location.href;
      handleRouteChange();
    }
  }, 1000);

  function handleRouteChange() {
    const newUrl = location.href;
    if (newUrl !== lastUrl) {
      console.log('[Content Filter] 🔄 Route changed:', lastUrl, '→', newUrl);
      lastUrl = newUrl;

      // Clear old filtered markers
      clearFilteredMarkers();

      // Wait a bit for new content to load, then re-filter
      setTimeout(() => {
        console.log('[Content Filter] Re-filtering after route change...');
        filterExistingContent();
      }, 500);
    }
  }
}

// Clear filtered markers from previous page
function clearFilteredMarkers() {
  console.log('[Content Filter] Clearing old filtered markers...');

  const filteredElements = document.querySelectorAll('[data-content-filtered="true"]');
  filteredElements.forEach(element => {
    delete element.dataset.contentFiltered;
    delete element.dataset.originalText;
  });

  console.log('[Content Filter] Cleared', filteredElements.length, 'filtered markers');
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
  const customWords = config.customWords || [];

  for (const attr of attributes) {
    const value = element.getAttribute(attr);
    if (value && containsProfanity(value, 'all', customWords)) {
      return true;
    }
  }

  // Check parent elements for context
  const parentText = element.parentElement ? element.parentElement.textContent : '';
  if (containsProfanity(parentText, 'all', customWords)) {
    return true;
  }

  return false;
}

// Check if text has already been filtered (to prevent re-filtering)
function hasBeenFiltered(text) {
  if (!text) return false;

  // Check for filtered content markers
  if (text.includes('[Filtered') || text.includes('[Content filtered]')) {
    return true;
  }

  // If text is mostly asterisks, it's probably already filtered
  const asteriskCount = (text.match(/\*/g) || []).length;
  const totalLength = text.length;

  // If more than 30% of text is asterisks, consider it filtered
  if (asteriskCount > 0 && (asteriskCount / totalLength) > 0.3) {
    return true;
  }

  // If text contains long sequences of asterisks (4+), it's filtered
  if (/\*{4,}/.test(text)) {
    return true;
  }

  return false;
}

// Pattern-based sentence rewriting rules
// These patterns match common profanity usage and provide natural rewrites
const rewritePatterns = [
  // Intensifier patterns - remove the profanity, keep the sentiment
  {
    pattern: /\b(fucking|fuckin|f\*\*\*ing)\s+(good|great|awesome|amazing|excellent|wonderful|fantastic|brilliant|perfect)\b/gi,
    replacement: 'very $2'
  },
  {
    pattern: /\b(fucking|fuckin|f\*\*\*ing)\s+(bad|terrible|awful|horrible|stupid|dumb|ridiculous)\b/gi,
    replacement: 'very $2'
  },
  {
    pattern: /\b(damn|damned)\s+(good|great|awesome|amazing|excellent)\b/gi,
    replacement: 'very $2'
  },
  {
    pattern: /\b(damn|damned)\s+(bad|stupid|hard|difficult)\b/gi,
    replacement: 'very $2'
  },

  // Expression patterns - common exclamations
  {
    pattern: /\bwhat\s+the\s+(fuck|hell|heck)\b/gi,
    replacement: 'what on earth'
  },
  {
    pattern: /\bhow\s+the\s+(fuck|hell)\b/gi,
    replacement: 'how on earth'
  },
  {
    pattern: /\bwho\s+the\s+(fuck|hell)\b/gi,
    replacement: 'who on earth'
  },
  {
    pattern: /\bwhere\s+the\s+(fuck|hell)\b/gi,
    replacement: 'where on earth'
  },
  {
    pattern: /\bwhy\s+the\s+(fuck|hell)\b/gi,
    replacement: 'why on earth'
  },

  // Standalone intensifiers - at start or with "so"
  {
    pattern: /\bso\s+(fucking|fuckin|damn|damned)\b/gi,
    replacement: 'so very'
  },
  {
    pattern: /\breally\s+(fucking|fuckin|damn|damned)\b/gi,
    replacement: 'really very'
  },

  // Common verb patterns
  {
    pattern: /\b(fuck|screw|damn)\s+(this|that|it|them|you)\b/gi,
    replacement: 'forget $2'
  },
  {
    pattern: /\b(fucking|fuckin)\s+(hate|love|like|want|need)\b/gi,
    replacement: 'really $2'
  },

  // "As fuck" patterns
  {
    pattern: /\bas\s+fuck\b/gi,
    replacement: 'extremely'
  },
  {
    pattern: /\baf\b(?=\s|$|[.,!?])/gi, // "af" as abbreviation
    replacement: 'extremely'
  },

  // Holy/Oh expressions
  {
    pattern: /\b(holy|oh)\s+(shit|fuck|crap|hell)\b/gi,
    replacement: '$1 wow'
  },

  // "Hell" in various contexts
  {
    pattern: /\bhell\s+yeah\b/gi,
    replacement: 'definitely yes'
  },
  {
    pattern: /\bhell\s+no\b/gi,
    replacement: 'definitely not'
  },
  {
    pattern: /\bthe\s+hell\b/gi,
    replacement: 'on earth'
  },

  // General cleanup - simple intensifier removal
  {
    pattern: /\b(fucking|fuckin|f\*\*\*ing|damn|damned)\s+/gi,
    replacement: ''
  }
];

// Split text into sentences for better context-aware filtering
function splitIntoSentences(text) {
  // Split on sentence boundaries but keep the punctuation
  // This regex splits on . ! ? followed by space/newline, or on newlines
  const sentences = [];
  const parts = text.split(/([.!?]+[\s\n]+|\n+)/);

  let currentSentence = '';
  for (let i = 0; i < parts.length; i++) {
    currentSentence += parts[i];
    // If this part is punctuation + whitespace, we have a complete sentence
    if (i % 2 === 1 || i === parts.length - 1) {
      if (currentSentence.trim()) {
        sentences.push(currentSentence);
      }
      currentSentence = '';
    }
  }

  // If there's remaining text without punctuation, add it
  if (currentSentence.trim()) {
    sentences.push(currentSentence);
  }

  return sentences.length > 0 ? sentences : [text];
}

// Rewrite a sentence using pattern-based rules
function rewriteSentence(sentence, filterLevel, customWords) {
  if (!sentence || !sentence.trim()) {
    return sentence;
  }

  // First check if the sentence contains profanity
  if (!window.containsProfanity(sentence, filterLevel, customWords)) {
    return sentence;
  }

  let rewritten = sentence;
  let wasModified = false;

  // Apply each rewrite pattern
  for (const rule of rewritePatterns) {
    const beforeRewrite = rewritten;
    rewritten = rewritten.replace(rule.pattern, rule.replacement);
    if (beforeRewrite !== rewritten) {
      wasModified = true;
    }
  }

  // After pattern-based rewriting, check if profanity still remains
  // If so, use the fallback: replace remaining profane words
  if (window.containsProfanity(rewritten, filterLevel, customWords)) {
    // For remaining words that didn't match patterns, remove them entirely
    const words = rewritten.split(/\b/);
    const cleanedWords = words.map(word => {
      // Check if this specific word is profane
      if (word.trim() && window.containsProfanity(word, filterLevel, customWords)) {
        return ''; // Remove the word entirely
      }
      return word;
    });

    rewritten = cleanedWords.join('');
    wasModified = true;
  }

  // Clean up extra spaces
  if (wasModified) {
    rewritten = rewritten.replace(/\s+/g, ' ').trim();

    // Ensure proper spacing after sentence start
    rewritten = rewritten.replace(/^([a-z])/, (match) => match.toUpperCase());
  }

  return rewritten;
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

  // Get custom words from config
  const customWords = config.customWords || [];
  console.log('[Content Filter] Custom words:', customWords);

  // Walk through all text nodes
  walkTextNodes(document.body, (node) => {
    nodesProcessed++;

    const nodeText = node.textContent;

    // Skip if already filtered (contains many asterisks)
    if (hasBeenFiltered(nodeText)) {
      return;
    }

    // Skip empty or whitespace-only nodes
    if (!nodeText || nodeText.trim().length === 0) {
      return;
    }

    // Skip if parent is a sensitive element (script, style, input, textarea, code)
    if (node.parentElement) {
      const tagName = node.parentElement.tagName;
      if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT'].includes(tagName)) {
        return;
      }

      // Skip if parent is contenteditable (user input areas)
      if (node.parentElement.isContentEditable) {
        return;
      }
    }

    if (window.containsProfanity(nodeText, filterLevel, customWords)) {
      const originalText = nodeText;

      // Use sentence-level rewriting instead of word censoring
      const sentences = splitIntoSentences(nodeText);
      const rewrittenSentences = sentences.map(sentence =>
        rewriteSentence(sentence, filterLevel, customWords)
      );
      const rewrittenText = rewrittenSentences.join('');

      if (originalText !== rewrittenText) {
        // Only log first 10 filtered items to avoid console spam
        if (wordsFiltered < 10) {
          console.log('[Content Filter] Rewriting:', originalText.substring(0, 100), '→', rewrittenText.substring(0, 100));
        }

        // Only modify if change is valid
        if (rewrittenText && rewrittenText.length > 0) {
          node.textContent = rewrittenText;

          // Mark the parent element so we know it was filtered
          if (node.parentElement) {
            node.parentElement.dataset.contentFiltered = 'true';
            // Store original text for restoration if needed
            if (!node.parentElement.dataset.originalText) {
              node.parentElement.dataset.originalText = originalText;
            }
          }

          statistics.wordsFiltered++;
          wordsFiltered++;
        }
      }
    }
  });

  console.log('[Content Filter] Text filtering complete:', nodesProcessed, 'nodes processed,', wordsFiltered, 'words filtered');
  updateStatistics();
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
    // Skip sensitive elements that shouldn't be filtered
    const skipTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT', 'SVG'];
    if (!skipTags.includes(element.tagName)) {
      // Skip contenteditable elements
      if (!element.isContentEditable) {
        for (let child of element.childNodes) {
          walkTextNodes(child, callback);
        }
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
            const customWords = config.customWords || [];
            walkTextNodes(node, (textNode) => {
              const nodeText = textNode.textContent;

              // Skip if already filtered or empty
              if (hasBeenFiltered(nodeText) || !nodeText || nodeText.trim().length === 0) {
                return;
              }

              if (window.containsProfanity && window.containsProfanity(nodeText, filterLevel, customWords)) {
                const originalText = nodeText;

                // Use sentence-level rewriting instead of word censoring
                const sentences = splitIntoSentences(nodeText);
                const rewrittenSentences = sentences.map(sentence =>
                  rewriteSentence(sentence, filterLevel, customWords)
                );
                const rewrittenText = rewrittenSentences.join('');

                if (originalText !== rewrittenText && rewrittenText && rewrittenText.length > 0) {
                  textNode.textContent = rewrittenText;

                  // Mark parent element
                  if (textNode.parentElement) {
                    textNode.parentElement.dataset.contentFiltered = 'true';
                  }

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
    console.log('[Content Filter] ⚙️ Config updated!');
    console.log('[Content Filter] Old config:', changes.config.oldValue);
    console.log('[Content Filter] New config:', changes.config.newValue);

    config = { ...config, ...changes.config.newValue };

    console.log('[Content Filter] Custom words updated:', config.customWords);
    console.log('[Content Filter] Re-filtering page with new config...');

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

  // Handle config updates from popup
  if (request.action === 'configUpdate') {
    console.log('[Content Filter] ⚙️ Received config update from popup');
    console.log('[Content Filter] New config:', request.config);

    config = { ...config, ...request.config };

    console.log('[Content Filter] Custom words:', config.customWords);
    console.log('[Content Filter] Re-filtering page...');

    // Refilter content with new config
    filterExistingContent();

    sendResponse({ success: true });
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
