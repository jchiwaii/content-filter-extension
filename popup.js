// Popup Script - Handles user interactions and settings management

// DOM Elements
const elements = {
  mainToggle: document.getElementById('mainToggle'),
  statusText: document.getElementById('statusText'),
  statusIndicator: document.querySelector('.status-indicator'),
  mlStatus: document.getElementById('mlStatus'),
  profanityStatus: document.getElementById('profanityStatus'),
  imagesBlocked: document.getElementById('imagesBlocked'),
  wordsFiltered: document.getElementById('wordsFiltered'),
  sitesProtected: document.getElementById('sitesProtected'),
  filterImages: document.getElementById('filterImages'),
  filterText: document.getElementById('filterText'),
  strictMode: document.getElementById('strictMode'),
  blurLevel: document.getElementById('blurLevel'),
  blurValue: document.getElementById('blurValue'),
  customWordInput: document.getElementById('customWordInput'),
  addWordBtn: document.getElementById('addWordBtn'),
  customWordsList: document.getElementById('customWordsList'),
  whitelistCurrentBtn: document.getElementById('whitelistCurrentBtn'),
  whitelistDisplay: document.getElementById('whitelistDisplay'),
  refreshBtn: document.getElementById('refreshBtn'),
  reportBtn: document.getElementById('reportBtn'),
  resetBtn: document.getElementById('resetBtn'),
  exportBtn: document.getElementById('exportBtn')
};

// Current configuration
let config = {
  enabled: true,
  filterImages: true,
  filterText: true,
  blurLevel: 20,
  strictMode: true,
  customWords: [],
  whitelistedDomains: [],
  statistics: {
    imagesBlocked: 0,
    wordsFiltered: 0,
    sitesProtected: 0
  }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadConfiguration();
  setupEventListeners();
  getCurrentTabInfo();
  checkMLStatus();
});

// Load configuration from storage
function loadConfiguration() {
  chrome.storage.sync.get(['config'], (result) => {
    if (result.config) {
      config = { ...config, ...result.config };
      updateUI();
    }
  });
}

// Update UI with current configuration
function updateUI() {
  // Main toggle and status
  elements.mainToggle.checked = config.enabled !== false;
  updateStatus(config.enabled !== false);
  
  // Statistics
  elements.imagesBlocked.textContent = formatNumber(config.statistics.imagesBlocked);
  elements.wordsFiltered.textContent = formatNumber(config.statistics.wordsFiltered);
  elements.sitesProtected.textContent = formatNumber(config.statistics.sitesProtected);
  
  // Settings
  elements.filterImages.checked = config.filterImages;
  elements.filterText.checked = config.filterText;
  elements.strictMode.checked = config.strictMode;
  elements.blurLevel.value = config.blurLevel;
  elements.blurValue.textContent = config.blurLevel;
  
  // Custom words
  displayCustomWords();
  
  // Whitelisted domains
  displayWhitelistedDomains();
  
  // Enable/disable settings based on main toggle
  toggleSettings(config.enabled !== false);
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

// Update status display
function updateStatus(enabled) {
  if (enabled) {
    elements.statusText.textContent = 'Protection Active';
    elements.statusIndicator.classList.add('active');
  } else {
    elements.statusText.textContent = 'Protection Disabled';
    elements.statusIndicator.classList.remove('active');
  }
}

// Toggle settings availability
function toggleSettings(enabled) {
  const settingsElements = [
    elements.filterImages,
    elements.filterText,
    elements.strictMode,
    elements.blurLevel,
    elements.customWordInput,
    elements.addWordBtn
  ];
  
  settingsElements.forEach(el => {
    el.disabled = !enabled;
    if (el.parentElement) {
      el.parentElement.classList.toggle('disabled', !enabled);
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Main toggle
  elements.mainToggle.addEventListener('change', () => {
    config.enabled = elements.mainToggle.checked;
    saveConfiguration();
    updateStatus(config.enabled);
    toggleSettings(config.enabled);
    
    // Reload active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });
  
  // Filter settings
  elements.filterImages.addEventListener('change', () => {
    config.filterImages = elements.filterImages.checked;
    saveConfiguration();
  });
  
  elements.filterText.addEventListener('change', () => {
    config.filterText = elements.filterText.checked;
    saveConfiguration();
  });
  
  elements.strictMode.addEventListener('change', () => {
    config.strictMode = elements.strictMode.checked;
    saveConfiguration();
  });
  
  // Blur level
  elements.blurLevel.addEventListener('input', () => {
    config.blurLevel = parseInt(elements.blurLevel.value);
    elements.blurValue.textContent = config.blurLevel;
  });
  
  elements.blurLevel.addEventListener('change', () => {
    saveConfiguration();
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
  
  // Action buttons
  elements.refreshBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
        window.close();
      }
    });
  });
  
  elements.reportBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/yourusername/content-filter/issues' });
  });
  
  elements.resetBtn.addEventListener('click', resetToDefaults);
  elements.exportBtn.addEventListener('click', exportSettings);
}

// Add custom word to filter
function addCustomWord() {
  const word = elements.customWordInput.value.trim().toLowerCase();
  
  if (word && !config.customWords.includes(word)) {
    config.customWords.push(word);
    saveConfiguration();
    elements.customWordInput.value = '';
    displayCustomWords();
    
    // Show notification
    showNotification('Word added to filter');
  }
}

// Display custom words
function displayCustomWords() {
  elements.customWordsList.innerHTML = '';
  
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
  showNotification('Word removed from filter');
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
          showNotification(`${hostname} whitelisted`);
          
          // Reload the tab
          chrome.tabs.reload(tabs[0].id);
        } else {
          showNotification('Site already whitelisted');
        }
      } catch (e) {
        showNotification('Cannot whitelist this page');
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
      <button data-domain="${domain}">Remove</button>
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
  showNotification('Site removed from whitelist');
}

// Get current tab info
function getCurrentTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        
        // Update whitelist button text if already whitelisted
        if (config.whitelistedDomains.includes(hostname)) {
          elements.whitelistCurrentBtn.innerHTML = '<span>✓</span> Site Whitelisted';
          elements.whitelistCurrentBtn.disabled = true;
        }
      } catch (e) {
        // Invalid URL
      }
    }
  });
}

// Reset to defaults
function resetToDefaults() {
  if (confirm('Reset all settings to defaults? This will remove all custom words and whitelisted sites.')) {
    config = {
      enabled: true,
      filterImages: true,
      filterText: true,
      blurLevel: 20,
      strictMode: true,
      customWords: [],
      whitelistedDomains: [],
      statistics: config.statistics // Keep statistics
    };
    
    saveConfiguration();
    updateUI();
    showNotification('Settings reset to defaults');
  }
}

// Export settings
function exportSettings() {
  const exportData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config: config
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: `safe-browse-settings-${Date.now()}.json`,
    saveAs: true
  });
  
  showNotification('Settings exported');
}

// Save configuration to storage
function saveConfiguration() {
  chrome.storage.sync.set({ config }, () => {
    // Notify content scripts of configuration change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'configUpdate',
            config: config
          }).catch(() => {
            // Tab might not have content script
          });
        }
      });
    });
  });
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4b5563;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 1000;
    animation: slideUp 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Check ML Model Status
function checkMLStatus() {
  // Set initial loading state
  elements.mlStatus.textContent = 'Loading...';
  elements.mlStatus.className = 'ml-value loading';
  elements.profanityStatus.textContent = 'Loading...';
  elements.profanityStatus.className = 'ml-value loading';

  // Query active tab for ML status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // Send message to content script to get ML status
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getMLStatus' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded or not responding
          elements.mlStatus.textContent = 'Not Active';
          elements.mlStatus.className = 'ml-value';
          elements.profanityStatus.textContent = 'Not Active';
          elements.profanityStatus.className = 'ml-value';
          return;
        }

        if (response) {
          // Update ML model status
          if (response.mlDetectorReady) {
            elements.mlStatus.textContent = '✓ Ready (NSFWJS)';
            elements.mlStatus.className = 'ml-value ready';
          } else if (response.mlDetectorLoading) {
            elements.mlStatus.textContent = 'Loading Model...';
            elements.mlStatus.className = 'ml-value loading';
            // Check again in 2 seconds
            setTimeout(checkMLStatus, 2000);
          } else {
            elements.mlStatus.textContent = '⚠ Not Loaded';
            elements.mlStatus.className = 'ml-value error';
          }

          // Update profanity database status
          if (response.profanityReady) {
            elements.profanityStatus.textContent = '✓ Ready';
            elements.profanityStatus.className = 'ml-value ready';
          } else {
            elements.profanityStatus.textContent = '⚠ Not Loaded';
            elements.profanityStatus.className = 'ml-value error';
          }
        }
      });
    }
  });
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
