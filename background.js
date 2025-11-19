// Background Service Worker
// Handles extension initialization

// Default configuration
const defaultConfig = {
  filterText: true,
  strictMode: true,
  customWords: [],
  whitelistedDomains: []
};

// Default statistics
const defaultStats = {
  wordsFiltered: 0
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  // Set default configuration
  chrome.storage.sync.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.sync.set({ config: defaultConfig });
    }
  });

  // Initialize statistics in local storage (unlimited writes)
  chrome.storage.local.get(['statistics'], (result) => {
    if (!result.statistics) {
      chrome.storage.local.set({ statistics: defaultStats });
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'updateStatistics':
      updateStatistics(request.data);
      sendResponse({ success: true });
      break;

    case 'getConfig':
      // Return both config and stats
      Promise.all([
        chrome.storage.sync.get(['config']),
        chrome.storage.local.get(['statistics'])
      ]).then(([syncResult, localResult]) => {
        const config = syncResult.config || defaultConfig;
        const stats = localResult.statistics || defaultStats;
        // Merge stats into config object for backward compatibility with popup/content scripts
        sendResponse({ ...config, statistics: stats });
      });
      return true; // Keep channel open for async response
  }
});

// Update statistics
function updateStatistics(data) {
  chrome.storage.local.get(['statistics'], (result) => {
    const stats = result.statistics || defaultStats;

    if (data.wordsFiltered) {
      stats.wordsFiltered = (stats.wordsFiltered || 0) + data.wordsFiltered;
    }

    chrome.storage.local.set({ statistics: stats });
  });
}
