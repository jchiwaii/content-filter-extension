// Enhanced Content Filter - Main Content Script

// ── Image Detector (inline) ──────────────────────────────────────────────────
window.ImageDetector = (() => {
  const SUSPICIOUS_DOMAINS = [
    'pornhub','xvideos','xnxx','xhamster','redtube','youporn','spankbang',
    'beeg','eporner','pornpic','xxx','nudevista','hentai','rule34'
  ];
  const SUSPICIOUS_EXTS = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
  const SUSPICIOUS_CLASSES = /\b(adult|nsfw|xxx|porn|naked|nude|sexy|bikini|lingerie)\b/i;

  let enabled = true;

  function isSuspicious(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      for (const d of SUSPICIOUS_DOMAINS) {
        if (host.includes(d)) return true;
      }
    } catch {}
    return false;
  }

  function hasSuspiciousAlt(img) {
    const alt = (img.alt || '').toLowerCase();
    const title = (img.title || '').toLowerCase();
    const src = (img.src || '').toLowerCase();
    return SUSPICIOUS_CLASSES.test(alt) || SUSPICIOUS_CLASSES.test(title) ||
           SUSPICIOUS_CLASSES.test(img.className) ||
           SUSPICIOUS_CLASSES.test(src);
  }

  function processImage(img) {
    if (img.dataset.sbProcessed) return;
    img.dataset.sbProcessed = '1';

    if (hasSuspiciousAlt(img) || isSuspicious(img.src)) {
      img.style.opacity = '0.3';
      img.style.filter = 'blur(8px)';
      img.style.transition = 'opacity 0.3s, filter 0.3s';
      img.title = 'Potentially adult content';
      img.alt = '[Filtered]';
      // increment statistics later
      chrome.runtime.sendMessage({
        action: 'updateStatistics',
        data: { imagesBlocked: 1, site: window.location.hostname }
      }).catch(()=>{});
    }
  }

  function scanPage() {
    if (!enabled) return;
    const imgs = document.querySelectorAll('img');
    imgs.forEach(processImage);
  }

  function observe() {
    if (!enabled) return;
    const observer = new MutationObserver(mutations => {
      if (!enabled) return;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1 && node.tagName === 'IMG') processImage(node);
          else if (node.nodeType === 1) {
            node.querySelectorAll('img').forEach(processImage);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return {
    init: () => { if (!document.body) return; scanPage(); observe(); },
    setEnabled: (val) => { enabled = val; },
    config: { enabled: true },
    setupObserver: observe,
    scanPage
  };
})();

// ── Configuration ────────────────────────────────────────────────────────────
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
        console.log('[wash-my-eyes] Protection is paused or disabled');
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
      console.log('[wash-my-eyes] Site is whitelisted');
    }
    return;
  }

  console.log('[wash-my-eyes] Initializing content filter');

  // Filter existing content
  filterExistingContent();

  // Setup mutation observer for dynamic content
  setupMutationObserver();

  // Setup SPA detection
  setupSPADetection();

  // Periodic re‑scan to catch late‑arriving AI / AJAX content
  let scanAttempts = 0;
  const maxAttempts = 10;               // scan up to 10 times (2 sec apart)
  const scanInterval = 2000;            // milliseconds
  const scanTimer = setInterval(() => {
    scanAttempts++;
    if (!isProtectionActive() || scanAttempts > maxAttempts) {
      clearInterval(scanTimer);
      return;
    }
    filterExistingContent();
  }, scanInterval);

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
    filterPlaceholders();
  }

  syncImageFiltering();
}

async function syncImageFiltering() {
  // ImageDetector is now always available (defined above)
  const imageDetector = window.ImageDetector;
  if (!imageDetector) return;

  const enabled = isProtectionActive() && config.filterImages !== false;

  if (typeof imageDetector.init === 'function') {
    await imageDetector.init();
  }

  if (typeof imageDetector.setEnabled === 'function') {
    imageDetector.setEnabled(enabled);
  } else {
    imageDetector.config = { ...imageDetector.config, enabled };
  }

  if (!enabled) return;

  if (!imageObserverReady && typeof imageDetector.setupObserver === 'function') {
    imageDetector.setupObserver();
    imageObserverReady = true;
  }

  if (typeof imageDetector.scanPage === 'function') {
    imageDetector.scanPage(true);
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
    console.error('[wash-my-eyes] Profanity functions not available');
    return;
  }
  if (!document.body) return;
  walkTextNodes(document.body, filterNode);
}

// Filter placeholder attributes (visible in form elements)
function filterPlaceholders() {
  if (!window.removeProfanity || !window.containsProfanity) return;
  const elements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
  for (const el of elements) {
    const ph = el.getAttribute('placeholder');
    if (!ph) continue;
    if (window.containsProfanity(ph, config.customWords)) {
      const cleaned = window.removeProfanity(ph, config.customWords);
      el.setAttribute('placeholder', cleaned);
      statistics.wordsFiltered++;
      maybeFlushStats();
    }
  }
}

// Walk through text nodes (including shadow DOM roots)
function walkTextNodes(element, callback, visitedWeakSet = new WeakSet()) {
  if (!element || !element.nodeType) return;

  // Prevent infinite loops from circular references
  if (visitedWeakSet.has(element)) return;
  visitedWeakSet.add(element);

  if (element.nodeType === 3) {
    callback(element);
  } else if (element.nodeType === 1) {
    const skipTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT', 'SVG'];
    if (!skipTags.includes(element.tagName)) {
      if (!element.isContentEditable) {
        // Walk normal child nodes
        for (let child of element.childNodes) {
          walkTextNodes(child, callback, visitedWeakSet);
        }
        // Walk shadow root children (if any)
        if (element.shadowRoot) {
          for (let child of element.shadowRoot.childNodes) {
            walkTextNodes(child, callback, visitedWeakSet);
          }
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

console.log('[wash-my-eyes] Content script loaded');
