// Enhanced Content Filter - Main Content Script
// Pattern-based sentence rewriting with multi-language support

// Configuration
let config = {
  enabled: true,
  filterText: true,
  filterImages: true,
  strictMode: true,
  filterLevel: 'moderate',
  customWords: [],
  whitelistedDomains: []
};

let isPaused = false;

// Statistics for this session
let statistics = {
  wordsFiltered: 0,
  imagesBlocked: 0,
  lastUpdate: Date.now()
};

// Initialize
function initialize() {
  chrome.storage.sync.get(['config'], function(result) {
    if (result.config) {
      config = { ...config, ...result.config };
    }

    // Check pause status
    chrome.storage.local.get(['isPaused', 'pauseUntil'], (pauseResult) => {
      isPaused = pauseResult.isPaused && pauseResult.pauseUntil > Date.now();

      if (isPaused || !config.enabled) {
        console.log('[Safe Browse] Protection is paused or disabled');
        return;
      }

      waitForProfanityDB().then(() => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initializeFilter);
        } else {
          initializeFilter();
        }
      });
    });
  });
}

initialize();

// Wait for profanity database to be ready
function waitForProfanityDB() {
  return new Promise((resolve) => {
    if (window.containsProfanity && typeof window.containsProfanity === 'function') {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 100;

    const checkInterval = setInterval(() => {
      attempts++;
      if (window.containsProfanity && typeof window.containsProfanity === 'function') {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error('[Safe Browse] Profanity DB failed to load');
        resolve();
      }
    }, 50);
  });
}

// Initialize the filter
function initializeFilter() {
  if (isWhitelisted()) {
    console.log('[Safe Browse] Site is whitelisted');
    return;
  }

  console.log('[Safe Browse] Initializing content filter');

  // Filter existing content
  filterExistingContent();

  // Setup mutation observer for dynamic content
  setupMutationObserver();

  // Setup SPA detection
  setupSPADetection();

  // Initialize image detectors
  if (config.filterImages) {
    // First initialize heuristic detector
    if (window.ImageDetector) {
      window.ImageDetector.init();
      window.ImageDetector.setupObserver();
      window.ImageDetector.scanPage();
    }

    // Then initialize ML detector (uses TensorFlow.js via offscreen document)
    if (window.MLImageDetector) {
      window.MLImageDetector.init().then(() => {
        console.log('[Safe Browse] ML Image Detector initialized');
        window.MLImageDetector.setupObserver();
        window.MLImageDetector.scanPage();
      }).catch(err => {
        console.warn('[Safe Browse] ML Image Detector failed to initialize:', err);
      });
    }
  }
}

// Check if current domain is whitelisted
function isWhitelisted() {
  const currentDomain = window.location.hostname;
  return config.whitelistedDomains.includes(currentDomain);
}

// Detect SPA route changes
function setupSPADetection() {
  let lastUrl = location.href;

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

  window.addEventListener('popstate', handleRouteChange);

  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      handleRouteChange();
    }
  }, 1000);

  function handleRouteChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      clearFilteredMarkers();
      setTimeout(filterExistingContent, 500);
    }
  }
}

// Clear filtered markers from previous page
function clearFilteredMarkers() {
  const filtered = document.querySelectorAll('[data-content-filtered="true"]');
  filtered.forEach(el => {
    delete el.dataset.contentFiltered;
    delete el.dataset.originalText;
  });
}

// Filter all existing content
function filterExistingContent() {
  if (config.filterText) {
    filterTextContent();
  }

  if (config.filterImages) {
    if (window.ImageDetector) {
      window.ImageDetector.scanPage();
    }
    if (window.MLImageDetector) {
      window.MLImageDetector.scanPage();
    }
  }
}

// Check if text has already been filtered
function hasBeenFiltered(text) {
  if (!text) return false;

  if (text.includes('[Filtered') || text.includes('[Content filtered]')) {
    return true;
  }

  const asteriskCount = (text.match(/\*/g) || []).length;
  if (asteriskCount > 0 && (asteriskCount / text.length) > 0.3) {
    return true;
  }

  if (/\*{4,}/.test(text)) {
    return true;
  }

  return false;
}

// Pattern-based sentence rewriting rules
const rewritePatterns = [
  // Intensifier patterns
  { pattern: /\b(fucking|fuckin|f\*\*\*ing)\s+(good|great|awesome|amazing|excellent|wonderful|fantastic|brilliant|perfect)\b/gi, replacement: 'very $2' },
  { pattern: /\b(fucking|fuckin|f\*\*\*ing)\s+(bad|terrible|awful|horrible|stupid|dumb|ridiculous)\b/gi, replacement: 'very $2' },
  { pattern: /\b(damn|damned)\s+(good|great|awesome|amazing|excellent)\b/gi, replacement: 'very $2' },
  { pattern: /\b(damn|damned)\s+(bad|stupid|hard|difficult)\b/gi, replacement: 'very $2' },

  // Expression patterns
  { pattern: /\bwhat\s+the\s+(fuck|hell|heck)\b/gi, replacement: 'what on earth' },
  { pattern: /\bhow\s+the\s+(fuck|hell)\b/gi, replacement: 'how on earth' },
  { pattern: /\bwho\s+the\s+(fuck|hell)\b/gi, replacement: 'who on earth' },
  { pattern: /\bwhere\s+the\s+(fuck|hell)\b/gi, replacement: 'where on earth' },
  { pattern: /\bwhy\s+the\s+(fuck|hell)\b/gi, replacement: 'why on earth' },

  // Standalone intensifiers
  { pattern: /\bso\s+(fucking|fuckin|damn|damned)\b/gi, replacement: 'so very' },
  { pattern: /\breally\s+(fucking|fuckin|damn|damned)\b/gi, replacement: 'really very' },

  // Common verb patterns
  { pattern: /\b(fuck|screw|damn)\s+(this|that|it|them|you)\b/gi, replacement: 'forget $2' },
  { pattern: /\b(fucking|fuckin)\s+(hate|love|like|want|need)\b/gi, replacement: 'really $2' },

  // "As fuck" patterns
  { pattern: /\bas\s+fuck\b/gi, replacement: 'extremely' },
  { pattern: /\baf\b(?=\s|$|[.,!?])/gi, replacement: 'extremely' },

  // Holy/Oh expressions
  { pattern: /\b(holy|oh)\s+(shit|fuck|crap|hell)\b/gi, replacement: '$1 wow' },

  // Hell patterns
  { pattern: /\bhell\s+yeah\b/gi, replacement: 'definitely yes' },
  { pattern: /\bhell\s+no\b/gi, replacement: 'definitely not' },
  { pattern: /\bthe\s+hell\b/gi, replacement: 'on earth' },

  // General cleanup
  { pattern: /\b(fucking|fuckin|f\*\*\*ing|damn|damned)\s+/gi, replacement: '' }
];

// Split text into sentences
function splitIntoSentences(text) {
  const sentences = [];
  const parts = text.split(/([.!?]+[\s\n]+|\n+)/);

  let currentSentence = '';
  for (let i = 0; i < parts.length; i++) {
    currentSentence += parts[i];
    if (i % 2 === 1 || i === parts.length - 1) {
      if (currentSentence.trim()) {
        sentences.push(currentSentence);
      }
      currentSentence = '';
    }
  }

  if (currentSentence.trim()) {
    sentences.push(currentSentence);
  }

  return sentences.length > 0 ? sentences : [text];
}

// Get filter level
function getFilterLevel() {
  if (config.strictMode) return 'all';
  return config.filterLevel || 'moderate';
}

// Check for profanity using language detector if available
function checkProfanity(text) {
  if (window.LangDetector && typeof window.LangDetector.containsProfanity === 'function') {
    return window.LangDetector.containsProfanity(text, getFilterLevel(), config.customWords);
  }

  if (window.containsProfanity) {
    return window.containsProfanity(text, getFilterLevel(), config.customWords);
  }

  return false;
}

// Rewrite a sentence using pattern-based rules
function rewriteSentence(sentence) {
  if (!sentence || !sentence.trim()) return sentence;

  if (!checkProfanity(sentence)) return sentence;

  let rewritten = sentence;
  let wasModified = false;

  // Apply rewrite patterns
  for (const rule of rewritePatterns) {
    const before = rewritten;
    rewritten = rewritten.replace(rule.pattern, rule.replacement);
    if (before !== rewritten) wasModified = true;
  }

  // If profanity still remains, remove offending words
  if (checkProfanity(rewritten)) {
    const words = rewritten.split(/\b/);
    const cleanedWords = words.map(word => {
      if (word.trim() && checkProfanity(word)) {
        return '';
      }
      return word;
    });

    rewritten = cleanedWords.join('');
    wasModified = true;
  }

  // Clean up
  if (wasModified) {
    rewritten = rewritten.replace(/\s+/g, ' ').trim();
    rewritten = rewritten.replace(/^([a-z])/, match => match.toUpperCase());
  }

  return rewritten;
}

// Update statistics
function updateStatistics() {
  if (Date.now() - statistics.lastUpdate > 5000) {
    chrome.runtime.sendMessage({
      action: 'updateStatistics',
      data: {
        wordsFiltered: statistics.wordsFiltered,
        imagesBlocked: statistics.imagesBlocked,
        site: window.location.hostname
      }
    }).catch(() => {});

    statistics.wordsFiltered = 0;
    statistics.imagesBlocked = 0;
    statistics.lastUpdate = Date.now();
  }
}

// Filter text content
function filterTextContent() {
  if (!window.containsProfanity || !window.censorProfanity) {
    console.error('[Safe Browse] Profanity functions not available');
    return;
  }

  if (!document.body) return;

  const filterLevel = getFilterLevel();
  let wordsFiltered = 0;

  // Walk through all text nodes
  walkTextNodes(document.body, (node) => {
    const nodeText = node.textContent;

    if (hasBeenFiltered(nodeText)) return;
    if (!nodeText || nodeText.trim().length === 0) return;

    // Skip sensitive elements
    if (node.parentElement) {
      const tagName = node.parentElement.tagName;
      if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT'].includes(tagName)) {
        return;
      }
      if (node.parentElement.isContentEditable) return;
    }

    if (checkProfanity(nodeText)) {
      const sentences = splitIntoSentences(nodeText);
      const rewrittenSentences = sentences.map(s => rewriteSentence(s));
      const rewrittenText = rewrittenSentences.join('');

      if (nodeText !== rewrittenText && rewrittenText.length > 0) {
        node.textContent = rewrittenText;

        if (node.parentElement) {
          node.parentElement.dataset.contentFiltered = 'true';
          if (!node.parentElement.dataset.originalText) {
            node.parentElement.dataset.originalText = nodeText;
          }
        }

        statistics.wordsFiltered++;
        wordsFiltered++;
      }
    }
  });

  if (wordsFiltered > 0) {
    updateStatistics();
  }
}

// Walk through text nodes
function walkTextNodes(element, callback) {
  if (!element || !element.nodeType) return;

  if (element.nodeType === 3) {
    callback(element);
  } else if (element.nodeType === 1) {
    const skipTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT', 'SVG'];
    if (!skipTags.includes(element.tagName)) {
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
    let hasNewContent = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasNewContent = true;
        break;
      }
    }

    if (hasNewContent) {
      // Debounce
      clearTimeout(window.filterDebounce);
      window.filterDebounce = setTimeout(() => {
        filterDynamicContent(mutations);
      }, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Filter dynamically added content
function filterDynamicContent(mutations) {
  if (!config.filterText) return;

  const filterLevel = getFilterLevel();

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        walkTextNodes(node, (textNode) => {
          const nodeText = textNode.textContent;

          if (hasBeenFiltered(nodeText) || !nodeText || nodeText.trim().length === 0) {
            return;
          }

          if (checkProfanity(nodeText)) {
            const sentences = splitIntoSentences(nodeText);
            const rewrittenSentences = sentences.map(s => rewriteSentence(s));
            const rewrittenText = rewrittenSentences.join('');

            if (nodeText !== rewrittenText && rewrittenText.length > 0) {
              textNode.textContent = rewrittenText;

              if (textNode.parentElement) {
                textNode.parentElement.dataset.contentFiltered = 'true';
              }

              statistics.wordsFiltered++;
            }
          }
        });
      }
    });
  });

  updateStatistics();
}

// Listen for configuration updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.config) {
    config = { ...config, ...changes.config.newValue };
    if (config.enabled && !isPaused) {
      filterExistingContent();
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'configUpdate') {
    config = { ...config, ...request.config };
    if (config.enabled && !isPaused) {
      filterExistingContent();
    }
    sendResponse({ success: true });
  } else if (request.action === 'pause') {
    isPaused = true;
    sendResponse({ success: true });
  } else if (request.action === 'resume') {
    isPaused = false;
    filterExistingContent();
    sendResponse({ success: true });
  }
  return true;
});

console.log('[Safe Browse] Content script loaded');
