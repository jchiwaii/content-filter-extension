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
        'xxx.com', 'analvids.com', 'xvideos.red',
        'rule34.xxx', 'e621.net', 'nhentai.net', 'hentaihaven.xxx', 'literotica.com',
        'adultbooks.com','adultmovietheaters.com','adultmovietheatre.com','asianchics.com','asiansluts.com',
        'assarama.com','assholeoftheday.com','asskissing.com','assonline.com',
        'asszone.com',
        'ballme.com','barepussy.com','beatingoff.com','beefcakebeach.com','beefcakecity.com',
        'bestass.com','bestcock.com','bestcocks.com','bestfuckshow.com','bestfuckshows.com',
        'bestpussy.com','biggestass.com','biggestasses.com','biggestasshole.com','biggestassholes.com',
        'biggestballs.com','biggestbreast.com','biggestcocks.com','biggestdicks.com',
        'biggesthooters.com','biggestjugs.com','biggesttitscontest.com','biggesttittscontest.com',
        'bighardcock.com','bigshit.com','bipussy.com','bootypoodle.com',
        'cheapdate.com','cheapdates.com','cheating.com','cockteasers.com','cockteasing.com',
        'cybercock.com','cyberdaily.com',
        'dancerswanted.com','dickmoney.com','dickworld.com','dirtybitch.com','dirtychat.com',
        'dirtynurses.com','dirtyphoto.com','dirtyphotographs.com','dirtypics.com','dirtypicts.com',
        'dirtypicture.com','dirtysites.com','dirtyslut.com','dirtysluts.com',
        'easywomen.com','eroticgaysex.com','erotichotline.com','eroticphotos.com','eroticsites.com',
        'erotimes.com',
        'fistme.com','flipoff.com','freesex-pics.com','frenchwhore.com','frenchwhores.com',
        'fullynude.com',
        'gaybar.com','gaycock.com','gaycore.com','gaydates.com','gaydick.com','gayfilm.com',
        'gayfuckshows.com','gayghetto.com','gaylive.com','gayqueen.com','gaystuds.com',
        'gaywhore.com','gaywhores.com','getbabes.com','geterotic.com','gethead.com',
        'gethorny.com','gethot.com','getlaid.com','gianthooters.com','girlienight.com',
        'girliepics.com','girlieshows.com','girls.net','girlswanted.com','girlwatch.com',
        'girlwatchers.com','girlwatching.com','goldentouchmedia.com','gotoppless.com',
        'greatass.com','hardsex.com','homos.com','homosexuality.com','hornymen.com',
        'hornymilf.com','hornymodels.com','hornynymphos.com','hornyvirgins.com','hornywidows.com',
        'hornywives.com','hornywomen.com','hotass.com','hotbitch.com','hotcock.com',
        'hotcunt.com','hotflirting.com','hotgaymen.com','hotpasswords.com','hotshit.com',
        'hotsnatch.com','hottestass.com','hottestcock.com','hottestcocks.com','hottestfantasy.com',
        'hottestgay.com','hottestgaybar.com','hottestgaybars.com','hottestgayman.com',
        'hottestgaymen.com','hottestgays.com','hottestladies.com','hottestlegs.com',
        'hottestpinupgirl.com','hottestpinupgirls.com','hottestporno.com','hottestpornography.com',
        'hottestpornsites.com','hottestpornstar.com','hottestpornstars.com','hottestportals.com',
        'hotteststripper.com','hotteststrippers.com','hottestwhores.com','hottestwives.com',
        'hottetphonesex.com','humps.com',
        'iwantsex.com',
        'jackmeoff.com','jackpotbingo.com','jackpotslots.com','jailinmates.com',
        'jailqueen.com','jailqueens.com','jerkingoff.com','jerkmeoff.com','jerkoffcam.com',
        'kinkysex.com',
        'ladies.org','lickass.com','lickmyass.com','lickmyballs.com','lickmycock.com',
        'lickmypussy.com','lickpenis.com','lickpussy.com','licktwat.com','loveads.com',
        'loveliest.com',
        'males.com','malesex.com','malestrip.com','malestud.com','maritalaids.com',
        'misstresswanted.com','mistresscam.com','mlm.org',
        'niceass.com','nicehooters.com','nicepussy.com','nicesttits.com','nudemodels.com',
        'nudistcolony.com','numnuts.com','nutso.com','nymphos.com',
        'onlinefantasy.com','onlinelive.com','orientalgirls.com','orientalpornos.com','orientalsluts.com',
        'partypersonals.com','partyporn.com','partysluts.com','porncash.com','porncentral.tv',
        'pornflix.com','pornhotline.com','pornjewelery.com','pornmags.com','pornmodel.com',
        'pornnews.com','pornobroker.com','pornoclub.com','pornodollars.com','pornofilms.com',
        'pornographey.com','pornographia.com','pornojewelery.com','pornojewelry.com',
        'pornoking.com','pornolist.com','pornoman.com','pornomodels.com','pornomoviestar.com',
        'pornonews.com','pornoonline.com','pornopasswords.com','pornopersonals.com',
        'pornopic.com','pornosluts.com','pornostarcam.com','pornostudio.com','pornostudios.com',
        'pornotape.com','pornoticket.com','pornotime.com','pornotokens.com','pornovault.com',
        'pornovideos.com','pornowebsites.com','pornqueen.com','pornslut.com','pornsluts.com',
        'pornstar.org','pornstore.com','porntapes.com','porntimes.com','porntraffic.com',
        'pornwatching.com','pornwebsites.com','prisonsex.com','privatedancing.com',
        'pussycity.com','pussyeaters.com','pussyfart.com','pussyfever.com','pussyforsale.com',
        'pussyhotline.com','pussyonline.com','pussyworld.com','pussyzilla.com','puta.com',
        'ratedxxx.com','rectal.com','roughsex.com','russiansluts.com',
        'scorezilla.com','screwed.com','screwing.com','screwit.com','screwme.com','screwus.com',
        'secretpasswords.com','sexfetish.com','sexgod.com','sexgoddess.com','sexmenu.com',
        'sexo.com','sexoholic.com','sexqueen.com','sexrelated.com','sexscandal.com',
        'sexspecialist.com','sexspecialists.com','sextrips.com','sexualacts.com','sexualdesire.com',
        'sexualmaniac.com','sexydancing.com','sexydate.com','sexydates.com','sexyfemalescort.com',
        'sexyfemalescorts.com','sexymodels.com','sexynudemodels.com','sexyoldladies.com',
        'sexyoldlady.com','shavedbeavers.com','shavedtwat.com','shavedtwats.com','shemaleshows.com',
        'showering.com','sirlove.com','sitecop.com','skintone.com','sleazybitch.com','sob.com',
        'startstripping.com','stickytracker.com','streaking.com','stripcam.com','stripjobs.com',
        'stripjoints.com','stripshows.com','stripteaseshows.com','stud.com','studking.com',
        'studworld.com','studzone.com','stupidass.com','submissive.com',
        'titdoc.com','titdoctor.com','titjobs.com','titqueen.com','tstv.com',
        'undressing.com',
        'vbanks.com','vbingo.com','vcasinos.com','vdate.com','vdates.com','vdealer.com',
        'vicesquad.com','videodates.com','virginpussy.com','virgins.com','virtualass.com',
        'virtualasshole.com','virtualcock.com','virtualcunt.com','virtualpussy.com',
        'virtualstud.com','virtualsucker.com','virtualwhore.com','virtualwhorehouse.com',
        'virtualwhores.com','virtualwoman.com','vulgarity.com',
        'wackit.com','wackoff.com','wackychicks.com','wackygirls.com','webparties.com',
        'wetcunt.com','wetgirls.com','wetvirgins.com','whitechicks.com','whitefemale.com',
        'whorehousing.com','whoreoftheweek.com','wifeswap.com','wifeswapper.com',
        'xxxcashier.com','xxxfilmstar.com','xxxflicks.com','xxxfreeporno.com',
        'xxxfuckshows.com','xxxgaysex.com','xxxhardcore.com','xxxmoviestar.com',
        'xxxphotos.com','xxxsexshow.com','xxxstar.com','xxxvideos.com'
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
        const result = await chrome.storage.local.get(['combinedProfanityWords']);
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
    const leftBoundary = '(?<![\\p{L}\\p{N}])';
    const rightBoundary = '(?![\\p{L}\\p{N}])';
    const patterns = terms
      .map(term => String(term || '').normalize('NFKC').trim().toLowerCase())
      .filter(Boolean)
      .map(term => {
        const escaped = escapeRegExp(term).replace(/[\s_-]+/g, '[\\s\\-_]+');
        return new RegExp(`${leftBoundary}${escaped}${rightBoundary}`, 'giu');
      });
    const asteriskPatterns = [
      /\bf\*ck\b/gi, /\bs\*[i!]t\b/gi, /\bc\*nt\b/gi, /\bb\*tch\b/gi, /\bd\*ck\b/gi, /\bp\*rn\b/gi, /\ba\*ss\b/gi
    ];
    const evasionPatterns = [
      /\bf[^a-z0-9]*u[^a-z0-9]*c[^a-z0-9]*k\b/giu,
      /\bs[^a-z0-9]*h[^a-z0-9]*i[^a-z0-9]*t\b/giu,
      /\bb[^a-z0-9]*i[^a-z0-9]*t[^a-z0-9]*c[^a-z0-9]*h\b/giu,
      /\bp[^a-z0-9]*o[^a-z0-9]*r[^a-z0-9]*n\b/giu,
      /\bc[^a-z0-9]*u[^a-z0-9]*n[^a-z0-9]*t\b/giu
    ];
    this._patternCache = {
      patterns,
      asteriskPatterns,
      evasionPatterns
    };
    return this._patternCache;
  },

  async containsBlockedTerm(query) {
    const cache = await this._buildPatterns();
    for (const regex of cache.patterns) {
      regex.lastIndex = 0;
      if (regex.test(query)) return true;
    }
    for (const regex of cache.asteriskPatterns) {
      regex.lastIndex = 0;
      if (regex.test(query)) return true;
    }
    for (const regex of cache.evasionPatterns) {
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
      chrome.action.setBadgeBackgroundColor({ color: '#2B6E44' });
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

  if (namespace === 'local' && changes.combinedProfanityWords) {
    SafeSearch._blockedTerms = null;
    SafeSearch._blockedTermsPromise = null;
    SafeSearch._patternCache = null;
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
