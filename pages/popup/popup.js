// Modern Popup Script

const hasExtensionApi = typeof chrome !== 'undefined'
  && chrome.storage?.sync
  && chrome.storage?.local
  && chrome.tabs
  && chrome.runtime;
const extensionApi = hasExtensionApi ? chrome : createPreviewApi();

if (!hasExtensionApi && typeof window !== 'undefined') {
  window.chrome = extensionApi;
}

function createPreviewApi() {
  const syncStore = {};
  const localStore = {
    statistics: { wordsFiltered: 1280, sitesBlocked: 14, imagesBlocked: 8, searchesFiltered: 4 },
    dailyStats: {
      date: new Date().toDateString(),
      wordsFiltered: 38,
      sitesBlocked: 2,
      imagesBlocked: 3,
      searchesFiltered: 1
    }
  };
  const sessionStore = {};

  const readStore = (store, keys) => {
    if (Array.isArray(keys)) {
      return Object.fromEntries(keys.map(key => [key, store[key]]));
    }
    if (typeof keys === 'string') {
      return { [keys]: store[keys] };
    }
    if (keys && typeof keys === 'object') {
      return Object.fromEntries(
        Object.keys(keys).map(key => [key, store[key] ?? keys[key]])
      );
    }
    return { ...store };
  };

  const storageArea = store => ({
    get(keys) {
      return Promise.resolve(readStore(store, keys));
    },
    set(values) {
      Object.assign(store, values);
      return Promise.resolve();
    },
    remove(keys) {
      const keysToRemove = Array.isArray(keys) ? keys : [keys];
      keysToRemove.forEach(key => delete store[key]);
      return Promise.resolve();
    }
  });

  const queryTabs = (query, callback) => {
    const tabs = [{ id: 1, url: window.location.href }];
    if (callback) {
      callback(tabs);
      return undefined;
    }
    return Promise.resolve(tabs);
  };

  return {
    storage: {
      sync: storageArea(syncStore),
      local: storageArea(localStore),
      session: storageArea(sessionStore)
    },
    tabs: {
      query: queryTabs,
      create({ url }) {
        window.location.href = url;
        return Promise.resolve();
      },
      sendMessage() {
        return Promise.resolve();
      },
      reload() {
        return Promise.resolve();
      }
    },
    runtime: {
      getURL(path) {
        return `../../${path}`;
      }
    }
  };
}

// State
let config = {
  enabled: true,
  filterText: true,
  filterImages: true,
  safeSearch: true,
  blockSites: true,
  customWords: [],
  whitelistedDomains: []
};

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
  elements.filterTextToggle = document.getElementById('filterTextToggle');
  elements.filterImagesToggle = document.getElementById('filterImagesToggle');
  elements.safeSearchToggle = document.getElementById('safeSearchToggle');
  elements.blockSitesToggle = document.getElementById('blockSitesToggle');
  elements.customWordInput = document.getElementById('customWordInput');
  elements.addWordBtn = document.getElementById('addWordBtn');
  elements.customWordsList = document.getElementById('customWordsList');
  elements.whitelistList = document.getElementById('whitelistList');
  elements.pauseBtn = document.getElementById('pauseBtn');
  elements.whitelistBtn = document.getElementById('whitelistBtn');
  elements.dashboardBtn = document.getElementById('dashboardBtn');
  elements.settingsLink = document.getElementById('settingsLink');
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
    extensionApi.storage.sync.get(['config', 'safeSearchConfig', 'imageDetectorConfig']),
    extensionApi.storage.local.get(['isPaused', 'pauseUntil'])
  ]);

  if (syncResult.config) {
    config = { ...config, ...syncResult.config };
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
  const result = await extensionApi.storage.local.get(['statistics', 'dailyStats']);
  const stats = result.statistics || {};
  const dailyStats = result.dailyStats || {};
  const today = new Date().toDateString();

  // Today's filtered count
  if (dailyStats.date === today) {
    elements.wordsFilteredToday.textContent = formatNumber(sumFilterCounts(dailyStats));
  }

  // Total filtered
  elements.totalFiltered.textContent = formatNumber(sumFilterCounts(stats));

  // Sites blocked
  elements.sitesBlocked.textContent = formatNumber(stats.sitesBlocked || 0);
}

// Setup event listeners
function setupEventListeners() {
  // Main toggle
  elements.mainToggle.addEventListener('change', toggleProtection);

  // Setting toggles
  elements.filterTextToggle.addEventListener('change', async () => {
    config.filterText = elements.filterTextToggle.checked;
    await saveConfiguration();
    reloadActiveTab();
  });

  elements.filterImagesToggle.addEventListener('change', async () => {
    config.filterImages = elements.filterImagesToggle.checked;
    await saveConfiguration();
    const result = await extensionApi.storage.sync.get(['imageDetectorConfig']);
    await extensionApi.storage.sync.set({
      imageDetectorConfig: {
        ...(result.imageDetectorConfig || {}),
        enabled: config.filterImages
      }
    });
    reloadActiveTab();
  });

  elements.safeSearchToggle.addEventListener('change', async () => {
    config.safeSearch = elements.safeSearchToggle.checked;
    await saveConfiguration();
    await extensionApi.storage.sync.set({
      safeSearchConfig: { enabled: config.safeSearch }
    });
    reloadActiveTab();
  });

  elements.blockSitesToggle.addEventListener('change', async () => {
    config.blockSites = elements.blockSitesToggle.checked;
    await saveConfiguration();
    reloadActiveTab();
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
    extensionApi.tabs.create({ url: extensionApi.runtime.getURL('pages/dashboard/dashboard.html') });
  });

  // Footer links
  elements.settingsLink.addEventListener('click', () => {
    extensionApi.tabs.create({ url: extensionApi.runtime.getURL('pages/settings/settings.html') });
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

  // Setting toggles
  elements.filterTextToggle.checked = config.filterText !== false;
  elements.filterImagesToggle.checked = config.filterImages !== false;
  elements.safeSearchToggle.checked = config.safeSearch !== false;
  elements.blockSitesToggle.checked = config.blockSites !== false;

  // Pause button
  elements.pauseBtn.querySelector('span:last-child').textContent =
    isPaused ? 'Resume' : 'Pause 1hr';
  elements.pauseBtn.querySelector('.action-icon').textContent =
    isPaused ? 'Go' : 'II';

  // Custom words
  displayCustomWords();

  // Whitelist
  displayWhitelist();

  // Check current site whitelist status
  updateWhitelistButton();
}

// Toggle protection
async function toggleProtection() {
  config.enabled = elements.mainToggle.checked;
  if (config.enabled && isPaused) {
    await resumeProtection();
  }
  await saveConfiguration();
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

  await extensionApi.storage.local.set({ isPaused: true, pauseUntil });

  pauseTimeout = setTimeout(() => {
    resumeProtection();
  }, 60 * 60 * 1000);

  updateUI();
  notifyContentScripts({ action: 'pause' });
  reloadActiveTab();
}

// Resume protection
async function resumeProtection() {
  isPaused = false;
  if (pauseTimeout) {
    clearTimeout(pauseTimeout);
    pauseTimeout = null;
  }

  await extensionApi.storage.local.set({ isPaused: false, pauseUntil: null });

  updateUI();
  notifyContentScripts({ action: 'resume' });
  reloadActiveTab();
}

// Whitelist current site
async function whitelistCurrentSite() {
  const tabs = await extensionApi.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;

  try {
    const url = new URL(tabs[0].url);
    const hostname = normalizeHostname(url.hostname);

    if (!config.whitelistedDomains.some(domain => domainMatches(hostname, domain))) {
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
  const tabs = await extensionApi.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;

  try {
    const url = new URL(tabs[0].url);
    const hostname = normalizeHostname(url.hostname);
    const isWhitelisted = config.whitelistedDomains.some(domain => domainMatches(hostname, domain));

    elements.whitelistBtn.querySelector('span:last-child').textContent =
      isWhitelisted ? 'Whitelisted' : 'Whitelist';
    elements.whitelistBtn.querySelector('.action-icon').textContent =
      isWhitelisted ? 'OK' : '+';
  } catch (e) {
    // Invalid URL
  }
}

// Add custom word
async function addCustomWord() {
  const word = elements.customWordInput.value.trim().toLowerCase();
  if (!word || config.customWords.includes(word)) return;

  config.customWords.push(word);
  elements.customWordInput.value = '';
  await saveConfiguration();
  displayCustomWords();
  reloadActiveTab();
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
    btn.addEventListener('click', async () => {
      const word = btn.dataset.word;
      config.customWords = config.customWords.filter(w => w !== word);
      await saveConfiguration();
      displayCustomWords();
      reloadActiveTab();
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
    btn.addEventListener('click', async () => {
      const domain = btn.dataset.domain;
      config.whitelistedDomains = config.whitelistedDomains.filter(d => d !== domain);
      await saveConfiguration();
      displayWhitelist();
      reloadActiveTab();
    });
  });
}

// Save configuration
async function saveConfiguration() {
  const configToSave = { ...config };
  delete configToSave.statistics;

  await extensionApi.storage.sync.set({ config: configToSave });
  notifyContentScripts({ action: 'configUpdate', config: configToSave });
}

// Notify content scripts
function notifyContentScripts(message) {
  extensionApi.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        extensionApi.tabs.sendMessage(tab.id, message).catch(() => {});
      }
    });
  });
}

// Reload active tab
function reloadActiveTab() {
  extensionApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      extensionApi.tabs.reload(tabs[0].id);
    }
  });
}

// Helper functions
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function sumFilterCounts(stats = {}) {
  return (stats.wordsFiltered || 0) +
    (stats.sitesBlocked || 0) +
    (stats.imagesBlocked || 0) +
    (stats.searchesFiltered || 0);
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-refresh stats
setInterval(loadStatistics, 5000);
