// Twitter/X Platform Integration
// Specialized filtering for Twitter content

const TwitterFilter = {
  // Configuration
  config: {
    filterTweets: true,
    filterReplies: true,
    filterBios: true,
    filterDMs: false,
    filterTrends: true,
    blurMedia: true,
    hideNsfwAccounts: true
  },

  // Selectors for Twitter elements
  selectors: {
    tweets: '[data-testid="tweetText"]',
    userBios: '[data-testid="UserDescription"]',
    userNames: '[data-testid="User-Name"]',
    tweetMedia: '[data-testid="tweetPhoto"], [data-testid="videoPlayer"]',
    trends: '[data-testid="trend"]',
    dms: '[data-testid="messageEntry"]',
    replies: '[data-testid="reply"]',
    cards: '[data-testid="card.wrapper"]',
    sensitiveWarning: '[data-testid="sensitiveMediaWarning"]'
  },

  // Initialize Twitter filter
  init() {
    if (!this.isTwitter()) return;

    this.loadConfig().then(() => {
      this.setupObserver();
      this.filterExistingContent();
      this.setupNavigationHandler();
    });
  },

  // Check if current page is Twitter
  isTwitter() {
    const host = window.location.hostname;
    return host.includes('twitter.com') || host.includes('x.com');
  },

  // Load configuration
  async loadConfig() {
    const result = await chrome.storage.sync.get(['twitterConfig']);
    if (result.twitterConfig) {
      this.config = { ...this.config, ...result.twitterConfig };
    }
  },

  // Save configuration
  async saveConfig(config) {
    this.config = { ...this.config, ...config };
    await chrome.storage.sync.set({ twitterConfig: this.config });
  },

  // Setup mutation observer
  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldFilter = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldFilter = true;
          break;
        }
      }

      if (shouldFilter) {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
          this.filterDynamicContent();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  // Setup navigation handler
  setupNavigationHandler() {
    let lastUrl = location.href;

    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.filterExistingContent();
      }
    }, 500);
  },

  // Filter existing content
  filterExistingContent() {
    if (this.config.filterTweets) this.filterTweets();
    if (this.config.filterBios) this.filterBios();
    if (this.config.filterTrends) this.filterTrends();
    if (this.config.blurMedia) this.checkMedia();
  },

  // Filter dynamic content
  filterDynamicContent() {
    this.filterExistingContent();
  },

  // Filter tweets
  filterTweets() {
    const tweets = document.querySelectorAll(this.selectors.tweets);

    tweets.forEach(tweet => {
      if (tweet.dataset.filtered) return;

      const text = tweet.textContent;
      if (this.containsProfanity(text)) {
        this.filterTweetContent(tweet);
        tweet.dataset.filtered = 'true';
      }
    });
  },

  // Filter a specific tweet
  filterTweetContent(tweetElement) {
    // Keep the tweet visible; only remove the matched words from text nodes.
    this.filterTextInElement(tweetElement);
  },

  // Filter text in an element
  filterTextInElement(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
      if (this.containsProfanity(node.textContent)) {
        node.textContent = this.filterText(node.textContent);
      }
    });
  },

  // Filter user bios
  filterBios() {
    const bios = document.querySelectorAll(this.selectors.userBios);

    bios.forEach(bio => {
      if (bio.dataset.bioFiltered) return;

      const text = bio.textContent;
      if (this.containsProfanity(text)) {
        this.filterTextInElement(bio);
        bio.dataset.bioFiltered = 'true';
      }
    });
  },

  // Filter trending topics
  filterTrends() {
    const trends = document.querySelectorAll(this.selectors.trends);

    trends.forEach(trend => {
      if (trend.dataset.trendFiltered) return;
      trend.dataset.trendFiltered = 'true';

      const text = trend.textContent;
      if (this.containsProfanity(text) || this.containsNsfwKeyword(text)) {
        trend.style.display = 'none';
      }
    });
  },

  // Check and blur media
  checkMedia() {
    const mediaElements = document.querySelectorAll(this.selectors.tweetMedia);

    mediaElements.forEach(media => {
      if (media.dataset.mediaChecked) return;
      media.dataset.mediaChecked = 'true';

      // Get associated tweet text
      const article = media.closest('article');
      if (!article) return;

      // Check for sensitive content warning already present
      const sensitiveWarning = article.querySelector(this.selectors.sensitiveWarning);
      if (sensitiveWarning) {
        // Already has warning, enhance it
        this.enhanceSensitiveWarning(sensitiveWarning);
      }
    });
  },

  // Blur media element
  blurMedia(media) {
    media.style.filter = 'blur(30px)';
    media.style.transition = 'filter 0.3s ease';
    media.dataset.blurred = 'true';

    // Add overlay
    const container = media.parentElement;
    if (container && !container.querySelector('.media-blur-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'media-blur-overlay';
      overlay.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(4, 4, 4, 0.94);
          color: white;
          padding: 12px 16px;
          border: 1px solid rgba(217, 217, 217, 0.28);
          border-radius: 8px;
          text-align: center;
          z-index: 10;
          font-family: "Azeret Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        ">
          <img src="${chrome.runtime.getURL('assets/icons/safe-browse-logo.svg')}" alt="" width="28" height="37" style="width: 28px; height: 37px; object-fit: contain; margin-bottom: 8px;">
          <div style="font-size: 14px; font-weight: 500;">Media hidden</div>
          <div style="font-size: 11px; color: #93969f; margin-top: 4px;">Click to reveal</div>
        </div>
      `;
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
      `;

      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        media.style.filter = 'none';
        overlay.remove();
      });

      container.style.position = 'relative';
      container.appendChild(overlay);
    }
  },

  // Enhance sensitive warning
  enhanceSensitiveWarning(warning) {
    if (warning.dataset.enhanced) return;
    warning.dataset.enhanced = 'true';

    // Add our own styling
    warning.style.background = '#040404';
    warning.style.border = '1px solid rgba(255, 85, 85, 0.42)';
  },

  // Simple profanity check
  containsProfanity(text) {
    if (!text) return false;

    if (typeof window.containsProfanity === 'function') {
      return window.containsProfanity(text);
    }

    const basicWords = ['fuck', 'shit', 'porn', 'xxx', 'nsfw', 'nude', 'naked'];
    return this.containsKeyword(text, basicWords);
  },

  // Check for NSFW keywords
  containsNsfwKeyword(text) {
    if (!text) return false;
    const keywords = ['porn', 'xxx', 'nsfw', 'nude', 'naked', 'explicit', 'onlyfans', 'fansly', '18+'];
    return this.containsKeyword(text, keywords);
  },

  containsKeyword(text, keywords) {
    const value = String(text).toLowerCase();
    return keywords.some(keyword => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s-]+');
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(value);
    });
  },

  // Remove profanity from text
  filterText(text) {
    if (typeof window.removeProfanity === 'function') {
      return window.removeProfanity(text);
    }

    // Basic fallback: remove known words
    const words = ['fuck', 'shit', 'damn', 'ass', 'bitch'];
    let filtered = text;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '');
    });
    return filtered.replace(/[ \t]{2,}/g, ' ').trim();
  },

  // Get stats
  getStats() {
    return {
      tweetsFiltered: document.querySelectorAll('[data-filtered="true"]').length,
      mediaBlurred: document.querySelectorAll('[data-blurred="true"]').length,
      trendsHidden: document.querySelectorAll('[data-trend-filtered="true"][style*="display: none"]').length
    };
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TwitterFilter.init());
} else {
  TwitterFilter.init();
}

// Export
if (typeof window !== 'undefined') {
  window.TwitterFilter = TwitterFilter;
}
