// Settings Page JavaScript

// Current configuration
let config = {};
let passwordStatus = { enabled: false };

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await checkPasswordLock();
  await loadConfiguration();
  setupNavigation();
  setupEventListeners();
  loadProfiles();
  generateScheduleGrid();
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

  document.getElementById('unlockBtn').addEventListener('click', async () => {
    const password = document.getElementById('passwordInput').value;

    try {
      await PasswordManager.unlock(password);
      overlay.classList.add('hidden');
      document.getElementById('passwordError').classList.add('hidden');
    } catch (e) {
      document.getElementById('passwordError').classList.remove('hidden');
    }
  });

  document.getElementById('passwordInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      document.getElementById('unlockBtn').click();
    }
  });
}

// Load configuration
async function loadConfiguration() {
  const [syncResult, localResult] = await Promise.all([
    chrome.storage.sync.get(null),
    chrome.storage.local.get(['passwordEnabled'])
  ]);

  config = syncResult.config || {};

  // Apply settings to UI
  applyConfigToUI(config);
  applyConfigToUI(syncResult);

  // Dark mode
  if (syncResult.darkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkMode').checked = true;
  }

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
  if (cfg.filterLanguage) {
    document.getElementById('filterLanguage').value = cfg.filterLanguage;
  }

  // Text filtering
  if (cfg.filterText !== undefined) {
    document.getElementById('filterText').checked = cfg.filterText !== false;
  }
  if (cfg.strictMode !== undefined) {
    document.getElementById('strictMode').checked = cfg.strictMode !== false;
  }
  if (cfg.filterLevel) {
    document.getElementById('filterLevel').value = cfg.filterLevel;
  }

  // Custom words
  if (cfg.customWords && cfg.customWords.length > 0) {
    displayCustomWords(cfg.customWords);
  }

  // Site blocking
  if (cfg.blockSites !== undefined) {
    document.getElementById('blockSites').checked = cfg.blockSites !== false;
  }
  if (cfg.safeSearch !== undefined) {
    document.getElementById('safeSearch').checked = cfg.safeSearch !== false;
  }

  // Block categories
  if (cfg.blockCategories) {
    cfg.blockCategories.forEach(cat => {
      const checkbox = document.querySelector(`#categoriesGrid input[value="${cat}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }

  // Whitelist
  if (cfg.whitelistedDomains && cfg.whitelistedDomains.length > 0) {
    displayWhitelist(cfg.whitelistedDomains);
  }

  // Image filtering
  if (cfg.filterImages !== undefined) {
    document.getElementById('filterImages').checked = cfg.filterImages !== false;
  }
  if (cfg.imagePlaceholder !== undefined) {
    document.getElementById('imagePlaceholder').checked = cfg.imagePlaceholder !== false;
  }
  if (cfg.checkUrlPatterns !== undefined) {
    document.getElementById('checkUrlPatterns').checked = cfg.checkUrlPatterns !== false;
  }

  // Schedule
  if (cfg.schedule) {
    document.getElementById('scheduleEnabled').checked = cfg.schedule.enabled;
    if (cfg.schedule.bedtimeMode) {
      document.getElementById('bedtimeEnabled').checked = cfg.schedule.bedtimeMode.enabled;
      document.getElementById('bedtimeStart').value = cfg.schedule.bedtimeMode.start || '22:00';
      document.getElementById('bedtimeEnd').value = cfg.schedule.bedtimeMode.end || '07:00';
    }
  }

  // Notifications
  if (cfg.notificationConfig) {
    document.getElementById('notificationsEnabled').checked = cfg.notificationConfig.enabled !== false;
    document.getElementById('dailySummary').checked = cfg.notificationConfig.dailySummary === true;
  }

  // Time limits
  if (cfg.schedule?.dailyLimits) {
    document.getElementById('limitSocialMedia').value = cfg.schedule.dailyLimits.socialMedia || 120;
    document.getElementById('limitGaming').value = cfg.schedule.dailyLimits.gaming || 60;
    document.getElementById('limitStreaming').value = cfg.schedule.dailyLimits.streaming || 180;
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
  document.getElementById('darkMode').addEventListener('change', toggleDarkMode);
  document.getElementById('showBadge').addEventListener('change', saveGeneralSettings);
  document.getElementById('filterLanguage').addEventListener('change', saveGeneralSettings);

  // Text filtering
  document.getElementById('filterText').addEventListener('change', saveTextSettings);
  document.getElementById('strictMode').addEventListener('change', saveTextSettings);
  document.getElementById('filterLevel').addEventListener('change', saveTextSettings);
  document.getElementById('addWordBtn').addEventListener('click', addCustomWord);
  document.getElementById('customWordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomWord();
  });

  // Site blocking
  document.getElementById('blockSites').addEventListener('change', saveSiteSettings);
  document.getElementById('safeSearch').addEventListener('change', saveSiteSettings);
  document.querySelectorAll('#categoriesGrid input').forEach(cb => {
    cb.addEventListener('change', saveSiteSettings);
  });
  document.getElementById('addWhitelistBtn').addEventListener('click', addWhitelistDomain);
  document.getElementById('addBlocklistBtn').addEventListener('click', addBlocklistDomain);

  // Image filtering
  document.getElementById('filterImages').addEventListener('change', saveImageSettings);
  document.getElementById('imagePlaceholder').addEventListener('change', saveImageSettings);
  document.getElementById('checkUrlPatterns').addEventListener('change', saveImageSettings);

  // Schedule
  document.getElementById('scheduleEnabled').addEventListener('change', saveScheduleSettings);
  document.getElementById('bedtimeEnabled').addEventListener('change', saveScheduleSettings);
  document.getElementById('bedtimeStart').addEventListener('change', saveScheduleSettings);
  document.getElementById('bedtimeEnd').addEventListener('change', saveScheduleSettings);

  // Parental controls
  document.getElementById('passwordEnabled').addEventListener('change', togglePasswordSettings);
  document.getElementById('setPasswordBtn').addEventListener('click', setPassword);
  document.getElementById('limitSocialMedia').addEventListener('change', saveTimeLimits);
  document.getElementById('limitGaming').addEventListener('change', saveTimeLimits);
  document.getElementById('limitStreaming').addEventListener('change', saveTimeLimits);

  // Notifications
  document.getElementById('notificationsEnabled').addEventListener('change', saveNotificationSettings);
  document.getElementById('dailySummary').addEventListener('change', saveNotificationSettings);

  // Backup
  document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);
  document.getElementById('importFile').addEventListener('change', handleImportFile);
  document.getElementById('importSettingsBtn').addEventListener('click', importSettings);
  document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
}

// Save functions
async function saveGeneralSettings() {
  config.enabled = document.getElementById('enableProtection').checked;
  config.showBadge = document.getElementById('showBadge').checked;
  config.filterLanguage = document.getElementById('filterLanguage').value;

  await chrome.storage.sync.set({ config });
  notifyContentScripts();
}

async function saveTextSettings() {
  config.filterText = document.getElementById('filterText').checked;
  config.strictMode = document.getElementById('strictMode').checked;
  config.filterLevel = document.getElementById('filterLevel').value;

  await chrome.storage.sync.set({ config });
  notifyContentScripts();
}

async function saveSiteSettings() {
  config.blockSites = document.getElementById('blockSites').checked;
  config.safeSearch = document.getElementById('safeSearch').checked;

  const categories = [];
  document.querySelectorAll('#categoriesGrid input:checked').forEach(cb => {
    categories.push(cb.value);
  });
  config.blockCategories = categories;

  await chrome.storage.sync.set({ config });
  notifyContentScripts();
}

async function saveImageSettings() {
  const imageConfig = {
    enabled: document.getElementById('filterImages').checked,
    placeholderEnabled: document.getElementById('imagePlaceholder').checked,
    checkUrlPatterns: document.getElementById('checkUrlPatterns').checked
  };

  await chrome.storage.sync.set({ imageDetectorConfig: imageConfig });
}

async function saveScheduleSettings() {
  const schedule = {
    enabled: document.getElementById('scheduleEnabled').checked,
    bedtimeMode: {
      enabled: document.getElementById('bedtimeEnabled').checked,
      start: document.getElementById('bedtimeStart').value,
      end: document.getElementById('bedtimeEnd').value
    }
  };

  await chrome.storage.sync.set({ schedule });
}

async function saveTimeLimits() {
  const result = await chrome.storage.sync.get(['schedule']);
  const schedule = result.schedule || {};

  schedule.dailyLimits = {
    socialMedia: parseInt(document.getElementById('limitSocialMedia').value) || 0,
    gaming: parseInt(document.getElementById('limitGaming').value) || 0,
    streaming: parseInt(document.getElementById('limitStreaming').value) || 0
  };

  await chrome.storage.sync.set({ schedule });
}

async function saveNotificationSettings() {
  const notificationConfig = {
    enabled: document.getElementById('notificationsEnabled').checked,
    dailySummary: document.getElementById('dailySummary').checked
  };

  await chrome.storage.sync.set({ notificationConfig });
}

// Dark mode
async function toggleDarkMode() {
  const enabled = document.getElementById('darkMode').checked;
  document.body.classList.toggle('dark-mode', enabled);
  await chrome.storage.sync.set({ darkMode: enabled });
}

// Password settings
function togglePasswordSettings() {
  const enabled = document.getElementById('passwordEnabled').checked;
  const settings = document.getElementById('passwordSettings');
  settings.classList.toggle('hidden', !enabled);
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
    alert('Password set successfully');
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordSettings').classList.add('hidden');
  } catch (e) {
    alert('Failed to set password: ' + e.message);
  }
}

// Custom words
function addCustomWord() {
  const input = document.getElementById('customWordInput');
  const word = input.value.trim().toLowerCase();

  if (!word) return;

  config.customWords = config.customWords || [];
  if (!config.customWords.includes(word)) {
    config.customWords.push(word);
    chrome.storage.sync.set({ config });
    displayCustomWords(config.customWords);
  }

  input.value = '';
}

function displayCustomWords(words) {
  const container = document.getElementById('customWordsList');
  container.innerHTML = words.map(word => `
    <span class="tag">
      ${escapeHtml(word)}
      <button onclick="removeCustomWord('${escapeHtml(word)}')">&times;</button>
    </span>
  `).join('');
}

window.removeCustomWord = function(word) {
  config.customWords = config.customWords.filter(w => w !== word);
  chrome.storage.sync.set({ config });
  displayCustomWords(config.customWords);
};

// Whitelist
function addWhitelistDomain() {
  const input = document.getElementById('whitelistInput');
  const domain = input.value.trim().toLowerCase();

  if (!domain) return;

  config.whitelistedDomains = config.whitelistedDomains || [];
  if (!config.whitelistedDomains.includes(domain)) {
    config.whitelistedDomains.push(domain);
    chrome.storage.sync.set({ config });
    displayWhitelist(config.whitelistedDomains);
  }

  input.value = '';
}

function displayWhitelist(domains) {
  const container = document.getElementById('whitelistList');
  container.innerHTML = domains.map(domain => `
    <div class="list-item">
      <span>${escapeHtml(domain)}</span>
      <button onclick="removeWhitelistDomain('${escapeHtml(domain)}')">&times;</button>
    </div>
  `).join('');
}

window.removeWhitelistDomain = function(domain) {
  config.whitelistedDomains = config.whitelistedDomains.filter(d => d !== domain);
  chrome.storage.sync.set({ config });
  displayWhitelist(config.whitelistedDomains);
};

// Blocklist
function addBlocklistDomain() {
  const input = document.getElementById('blocklistInput');
  const domain = input.value.trim().toLowerCase();

  if (!domain) return;

  config.customBlocklist = config.customBlocklist || [];
  if (!config.customBlocklist.includes(domain)) {
    config.customBlocklist.push(domain);
    chrome.storage.sync.set({ config });
    displayBlocklist(config.customBlocklist);
  }

  input.value = '';
}

function displayBlocklist(domains) {
  const container = document.getElementById('blocklistList');
  if (!container) return;

  container.innerHTML = (domains || []).map(domain => `
    <div class="list-item">
      <span>${escapeHtml(domain)}</span>
      <button onclick="removeBlocklistDomain('${escapeHtml(domain)}')">&times;</button>
    </div>
  `).join('');
}

window.removeBlocklistDomain = function(domain) {
  config.customBlocklist = config.customBlocklist.filter(d => d !== domain);
  chrome.storage.sync.set({ config });
  displayBlocklist(config.customBlocklist);
};

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
      const profileId = card.dataset.profile;
      await FilterProfiles.setActiveProfile(profileId);
      loadProfiles();
      loadConfiguration();
    });
  });

  // Create profile button
  document.getElementById('createProfileBtn').addEventListener('click', async () => {
    const name = document.getElementById('customProfileName').value.trim();
    if (!name) return;

    await FilterProfiles.createCustomProfile(name, config);
    document.getElementById('customProfileName').value = '';
    loadProfiles();
  });
}

// Schedule grid
function generateScheduleGrid() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const container = document.getElementById('scheduleGrid');

  container.innerHTML = days.map(day => `
    <div class="schedule-day">
      <label>${day}</label>
      <input type="time" id="schedule-${day.toLowerCase()}-start" value="08:00">
      <span>to</span>
      <input type="time" id="schedule-${day.toLowerCase()}-end" value="22:00">
    </div>
  `).join('');
}

// Export settings
async function exportSettings() {
  const [syncData, localData] = await Promise.all([
    chrome.storage.sync.get(null),
    chrome.storage.local.get(['passwordHash', 'passwordEnabled'])
  ]);

  const exportData = {
    type: 'safe-browse-settings',
    version: '2.0',
    exportDate: new Date().toISOString(),
    config: syncData.config || {},
    profiles: syncData.customProfiles || {},
    activeProfile: syncData.activeProfile,
    schedule: syncData.schedule || {},
    notificationConfig: syncData.notificationConfig || {},
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

  if (!confirm('This will replace your current settings. Continue?')) return;

  await chrome.storage.sync.set({
    config: importData.config || {},
    customProfiles: importData.profiles || {},
    activeProfile: importData.activeProfile || 'teen-safe',
    schedule: importData.schedule || {},
    notificationConfig: importData.notificationConfig || {},
    imageDetectorConfig: importData.imageDetectorConfig || {}
  });

  alert('Settings imported successfully');
  location.reload();
}

// Reset settings
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) return;

  await chrome.storage.sync.clear();
  await chrome.storage.local.remove(['passwordHash', 'passwordEnabled']);

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
