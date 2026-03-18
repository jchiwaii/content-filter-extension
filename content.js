// Enhanced Content Filter - Main Content Script

// Configuration
let config = {
  enabled: true,
  filterText: true,
  filterImages: true,
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

// Wait for profanity database to be ready (checks for removeProfanity)
function waitForProfanityDB() {
  return new Promise((resolve) => {
    if (window.removeProfanity && typeof window.removeProfanity === 'function') {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 100;

    const checkInterval = setInterval(() => {
      attempts++;
      if (window.removeProfanity && typeof window.removeProfanity === 'function') {
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
    if (window.ImageDetector) {
      window.ImageDetector.init();
      window.ImageDetector.setupObserver();
      window.ImageDetector.scanPage();
    }

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
      setTimeout(filterExistingContent, 500);
    }
  }
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

// Check for profanity using language detector if available, otherwise use direct function
function checkProfanity(text) {
  if (window.LangDetector && typeof window.LangDetector.containsProfanity === 'function') {
    return window.LangDetector.containsProfanity(text, config.customWords);
  }
  if (window.containsProfanity) {
    return window.containsProfanity(text, config.customWords);
  }
  return false;
}

// Remove profanity using language detector if available, otherwise use direct function
function cleanProfanity(text) {
  if (window.LangDetector && typeof window.LangDetector.removeProfanity === 'function') {
    return window.LangDetector.removeProfanity(text, config.customWords);
  }
  if (window.removeProfanity) {
    return window.removeProfanity(text, config.customWords);
  }
  return text;
}

// Flush statistics to background
function maybeFlushStats() {
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

// Filter a single text node
function filterNode(node) {
  const text = node.textContent;
  if (!text || !text.trim()) return;
  if (!checkProfanity(text)) return;

  const cleaned = cleanProfanity(text);
  if (cleaned !== text) {
    node.textContent = cleaned;
    statistics.wordsFiltered++;
    maybeFlushStats();
  }
}

// Filter text content
function filterTextContent() {
  if (!window.removeProfanity) {
    console.error('[Safe Browse] Profanity functions not available');
    return;
  }
  if (!document.body) return;
  walkTextNodes(document.body, filterNode);
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

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        walkTextNodes(node, filterNode);
      }
    });
  });
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
