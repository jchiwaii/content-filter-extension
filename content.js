// Content Filter - Main Content Script
// Pattern-based sentence rewriting for text content

// Configuration
let config = {
  filterText: true,
  strictMode: true,
  customWords: [],
  whitelistedDomains: []
};

// Wait for both DOM and profanity database to be ready
function initialize() {
// Load configuration from storage
chrome.storage.sync.get(['config'], function(result) {

  if (result.config) {
    config = { ...config, ...result.config };
  }

    // Wait for profanity database to load before initializing
    waitForProfanityDB().then(() => {
      // Ensure DOM is ready before filtering
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
  initializeFilter();
});
      } else {
        // DOM is already interactive or complete
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
  wordsFiltered: 0,
  lastUpdate: Date.now()
};

// Initialize the filter
function initializeFilter() {
  if (isWhitelisted()) return;
  
  // Start filtering
  filterExistingContent();
  
  // Listen for dynamic content changes
  setupMutationObserver();

  // Listen for SPA route changes
  setupSPADetection();
}

// Detect SPA route changes (for React, Vue, Angular, etc.)
function setupSPADetection() {
  let lastUrl = location.href;

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
      lastUrl = location.href;
      handleRouteChange();
    }
  }, 1000);

  function handleRouteChange() {
    const newUrl = location.href;
    if (newUrl !== lastUrl) {
      lastUrl = newUrl;

      // Clear old filtered markers
      clearFilteredMarkers();

      // Wait a bit for new content to load, then re-filter
      setTimeout(() => {
        filterExistingContent();
      }, 500);
    }
  }
}

// Clear filtered markers from previous page
function clearFilteredMarkers() {
  const filteredElements = document.querySelectorAll('[data-content-filtered="true"]');
  filteredElements.forEach(element => {
    delete element.dataset.contentFiltered;
    delete element.dataset.originalText;
  });
}

// Check if current domain is whitelisted
function isWhitelisted() {
  const currentDomain = window.location.hostname;
  return config.whitelistedDomains.includes(currentDomain);
}

// Filter all existing content
function filterExistingContent() {
  if (config.filterText) {
    filterTextContent();
  }
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
        wordsFiltered: statistics.wordsFiltered
      }
    });
    statistics.lastUpdate = Date.now();
  }
}

// Filter text content using ML-enhanced profanity detection
function filterTextContent() {

  // Check if profanity functions are available
  if (!window.containsProfanity || !window.censorProfanity) {
    console.error('[Content Filter] Profanity functions not available!');
    return;
  }

  // Check if document.body exists
  if (!document.body) {
    return;
  }

  // Use the profanity detection from profanity-data.js
  const filterLevel = config.strictMode ? 'all' : 'moderate';

  let nodesProcessed = 0;
  let wordsFiltered = 0;

  // Get custom words from config
  const customWords = config.customWords || [];

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

    config = { ...config, ...changes.config.newValue };


    // Refilter content with new config
    filterExistingContent();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle config updates from popup
  if (request.action === 'configUpdate') {

    config = { ...config, ...request.config };


    // Refilter content with new config
    filterExistingContent();

    sendResponse({ success: true });
    return true;
  }
});
