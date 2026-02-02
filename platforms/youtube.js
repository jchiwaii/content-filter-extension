// YouTube Platform Integration
// Specialized filtering for YouTube content

const YouTubeFilter = {
  // Configuration
  config: {
    filterComments: true,
    filterTitles: true,
    filterDescriptions: true,
    blurThumbnails: true,
    filterSearch: true,
    hideRecommendations: false,
    enforceRestrictedMode: true
  },

  // Selectors for YouTube elements
  selectors: {
    comments: '#content-text',
    commentAuthors: '#author-text',
    videoTitles: '#video-title, #title yt-formatted-string, h1.ytd-video-primary-info-renderer',
    videoDescriptions: '#description, #description-inline-expander',
    thumbnails: 'img.yt-core-image, ytd-thumbnail img',
    searchResults: 'ytd-video-renderer, ytd-compact-video-renderer',
    recommendations: 'ytd-compact-video-renderer, ytd-rich-item-renderer',
    channelNames: '#channel-name, #text.ytd-channel-name',
    liveChatMessages: '#message, yt-live-chat-text-message-renderer #message',
    shorts: 'ytd-reel-video-renderer'
  },

  // Initialize YouTube filter
  init() {
    if (!this.isYouTube()) return;

    this.loadConfig().then(() => {
      this.setupObserver();
      this.filterExistingContent();
      this.enforceRestrictedMode();
      this.setupNavigationHandler();
    });
  },

  // Check if current page is YouTube
  isYouTube() {
    return window.location.hostname.includes('youtube.com');
  },

  // Load configuration
  async loadConfig() {
    const result = await chrome.storage.sync.get(['youtubeConfig']);
    if (result.youtubeConfig) {
      this.config = { ...this.config, ...result.youtubeConfig };
    }
  },

  // Save configuration
  async saveConfig(config) {
    this.config = { ...this.config, ...config };
    await chrome.storage.sync.set({ youtubeConfig: this.config });
  },

  // Setup mutation observer for dynamic content
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
        // Debounce filtering
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

  // Setup navigation handler for SPA
  setupNavigationHandler() {
    let lastUrl = location.href;

    // Watch for URL changes
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.onNavigate();
      }
    }, 500);

    // Also listen for history changes
    window.addEventListener('yt-navigate-finish', () => {
      this.onNavigate();
    });
  },

  // Handle navigation
  onNavigate() {
    this.filterExistingContent();
    this.enforceRestrictedMode();
  },

  // Filter existing content on page
  filterExistingContent() {
    if (this.config.filterComments) this.filterComments();
    if (this.config.filterTitles) this.filterTitles();
    if (this.config.filterDescriptions) this.filterDescriptions();
    if (this.config.blurThumbnails) this.checkThumbnails();
    if (this.config.filterSearch) this.filterSearchResults();
    if (this.config.hideRecommendations) this.filterRecommendations();
    this.filterLiveChat();
  },

  // Filter dynamic content (for observer)
  filterDynamicContent() {
    this.filterExistingContent();
  },

  // Filter comments
  filterComments() {
    const comments = document.querySelectorAll(this.selectors.comments);

    comments.forEach(comment => {
      if (comment.dataset.filtered) return;

      const text = comment.textContent;
      if (this.containsProfanity(text)) {
        this.filterTextNode(comment);
        comment.dataset.filtered = 'true';
      }
    });
  },

  // Filter video titles
  filterTitles() {
    const titles = document.querySelectorAll(this.selectors.videoTitles);

    titles.forEach(title => {
      if (title.dataset.filtered) return;

      const text = title.textContent;
      if (this.containsProfanity(text)) {
        // Mark for visibility - don't hide, just mark
        title.dataset.hasProfanity = 'true';
        title.style.opacity = '0.5';
        title.title = 'This title may contain inappropriate content';
      }
    });
  },

  // Filter descriptions
  filterDescriptions() {
    const descriptions = document.querySelectorAll(this.selectors.videoDescriptions);

    descriptions.forEach(desc => {
      if (desc.dataset.filtered) return;

      const text = desc.textContent;
      if (this.containsProfanity(text)) {
        this.filterTextNode(desc);
        desc.dataset.filtered = 'true';
      }
    });
  },

  // Check and blur inappropriate thumbnails
  checkThumbnails() {
    const thumbnails = document.querySelectorAll(this.selectors.thumbnails);

    thumbnails.forEach(thumb => {
      if (thumb.dataset.checked) return;
      thumb.dataset.checked = 'true';

      // Check associated title/metadata
      const container = thumb.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer');
      if (!container) return;

      const title = container.querySelector('#video-title, #title');
      if (title && this.containsProfanity(title.textContent)) {
        this.blurThumbnail(thumb);
      }

      // Check image src for keywords
      const src = thumb.src || '';
      if (this.containsNsfwKeyword(src)) {
        this.blurThumbnail(thumb);
      }
    });
  },

  // Blur a thumbnail
  blurThumbnail(thumb) {
    thumb.style.filter = 'blur(20px)';
    thumb.style.transition = 'filter 0.3s ease';
    thumb.dataset.blurred = 'true';

    // Add overlay
    const container = thumb.parentElement;
    if (container && !container.querySelector('.yt-blur-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'yt-blur-overlay';
      overlay.innerHTML = `
        <span style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 10;
        ">Potentially Inappropriate</span>
      `;
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      `;
      container.style.position = 'relative';
      container.appendChild(overlay);
    }
  },

  // Filter search results
  filterSearchResults() {
    const results = document.querySelectorAll(this.selectors.searchResults);

    results.forEach(result => {
      if (result.dataset.searchFiltered) return;
      result.dataset.searchFiltered = 'true';

      const title = result.querySelector('#video-title');
      const description = result.querySelector('#description-text');

      const titleText = title?.textContent || '';
      const descText = description?.textContent || '';

      if (this.containsProfanity(titleText) || this.containsProfanity(descText)) {
        // Dim the result instead of hiding
        result.style.opacity = '0.3';
        result.style.position = 'relative';

        // Add warning badge
        if (!result.querySelector('.search-warning-badge')) {
          const badge = document.createElement('div');
          badge.className = 'search-warning-badge';
          badge.innerHTML = '⚠️ Flagged';
          badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ef4444;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            z-index: 10;
          `;
          result.appendChild(badge);
        }
      }
    });
  },

  // Filter recommendations
  filterRecommendations() {
    const recommendations = document.querySelectorAll(this.selectors.recommendations);

    recommendations.forEach(rec => {
      if (rec.dataset.recFiltered) return;
      rec.dataset.recFiltered = 'true';

      const title = rec.querySelector('#video-title');
      if (title && this.containsProfanity(title.textContent)) {
        rec.style.display = 'none';
      }
    });
  },

  // Filter live chat
  filterLiveChat() {
    const messages = document.querySelectorAll(this.selectors.liveChatMessages);

    messages.forEach(msg => {
      if (msg.dataset.chatFiltered) return;

      const text = msg.textContent;
      if (this.containsProfanity(text)) {
        msg.textContent = '[Message filtered]';
        msg.style.color = '#999';
        msg.style.fontStyle = 'italic';
        msg.dataset.chatFiltered = 'true';
      }
    });
  },

  // Filter text in a node
  filterTextNode(node) {
    if (!node) return;

    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      if (this.containsProfanity(text)) {
        textNode.textContent = this.filterText(text);
      }
    });
  },

  // Simple profanity check (uses main filter if available)
  containsProfanity(text) {
    if (!text) return false;

    // Use global filter if available
    if (typeof window.containsProfanity === 'function') {
      return window.containsProfanity(text, 'moderate');
    }

    // Fallback basic check
    const basicWords = ['fuck', 'shit', 'porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex'];
    const lowerText = text.toLowerCase();
    return basicWords.some(word => lowerText.includes(word));
  },

  // Check for NSFW keywords in URL/text
  containsNsfwKeyword(text) {
    if (!text) return false;
    const keywords = ['porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex', 'hentai', 'adult'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  },

  // Filter text (replace profanity)
  filterText(text) {
    if (typeof window.censorProfanity === 'function') {
      return window.censorProfanity(text, 'moderate');
    }

    // Basic fallback
    const words = ['fuck', 'shit', 'damn', 'ass', 'bitch'];
    let filtered = text;
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
  },

  // Enforce restricted mode
  enforceRestrictedMode() {
    if (!this.config.enforceRestrictedMode) return;

    // Check if restricted mode is off
    const url = new URL(window.location.href);

    // YouTube uses cookies for restricted mode
    // We can't directly set it, but we can warn
    this.checkRestrictedMode();
  },

  // Check restricted mode status
  checkRestrictedMode() {
    // Look for restricted mode indicator in page
    const settingsMenu = document.querySelector('ytd-popup-container');

    // Add periodic check for restricted mode toggle
    const observer = new MutationObserver(() => {
      const restrictedToggle = document.querySelector('[data-restricted-mode]');
      if (restrictedToggle) {
        // Could add warning here if restricted mode is off
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  },

  // Get filtered content stats
  getStats() {
    return {
      commentsFiltered: document.querySelectorAll('[data-filtered="true"]').length,
      thumbnailsBlurred: document.querySelectorAll('[data-blurred="true"]').length,
      recommendationsHidden: document.querySelectorAll('[data-rec-filtered="true"][style*="display: none"]').length,
      searchResultsFlagged: document.querySelectorAll('.search-warning-badge').length
    };
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => YouTubeFilter.init());
} else {
  YouTubeFilter.init();
}

// Export
if (typeof window !== 'undefined') {
  window.YouTubeFilter = YouTubeFilter;
}
