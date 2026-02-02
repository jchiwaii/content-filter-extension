// Safe Search Enforcement Module
// Forces safe search on major search engines

const SafeSearch = {
  // Search engine configurations
  engines: {
    google: {
      domains: ['google.com', 'google.co.uk', 'google.ca', 'google.com.au', 'google.de', 'google.fr', 'google.es', 'google.it', 'google.co.jp', 'google.com.br'],
      searchPaths: ['/search', '/images', '/videos'],
      safeParam: 'safe',
      safeValue: 'active',
      detectUnsafe: (url) => {
        const params = new URL(url).searchParams;
        return params.get('safe') !== 'active';
      }
    },
    bing: {
      domains: ['bing.com', 'www.bing.com'],
      searchPaths: ['/search', '/images', '/videos'],
      safeParam: 'adlt',
      safeValue: 'strict',
      detectUnsafe: (url) => {
        const params = new URL(url).searchParams;
        return params.get('adlt') !== 'strict';
      }
    },
    duckduckgo: {
      domains: ['duckduckgo.com'],
      searchPaths: ['/'],
      safeParam: 'kp',
      safeValue: '1',
      detectUnsafe: (url) => {
        const params = new URL(url).searchParams;
        return params.get('kp') !== '1';
      }
    },
    yahoo: {
      domains: ['search.yahoo.com', 'images.search.yahoo.com', 'video.search.yahoo.com'],
      searchPaths: ['/search', '/yhs/search'],
      safeParam: 'vm',
      safeValue: 'r',
      detectUnsafe: (url) => {
        const params = new URL(url).searchParams;
        return params.get('vm') !== 'r';
      }
    },
    ecosia: {
      domains: ['ecosia.org', 'www.ecosia.org'],
      searchPaths: ['/search'],
      safeParam: 'sc',
      safeValue: 'on',
      detectUnsafe: (url) => {
        const params = new URL(url).searchParams;
        return params.get('sc') !== 'on';
      }
    }
  },

  // Blocked search terms (always block these searches)
  blockedTerms: [
    'porn', 'xxx', 'nude', 'naked', 'nsfw', 'hentai', 'sex video',
    'adult video', 'explicit', 'pornhub', 'xvideos', 'xnxx',
    'onlyfans leak', 'nude leak', 'fappening'
  ],

  // Check if URL is a search engine
  isSearchEngine(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');

      for (const [name, config] of Object.entries(this.engines)) {
        for (const domain of config.domains) {
          if (hostname === domain || hostname === `www.${domain}`) {
            return { engine: name, config };
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  // Check if URL is a search page
  isSearchPage(url) {
    const searchEngine = this.isSearchEngine(url);
    if (!searchEngine) return false;

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      return searchEngine.config.searchPaths.some(sp =>
        path.startsWith(sp) || path === sp
      );
    } catch {
      return false;
    }
  },

  // Get safe search URL
  getSafeSearchUrl(url) {
    const searchEngine = this.isSearchEngine(url);
    if (!searchEngine) return url;

    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set(searchEngine.config.safeParam, searchEngine.config.safeValue);
      return urlObj.toString();
    } catch {
      return url;
    }
  },

  // Check if search query contains blocked terms
  containsBlockedTerms(url) {
    try {
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get('q') ||
                    urlObj.searchParams.get('query') ||
                    urlObj.searchParams.get('p') ||
                    urlObj.searchParams.get('search_query') || '';

      const lowerQuery = query.toLowerCase();
      return this.blockedTerms.some(term => lowerQuery.includes(term.toLowerCase()));
    } catch {
      return false;
    }
  },

  // Get search query from URL
  getSearchQuery(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('q') ||
             urlObj.searchParams.get('query') ||
             urlObj.searchParams.get('p') ||
             urlObj.searchParams.get('search_query') || '';
    } catch {
      return '';
    }
  },

  // Check if safe search is enabled on URL
  isSafeSearchEnabled(url) {
    const searchEngine = this.isSearchEngine(url);
    if (!searchEngine) return true;

    return !searchEngine.config.detectUnsafe(url);
  },

  // Process search URL - returns { action: 'allow'|'redirect'|'block', url?: string }
  processSearchUrl(url) {
    // Check for blocked terms first
    if (this.containsBlockedTerms(url)) {
      return { action: 'block', reason: 'blocked_term' };
    }

    // Check if it's a search page
    if (!this.isSearchPage(url)) {
      return { action: 'allow' };
    }

    // Check if safe search is already enabled
    if (this.isSafeSearchEnabled(url)) {
      return { action: 'allow' };
    }

    // Redirect to safe search version
    const safeUrl = this.getSafeSearchUrl(url);
    return { action: 'redirect', url: safeUrl };
  },

  // Get safe search status for display
  async getStatus() {
    const result = await chrome.storage.sync.get(['safeSearchConfig']);
    const config = result.safeSearchConfig || {
      enabled: true,
      blockTerms: true,
      enforceStrict: true
    };

    return config;
  },

  // Save safe search configuration
  async saveConfig(config) {
    await chrome.storage.sync.set({ safeSearchConfig: config });
  },

  // URL modification rules for declarativeNetRequest
  getDeclarativeRules() {
    const rules = [];
    let ruleId = 1000;

    for (const [name, config] of Object.entries(this.engines)) {
      for (const domain of config.domains) {
        rules.push({
          id: ruleId++,
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              transform: {
                queryTransform: {
                  addOrReplaceParams: [
                    { key: config.safeParam, value: config.safeValue }
                  ]
                }
              }
            }
          },
          condition: {
            urlFilter: `||${domain}`,
            resourceTypes: ['main_frame']
          }
        });
      }
    }

    return rules;
  }
};

// Export
if (typeof window !== 'undefined') {
  window.SafeSearch = SafeSearch;
}
if (typeof module !== 'undefined') {
  module.exports = SafeSearch;
}
