// Enhanced Background Service Worker
// Handles extension initialization, site blocking, safe search, and messaging

// Note: In MV3 service workers, we inline the module code or use dynamic imports
// For simplicity, we'll define stripped-down versions here

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

// Blocklist for adult sites (checked on navigation events)
const BlocklistData = {
  isBlocked: async (url, categories = ['adult']) => {
    try {
      const urlObj = new URL(url);
      const hostname = normalizeHostname(urlObj.hostname);

      // Core adult domains to block
      const adultDomains = [
        'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
        'youporn.com', 'spankbang.com', 'beeg.com', 'porn.com', 'eporner.com',
        'onlyfans.com', 'fansly.com', 'chaturbate.com', 'livejasmin.com',
        'stripchat.com', 'brazzers.com', 'realitykings.com', 'bangbros.com',
        'rule34.xxx', 'e621.net', 'nhentai.net', 'hentaihaven.xxx', 'literotica.com'
      ];

      if (categories.includes('adult')) {
        for (const domain of adultDomains) {
          if (domainMatches(hostname, domain)) {
            return { blocked: true, category: 'adult', reason: 'Adult content' };
          }
        }
      }

      // Check custom blocklist from storage
      const result = await chrome.storage.sync.get(['config']);
      const customBlocklist = result.config?.customBlocklist || [];
      if (customBlocklist.some(domain => domainMatches(hostname, domain))) {
        return { blocked: true, category: 'custom', reason: 'Manually blocked' };
      }

      return { blocked: false };
    } catch {
      return { blocked: false };
    }
  }
};

// Minimal safe search enforcement
const SafeSearch = {
  _blockedTermsPromise: null,
  _blockedTerms: null,

  async _ensureTerms() {
    if (this._blockedTerms) return this._blockedTerms;
    if (this._blockedTermsPromise) return this._blockedTermsPromise;
    this._blockedTermsPromise = (async () => {
      try {
        const result = await chrome.storage.sync.get(['combinedProfanityWords']);
        const stored = result.combinedProfanityWords;
        if (stored && Array.isArray(stored) && stored.length) {
          this._blockedTerms = stored;
        } else {
          this._blockedTerms = [
            'fuck','shit','bitch','asshole','porn','xxx','nude','naked','nsfw','hentai'
          ];
        }
      } catch {
        this._blockedTerms = [
          'fuck','shit','bitch','asshole','porn','xxx','nude','naked','nsfw','hentai'
        ];
      }
      return this._blockedTerms;
    })();
    return this._blockedTermsPromise;
  },

  _patternCache: null,

  async _buildPatterns() {
    if (this._patternCache) return this._patternCache;
    const terms = await this._ensureTerms();
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = terms.map(term => {
      const escaped = escapeRegExp(term);
      const leet = escaped
        .replace(/[a]/g, '[a@4]')
        .replace(/[e]/g, '[e3]')
        .replace(/[i]/g, '[i1!]')
        .replace(/[o]/g, '[o0]')
        .replace(/[s]/g, '[s5$]')
        .replace(/[t]/g, '[t7]')
        .replace(/[u]/g, '[u]')
        .replace(/[ck]/g, '[ck]');
      const spaced = leet.replace(/(.)/g, '$1[\\s-]*');
      return `\\b${spaced}\\b`;
    });
    const asteriskPatterns = [
      /\bf\*ck\b/gi, /\bs\*[i!]t\b/gi, /\bc\*nt\b/gi, /\bb\*tch\b/gi, /\bd\*ck\b/gi, /\bp\*rn\b/gi, /\ba\*ss\b/gi
    ];
    this._patternCache = {
      patterns: patterns.map(p => new RegExp(p, 'gi')),
      asteriskPatterns
    };
    return this._patternCache;
  },

  async containsBlockedTerm(query) {
    const terms = await this._ensureTerms();
    const lower = query.toLowerCase();
    for (const term of terms) {
      if (lower.includes(term.toLowerCase())) return true;
    }
    const cache = await this._buildPatterns();
    for (const regex of cache.patterns) {
      regex.lastIndex = 0;
      if (regex.test(query)) return true;
    }
    for (const regex of cache.asteriskPatterns) {
      regex.lastIndex = 0;
      if (regex.test(query)) return true;
    }
    return false;
  },

  getSearchQuery: (urlObj) => {
    return urlObj.searchParams.get('q') ||
           urlObj.searchParams.get('query') ||
           urlObj.searchParams.get('p') ||
           urlObj.searchParams.get('search_query') ||
           '';
  },

  async processSearchUrl(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const params = urlObj.searchParams;
      const isGoogleSearch = /(^|\.)google\./.test(hostname) && urlObj.pathname.includes('/search');
      const isBingSearch = /(^|\.)bing\.com$/.test(hostname) && urlObj.pathname.includes('/search');
      const isDuckDuckGoSearch = /(^|\.)duckduckgo\.com$/.test(hostname);

      if (!isGoogleSearch && !isBingSearch && !isDuckDuckGoSearch) {
        return { action: 'none' };
      }

      const query = SafeSearch.getSearchQuery(urlObj);
      if (query && await SafeSearch.containsBlockedTerm(query)) {
        return { action: 'block', reason: 'blocked_search' };
      }

      // Google
      if (isGoogleSearch) {
        if (params.get('safe') !== 'active') {
          params.set('safe', 'active');
          return { action: 'redirect', url: urlObj.toString() };
        }
      }

      // Bing
      if (isBingSearch) {
        if (params.get('adlt') !== 'strict') {
          params.set('adlt', 'strict');
          return { action: 'redirect', url: urlObj.toString() };
        }
      }

      // DuckDuckGo
      if (isDuckDuckGoSearch) {
        if (params.get('kp') !== '1') {
          params.set('kp', '1');
          return { action: 'redirect', url: urlObj.toString() };
        }
      }

      return { action: 'none' };
    } catch {
      return { action: 'none' };
    }
  }
};

// Default configuration
const defaultConfig = {
  enabled: true,
  filterText: true,
  filterImages: true,
  blockSites: true,
  safeSearch: true,
  showBadge: true,
  customWords: [],
  whitelistedDomains: [],
  customBlocklist: [],
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
  let hostname = '';
  try {
    hostname = tab?.url ? normalizeHostname(new URL(tab.url).hostname) : '';
  } catch {
    hostname = '';
  }

  switch (info.menuItemId) {
    case 'whitelist-site':
      if (hostname) {
        const result = await chrome.storage.sync.get(['config']);
        const config = { ...defaultConfig, ...(result.config || {}) };
        config.whitelistedDomains = config.whitelistedDomains || [];
        if (!config.whitelistedDomains.some(domain => domainMatches(hostname, domain))) {
          config.whitelistedDomains.push(hostname);
          await chrome.storage.sync.set({ config });
          chrome.tabs.reload(tab.id);
        }
      }
      break;

    case 'block-site':
      if (hostname) {
        const result = await chrome.storage.sync.get(['config']);
        const config = { ...defaultConfig, ...(result.config || {}) };
        config.customBlocklist = config.customBlocklist || [];
        if (!config.customBlocklist.some(domain => domainMatches(hostname, domain))) {
          config.customBlocklist.push(hostname);
          await chrome.storage.sync.set({ config });
          chrome.tabs.update(tab.id, {
            url: chrome.runtime.getURL(`pages/blocked/blocked.html?url=${encodeURIComponent(tab.url)}&category=custom&reason=manual`)
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
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/dashboard/dashboard.html') });
      break;

    case 'open-settings':
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/settings/settings.html') });
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
  const [localResult, syncResult] = await Promise.all([
    chrome.storage.local.get(['dailyStats']),
    chrome.storage.sync.get(['config'])
  ]);
  const config = { ...defaultConfig, ...(syncResult.config || {}) };

  if (config.showBadge === false) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  const today = new Date().toDateString();
  const stats = localResult.dailyStats || {};

  if (stats.date === today) {
    const count = (stats.wordsFiltered || 0) +
      (stats.sitesBlocked || 0) +
      (stats.imagesBlocked || 0) +
      (stats.searchesFiltered || 0);
    if (count > 0) {
      const text = count > 999 ? '999+' : count.toString();
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#2838e3' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.config) {
    updateBadge();
  }
});

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
  const config = { ...defaultConfig, ...(syncResult.config || {}) };

  if (!config.enabled) return;

  const url = details.url;
  let hostname = '';

  // Check whitelist first
  try {
    const urlObj = new URL(url);
    hostname = normalizeHostname(urlObj.hostname);
    if ((config.whitelistedDomains || []).some(domain => domainMatches(hostname, domain))) {
      return;
    }
  } catch {
    return;
  }

  // Check site blocking
  if (config.blockSites) {
    const blockResult = await BlocklistData.isBlocked(url, config.blockCategories || ['adult']);

    if (blockResult.blocked) {
      // Redirect to blocked page
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`pages/blocked/blocked.html?url=${encodeURIComponent(url)}&category=${encodeURIComponent(blockResult.category)}&reason=${encodeURIComponent(blockResult.reason)}`)
      });

      // Update statistics
      await updateStatistics({ sitesBlocked: 1, site: hostname });

      // Log activity
      await logActivity('siteBlocked', { url, category: blockResult.category });

      return;
    }
  }

  // Check safe search
  if (config.safeSearch) {
    const searchResult = await SafeSearch.processSearchUrl(url);

    if (searchResult.action === 'block') {
      // Block inappropriate search
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`pages/blocked/blocked.html?url=${encodeURIComponent(url)}&category=blocked_search&reason=blocked_search`)
      });

      await updateStatistics({ searchesFiltered: 1, site: hostname });
      await logActivity('searchFiltered', { url, reason: searchResult.reason });
      return;
    }

    if (searchResult.action === 'redirect') {
      // Redirect to safe search version
      chrome.tabs.update(details.tabId, { url: searchResult.url });
      await updateStatistics({ searchesFiltered: 1, site: hostname });
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
      const config = { ...defaultConfig, ...(syncResult.config || {}) };
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
      const blockResult = await BlocklistData.isBlocked(request.url, request.categories || ['adult']);
      sendResponse(blockResult);
      break;

    case 'openSettings':
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/settings/settings.html') });
      sendResponse({ success: true });
      break;

    case 'openDashboard':
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/dashboard/dashboard.html') });
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
}

// Update statistics
async function updateStatistics(data) {
  // Update global statistics
  const result = await chrome.storage.local.get(['statistics', 'dailyStats', 'siteStats', 'weeklyStats']);
  const stats = { ...defaultStats, ...(result.statistics || {}) };
  const today = new Date().toDateString();
  let dailyStats = result.dailyStats || { date: today };
  let weeklyStats = normalizeWeeklyStats(result.weeklyStats);

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

  updateWeeklyStats(weeklyStats, data);

  // Update site-specific stats
  if (data.site) {
    const siteStats = result.siteStats || {};
    const siteCount = getFilterCount(data);
    siteStats[data.site] = (siteStats[data.site] || 0) + siteCount;
    await chrome.storage.local.set({ siteStats });
  }

  await chrome.storage.local.set({ statistics: stats, dailyStats, weeklyStats });
  await updateBadge();
}

function getFilterCount(data = {}) {
  return (data.wordsFiltered || 0) +
    (data.sitesBlocked || 0) +
    (data.imagesBlocked || 0) +
    (data.searchesFiltered || 0);
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptyWeeklyStats(now = new Date()) {
  const labels = [];
  const dateKeys = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    dateKeys.push(getDateKey(date));
  }

  return {
    labels,
    dateKeys,
    words: [0, 0, 0, 0, 0, 0, 0],
    sites: [0, 0, 0, 0, 0, 0, 0],
    images: [0, 0, 0, 0, 0, 0, 0],
    searches: [0, 0, 0, 0, 0, 0, 0],
    types: [0, 0, 0, 0]
  };
}

function normalizeWeeklyStats(existing = {}) {
  const empty = createEmptyWeeklyStats();
  if (!Array.isArray(existing.dateKeys)) return empty;

  const normalized = { ...empty };
  for (const field of ['words', 'sites', 'images', 'searches']) {
    normalized[field] = empty.dateKeys.map(dateKey => {
      const oldIndex = existing.dateKeys.indexOf(dateKey);
      return oldIndex >= 0 ? (existing[field]?.[oldIndex] || 0) : 0;
    });
  }
  normalized.types = [
    normalized.words.reduce((sum, value) => sum + value, 0),
    normalized.images.reduce((sum, value) => sum + value, 0),
    normalized.sites.reduce((sum, value) => sum + value, 0),
    normalized.searches.reduce((sum, value) => sum + value, 0)
  ];
  return normalized;
}

function updateWeeklyStats(weeklyStats, data) {
  const todayKey = getDateKey(new Date());
  const index = weeklyStats.dateKeys.indexOf(todayKey);
  if (index < 0) return;

  weeklyStats.words[index] += data.wordsFiltered || 0;
  weeklyStats.sites[index] += data.sitesBlocked || 0;
  weeklyStats.images[index] += data.imagesBlocked || 0;
  weeklyStats.searches[index] += data.searchesFiltered || 0;
  weeklyStats.types = [
    weeklyStats.words.reduce((sum, value) => sum + value, 0),
    weeklyStats.images.reduce((sum, value) => sum + value, 0),
    weeklyStats.sites.reduce((sum, value) => sum + value, 0),
    weeklyStats.searches.reduce((sum, value) => sum + value, 0)
  ];
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
      chrome.tabs.create({ url: chrome.runtime.getURL('pages/dashboard/dashboard.html') });
      break;
  }
});

// Initial badge update
updateBadge();

