// Popup Script - Minimal interface for pattern-based text filtering

// DOM Elements
const elements = {
  mainToggle: document.getElementById('mainToggle'),
  wordsFiltered: document.getElementById('wordsFiltered'),
  customWordInput: document.getElementById('customWordInput'),
  addWordBtn: document.getElementById('addWordBtn'),
  customWordsList: document.getElementById('customWordsList'),
  whitelistCurrentBtn: document.getElementById('whitelistCurrentBtn'),
  whitelistDisplay: document.getElementById('whitelistDisplay')
};

// Current configuration
let config = {
  enabled: true,
  filterText: true,
  strictMode: true,
  customWords: [],
  whitelistedDomains: [],
  statistics: {
    wordsFiltered: 0
  }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadConfiguration();
  setupEventListeners();
  getCurrentTabInfo();
});

// Load configuration from storage
function loadConfiguration() {
  // Load config from sync and stats from local
  Promise.all([
    chrome.storage.sync.get(['config']),
    chrome.storage.local.get(['statistics'])
  ]).then(([syncResult, localResult]) => {
    if (syncResult.config) {
      config = { ...config, ...syncResult.config };
    }
    if (localResult.statistics) {
      config.statistics = localResult.statistics;
    }
    updateUI();
  });
}

// Update UI with current configuration
function updateUI() {
  elements.mainToggle.checked = config.enabled !== false;
  elements.wordsFiltered.textContent = formatNumber(config.statistics.wordsFiltered);
  displayCustomWords();
  displayWhitelistedDomains();
}

// Format large numbers
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Setup event listeners
function setupEventListeners() {
  // Main toggle
  elements.mainToggle.addEventListener('change', () => {
    config.enabled = elements.mainToggle.checked;
    saveConfiguration();

    // Reload active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });

  // Custom words
  elements.addWordBtn.addEventListener('click', addCustomWord);
  elements.customWordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCustomWord();
    }
  });

  // Whitelist current site
  elements.whitelistCurrentBtn.addEventListener('click', whitelistCurrentSite);
}

// Add custom word to filter
function addCustomWord() {
  const word = elements.customWordInput.value.trim().toLowerCase();

  if (word && !config.customWords.includes(word)) {
    config.customWords.push(word);
    saveConfiguration();
    elements.customWordInput.value = '';
    displayCustomWords();
  }
}

// Display custom words
function displayCustomWords() {
  elements.customWordsList.innerHTML = '';

  if (config.customWords.length === 0) {
    elements.customWordsList.innerHTML = '<div style="color: #9ca3af; font-size: 12px;">No custom words</div>';
    return;
  }

  config.customWords.forEach(word => {
    const tag = document.createElement('div');
    tag.className = 'word-tag';
    tag.innerHTML = `
      ${escapeHtml(word)}
      <button data-word="${word}">×</button>
    `;

    tag.querySelector('button').addEventListener('click', () => {
      removeCustomWord(word);
    });

    elements.customWordsList.appendChild(tag);
  });
}

// Remove custom word
function removeCustomWord(word) {
  config.customWords = config.customWords.filter(w => w !== word);
  saveConfiguration();
  displayCustomWords();
}

// Whitelist current site
function whitelistCurrentSite() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;

        if (!config.whitelistedDomains.includes(hostname)) {
          config.whitelistedDomains.push(hostname);
          saveConfiguration();
          displayWhitelistedDomains();

          // Update button
          elements.whitelistCurrentBtn.textContent = '✓ Site Whitelisted';
          elements.whitelistCurrentBtn.disabled = true;

          // Reload the tab
          chrome.tabs.reload(tabs[0].id);
        }
      } catch (e) {
        // Invalid URL
      }
    }
  });
}

// Display whitelisted domains
function displayWhitelistedDomains() {
  elements.whitelistDisplay.innerHTML = '';

  if (config.whitelistedDomains.length === 0) {
    elements.whitelistDisplay.innerHTML = '<div style="color: #9ca3af; font-size: 12px;">No whitelisted sites</div>';
    return;
  }

  config.whitelistedDomains.forEach(domain => {
    const item = document.createElement('div');
    item.className = 'whitelist-item';
    item.innerHTML = `
      <span>${escapeHtml(domain)}</span>
      <button data-domain="${domain}">×</button>
    `;

    item.querySelector('button').addEventListener('click', () => {
      removeWhitelistedDomain(domain);
    });

    elements.whitelistDisplay.appendChild(item);
  });
}

// Remove whitelisted domain
function removeWhitelistedDomain(domain) {
  config.whitelistedDomains = config.whitelistedDomains.filter(d => d !== domain);
  saveConfiguration();
  displayWhitelistedDomains();
}

// Get current tab info
function getCurrentTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;

        // Update whitelist button if already whitelisted
        if (config.whitelistedDomains.includes(hostname)) {
          elements.whitelistCurrentBtn.textContent = '✓ Site Whitelisted';
          elements.whitelistCurrentBtn.disabled = true;
        }
      } catch (e) {
        // Invalid URL
      }
    }
  });
}

// Save configuration to storage
function saveConfiguration() {
  // Save only config to sync (exclude statistics)
  const configToSave = { ...config };
  delete configToSave.statistics; // Statistics are stored separately in local storage

  chrome.storage.sync.set({ config: configToSave }, () => {
    // Notify content scripts of configuration change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'configUpdate',
            config: configToSave
          }).catch(() => {
            // Tab might not have content script
          });
        }
      });
    });
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
