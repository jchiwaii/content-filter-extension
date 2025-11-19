// Background Service Worker
// Handles extension initialization

// Default configuration
const defaultConfig = {
  filterText: true,
  strictMode: true,
  customWords: [],
  whitelistedDomains: [],
  statistics: {
    wordsFiltered: 0
  }
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  // Set default configuration
  chrome.storage.sync.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.sync.set({ config: defaultConfig });
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
      chrome.storage.sync.get(['config'], (result) => {
        sendResponse(result.config || defaultConfig);
      });
      return true; // Keep channel open for async response
  }
});

// Update statistics
function updateStatistics(data) {
  chrome.storage.sync.get(['config'], (result) => {
    const config = result.config || defaultConfig;

    if (data.wordsFiltered) {
      config.statistics.wordsFiltered += data.wordsFiltered;
    }

    chrome.storage.sync.set({ config });
  });
}
