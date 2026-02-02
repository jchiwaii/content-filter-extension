// Site Blocklist Database
// Categorized list of domains and URL patterns to block

const BlocklistData = {
  // Version for updates
  version: '1.0.0',
  lastUpdated: '2024-01-01',

  // Categories with domain patterns
  categories: {
    adult: {
      name: 'Adult Content',
      description: 'Pornographic and explicit adult websites',
      icon: '🔞',
      domains: [
        'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
        'youporn.com', 'tube8.com', 'spankbang.com', 'beeg.com', 'txxx.com',
        'porn.com', 'xporn.com', 'xxxvideos.com', 'pornmd.com', 'eporner.com',
        'porntrex.com', 'hqporner.com', 'porndig.com', 'pornone.com', 'porn300.com',
        'onlyfans.com', 'fansly.com', 'manyvids.com', 'clips4sale.com',
        'chaturbate.com', 'livejasmin.com', 'stripchat.com', 'bongacams.com',
        'cam4.com', 'camsoda.com', 'myfreecams.com', 'streamate.com',
        'brazzers.com', 'realitykings.com', 'bangbros.com', 'naughtyamerica.com',
        'mofos.com', 'digitalplayground.com', 'wicked.com', 'adulttime.com',
        'rule34.xxx', 'rule34.paheal.net', 'e621.net', 'gelbooru.com',
        'nhentai.net', 'hanime.tv', 'hentaihaven.xxx', 'hentai2read.com',
        'fakku.net', 'tsumino.com', 'doujins.com', 'luscious.net',
        'literotica.com', 'sexstories.com', 'asstr.org', 'storiesonline.net'
      ],
      patterns: [
        /porn/i, /xxx/i, /adult/i, /nsfw/i, /hentai/i,
        /nude/i, /naked/i, /erotic/i, /sex\./i
      ]
    },

    gambling: {
      name: 'Gambling',
      description: 'Online gambling and betting sites',
      icon: '🎰',
      domains: [
        'bet365.com', 'draftkings.com', 'fanduel.com', 'betmgm.com', 'caesars.com',
        'pokerstars.com', 'partypoker.com', '888poker.com', 'wsop.com',
        'bovada.lv', 'betonline.ag', 'mybookie.ag', 'betway.com', 'unibet.com',
        'williamhill.com', 'ladbrokes.com', 'paddypower.com', 'betfair.com',
        'stake.com', 'roobet.com', 'bc.game', 'duelbits.com', 'rollbit.com',
        'casumo.com', 'leovegas.com', '888casino.com', 'betsson.com'
      ],
      patterns: [
        /casino/i, /poker(?!mon)/i, /betting/i, /gambl/i, /slots/i
      ]
    },

    drugs: {
      name: 'Drugs',
      description: 'Drug-related content and marketplaces',
      icon: '💊',
      domains: [
        'erowid.org', 'drugs-forum.com', 'bluelight.org',
        'rollsafe.org', 'tripsit.me', 'psychonautwiki.org'
      ],
      patterns: [
        /drug-market/i, /buy-drugs/i, /dark-?net-?market/i
      ]
    },

    violence: {
      name: 'Violence & Gore',
      description: 'Graphic violence and disturbing content',
      icon: '⚠️',
      domains: [
        'bestgore.fun', 'theync.com', 'kaotic.com', 'crazyshit.com',
        'documentingreality.com', 'goregrish.com', 'seegore.com'
      ],
      patterns: [
        /gore/i, /death-?video/i, /murder-?video/i, /execution/i
      ]
    },

    weapons: {
      name: 'Weapons',
      description: 'Weapons sales and manufacturing',
      icon: '🔫',
      domains: [
        'gunbroker.com', 'budsgunshop.com', 'palmettostatearmory.com',
        'cheaperthandirt.com', 'midwayusa.com', 'brownells.com'
      ],
      patterns: [
        /buy-?guns/i, /gun-?shop/i, /ammo-?store/i
      ]
    },

    hate: {
      name: 'Hate Speech',
      description: 'Extremist and hate content',
      icon: '🚫',
      domains: [
        'stormfront.org', 'dailystormer.su', 'vdare.com'
      ],
      patterns: [
        /white-?power/i, /nazi/i, /kkk/i
      ]
    },

    phishing: {
      name: 'Phishing & Scams',
      description: 'Known phishing and scam sites',
      icon: '🎣',
      domains: [],
      patterns: [
        /paypal.*login/i, /facebook.*login/i, /google.*signin/i,
        /bank.*verify/i, /account.*suspend/i
      ]
    },

    malware: {
      name: 'Malware',
      description: 'Known malware distribution sites',
      icon: '🦠',
      domains: [],
      patterns: [
        /free-?download/i, /crack-?software/i, /keygen/i, /warez/i
      ]
    },

    socialMedia: {
      name: 'Social Media',
      description: 'Social networking sites (for time management)',
      icon: '📱',
      domains: [
        'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
        'tiktok.com', 'snapchat.com', 'pinterest.com', 'tumblr.com',
        'reddit.com', 'linkedin.com', 'threads.net', 'mastodon.social',
        'discord.com', 'telegram.org', 'whatsapp.com'
      ],
      patterns: []
    },

    gaming: {
      name: 'Gaming',
      description: 'Gaming sites (for time management)',
      icon: '🎮',
      domains: [
        'steampowered.com', 'store.steampowered.com', 'epicgames.com',
        'roblox.com', 'minecraft.net', 'fortnite.com', 'twitch.tv',
        'itch.io', 'gog.com', 'origin.com', 'ubisoft.com', 'ea.com',
        'newgrounds.com', 'kongregate.com', 'armorgames.com', 'miniclip.com',
        'crazygames.com', 'poki.com', 'y8.com', 'addictinggames.com'
      ],
      patterns: []
    },

    streaming: {
      name: 'Streaming',
      description: 'Video streaming sites (for time management)',
      icon: '📺',
      domains: [
        'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com',
        'hbomax.com', 'max.com', 'peacocktv.com', 'paramountplus.com',
        'primevideo.com', 'crunchyroll.com', 'funimation.com',
        'twitch.tv', 'kick.com', 'rumble.com', 'dailymotion.com',
        'vimeo.com', 'bitchute.com', 'odysee.com'
      ],
      patterns: []
    }
  },

  // Check if domain is blocked
  isDomainBlocked(domain, enabledCategories = ['adult']) {
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

    for (const [categoryId, category] of Object.entries(this.categories)) {
      if (!enabledCategories.includes(categoryId)) continue;

      // Check exact domain match
      if (category.domains.includes(normalizedDomain)) {
        return { blocked: true, category: categoryId, reason: 'domain' };
      }

      // Check if domain ends with blocked domain (subdomains)
      for (const blockedDomain of category.domains) {
        if (normalizedDomain.endsWith(`.${blockedDomain}`)) {
          return { blocked: true, category: categoryId, reason: 'subdomain' };
        }
      }

      // Check patterns
      for (const pattern of category.patterns) {
        if (pattern.test(normalizedDomain)) {
          return { blocked: true, category: categoryId, reason: 'pattern' };
        }
      }
    }

    return { blocked: false };
  },

  // Check if URL is blocked
  isUrlBlocked(url, enabledCategories = ['adult']) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      const fullUrl = domain + path;

      // Check domain first
      const domainResult = this.isDomainBlocked(domain, enabledCategories);
      if (domainResult.blocked) return domainResult;

      // Check URL patterns
      for (const [categoryId, category] of Object.entries(this.categories)) {
        if (!enabledCategories.includes(categoryId)) continue;

        for (const pattern of category.patterns) {
          if (pattern.test(fullUrl) || pattern.test(url)) {
            return { blocked: true, category: categoryId, reason: 'url_pattern' };
          }
        }
      }

      return { blocked: false };
    } catch {
      return { blocked: false };
    }
  },

  // Get category info
  getCategory(categoryId) {
    return this.categories[categoryId] || null;
  },

  // Get all categories
  getAllCategories() {
    return Object.entries(this.categories).map(([id, cat]) => ({
      id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      domainCount: cat.domains.length
    }));
  },

  // Add custom blocked domain
  async addCustomDomain(domain, category = 'custom') {
    const result = await chrome.storage.sync.get(['customBlocklist']);
    const customBlocklist = result.customBlocklist || { domains: [], patterns: [] };

    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    if (!customBlocklist.domains.includes(normalizedDomain)) {
      customBlocklist.domains.push(normalizedDomain);
      await chrome.storage.sync.set({ customBlocklist });
    }

    return customBlocklist;
  },

  // Remove custom blocked domain
  async removeCustomDomain(domain) {
    const result = await chrome.storage.sync.get(['customBlocklist']);
    const customBlocklist = result.customBlocklist || { domains: [], patterns: [] };

    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    customBlocklist.domains = customBlocklist.domains.filter(d => d !== normalizedDomain);
    await chrome.storage.sync.set({ customBlocklist });

    return customBlocklist;
  },

  // Get custom blocklist
  async getCustomBlocklist() {
    const result = await chrome.storage.sync.get(['customBlocklist']);
    return result.customBlocklist || { domains: [], patterns: [] };
  },

  // Check including custom blocklist
  async isBlocked(url, enabledCategories) {
    // Check built-in blocklist
    const builtInResult = this.isUrlBlocked(url, enabledCategories);
    if (builtInResult.blocked) return builtInResult;

    // Check custom blocklist
    const customBlocklist = await this.getCustomBlocklist();
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');

      for (const blockedDomain of customBlocklist.domains) {
        if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) {
          return { blocked: true, category: 'custom', reason: 'custom_domain' };
        }
      }
    } catch {
      // Invalid URL
    }

    return { blocked: false };
  }
};

// Export
if (typeof window !== 'undefined') {
  window.BlocklistData = BlocklistData;
}
if (typeof module !== 'undefined') {
  module.exports = BlocklistData;
}
