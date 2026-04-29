// Settings Page JavaScript

if (typeof window !== 'undefined' && (!window.chrome || !window.chrome.storage?.sync || !window.chrome.storage?.local)) {
  window.chrome = createSettingsPreviewChrome(window.chrome || {});
}

function createSettingsPreviewChrome(existingChrome) {
  const memoryStore = {
    sync: {},
    local: {},
    session: {}
  };

  function readStore(areaName) {
    if (areaName === 'session') {
      return memoryStore.session;
    }

    try {
      const stored = window.localStorage.getItem(`safeBrowsePreview:${areaName}`);
      memoryStore[areaName] = stored ? JSON.parse(stored) : memoryStore[areaName];
    } catch {
      memoryStore[areaName] = memoryStore[areaName] || {};
    }

    return memoryStore[areaName];
  }

  function writeStore(areaName, value) {
    memoryStore[areaName] = value;
    if (areaName === 'session') return;

    try {
      window.localStorage.setItem(`safeBrowsePreview:${areaName}`, JSON.stringify(value));
    } catch {
      // Local file previews can block storage in some browsers; in-memory state is enough.
    }
  }

  function callbackResult(value, callback) {
    if (typeof callback === 'function') {
      setTimeout(() => callback(value), 0);
    }
    return Promise.resolve(value);
  }

  function pickValues(keys, store) {
    if (keys === null || keys === undefined) {
      return { ...store };
    }
    if (Array.isArray(keys)) {
      return keys.reduce((result, key) => {
        result[key] = store[key];
        return result;
      }, {});
    }
    if (typeof keys === 'string') {
      return { [keys]: store[keys] };
    }
    if (typeof keys === 'object') {
      return Object.keys(keys).reduce((result, key) => {
        result[key] = store[key] === undefined ? keys[key] : store[key];
        return result;
      }, {});
    }
    return {};
  }

  function createStorageArea(areaName) {
    return {
      get(keys, callback) {
        const store = readStore(areaName);
        return callbackResult(pickValues(keys, store), callback);
      },
      set(items, callback) {
        writeStore(areaName, { ...readStore(areaName), ...items });
        return callbackResult(undefined, callback);
      },
      remove(keys, callback) {
        const store = { ...readStore(areaName) };
        const keysToRemove = Array.isArray(keys) ? keys : [keys];
        keysToRemove.forEach(key => delete store[key]);
        writeStore(areaName, store);
        return callbackResult(undefined, callback);
      },
      clear(callback) {
        writeStore(areaName, {});
        return callbackResult(undefined, callback);
      }
    };
  }

  return {
    ...existingChrome,
    storage: {
      ...(existingChrome.storage || {}),
      sync: createStorageArea('sync'),
      local: createStorageArea('local'),
      session: createStorageArea('session')
    },
    tabs: {
      ...(existingChrome.tabs || {}),
      query(queryInfo, callback) {
        const tabs = [];
        return callbackResult(tabs, callback);
      },
      sendMessage() {
        return Promise.resolve();
      },
      create({ url } = {}) {
        if (url) window.location.href = url;
        return Promise.resolve();
      },
      reload() {
        return Promise.resolve();
      }
    },
    runtime: {
      ...(existingChrome.runtime || {}),
      lastError: null
    }
  };
}

// Current configuration
const DEFAULT_CONFIG = {
  enabled: true,
  filterText: true,
  filterImages: true,
  blockSites: true,
  safeSearch: true,
  showBadge: true,
  customWords: [],
  whitelistedDomains: [],
  customBlocklist: []
};

const DEFAULT_IMAGE_CONFIG = {
  enabled: true,
  placeholderEnabled: true,
  checkUrlPatterns: true
};

let config = { ...DEFAULT_CONFIG };
let passwordStatus = { enabled: false };
let passwordOverlayBound = false;
let unlockPromise = null;
let resolveUnlock = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await checkPasswordLock();
  await loadConfiguration();
  setupNavigation();
  setupEventListeners();
  loadProfiles();
});

// Check if settings are password protected
async function checkPasswordLock() {
  if (typeof PasswordManager !== 'undefined') {
    passwordStatus = await PasswordManager.getStatus();

    if (passwordStatus.enabled && !passwordStatus.sessionValid) {
      showPasswordOverlay();
    }
  }
}

// Show password overlay
function showPasswordOverlay() {
  const overlay = document.getElementById('passwordOverlay');
  overlay.classList.remove('hidden');

  if (!unlockPromise) {
    unlockPromise = new Promise(resolve => {
      resolveUnlock = resolve;
    });
  }

  const passwordInput = document.getElementById('passwordInput');
  passwordInput.value = '';
  setTimeout(() => passwordInput.focus(), 0);

  if (passwordOverlayBound) {
    return unlockPromise;
  }

  passwordOverlayBound = true;

  document.getElementById('unlockBtn').addEventListener('click', async () => {
    const password = document.getElementById('passwordInput').value;

    try {
      await PasswordManager.unlock(password);
      passwordStatus = await PasswordManager.getStatus();
      overlay.classList.add('hidden');
      document.getElementById('passwordError').classList.add('hidden');
      const resolver = resolveUnlock;
      unlockPromise = null;
      resolveUnlock = null;
      resolver?.(true);
    } catch (e) {
      document.getElementById('passwordError').classList.remove('hidden');
    }
  });

  document.getElementById('passwordInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      document.getElementById('unlockBtn').click();
    }
  });

  return unlockPromise;
}

async function ensureSettingsUnlocked() {
  if (typeof PasswordManager === 'undefined') return true;

  passwordStatus = await PasswordManager.getStatus();
  if (!passwordStatus.enabled || passwordStatus.sessionValid) return true;

  await showPasswordOverlay();
  passwordStatus = await PasswordManager.getStatus();
  return !passwordStatus.enabled || passwordStatus.sessionValid;
}

// Load configuration
async function loadConfiguration() {
  const [syncResult, localResult] = await Promise.all([
    chrome.storage.sync.get(null),
    chrome.storage.local.get(['passwordEnabled'])
  ]);

  const imageConfig = { ...DEFAULT_IMAGE_CONFIG, ...(syncResult.imageDetectorConfig || {}) };
  config = {
    ...DEFAULT_CONFIG,
    ...(syncResult.config || {}),
    filterImages: imageConfig.enabled !== false
  };
  if (syncResult.safeSearchConfig) {
    config.safeSearch = syncResult.safeSearchConfig.enabled !== false;
  }

  // Apply settings to UI
  applyConfigToUI(config);
  applyImageConfigToUI(imageConfig);

  // Password
  if (localResult.passwordEnabled) {
    document.getElementById('passwordEnabled').checked = true;
  }
}

// Apply config to UI elements
function applyConfigToUI(cfg) {
  // General
  if (cfg.enabled !== undefined) {
    document.getElementById('enableProtection').checked = cfg.enabled !== false;
  }
  if (cfg.showBadge !== undefined) {
    document.getElementById('showBadge').checked = cfg.showBadge !== false;
  }

  // Text filtering
  if (cfg.filterText !== undefined) {
    document.getElementById('filterText').checked = cfg.filterText !== false;
  }

  displayCustomWords(cfg.customWords || []);

  // Site blocking
  if (cfg.blockSites !== undefined) {
    document.getElementById('blockSites').checked = cfg.blockSites !== false;
  }
  if (cfg.safeSearch !== undefined) {
    document.getElementById('safeSearch').checked = cfg.safeSearch !== false;
  }

  displayWhitelist(cfg.whitelistedDomains || []);
  displayBlocklist(cfg.customBlocklist || []);
}

function applyImageConfigToUI(imageConfig) {
  if (imageConfig.enabled !== undefined) {
    document.getElementById('filterImages').checked = imageConfig.enabled !== false;
  }
  if (imageConfig.placeholderEnabled !== undefined) {
    document.getElementById('imagePlaceholder').checked = imageConfig.placeholderEnabled !== false;
  }
  if (imageConfig.checkUrlPatterns !== undefined) {
    document.getElementById('checkUrlPatterns').checked = imageConfig.checkUrlPatterns !== false;
  }
}

// Setup navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.settings-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;

      // Update nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update sections
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${sectionId}`).classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // General settings
  document.getElementById('enableProtection').addEventListener('change', saveGeneralSettings);
  document.getElementById('showBadge').addEventListener('change', saveGeneralSettings);

  // Text filtering
  document.getElementById('filterText').addEventListener('change', saveTextSettings);
  document.getElementById('addWordBtn').addEventListener('click', addCustomWord);
  document.getElementById('customWordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomWord();
  });

  // Site blocking
  document.getElementById('blockSites').addEventListener('change', saveSiteSettings);
  document.getElementById('safeSearch').addEventListener('change', saveSiteSettings);
  document.getElementById('addWhitelistBtn').addEventListener('click', addWhitelistDomain);
  document.getElementById('addBlocklistBtn').addEventListener('click', addBlocklistDomain);

  // Image filtering
  document.getElementById('filterImages').addEventListener('change', saveImageSettings);
  document.getElementById('imagePlaceholder').addEventListener('change', saveImageSettings);
  document.getElementById('checkUrlPatterns').addEventListener('change', saveImageSettings);

  // Parental controls
  document.getElementById('passwordEnabled').addEventListener('change', togglePasswordSettings);
  document.getElementById('setPasswordBtn').addEventListener('click', setPassword);

  // Profiles
  document.getElementById('createProfileBtn').addEventListener('click', createCustomProfile);

  // Backup
  document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);
  document.getElementById('importFile').addEventListener('change', handleImportFile);
  document.getElementById('importSettingsBtn').addEventListener('click', importSettings);
  document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
}

// Save functions
async function saveGeneralSettings() {
  if (!(await ensureSettingsUnlocked())) {
    await loadConfiguration();
    return;
  }

  config.enabled = document.getElementById('enableProtection').checked;
  config.showBadge = document.getElementById('showBadge').checked;

  await chrome.storage.sync.set({ config });
  notifyContentScripts();
}

async function saveTextSettings() {
  if (!(await ensureSettingsUnlocked())) {
    await loadConfiguration();
    return;
  }

  config.filterText = document.getElementById('filterText').checked;

  await chrome.storage.sync.set({ config });
  notifyContentScripts();
}

async function saveSiteSettings() {
  if (!(await ensureSettingsUnlocked())) {
    await loadConfiguration();
    return;
  }

  config.blockSites = document.getElementById('blockSites').checked;
  config.safeSearch = document.getElementById('safeSearch').checked;

  config.blockCategories = ['adult'];

  await chrome.storage.sync.set({
    config,
    safeSearchConfig: { enabled: config.safeSearch }
  });
  notifyContentScripts();
}

async function saveImageSettings() {
  if (!(await ensureSettingsUnlocked())) {
    await loadConfiguration();
    return;
  }

  const imageConfig = {
    enabled: document.getElementById('filterImages').checked,
    placeholderEnabled: document.getElementById('imagePlaceholder').checked,
    checkUrlPatterns: document.getElementById('checkUrlPatterns').checked
  };

  config.filterImages = imageConfig.enabled;
  await chrome.storage.sync.set({ config, imageDetectorConfig: imageConfig });
  notifyContentScripts();
}

// Password settings
async function togglePasswordSettings() {
  const enabled = document.getElementById('passwordEnabled').checked;
  const settings = document.getElementById('passwordSettings');

  if (!enabled && passwordStatus.enabled && !(await ensureSettingsUnlocked())) {
    document.getElementById('passwordEnabled').checked = true;
    return;
  }

  settings.classList.toggle('hidden', !enabled);

  if (!enabled && passwordStatus.enabled) {
    await chrome.storage.local.remove(['passwordHash', 'passwordEnabled', 'passwordSetAt']);
    await PasswordManager.clearSession();
    passwordStatus = await PasswordManager.getStatus();
  }
}

async function setPassword() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword.length < 4) {
    alert('Password must be at least 4 characters');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    await PasswordManager.setPassword(newPassword);
    await PasswordManager.clearSession();
    passwordStatus = await PasswordManager.getStatus();
    document.getElementById('passwordEnabled').checked = true;
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordSettings').classList.add('hidden');
    alert('Password set successfully. Settings are locked now.');
    showPasswordOverlay();
  } catch (e) {
    alert('Failed to set password: ' + e.message);
  }
}

// Custom words
async function addCustomWord() {
  if (!(await ensureSettingsUnlocked())) return;

  const input = document.getElementById('customWordInput');
  const word = input.value.trim().toLowerCase();

  if (!word) return;

  config.customWords = config.customWords || [];
  if (!config.customWords.includes(word)) {
    config.customWords.push(word);
    await chrome.storage.sync.set({ config });
    displayCustomWords(config.customWords);
    notifyContentScripts();
  }

  input.value = '';
}

function displayCustomWords(words) {
  const container = document.getElementById('customWordsList');
  if (!words || words.length === 0) {
    container.innerHTML = '<div class="empty-state">No custom words added</div>';
    return;
  }

  container.innerHTML = words.map(word => `
    <span class="tag">
      ${escapeHtml(word)}
      <button data-word="${escapeHtml(word)}">&times;</button>
    </span>
  `).join('');

  container.querySelectorAll('button[data-word]').forEach(btn => {
    btn.addEventListener('click', () => removeCustomWord(btn.dataset.word));
  });
}

async function removeCustomWord(word) {
  if (!(await ensureSettingsUnlocked())) return;

  config.customWords = config.customWords.filter(w => w !== word);
  await chrome.storage.sync.set({ config });
  displayCustomWords(config.customWords);
  notifyContentScripts();
}

// Whitelist
async function addWhitelistDomain() {
  if (!(await ensureSettingsUnlocked())) return;

  const input = document.getElementById('whitelistInput');
  const domain = normalizeDomainInput(input.value);

  if (!domain) return;

  config.whitelistedDomains = config.whitelistedDomains || [];
  if (!config.whitelistedDomains.some(existing => domainMatches(domain, existing))) {
    config.whitelistedDomains.push(domain);
    await chrome.storage.sync.set({ config });
    displayWhitelist(config.whitelistedDomains);
    notifyContentScripts();
  }

  input.value = '';
}

function displayWhitelist(domains) {
  const container = document.getElementById('whitelistList');
  if (!domains || domains.length === 0) {
    container.innerHTML = '<div class="empty-state">No whitelisted sites</div>';
    return;
  }

  container.innerHTML = domains.map(domain => `
    <div class="list-item">
      <span>${escapeHtml(domain)}</span>
      <button data-domain="${escapeHtml(domain)}">&times;</button>
    </div>
  `).join('');

  container.querySelectorAll('button[data-domain]').forEach(btn => {
    btn.addEventListener('click', () => removeWhitelistDomain(btn.dataset.domain));
  });
}

async function removeWhitelistDomain(domain) {
  if (!(await ensureSettingsUnlocked())) return;

  config.whitelistedDomains = config.whitelistedDomains.filter(d => d !== domain);
  await chrome.storage.sync.set({ config });
  displayWhitelist(config.whitelistedDomains);
  notifyContentScripts();
}

// Blocklist
async function addBlocklistDomain() {
  if (!(await ensureSettingsUnlocked())) return;

  const input = document.getElementById('blocklistInput');
  const domain = normalizeDomainInput(input.value);

  if (!domain) return;

  config.customBlocklist = config.customBlocklist || [];
  if (!config.customBlocklist.some(existing => domainMatches(domain, existing))) {
    config.customBlocklist.push(domain);
    await chrome.storage.sync.set({ config });
    displayBlocklist(config.customBlocklist);
    notifyContentScripts();
  }

  input.value = '';
}

function displayBlocklist(domains) {
  const container = document.getElementById('blocklistList');
  if (!container) return;
  if (!domains || domains.length === 0) {
    container.innerHTML = '<div class="empty-state">No blocked sites</div>';
    return;
  }

  container.innerHTML = (domains || []).map(domain => `
    <div class="list-item">
      <span>${escapeHtml(domain)}</span>
      <button data-domain="${escapeHtml(domain)}">&times;</button>
    </div>
  `).join('');

  container.querySelectorAll('button[data-domain]').forEach(btn => {
    btn.addEventListener('click', () => removeBlocklistDomain(btn.dataset.domain));
  });
}

async function removeBlocklistDomain(domain) {
  if (!(await ensureSettingsUnlocked())) return;

  config.customBlocklist = config.customBlocklist.filter(d => d !== domain);
  await chrome.storage.sync.set({ config });
  displayBlocklist(config.customBlocklist);
  notifyContentScripts();
}

// Profiles
async function loadProfiles() {
  if (typeof FilterProfiles === 'undefined') return;

  const profiles = await FilterProfiles.getAllProfiles();
  const current = await FilterProfiles.getCurrentProfile();
  const container = document.getElementById('profilesGrid');

  container.innerHTML = Object.values(profiles).map(profile => `
    <div class="profile-card ${profile.id === current.id ? 'active' : ''}" data-profile="${profile.id}">
      <div class="profile-icon">${profile.icon}</div>
      <div class="profile-name">${escapeHtml(profile.name)}</div>
      <div class="profile-description">${escapeHtml(profile.description)}</div>
    </div>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('click', async () => {
      if (!(await ensureSettingsUnlocked())) return;

      const profileId = card.dataset.profile;
      await FilterProfiles.setActiveProfile(profileId);
      loadProfiles();
      loadConfiguration();
    });
  });

}

async function createCustomProfile() {
  if (typeof FilterProfiles === 'undefined') return;
  if (!(await ensureSettingsUnlocked())) return;

  const name = document.getElementById('customProfileName').value.trim();
  if (!name) return;

  await FilterProfiles.createCustomProfile(name, config);
  document.getElementById('customProfileName').value = '';
  loadProfiles();
}

// Export settings
async function exportSettings() {
  if (!(await ensureSettingsUnlocked())) return;

  const syncData = await chrome.storage.sync.get(null);

  const exportData = {
    type: 'safe-browse-settings',
    version: '2.0',
    exportDate: new Date().toISOString(),
    config: syncData.config || {},
    profiles: syncData.customProfiles || {},
    activeProfile: syncData.activeProfile,
    imageDetectorConfig: syncData.imageDetectorConfig || {}
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `safe-browse-settings-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Import settings
let importData = null;

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      importData = JSON.parse(event.target.result);
      if (importData.type !== 'safe-browse-settings') {
        alert('Invalid settings file');
        importData = null;
        return;
      }
      document.getElementById('importSettingsBtn').disabled = false;
    } catch (err) {
      alert('Failed to read settings file');
      importData = null;
    }
  };
  reader.readAsText(file);
}

async function importSettings() {
  if (!importData) return;
  if (!(await ensureSettingsUnlocked())) return;

  if (!confirm('This will replace your current settings. Continue?')) return;

  await chrome.storage.sync.set({
    config: { ...DEFAULT_CONFIG, ...(importData.config || {}) },
    customProfiles: importData.profiles || {},
    activeProfile: importData.activeProfile || 'teen-safe',
    imageDetectorConfig: { ...DEFAULT_IMAGE_CONFIG, ...(importData.imageDetectorConfig || {}) }
  });

  alert('Settings imported successfully');
  location.reload();
}

// Reset settings
async function resetSettings() {
  if (!(await ensureSettingsUnlocked())) return;

  if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) return;

  await chrome.storage.sync.clear();
  await chrome.storage.sync.set({
    config: { ...DEFAULT_CONFIG },
    activeProfile: 'teen-safe',
    imageDetectorConfig: { ...DEFAULT_IMAGE_CONFIG },
    safeSearchConfig: { enabled: true }
  });
  await chrome.storage.local.remove(['passwordHash', 'passwordEnabled', 'passwordSetAt']);
  await chrome.storage.session?.remove?.(['unlockSession']);

  alert('Settings reset to defaults');
  location.reload();
}

// Notify content scripts of config changes
function notifyContentScripts() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'configUpdate',
          config
        }).catch(() => {});
      }
    });
  });
}

// Helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function normalizeDomainInput(input) {
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
  const host = normalizeDomainInput(hostname);
  const domain = normalizeDomainInput(configuredDomain);
  return Boolean(domain && (host === domain || host.endsWith(`.${domain}`)));
}
