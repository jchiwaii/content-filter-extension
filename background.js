// Enhanced Background Service Worker
// Handles extension initialization, site blocking, safe search, and messaging

// Import modules (will be available in service worker context)
importScripts(
  'data/blocklist-data.js',
  'modules/safe-search.js',
  'modules/notifications.js'
);

// Default configuration
const defaultConfig = {
  enabled: true,
  filterText: true,
  filterImages: true,
  blockSites: true,
  safeSearch: true,
  strictMode: true,
  filterLevel: 'moderate',
  customWords: [],
  whitelistedDomains: [],
  blockCategories: ['adult']
};

// Default statistics
const defaultStats = {
  wordsFiltered: 0,
  sitesBlocked: 0,
  imagesBlocked: 0,
  searchesFiltered: 0
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Safe Browse] Extension installed/updated:', details.reason);

  // Set default configuration
  const syncResult = await chrome.storage.sync.get(['config']);
  if (!syncResult.config) {
    await chrome.storage.sync.set({ config: defaultConfig });
  }

  // Initialize statistics
  const localResult = await chrome.storage.local.get(['statistics', 'installTime']);
  if (!localResult.statistics) {
    await chrome.storage.local.set({ statistics: defaultStats });
  }
  if (!localResult.installTime) {
    await chrome.storage.local.set({ installTime: Date.now() });
  }

  // Check if onboarding needed
  const onboardingResult = await chrome.storage.local.get(['onboardingComplete']);
  if (!onboardingResult.onboardingComplete && details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({ url: 'onboarding.html' });
  }

  // Setup context menus
  setupContextMenus();

  // Setup alarms
  setupAlarms();
});

// Setup context menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'whitelist-site',
      title: 'Whitelist this site',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'block-site',
      title: 'Block this site',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'separator-1',
      type: 'separator',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'pause-1hour',
      title: 'Pause protection for 1 hour',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'open-dashboard',
      title: 'Open Dashboard',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'open-settings',
      title: 'Open Settings',
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = tab?.url ? new URL(tab.url) : null;
  const hostname = url?.hostname;

  switch (info.menuItemId) {
    case 'whitelist-site':
      if (hostname) {
        const result = await chrome.storage.sync.get(['config']);
        const config = result.config || defaultConfig;
        if (!config.whitelistedDomains.includes(hostname)) {
          config.whitelistedDomains.push(hostname);
          await chrome.storage.sync.set({ config });
          chrome.tabs.reload(tab.id);
        }
      }
      break;

    case 'block-site':
      if (hostname) {
        const result = await chrome.storage.sync.get(['config']);
        const config = result.config || defaultConfig;
        config.customBlocklist = config.customBlocklist || [];
        if (!config.customBlocklist.includes(hostname)) {
          config.customBlocklist.push(hostname);
          await chrome.storage.sync.set({ config });
          chrome.tabs.update(tab.id, {
            url: chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(tab.url)}&reason=manual`)
          });
        }
      }
      break;

    case 'pause-1hour':
      await chrome.storage.local.set({
        isPaused: true,
        pauseUntil: Date.now() + (60 * 60 * 1000)
      });
      break;

    case 'open-dashboard':
      chrome.tabs.create({ url: 'dashboard.html' });
      break;

    case 'open-settings':
      chrome.tabs.create({ url: 'settings.html' });
      break;
  }
});

// Setup alarms for scheduled tasks
function setupAlarms() {
  // Badge update every minute
  chrome.alarms.create('updateBadge', { periodInMinutes: 1 });

  // Daily stats reset at midnight
  chrome.alarms.create('dailyReset', {
    when: getNextMidnight(),
    periodInMinutes: 24 * 60
  });

  // Resume from pause check
  chrome.alarms.create('checkPause', { periodInMinutes: 1 });
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case 'updateBadge':
      await updateBadge();
      break;

    case 'dailyReset':
      await chrome.storage.local.set({
        dailyStats: {
          date: new Date().toDateString(),
          wordsFiltered: 0,
          sitesBlocked: 0,
          imagesBlocked: 0,
          searchesFiltered: 0
        }
      });
      break;

    case 'checkPause':
      const result = await chrome.storage.local.get(['isPaused', 'pauseUntil']);
      if (result.isPaused && result.pauseUntil < Date.now()) {
        await chrome.storage.local.set({ isPaused: false, pauseUntil: null });
      }
      break;
  }
});

// Update badge
async function updateBadge() {
  const result = await chrome.storage.local.get(['dailyStats']);
  const today = new Date().toDateString();
  const stats = result.dailyStats || {};

  if (stats.date === today) {
    const count = (stats.wordsFiltered || 0) + (stats.sitesBlocked || 0);
    if (count > 0) {
      const text = count > 999 ? '999+' : count.toString();
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#222823' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Web navigation - check before page loads
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only check main frame
  if (details.frameId !== 0) return;

  // Check if paused
  const pauseResult = await chrome.storage.local.get(['isPaused', 'pauseUntil']);
  if (pauseResult.isPaused && pauseResult.pauseUntil > Date.now()) {
    return;
  }

  // Get configuration
  const syncResult = await chrome.storage.sync.get(['config']);
  const config = syncResult.config || defaultConfig;

  if (!config.enabled) return;

  const url = details.url;

  // Check whitelist first
  try {
    const urlObj = new URL(url);
    if (config.whitelistedDomains.includes(urlObj.hostname)) {
      return;
    }
  } catch {
    return;
  }

  // Check site blocking
  if (config.blockSites && typeof BlocklistData !== 'undefined') {
    const blockResult = await BlocklistData.isBlocked(url, config.blockCategories || ['adult']);

    if (blockResult.blocked) {
      // Redirect to blocked page
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(url)}&category=${blockResult.category}&reason=${blockResult.reason}`)
      });

      // Update statistics
      await updateStatistics({ sitesBlocked: 1 });

      // Log activity
      await logActivity('siteBlocked', { url, category: blockResult.category });

      return;
    }
  }

  // Check safe search
  if (config.safeSearch && typeof SafeSearch !== 'undefined') {
    const searchResult = SafeSearch.processSearchUrl(url);

    if (searchResult.action === 'block') {
      // Block inappropriate search
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(url)}&reason=blocked_search`)
      });

      await updateStatistics({ searchesFiltered: 1 });
      await logActivity('searchFiltered', { url, reason: searchResult.reason });
      return;
    }

    if (searchResult.action === 'redirect') {
      // Redirect to safe search version
      chrome.tabs.update(details.tabId, { url: searchResult.url });
      await updateStatistics({ searchesFiltered: 1 });
      return;
    }
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Keep channel open for async response
});

// Message handler
async function handleMessage(request, sender, sendResponse) {
  switch (request.action) {
    case 'updateStatistics':
      await updateStatistics(request.data);
      sendResponse({ success: true });
      break;

    case 'getConfig':
      const [syncResult, localResult] = await Promise.all([
        chrome.storage.sync.get(['config']),
        chrome.storage.local.get(['statistics', 'isPaused', 'pauseUntil'])
      ]);
      const config = syncResult.config || defaultConfig;
      const stats = localResult.statistics || defaultStats;
      sendResponse({
        ...config,
        statistics: stats,
        isPaused: localResult.isPaused && localResult.pauseUntil > Date.now()
      });
      break;

    case 'logActivity':
      await logActivity(request.type, request.data);
      sendResponse({ success: true });
      break;

    case 'checkSiteBlocked':
      if (typeof BlocklistData !== 'undefined') {
        const result = await BlocklistData.isBlocked(request.url, request.categories || ['adult']);
        sendResponse(result);
      } else {
        sendResponse({ blocked: false });
      }
      break;

    case 'openSettings':
      chrome.tabs.create({ url: 'settings.html' });
      sendResponse({ success: true });
      break;

    case 'openDashboard':
      chrome.tabs.create({ url: 'dashboard.html' });
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
}

// Update statistics
async function updateStatistics(data) {
  // Update global statistics
  const result = await chrome.storage.local.get(['statistics', 'dailyStats', 'siteStats']);
  const stats = result.statistics || defaultStats;
  const today = new Date().toDateString();
  let dailyStats = result.dailyStats || { date: today };

  // Reset daily stats if new day
  if (dailyStats.date !== today) {
    dailyStats = {
      date: today,
      wordsFiltered: 0,
      sitesBlocked: 0,
      imagesBlocked: 0,
      searchesFiltered: 0
    };
  }

  // Update counts
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'number') {
      stats[key] = (stats[key] || 0) + value;
      dailyStats[key] = (dailyStats[key] || 0) + value;
    }
  }

  // Update site-specific stats
  if (data.site) {
    const siteStats = result.siteStats || {};
    siteStats[data.site] = (siteStats[data.site] || 0) + (data.wordsFiltered || 0);
    await chrome.storage.local.set({ siteStats });
  }

  await chrome.storage.local.set({ statistics: stats, dailyStats });
  await updateBadge();
}

// Log activity
async function logActivity(type, data) {
  const result = await chrome.storage.local.get(['activityLog']);
  const log = result.activityLog || [];

  // Keep last 1000 entries
  if (log.length >= 1000) {
    log.shift();
  }

  log.push({
    type,
    data,
    timestamp: Date.now()
  });

  await chrome.storage.local.set({ activityLog: log });
}

// Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'toggle-protection':
      const result = await chrome.storage.sync.get(['config']);
      const config = result.config || defaultConfig;
      config.enabled = !config.enabled;
      await chrome.storage.sync.set({ config });

      // Reload active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        chrome.tabs.reload(tabs[0].id);
      }
      break;

    case 'open-dashboard':
      chrome.tabs.create({ url: 'dashboard.html' });
      break;
  }
});

// Initial badge update
updateBadge();

console.log('[Safe Browse] Background service worker initialized');
