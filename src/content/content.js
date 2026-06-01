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
let imageObserverReady = false;

// Statistics for this session
let statistics = {
  wordsFiltered: 0,
  imagesBlocked: 0,
  lastUpdate: Date.now()
};
let statsFlushTimer = null;

// Initialize
function initialize() {
  chrome.storage.sync.get(['config'], function(result) {
    if (result.config) {
      config = { ...config, ...result.config };
    }

    // Check pause status
    chrome.storage.local.get(['isPaused', 'pauseUntil'], (pauseResult) => {
      isPaused = pauseResult.isPaused && pauseResult.pauseUntil > Date.now();

      if (!isProtectionActive()) {
        console.log('[Safe Browse] Protection is paused or disabled');
        return;
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFilter);
      } else {
        initializeFilter();
      }
    });
  });
}

initialize();

// Initialize the filter
function initializeFilter() {
  if (!isProtectionActive()) {
    if (isWhitelisted()) {
      console.log('[Safe Browse] Site is whitelisted');
    }
    return;
  }

  console.log('[Safe Browse] Initializing content filter');

  // Filter existing content
  filterExistingContent();

  // Setup mutation observer for dynamic content
  setupMutationObserver();

  // Setup SPA detection
  setupSPADetection();

  // Initialize image detector
  syncImageFiltering();
  setupFormProtection();
}

function isProtectionActive() {
  return config.enabled !== false && !isPaused && !isWhitelisted();
}

// Check if current domain is whitelisted
function isWhitelisted() {
  return (config.whitelistedDomains || []).some(domain =>
    domainMatches(window.location.hostname, domain)
  );
}

function normalizeHostname(input) {
  if (!input) return '';

  let value = String(input).trim().toLowerCase();
  if (!value) return '';

  try {
    const url = value.includes('://') ? new URL(value) : new URL(`https://${value}`);
    value = url.hostname;
  } catch {
    value = value.split('/')[0].split(':')[0];
  }

  return value.replace(/^\.+/, '').replace(/^www\./, '');
}

function domainMatches(hostname, configuredDomain) {
  const host = normalizeHostname(hostname);
  const domain = normalizeHostname(configuredDomain);
  return Boolean(domain && (host === domain || host.endsWith(`.${domain}`)));
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

  // Polling fallback for any SPAs that bypass the history API hooks
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(filterExistingContent, 500);
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
  if (!isProtectionActive()) {
    syncImageFiltering();
    return;
  }

  if (config.filterText) {
    filterTextContent();
  }

  syncImageFiltering();
}

async function syncImageFiltering() {
  if (!window.ImageDetector) return;

  const enabled = isProtectionActive() && config.filterImages !== false;

  if (typeof window.ImageDetector.init === 'function') {
    await window.ImageDetector.init();
  }

  if (typeof window.ImageDetector.setEnabled === 'function') {
    window.ImageDetector.setEnabled(enabled);
  } else {
    window.ImageDetector.config = { ...window.ImageDetector.config, enabled };
  }

  if (!enabled) return;

  if (!imageObserverReady && typeof window.ImageDetector.setupObserver === 'function') {
    window.ImageDetector.setupObserver();
    imageObserverReady = true;
  }

  if (typeof window.ImageDetector.scanPage === 'function') {
    window.ImageDetector.scanPage(true);
  }
}

// Check if text contains profanity
function checkProfanity(text) {
  if (window.containsProfanity) {
    return window.containsProfanity(text, config.customWords);
  }
  return false;
}

// Remove all profanity from text
function cleanProfanity(text) {
  if (window.removeProfanity) {
    return window.removeProfanity(text, config.customWords);
  }
  return text;
}

// Flush statistics to background
function flushStats() {
  if (statsFlushTimer) {
    clearTimeout(statsFlushTimer);
    statsFlushTimer = null;
  }

  const wordsFiltered = statistics.wordsFiltered;
  const imagesBlocked = statistics.imagesBlocked;

  if (!wordsFiltered && !imagesBlocked) return;

  chrome.runtime.sendMessage({
    action: 'updateStatistics',
    data: {
      wordsFiltered,
      imagesBlocked,
      site: normalizeHostname(window.location.hostname)
    }
  }).catch(() => {});

  statistics.wordsFiltered = 0;
  statistics.imagesBlocked = 0;
  statistics.lastUpdate = Date.now();
}

function scheduleStatsFlush() {
  if (Date.now() - statistics.lastUpdate > 5000) {
    flushStats();
    return;
  }

  if (!statsFlushTimer) {
    statsFlushTimer = setTimeout(flushStats, 1000);
  }
}

function maybeFlushStats() {
  scheduleStatsFlush();
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
  if (!isProtectionActive() || !config.filterText) return;

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
    if (isProtectionActive()) {
      filterExistingContent();
    } else {
      syncImageFiltering();
    }
  }

  if (namespace === 'sync' && changes.imageDetectorConfig && window.ImageDetector) {
    window.ImageDetector.config = {
      ...window.ImageDetector.config,
      ...changes.imageDetectorConfig.newValue
    };
    syncImageFiltering();
  }

  if (namespace === 'local' && (changes.isPaused || changes.pauseUntil)) {
    const pauseUntil = changes.pauseUntil?.newValue;
    isPaused = Boolean(changes.isPaused?.newValue && pauseUntil > Date.now());
    if (isProtectionActive()) {
      filterExistingContent();
    } else {
      syncImageFiltering();
    }
  }
});

window.addEventListener('pagehide', flushStats);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushStats();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'configUpdate') {
    config = { ...config, ...request.config };
    if (isProtectionActive()) {
      filterExistingContent();
    } else {
      syncImageFiltering();
    }
    sendResponse({ success: true });
  } else if (request.action === 'pause') {
    isPaused = true;
    syncImageFiltering();
    sendResponse({ success: true });
  } else if (request.action === 'resume') {
    isPaused = false;
    filterExistingContent();
    sendResponse({ success: true });
  }
  return true;
});

// Protect forms from submitting profanity
function setupFormProtection() {
  document.addEventListener('submit', function(event) {
    if (!isProtectionActive() || !config.filterText) return;
    const form = event.target;
    const profanityElements = [];
    const elements = form.querySelectorAll('input[type=text], input[type=email], input[type=url], input[type=search], textarea');
    elements.forEach(el => {
      if (el.value && window.containsProfanity && window.containsProfanity(el.value, config.customWords)) {
        profanityElements.push(el);
      }
    });
    if (profanityElements.length === 0) return;
    event.preventDefault();
    profanityElements.forEach(el => {
      if (window.removeProfanity) {
        const cleaned = window.removeProfanity(el.value, config.customWords);
        el.value = cleaned;
      }
    });
    requestAnimationFrame(() => {
      form.submit();
    });
  });
}

console.log('[Safe Browse] Content script loaded');
