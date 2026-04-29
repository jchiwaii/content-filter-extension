// Reddit Platform Integration
// Specialized filtering for Reddit content

const RedditFilter = {
  // Configuration
  config: {
    filterPosts: true,
    filterComments: true,
    filterTitles: true,
    blurNsfwPosts: true,
    hideNsfwSubreddits: true,
    filterUsernames: false,
    collapseFilteredComments: true
  },

  // Selectors for Reddit elements (supports both old and new Reddit)
  selectors: {
    // New Reddit
    newPosts: '[data-testid="post-container"]',
    newPostTitles: 'h3, [data-adclicklocation="title"]',
    newPostContent: '[data-click-id="text"]',
    newComments: '[data-testid="comment"]',
    newCommentContent: '[data-testid="comment"] > div:nth-child(2)',
    newNsfwTag: '[data-testid="post-container"] [aria-label*="NSFW"]',
    newSubredditName: '[data-testid="subreddit-name"]',

    // Old Reddit
    oldPosts: '.thing.link',
    oldPostTitles: 'a.title',
    oldComments: '.comment',
    oldCommentContent: '.usertext-body',
    oldNsfwTag: '.nsfw-stamp',

    // Shared
    mediaContent: 'img, video, [data-testid="media-element"]',
    spoilerContent: '[data-spoiler]'
  },

  // NSFW subreddit patterns
  nsfwSubreddits: [
    /^r\/nsfw/i, /^r\/gonewild/i, /^r\/porn/i, /^r\/sex/i,
    /^r\/adult/i, /^r\/xxx/i, /^r\/nude/i, /^r\/naked/i
  ],

  // Initialize Reddit filter
  init() {
    if (!this.isReddit()) return;

    this.loadConfig().then(() => {
      this.detectRedditVersion();
      this.setupObserver();
      this.filterExistingContent();
      this.setupNavigationHandler();
    });
  },

  // Check if current page is Reddit
  isReddit() {
    return window.location.hostname.includes('reddit.com');
  },

  // Detect Reddit version (old vs new)
  detectRedditVersion() {
    this.isNewReddit = !document.querySelector('#header');
    this.isOldReddit = document.querySelector('#header') !== null;
  },

  // Load configuration
  async loadConfig() {
    const result = await chrome.storage.sync.get(['redditConfig']);
    if (result.redditConfig) {
      this.config = { ...this.config, ...result.redditConfig };
    }
  },

  // Save configuration
  async saveConfig(config) {
    this.config = { ...this.config, ...config };
    await chrome.storage.sync.set({ redditConfig: this.config });
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
        }, 150);
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
    if (this.config.filterPosts || this.config.filterTitles) this.filterPosts();
    if (this.config.filterComments) this.filterComments();
    if (this.config.blurNsfwPosts) this.handleNsfwPosts();
    if (this.config.hideNsfwSubreddits) this.hideNsfwSubredditContent();
  },

  // Filter dynamic content
  filterDynamicContent() {
    this.filterExistingContent();
  },

  // Filter posts
  filterPosts() {
    const postSelector = this.isNewReddit
      ? this.selectors.newPosts
      : this.selectors.oldPosts;

    const posts = document.querySelectorAll(postSelector);

    posts.forEach(post => {
      if (post.dataset.postFiltered) return;
      post.dataset.postFiltered = 'true';

      // Get title
      const titleSelector = this.isNewReddit
        ? this.selectors.newPostTitles
        : this.selectors.oldPostTitles;
      const title = post.querySelector(titleSelector);
      const titleText = title?.textContent || '';

      // Get content
      const contentSelector = this.isNewReddit
        ? this.selectors.newPostContent
        : '.usertext-body';
      const content = post.querySelector(contentSelector);
      const contentText = content?.textContent || '';

      const fullText = `${titleText} ${contentText}`;

      if (this.containsProfanity(fullText)) {
        this.filterPost(post, titleText);
      }
    });
  },

  // Filter a post
  filterPost(post, titleText) {
    post.style.opacity = '0.3';
    post.style.position = 'relative';

    // Add warning overlay
    if (!post.querySelector('.reddit-filter-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'reddit-filter-overlay';

      const inner = document.createElement('div');
      inner.style.cssText = `
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(4, 4, 4, 0.92);
        color: white;
        padding: 4px 12px;
        border: 1px solid rgba(255, 85, 85, 0.42);
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 6px;
      `;

      const icon = document.createElement('img');
      icon.src = chrome.runtime.getURL('assets/icons/safe-browse-logo.svg');
      icon.alt = '';
      icon.width = 14;
      icon.height = 18;
      icon.style.cssText = 'width: 14px; height: 18px; object-fit: contain;';
      const label = document.createElement('span');
      label.textContent = 'Content Filtered';
      const btn = document.createElement('button');
      btn.textContent = '✕';
      btn.style.cssText = 'background: none; border: none; color: white; cursor: pointer; padding: 0 4px; font-size: 14px;';
      btn.addEventListener('click', () => {
        post.style.opacity = '1';
        overlay.remove();
      });

      inner.appendChild(icon);
      inner.appendChild(label);
      inner.appendChild(btn);
      overlay.appendChild(inner);
      post.appendChild(overlay);
    }
  },

  // Filter comments
  filterComments() {
    const commentSelector = this.isNewReddit
      ? this.selectors.newComments
      : this.selectors.oldComments;

    const comments = document.querySelectorAll(commentSelector);

    comments.forEach(comment => {
      if (comment.dataset.commentFiltered) return;

      const contentSelector = this.isNewReddit
        ? '[id^="comment-content"]'
        : this.selectors.oldCommentContent;
      const content = comment.querySelector(contentSelector);
      const text = content?.textContent || '';

      if (this.containsProfanity(text)) {
        this.filterComment(comment, content);
        comment.dataset.commentFiltered = 'true';
      }
    });
  },

  // Filter a comment
  filterComment(comment, contentElement) {
    if (this.config.collapseFilteredComments) {
      // Collapse the comment
      comment.style.maxHeight = '60px';
      comment.style.overflow = 'hidden';
      comment.style.position = 'relative';

      // Add expand overlay
      if (!comment.querySelector('.comment-filter-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'comment-filter-overlay';
        overlay.innerHTML = `
          <div style="
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40px;
            background: linear-gradient(transparent, rgba(255,255,255,0.95));
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 8px;
          ">
            <button style="
              background: #040404;
              color: white;
              border: 1px solid rgba(217, 217, 217, 0.28);
              padding: 4px 12px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 500;
              cursor: pointer;
            ">Show filtered comment</button>
          </div>
        `;

        overlay.querySelector('button').addEventListener('click', () => {
          comment.style.maxHeight = 'none';
          comment.style.overflow = 'visible';
          overlay.remove();
        });

        comment.appendChild(overlay);
      }
    } else {
      // Just filter the text
      if (contentElement) {
        this.filterTextInElement(contentElement);
      }
    }
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

  // Handle NSFW posts
  handleNsfwPosts() {
    // Find posts with NSFW tags
    const nsfwSelector = this.isNewReddit
      ? this.selectors.newNsfwTag
      : this.selectors.oldNsfwTag;

    // Also check for data attributes
    const nsfwPosts = document.querySelectorAll('[data-nsfw="true"], .nsfw, .over18');

    nsfwPosts.forEach(post => {
      const container = post.closest('[data-testid="post-container"], .thing');
      if (!container || container.dataset.nsfwHandled) return;
      container.dataset.nsfwHandled = 'true';

      // Blur media
      const media = container.querySelectorAll('img, video');
      media.forEach(m => {
        if (!m.dataset.nsfwBlurred) {
          m.style.filter = 'blur(30px)';
          m.dataset.nsfwBlurred = 'true';
        }
      });

      // Add NSFW overlay
      if (!container.querySelector('.nsfw-overlay')) {
        this.addNsfwOverlay(container);
      }
    });
  },

  // Add NSFW overlay
  addNsfwOverlay(container) {
    const overlay = document.createElement('div');
    overlay.className = 'nsfw-overlay';
    overlay.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(4, 4, 4, 0.94);
        color: white;
        padding: 20px 24px;
        border: 1px solid rgba(217, 217, 217, 0.28);
        border-radius: 8px;
        text-align: center;
        z-index: 100;
        font-family: "Azeret Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      ">
        <img src="${chrome.runtime.getURL('assets/icons/safe-browse-logo.svg')}" alt="" width="32" height="42" style="width: 32px; height: 42px; object-fit: contain; margin-bottom: 10px;">
        <div style="font-size: 15px; font-weight: 500;">Content hidden</div>
        <div style="font-size: 12px; color: #93969f; margin: 8px 0;">This post matched your filter settings.</div>
        <button style="
          background: rgba(255, 85, 85, 0.14);
          color: white;
          border: 1px solid rgba(255, 85, 85, 0.42);
          padding: 8px 20px;
          border-radius: 999px;
          cursor: pointer;
          margin-top: 8px;
          font: inherit;
        ">Show anyway</button>
      </div>
    `;
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 50;
    `;

    overlay.querySelector('button').addEventListener('click', () => {
      // Unblur media
      container.querySelectorAll('[data-nsfw-blurred="true"]').forEach(m => {
        m.style.filter = 'none';
      });
      overlay.remove();
    });

    container.style.position = 'relative';
    container.appendChild(overlay);
  },

  // Hide NSFW subreddit content
  hideNsfwSubredditContent() {
    // Check current subreddit
    const path = window.location.pathname;
    const subredditMatch = path.match(/^\/r\/([^\/]+)/);

    if (subredditMatch) {
      const subreddit = `r/${subredditMatch[1]}`;

      for (const pattern of this.nsfwSubreddits) {
        if (pattern.test(subreddit)) {
          this.showSubredditBlockPage(subreddit);
          return;
        }
      }
    }

    // Also check posts from NSFW subreddits in feeds
    const subredditLinks = document.querySelectorAll('[data-testid="subreddit-name"], .subreddit');
    subredditLinks.forEach(link => {
      const text = link.textContent;
      for (const pattern of this.nsfwSubreddits) {
        if (pattern.test(text)) {
          const post = link.closest('[data-testid="post-container"], .thing');
          if (post && !post.dataset.subredditHidden) {
            post.style.display = 'none';
            post.dataset.subredditHidden = 'true';
          }
        }
      }
    });
  },

  // Show block page for NSFW subreddit
  showSubredditBlockPage(subreddit) {
    if (document.querySelector('.subreddit-blocked-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'subreddit-blocked-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: #040404; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      font-family: "Azeret Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    `;

    const card = document.createElement('div');
    card.style.cssText = 'background: rgba(217,217,217,0.045); color: white; border: 1px solid rgba(217,217,217,0.28); padding: 34px; border-radius: 8px; text-align: center; max-width: 420px; margin: 24px;';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('assets/icons/safe-browse-logo.svg');
    icon.alt = '';
    icon.width = 56;
    icon.height = 74;
    icon.style.cssText = 'width: 56px; height: 74px; object-fit: contain; margin-bottom: 16px;';

    const title = document.createElement('h1');
    title.style.cssText = 'color: #ffffff; margin: 0 0 12px; font-size: 28px; font-weight: 500; line-height: 1.2;';
    title.textContent = 'Subreddit Blocked';

    const desc = document.createElement('p');
    desc.style.cssText = 'color: #93969f; margin: 0 0 24px; font-size: 13px; line-height: 1.6;';
    const strong = document.createElement('strong');
    strong.textContent = subreddit;  // textContent prevents XSS
    desc.appendChild(strong);
    desc.append(' has been identified as containing adult content and is blocked.');

    const btn = document.createElement('button');
    btn.textContent = 'Go Back';
    btn.style.cssText = 'background: #2838e3; color: white; border: none; min-height: 44px; padding: 0 22px; border-radius: 999px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600;';
    btn.addEventListener('click', () => history.back());

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  },

  // Profanity check
  containsProfanity(text) {
    if (!text) return false;

    if (typeof window.containsProfanity === 'function') {
      return window.containsProfanity(text);
    }

    const basicWords = ['fuck', 'shit', 'porn', 'xxx', 'nsfw'];
    const lowerText = text.toLowerCase();
    return basicWords.some(word => lowerText.includes(word));
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
      postsFiltered: document.querySelectorAll('[data-post-filtered="true"]').length,
      commentsFiltered: document.querySelectorAll('[data-comment-filtered="true"]').length,
      nsfwBlocked: document.querySelectorAll('[data-nsfw-handled="true"]').length
    };
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RedditFilter.init());
} else {
  RedditFilter.init();
}

// Export
if (typeof window !== 'undefined') {
  window.RedditFilter = RedditFilter;
}
