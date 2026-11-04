// Enhanced Content Filter - Main Content Script

// ── Fallback profanity functions (if profanity-data.js is not loaded) ──
if (typeof containsProfanity === 'undefined') {
  containsProfanity = function(text, customWords) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (customWords || []).some(word => lower.includes(word.toLowerCase()));
  };
}
if (typeof removeProfanity === 'undefined') {
  removeProfanity = function(text, customWords) {
    if (!text) return text;
    let result = text;
    for (const word of (customWords || [])) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'gi');
      result = result.replace(re, ' ');
    }
    return result;
  };
}
// ── End fallback ──

// ── Configuration ────────────────────────────────────────────────────────────
let config = {
  enabled: true,
  filterText: true,
  filterImages: true,
  customWords: [],
  whitelistedDomains: []
};

let isPaused = false;
let filterInitialized = false;
let imageObserverReady = false;
let imageConfigReady = null;
let textMutationObserver = null;
let mutationFlushTimer = null;
const pendingTextMutations = [];
const observedMutationRoots = new WeakSet();

const TEXT_MUTATION_OPTIONS = {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ['placeholder', 'title', 'aria-label', 'href']
};

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const SKIPPED_TEXT_TAGS = new Set(['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'CODE', 'PRE', 'NOSCRIPT', 'SVG']);

// Do not start matching halfway through a hostname or an email address.
const WRITTEN_URL = /(?<![\p{L}\p{N}_@.-])(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?![a-z0-9@-])(?::\d+)?(?:[/?#][^\s<>"'\u201c\u201d]*)?/giu;
const URL_LABEL = new RegExp('^(?:' + WRITTEN_URL.source + ')$', 'iu');

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

  if (!document.body) return;
  if (filterInitialized) {
    filterExistingContent();
    return;
  }
  filterInitialized = true;

  console.log('[Safe Browse] Initializing content filter');

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
    filterTextAttributes();
  }

  syncImageFiltering();
}

async function syncImageFiltering() {
  const imageDetector = window.ImageDetector;
  if (!imageDetector) return;

  if (!imageConfigReady && typeof imageDetector.init === 'function') {
    imageConfigReady = imageDetector.init();
  }
  await imageConfigReady;

  // Use the latest state after storage loading, including a pause during startup.
  const enabled = isProtectionActive() && config.filterImages !== false;

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
  if (typeof containsProfanity === 'function') {
    return containsProfanity(text, config.customWords);
  }
  return false;
}

// Remove all profanity from text
function cleanProfanity(text) {
  if (typeof removeProfanity === 'function') {
    return removeProfanity(text, config.customWords);
  }
  return text;
}

function getLowerAttribute(element, attribute) {
  const value = element?.getAttribute?.(attribute);
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function isEditableElement(element) {
  if (!element || element.nodeType !== 1) return false;

  if (EDITABLE_TAGS.has(element.tagName)) return true;
  if (element.isContentEditable) return true;

  const contentEditable = getLowerAttribute(element, 'contenteditable');
  if (contentEditable && contentEditable !== 'false') return true;

  const role = getLowerAttribute(element, 'role');
  const ariaReadonly = getLowerAttribute(element, 'aria-readonly');
  return role === 'textbox' && ariaReadonly !== 'true';
}

function getEditableParent(node) {
  if (!node) return null;
  if (node.parentElement) return node.parentElement;
  if (node.parentNode) return node.parentNode;
  if (node.host) return node.host;
  return null;
}

function isInEditableContext(node) {
  let current = node?.nodeType === 1 ? node : getEditableParent(node);
  const seen = new WeakSet();

  while (current && typeof current === 'object') {
    if (seen.has(current)) return false;
    seen.add(current);

    if (current.nodeType === 1 && isEditableElement(current)) return true;

    current = getEditableParent(current);
  }

  return false;
}

function isInSkippedTextContext(node) {
  if (node?.ownerDocument?.designMode === 'on' || document.designMode === 'on') return true;
  if (isInEditableContext(node)) return true;
  let current = node?.nodeType === 1 ? node : getEditableParent(node);
  while (current) {
    if (SKIPPED_TEXT_TAGS.has(current.tagName)) return true;
    current = getEditableParent(current);
  }
  return false;
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

function isBlockedWebUrl(url) {
  if (!url || !['http:', 'https:'].includes(url.protocol)) return false;
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch { /* Keep malformed escapes literal. */ }
  const address = url.hostname + path;
  if (checkProfanity(address)) return true;

  // Only unambiguous compounds get substring matching. Short dictionary
  // entries still need boundaries (e.g. assignment.com and sussex.ac.uk).
  if (/(?:^|[./_-])sex(?:[./_-]|$)|sexwith(?:me|us)|dirtyword|fuck|blowjob|handjob|camgirl|onlyfans/i.test(address)) return true;
  for (const label of url.hostname.split('.')) {
    const base = label.replace(/^(?:my|free|watch)/i, '').replace(/(?:sites?|videos?|movies?|tube|hub|online)$/i, '');
    if (base && base !== label && checkProfanity(base)) return true;
  }
  return typeof normalizeCustomEntries === 'function' && normalizeCustomEntries(config.customWords).some(entry => {
    if (typeof entry !== 'string' || entry.startsWith('/')) return false;
    const word = normalizeTerm(entry).replace(/[\s_-]+/g, '');
    return word.length >= 4 && address.toLowerCase().includes(word);
  });
}

function writtenAddressIsBlocked(address) {
  if (!address || !address.includes('.') || !URL_LABEL.test(address)) return false;
  try {
    return isBlockedWebUrl(new URL(/^https?:\/\//i.test(address) ? address : 'https://' + address));
  } catch { return false; }
}

function removeBlockedAddresses(text) {
  if (!text.includes('.')) return text;
  const result = text.replace(WRITTEN_URL, match => {
    const address = match.replace(/[.,;:!?)\]}]+$/, '');
    return writtenAddressIsBlocked(address) ? ' ' + match.slice(address.length) : match;
  });
  return result === text ? text : cleanFilteredText(text, result);
}

function removeBlockedAnchor(anchor) {
  if (anchor?.tagName !== 'A' || !anchor.parentNode || isInSkippedTextContext(anchor)) return false;
  const href = anchor.getAttribute('href');
  if (!href) return false;
  let url;
  try { url = new URL(href, anchor.baseURI); } catch { /* Still check the displayed address. */ }
  // Shortened links often show the real domain across multiple nested spans.
  const label = anchor.textContent.trim();
  if (!isBlockedWebUrl(url) && !writtenAddressIsBlocked(label) &&
      !writtenAddressIsBlocked(anchor.getAttribute('title'))) return false;
  anchor.remove();
  statistics.wordsFiltered++;
  maybeFlushStats();
  return true;
}

// Filter a single text node
function filterNode(node) {
  if (isInSkippedTextContext(node)) return;

  const text = node.textContent;
  if (!text || !text.trim()) return;
  const remaining = removeBlockedAddresses(text);
  const cleaned = checkProfanity(remaining) ? cleanProfanity(remaining) : remaining;
  if (cleaned !== text) {
    node.textContent = cleaned;
    statistics.wordsFiltered++;
    maybeFlushStats();
  }
}

// Filter text content
function filterTextContent() {
  if (typeof removeProfanity !== 'function') {
    console.error('[Safe Browse] Profanity functions not available');
    return;
  }
  if (!document.body) return;
  walkTextNodes(document.body, filterNode);
}

function filterElementTextAttributes(element) {
  if (!element || element.nodeType !== 1) return;
  if (typeof removeProfanity !== 'function' || typeof containsProfanity !== 'function') return;
  if (isInSkippedTextContext(element)) return;

  const attributes = ['placeholder', 'title', 'aria-label'];
  for (const attribute of attributes) {
    if (element.tagName === 'IMG' && attribute === 'title') continue;

    const value = element.getAttribute?.(attribute);
    if (!value || !containsProfanity(value, config.customWords)) continue;

    const cleaned = removeProfanity(value, config.customWords);
    if (cleaned !== value) {
      element.setAttribute(attribute, cleaned);
      statistics.wordsFiltered++;
      maybeFlushStats();
    }
  }
}

// Filter visible text attributes without disturbing image-classification metadata.
function filterTextAttributes(root = document) {
  if (!root) return;
  const elements = [];

  if (root.nodeType === 1) {
    elements.push(root);
  }

  if (typeof root.querySelectorAll === 'function') {
    elements.push(...root.querySelectorAll('[placeholder], [title], [aria-label]'));
  }

  for (const el of elements) {
    filterElementTextAttributes(el);
  }
}

// Walk through text nodes (including shadow DOM roots)
function walkTextNodes(element, callback, visitedWeakSet = new WeakSet()) {
  if (!element || !element.nodeType) return;

  // Prevent infinite loops from circular references
  if (visitedWeakSet.has(element)) return;
  visitedWeakSet.add(element);

  if (element.nodeType === 3) {
    if (isInSkippedTextContext(element)) return;
    callback(element);
  } else if (element.nodeType === 1) {
    if (!isInSkippedTextContext(element)) {
      if (removeBlockedAnchor(element)) return;
      // Walk normal child nodes
      for (const child of Array.from(element.childNodes)) {
        walkTextNodes(child, callback, visitedWeakSet);
      }
      // Walk shadow root children (if any)
      if (element.shadowRoot) {
        for (const child of Array.from(element.shadowRoot.childNodes)) {
          walkTextNodes(child, callback, visitedWeakSet);
        }
      }
    }
  }
}

function observeMutationRoot(root) {
  if (!textMutationObserver || !root || observedMutationRoots.has(root)) return;
  textMutationObserver.observe(root, TEXT_MUTATION_OPTIONS);
  observedMutationRoots.add(root);
}

function observeOpenShadowRoots(root) {
  if (!root) return;

  if (root.nodeType === 1 && root.shadowRoot) {
    observeMutationRoot(root.shadowRoot);
    observeOpenShadowRoots(root.shadowRoot);
  }

  if (typeof root.querySelectorAll !== 'function') return;
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) {
      observeMutationRoot(element.shadowRoot);
      observeOpenShadowRoots(element.shadowRoot);
    }
  }
}

function queueTextMutations(mutations) {
  pendingTextMutations.push(...mutations);
  clearTimeout(mutationFlushTimer);
  mutationFlushTimer = setTimeout(() => {
    mutationFlushTimer = null;
    const batch = pendingTextMutations.splice(0, pendingTextMutations.length);
    filterDynamicContent(batch);
  }, 75);
}

// Setup mutation observer for dynamic content and open shadow DOM roots.
function setupMutationObserver() {
  if (textMutationObserver || !document.body) return;

  textMutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes || []) {
        if (node.nodeType === 1) {
          observeOpenShadowRoots(node);
        }
      }
    }

    queueTextMutations(mutations);
  });

  observeMutationRoot(document.body);
  observeOpenShadowRoots(document.body);
}

// Filter dynamically added content
function filterDynamicContent(mutations) {
  if (!isProtectionActive() || !config.filterText) return;

  mutations.forEach((mutation) => {
    const target = mutation.target?.nodeType === 3 ? mutation.target.parentElement : mutation.target;
    if (removeBlockedAnchor(target?.closest?.('a[href]'))) return;
    if (mutation.type === 'characterData' && mutation.target?.nodeType === 3) {
      filterNode(mutation.target);
    }

    if (mutation.type === 'attributes' && mutation.target?.nodeType === 1) {
      filterElementTextAttributes(mutation.target);
    }

    (mutation.addedNodes || []).forEach((node) => {
      if (node.nodeType === 3) {
        filterNode(node);
      } else if (node.nodeType === 1) {
        walkTextNodes(node, filterNode);
        filterTextAttributes(node);
      }
    });
  });
}

// Listen for configuration updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.config) {
    config = { ...config, ...changes.config.newValue };
    if (isProtectionActive()) {
      initializeFilter();
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
      initializeFilter();
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
      initializeFilter();
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
    initializeFilter();
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
      if (el.value && typeof containsProfanity === 'function' && containsProfanity(el.value, config.customWords)) {
        profanityElements.push(el);
      }
    });
    if (profanityElements.length === 0) return;
    event.preventDefault();
    profanityElements.forEach(el => {
      if (typeof removeProfanity === 'function') {
        const cleaned = removeProfanity(el.value, config.customWords);
        el.value = cleaned;
      }
    });
    requestAnimationFrame(() => {
      form.submit();
    });
  });
}

console.log('[Safe Browse] Content script loaded');
