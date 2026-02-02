// Modern Popup Script

// State
let config = {
  enabled: true,
  filterText: true,
  filterImages: true,
  safeSearch: true,
  blockSites: true,
  strictMode: true,
  customWords: [],
  whitelistedDomains: []
};

let activeProfile = 'teen-safe';
let isPaused = false;
let pauseTimeout = null;

// DOM Elements
const elements = {};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  await checkPasswordLock();
  await loadConfiguration();
  await loadStatistics();
  setupEventListeners();
  updateUI();
});

// Cache DOM elements
function cacheElements() {
  elements.mainToggle = document.getElementById('mainToggle');
  elements.statusBadge = document.getElementById('statusBadge');
  elements.wordsFilteredToday = document.getElementById('wordsFilteredToday');
  elements.totalFiltered = document.getElementById('totalFiltered');
  elements.sitesBlocked = document.getElementById('sitesBlocked');
  elements.profileBtns = document.querySelectorAll('.profile-btn');
  elements.filterTextToggle = document.getElementById('filterTextToggle');
  elements.filterImagesToggle = document.getElementById('filterImagesToggle');
  elements.safeSearchToggle = document.getElementById('safeSearchToggle');
  elements.blockSitesToggle = document.getElementById('blockSitesToggle');
  elements.customWordInput = document.getElementById('customWordInput');
  elements.addWordBtn = document.getElementById('addWordBtn');
  elements.customWordsList = document.getElementById('customWordsList');
  elements.whitelistList = document.getElementById('whitelistList');
  elements.darkModeBtn = document.getElementById('darkModeBtn');
  elements.pauseBtn = document.getElementById('pauseBtn');
  elements.whitelistBtn = document.getElementById('whitelistBtn');
  elements.dashboardBtn = document.getElementById('dashboardBtn');
  elements.settingsLink = document.getElementById('settingsLink');
  elements.helpLink = document.getElementById('helpLink');
  elements.customWordsHeader = document.getElementById('customWordsHeader');
  elements.customWordsContent = document.getElementById('customWordsContent');
  elements.whitelistHeader = document.getElementById('whitelistHeader');
  elements.whitelistContent = document.getElementById('whitelistContent');
  elements.passwordLock = document.getElementById('passwordLock');
  elements.mainContent = document.getElementById('mainContent');
}

// Check password lock
async function checkPasswordLock() {
  if (typeof PasswordManager !== 'undefined') {
    const status = await PasswordManager.getStatus();
    if (status.enabled && !status.sessionValid) {
      elements.passwordLock.classList.remove('hidden');
      elements.mainContent.classList.add('hidden');

      document.getElementById('unlockBtn').addEventListener('click', async () => {
        const password = document.getElementById('passwordInput').value;
        try {
          await PasswordManager.unlock(password);
          elements.passwordLock.classList.add('hidden');
          elements.mainContent.classList.remove('hidden');
          document.getElementById('passwordError').classList.add('hidden');
        } catch (e) {
          document.getElementById('passwordError').classList.remove('hidden');
        }
      });

      document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          document.getElementById('unlockBtn').click();
        }
      });
    }
  }
}

// Load configuration
async function loadConfiguration() {
  const [syncResult, localResult] = await Promise.all([
    chrome.storage.sync.get(['config', 'activeProfile', 'darkMode', 'safeSearchConfig', 'imageDetectorConfig']),
    chrome.storage.local.get(['isPaused', 'pauseUntil'])
  ]);

  if (syncResult.config) {
    config = { ...config, ...syncResult.config };
  }

  activeProfile = syncResult.activeProfile || 'teen-safe';

  // Check dark mode
  if (syncResult.darkMode) {
    document.body.classList.add('dark-mode');
  }

  // Check pause status
  if (localResult.isPaused && localResult.pauseUntil > Date.now()) {
    isPaused = true;
    pauseTimeout = setTimeout(() => {
      resumeProtection();
    }, localResult.pauseUntil - Date.now());
  }

  // Additional settings
  if (syncResult.safeSearchConfig) {
    config.safeSearch = syncResult.safeSearchConfig.enabled !== false;
  }
  if (syncResult.imageDetectorConfig) {
    config.filterImages = syncResult.imageDetectorConfig.enabled !== false;
  }
}

// Load statistics
async function loadStatistics() {
  const result = await chrome.storage.local.get(['statistics', 'dailyStats']);
  const stats = result.statistics || {};
  const dailyStats = result.dailyStats || {};
  const today = new Date().toDateString();

  // Today's filtered count
  if (dailyStats.date === today) {
    elements.wordsFilteredToday.textContent = formatNumber(dailyStats.wordsFiltered || 0);
  }

  // Total filtered
  elements.totalFiltered.textContent = formatNumber(stats.wordsFiltered || 0);

  // Sites blocked
  elements.sitesBlocked.textContent = formatNumber(stats.sitesBlocked || 0);
}

// Setup event listeners
function setupEventListeners() {
  // Main toggle
  elements.mainToggle.addEventListener('change', toggleProtection);

  // Profile buttons
  elements.profileBtns.forEach(btn => {
    btn.addEventListener('click', () => selectProfile(btn.dataset.profile));
  });

  // Setting toggles
  elements.filterTextToggle.addEventListener('change', () => {
    config.filterText = elements.filterTextToggle.checked;
    saveConfiguration();
  });

  elements.filterImagesToggle.addEventListener('change', () => {
    config.filterImages = elements.filterImagesToggle.checked;
    saveConfiguration();
    chrome.storage.sync.set({
      imageDetectorConfig: { enabled: config.filterImages }
    });
  });

  elements.safeSearchToggle.addEventListener('change', () => {
    config.safeSearch = elements.safeSearchToggle.checked;
    saveConfiguration();
    chrome.storage.sync.set({
      safeSearchConfig: { enabled: config.safeSearch }
    });
  });

  elements.blockSitesToggle.addEventListener('change', () => {
    config.blockSites = elements.blockSitesToggle.checked;
    saveConfiguration();
  });

  // Custom words
  elements.addWordBtn.addEventListener('click', addCustomWord);
  elements.customWordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomWord();
  });

  // Quick actions
  elements.pauseBtn.addEventListener('click', togglePause);
  elements.whitelistBtn.addEventListener('click', whitelistCurrentSite);
  elements.dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'dashboard.html' });
  });

  // Dark mode
  elements.darkModeBtn.addEventListener('click', toggleDarkMode);

  // Footer links
  elements.settingsLink.addEventListener('click', () => {
    chrome.tabs.create({ url: 'settings.html' });
  });

  elements.helpLink.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/anthropics/claude-code/issues' });
  });

  // Collapsible sections
  elements.customWordsHeader.addEventListener('click', () => {
    elements.customWordsHeader.classList.toggle('active');
    elements.customWordsContent.classList.toggle('show');
  });

  elements.whitelistHeader.addEventListener('click', () => {
    elements.whitelistHeader.classList.toggle('active');
    elements.whitelistContent.classList.toggle('show');
  });
}

// Update UI
function updateUI() {
  // Main toggle
  elements.mainToggle.checked = config.enabled !== false && !isPaused;

  // Status badge
  if (!config.enabled || isPaused) {
    elements.statusBadge.textContent = isPaused ? 'Paused' : 'Disabled';
    elements.statusBadge.classList.add(isPaused ? 'paused' : 'disabled');
    elements.statusBadge.classList.remove(isPaused ? 'disabled' : 'paused');
  } else {
    elements.statusBadge.textContent = 'Active';
    elements.statusBadge.classList.remove('paused', 'disabled');
  }

  // Profile buttons
  elements.profileBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.profile === activeProfile);
  });

  // Setting toggles
  elements.filterTextToggle.checked = config.filterText !== false;
  elements.filterImagesToggle.checked = config.filterImages !== false;
  elements.safeSearchToggle.checked = config.safeSearch !== false;
  elements.blockSitesToggle.checked = config.blockSites !== false;

  // Pause button
  elements.pauseBtn.querySelector('span:last-child').textContent =
    isPaused ? 'Resume' : 'Pause 1hr';
  elements.pauseBtn.querySelector('.action-icon').textContent =
    isPaused ? '▶️' : '⏸️';

  // Custom words
  displayCustomWords();

  // Whitelist
  displayWhitelist();

  // Check current site whitelist status
  updateWhitelistButton();
}

// Toggle protection
function toggleProtection() {
  config.enabled = elements.mainToggle.checked;
  if (config.enabled && isPaused) {
    resumeProtection();
  }
  saveConfiguration();
  updateUI();
  reloadActiveTab();
}

// Select profile
async function selectProfile(profileId) {
  activeProfile = profileId;
  await chrome.storage.sync.set({ activeProfile });

  // Apply profile settings
  if (typeof FilterProfiles !== 'undefined') {
    const profile = await FilterProfiles.getProfile(profileId);
    if (profile) {
      config = { ...config, ...profile.settings };
      saveConfiguration();
    }
  }

  updateUI();
  reloadActiveTab();
}

// Toggle pause
function togglePause() {
  if (isPaused) {
    resumeProtection();
  } else {
    pauseProtection();
  }
}

// Pause protection
async function pauseProtection() {
  isPaused = true;
  const pauseUntil = Date.now() + (60 * 60 * 1000); // 1 hour

  await chrome.storage.local.set({ isPaused: true, pauseUntil });

  pauseTimeout = setTimeout(() => {
    resumeProtection();
  }, 60 * 60 * 1000);

  updateUI();
  notifyContentScripts({ action: 'pause' });
}

// Resume protection
async function resumeProtection() {
  isPaused = false;
  if (pauseTimeout) {
    clearTimeout(pauseTimeout);
    pauseTimeout = null;
  }

  await chrome.storage.local.set({ isPaused: false, pauseUntil: null });

  updateUI();
  notifyContentScripts({ action: 'resume' });
}

// Whitelist current site
async function whitelistCurrentSite() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;

  try {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    if (!config.whitelistedDomains.includes(hostname)) {
      config.whitelistedDomains.push(hostname);
      await saveConfiguration();
      displayWhitelist();
      updateWhitelistButton();
      reloadActiveTab();
    }
  } catch (e) {
    // Invalid URL
  }
}

// Update whitelist button
async function updateWhitelistButton() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;

  try {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    const isWhitelisted = config.whitelistedDomains.includes(hostname);

    elements.whitelistBtn.querySelector('span:last-child').textContent =
      isWhitelisted ? 'Whitelisted' : 'Whitelist';
    elements.whitelistBtn.querySelector('.action-icon').textContent =
      isWhitelisted ? '✓' : '✅';
  } catch (e) {
    // Invalid URL
  }
}

// Add custom word
function addCustomWord() {
  const word = elements.customWordInput.value.trim().toLowerCase();
  if (!word || config.customWords.includes(word)) return;

  config.customWords.push(word);
  elements.customWordInput.value = '';
  saveConfiguration();
  displayCustomWords();
}

// Display custom words
function displayCustomWords() {
  if (!config.customWords.length) {
    elements.customWordsList.innerHTML = '<div class="empty-state">No custom words added</div>';
    return;
  }

  elements.customWordsList.innerHTML = config.customWords.map(word => `
    <span class="tag">
      ${escapeHtml(word)}
      <button data-word="${escapeHtml(word)}">&times;</button>
    </span>
  `).join('');

  // Add remove handlers
  elements.customWordsList.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const word = btn.dataset.word;
      config.customWords = config.customWords.filter(w => w !== word);
      saveConfiguration();
      displayCustomWords();
    });
  });
}

// Display whitelist
function displayWhitelist() {
  if (!config.whitelistedDomains.length) {
    elements.whitelistList.innerHTML = '<div class="empty-state">No whitelisted sites</div>';
    return;
  }

  elements.whitelistList.innerHTML = config.whitelistedDomains.map(domain => `
    <div class="whitelist-item">
      <span>${escapeHtml(domain)}</span>
      <button data-domain="${escapeHtml(domain)}">&times;</button>
    </div>
  `).join('');

  // Add remove handlers
  elements.whitelistList.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const domain = btn.dataset.domain;
      config.whitelistedDomains = config.whitelistedDomains.filter(d => d !== domain);
      saveConfiguration();
      displayWhitelist();
    });
  });
}

// Toggle dark mode
async function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  elements.darkModeBtn.textContent = isDark ? '☀️' : '🌙';
  await chrome.storage.sync.set({ darkMode: isDark });
}

// Save configuration
async function saveConfiguration() {
  const configToSave = { ...config };
  delete configToSave.statistics;

  await chrome.storage.sync.set({ config: configToSave });
  notifyContentScripts({ action: 'configUpdate', config: configToSave });
}

// Notify content scripts
function notifyContentScripts(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {});
      }
    });
  });
}

// Reload active tab
function reloadActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}

// Helper functions
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-refresh stats
setInterval(loadStatistics, 5000);
