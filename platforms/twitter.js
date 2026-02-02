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
    // Get the tweet article container
    const article = tweetElement.closest('article');
    if (!article) return;

    // Dim the tweet
    article.style.opacity = '0.4';
    article.style.position = 'relative';

    // Add filter overlay
    if (!article.querySelector('.twitter-filter-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'twitter-filter-overlay';
      overlay.innerHTML = `
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>🛡️</span>
          <span>Filtered</span>
        </div>
      `;
      article.appendChild(overlay);
    }

    // Also filter the text content
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
        bio.style.filter = 'blur(4px)';
        bio.title = 'This bio may contain inappropriate content';
        bio.dataset.bioFiltered = 'true';

        // Add reveal on hover
        bio.style.cursor = 'pointer';
        bio.addEventListener('mouseenter', () => {
          bio.style.filter = 'none';
        });
        bio.addEventListener('mouseleave', () => {
          bio.style.filter = 'blur(4px)';
        });
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

      const tweetText = article.querySelector(this.selectors.tweets);
      if (tweetText && this.containsProfanity(tweetText.textContent)) {
        this.blurMedia(media);
      }

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
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          z-index: 10;
        ">
          <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
          <div style="font-size: 14px;">Media Hidden</div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">Click to reveal</div>
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
    warning.style.background = '#222823';
    warning.style.border = '2px solid #ef4444';
  },

  // Simple profanity check
  containsProfanity(text) {
    if (!text) return false;

    if (typeof window.containsProfanity === 'function') {
      return window.containsProfanity(text, 'moderate');
    }

    const basicWords = ['fuck', 'shit', 'porn', 'xxx', 'nsfw', 'nude', 'naked'];
    const lowerText = text.toLowerCase();
    return basicWords.some(word => lowerText.includes(word));
  },

  // Check for NSFW keywords
  containsNsfwKeyword(text) {
    if (!text) return false;
    const keywords = ['porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex', 'onlyfans', 'fansly', '18+', 'adult'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  },

  // Filter text
  filterText(text) {
    if (typeof window.censorProfanity === 'function') {
      return window.censorProfanity(text, 'moderate');
    }

    const words = ['fuck', 'shit', 'damn', 'ass', 'bitch'];
    let filtered = text;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
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
