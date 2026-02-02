// Facebook & Instagram Platform Integration
// Specialized filtering for Meta platforms

const FacebookFilter = {
  // Configuration
  config: {
    filterPosts: true,
    filterComments: true,
    filterStories: true,
    filterMessages: false,
    blurImages: true,
    hideSponsored: false
  },

  // Selectors for Facebook elements
  selectors: {
    // Facebook
    fbPosts: '[data-ad-preview="message"], [data-testid="post_message"]',
    fbComments: '[aria-label*="Comment"] [dir="auto"]',
    fbStories: '[aria-label="Stories"]',
    fbImages: '[data-visualcompletion="media-vc-image"] img',
    fbSponsored: '[aria-label*="Sponsored"]',

    // Instagram
    igPosts: 'article [class*="Caption"]',
    igComments: '[class*="Comment"] span',
    igStories: '[class*="Story"]',
    igImages: 'article img[class*="Image"]',

    // Shared
    textContent: '[dir="auto"]',
    mediaContent: 'img, video'
  },

  // Initialize
  init() {
    if (!this.isFacebookOrInstagram()) return;

    this.loadConfig().then(() => {
      this.setupObserver();
      this.filterExistingContent();
    });
  },

  // Check if current page is Facebook or Instagram
  isFacebookOrInstagram() {
    const host = window.location.hostname;
    return host.includes('facebook.com') || host.includes('instagram.com');
  },

  isFacebook() {
    return window.location.hostname.includes('facebook.com');
  },

  isInstagram() {
    return window.location.hostname.includes('instagram.com');
  },

  // Load configuration
  async loadConfig() {
    const result = await chrome.storage.sync.get(['facebookConfig']);
    if (result.facebookConfig) {
      this.config = { ...this.config, ...result.facebookConfig };
    }
  },

  // Setup mutation observer
  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNewContent = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewContent = true;
          break;
        }
      }

      if (hasNewContent) {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
          this.filterExistingContent();
        }, 150);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  // Filter existing content
  filterExistingContent() {
    if (this.config.filterPosts) this.filterPosts();
    if (this.config.filterComments) this.filterComments();
    if (this.config.blurImages) this.checkImages();
  },

  // Filter posts
  filterPosts() {
    const selector = this.isFacebook()
      ? this.selectors.fbPosts
      : this.selectors.igPosts;

    const posts = document.querySelectorAll(selector);

    posts.forEach(post => {
      if (post.dataset.fbFiltered) return;

      const text = post.textContent;
      if (this.containsProfanity(text)) {
        this.filterPost(post);
        post.dataset.fbFiltered = 'true';
      }
    });
  },

  // Filter a post
  filterPost(postElement) {
    const article = postElement.closest('article') ||
                    postElement.closest('[role="article"]') ||
                    postElement.closest('[data-pagelet*="FeedUnit"]');

    if (!article) {
      // Just filter text if no article found
      this.filterTextInElement(postElement);
      return;
    }

    // Dim the post
    article.style.opacity = '0.3';
    article.style.position = 'relative';

    // Add filter overlay
    if (!article.querySelector('.fb-filter-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'fb-filter-overlay';
      overlay.innerHTML = `
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
          <span>🛡️</span>
          <span>Content Filtered</span>
          <button style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 14px;
            padding: 0 4px;
            margin-left: 4px;
          " onclick="this.closest('[role=article], article, [data-pagelet*=FeedUnit]').style.opacity='1'; this.closest('.fb-filter-overlay').remove();">✕</button>
        </div>
      `;
      article.appendChild(overlay);
    }
  },

  // Filter comments
  filterComments() {
    const selector = this.isFacebook()
      ? this.selectors.fbComments
      : this.selectors.igComments;

    const comments = document.querySelectorAll(selector);

    comments.forEach(comment => {
      if (comment.dataset.commentFiltered) return;

      const text = comment.textContent;
      if (this.containsProfanity(text)) {
        this.filterComment(comment);
        comment.dataset.commentFiltered = 'true';
      }
    });
  },

  // Filter a comment
  filterComment(commentElement) {
    // Blur and add reveal on hover
    commentElement.style.filter = 'blur(4px)';
    commentElement.style.cursor = 'pointer';
    commentElement.title = 'Click to reveal filtered comment';

    commentElement.addEventListener('click', function onClick(e) {
      e.stopPropagation();
      this.style.filter = 'none';
      this.removeEventListener('click', onClick);
    });
  },

  // Filter text in element
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

  // Check and blur inappropriate images
  checkImages() {
    const selector = this.isFacebook()
      ? this.selectors.fbImages
      : this.selectors.igImages;

    const images = document.querySelectorAll(selector);

    images.forEach(img => {
      if (img.dataset.imgChecked) return;
      img.dataset.imgChecked = 'true';

      // Check associated text content
      const container = img.closest('article') || img.closest('[role="article"]');
      if (!container) return;

      const textElement = container.querySelector('[dir="auto"]');
      if (textElement && this.containsProfanity(textElement.textContent)) {
        this.blurImage(img);
      }

      // Check image src for keywords
      if (this.containsNsfwKeyword(img.src || img.dataset.src || '')) {
        this.blurImage(img);
      }
    });
  },

  // Blur an image
  blurImage(img) {
    img.style.filter = 'blur(25px)';
    img.style.transition = 'filter 0.3s ease';
    img.dataset.blurred = 'true';

    // Add overlay
    const container = img.parentElement;
    if (container && !container.querySelector('.img-blur-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'img-blur-overlay';
      overlay.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          text-align: center;
          z-index: 10;
        ">
          <div style="font-size: 28px; margin-bottom: 8px;">🛡️</div>
          <div style="font-size: 14px; font-weight: 600;">Image Hidden</div>
          <button style="
            margin-top: 12px;
            background: white;
            color: black;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          ">Show Image</button>
        </div>
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
      `;

      overlay.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        img.style.filter = 'none';
        overlay.remove();
      });

      container.style.position = 'relative';
      container.appendChild(overlay);
    }
  },

  // Profanity check
  containsProfanity(text) {
    if (!text) return false;

    if (typeof window.containsProfanity === 'function') {
      return window.containsProfanity(text, 'moderate');
    }

    const basicWords = ['fuck', 'shit', 'porn', 'xxx', 'nsfw', 'nude'];
    const lowerText = text.toLowerCase();
    return basicWords.some(word => lowerText.includes(word));
  },

  // NSFW keyword check
  containsNsfwKeyword(text) {
    if (!text) return false;
    const keywords = ['porn', 'xxx', 'nsfw', 'nude', 'naked', 'sex', 'onlyfans'];
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
      postsFiltered: document.querySelectorAll('[data-fb-filtered="true"]').length,
      commentsFiltered: document.querySelectorAll('[data-comment-filtered="true"]').length,
      imagesBlurred: document.querySelectorAll('[data-blurred="true"]').length
    };
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => FacebookFilter.init());
} else {
  FacebookFilter.init();
}

// Export
if (typeof window !== 'undefined') {
  window.FacebookFilter = FacebookFilter;
}
