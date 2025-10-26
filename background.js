// Background Service Worker
// Handles extension initialization and network-level blocking

// Default configuration
const defaultConfig = {
  filterImages: true,
  filterText: true,
  blurLevel: 20,
  strictMode: true,
  customWords: [],
  whitelistedDomains: [],
  statistics: {
    imagesBlocked: 0,
    wordsFiltered: 0,
    sitesProtected: 0
  }
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  // Set default configuration
  chrome.storage.sync.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.sync.set({ config: defaultConfig });
    }
  });
  
  // Create context menu items
  createContextMenus();
  
  console.log('Safe Browse Content Filter installed successfully');
});

// Create context menu items
function createContextMenus() {
  chrome.contextMenus.create({
    id: 'blockImage',
    title: 'Block similar images',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'whitelistSite',
    title: 'Whitelist this website',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'reportContent',
    title: 'Report inappropriate content',
    contexts: ['page', 'image', 'video']
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'blockImage':
      handleBlockImage(info.srcUrl);
      break;
    case 'whitelistSite':
      handleWhitelistSite(tab.url);
      break;
    case 'reportContent':
      handleReportContent(info, tab);
      break;
  }
});

// Handle blocking similar images
function handleBlockImage(imageUrl) {
  // Extract domain and path patterns
  const url = new URL(imageUrl);
  const pattern = `${url.hostname}${url.pathname.split('/').slice(0, -1).join('/')}/*`;
  
  // Add to blocked patterns
  chrome.storage.sync.get(['blockedPatterns'], (result) => {
    const patterns = result.blockedPatterns || [];
    if (!patterns.includes(pattern)) {
      patterns.push(pattern);
      chrome.storage.sync.set({ blockedPatterns: patterns });
      
      // Notify user
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Image Pattern Blocked',
        message: `Similar images from this source will now be blocked`
      });
    }
  });
}

// Handle whitelisting a site
function handleWhitelistSite(url) {
  const hostname = new URL(url).hostname;
  
  chrome.storage.sync.get(['config'], (result) => {
    const config = result.config || defaultConfig;
    if (!config.whitelistedDomains.includes(hostname)) {
      config.whitelistedDomains.push(hostname);
      chrome.storage.sync.set({ config });
      
      // Notify user
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Website Whitelisted',
        message: `${hostname} has been added to your whitelist`
      });
      
      // Reload the tab
      chrome.tabs.reload();
    }
  });
}

// Handle content reporting
function handleReportContent(info, tab) {
  // In a real implementation, this would send data to a server
  console.log('Content reported:', {
    url: tab.url,
    contentUrl: info.srcUrl || info.pageUrl,
    type: info.mediaType || 'page'
  });
  
  // Notify user
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Content Reported',
    message: 'Thank you for helping improve content filtering'
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'updateStatistics':
      updateStatistics(request.data);
      sendResponse({ success: true });
      break;
      
    case 'getConfig':
      chrome.storage.sync.get(['config'], (result) => {
        sendResponse(result.config || defaultConfig);
      });
      return true; // Keep channel open for async response
      
    case 'checkUrl':
      checkUrlSafety(request.url).then(sendResponse);
      return true; // Keep channel open for async response
      
    case 'reportBlocked':
      handleBlockedContent(request.data);
      sendResponse({ success: true });
      break;
  }
});

// Update statistics
function updateStatistics(data) {
  chrome.storage.sync.get(['config'], (result) => {
    const config = result.config || defaultConfig;
    
    if (data.imagesBlocked) {
      config.statistics.imagesBlocked += data.imagesBlocked;
    }
    if (data.wordsFiltered) {
      config.statistics.wordsFiltered += data.wordsFiltered;
    }
    if (data.siteProtected) {
      config.statistics.sitesProtected += 1;
    }
    
    chrome.storage.sync.set({ config });
  });
}

// Check URL safety (can be enhanced with external API)
async function checkUrlSafety(url) {
  // Basic URL safety check
  const dangerousPatterns = [
    /porn/i,
    /xxx/i,
    /adult/i,
    /nsfw/i,
    /nude/i,
    /sex/i
  ];
  
  const hostname = new URL(url).hostname;
  const isDangerous = dangerousPatterns.some(pattern => pattern.test(hostname));
  
  return {
    safe: !isDangerous,
    reason: isDangerous ? 'URL contains inappropriate keywords' : null
  };
}

// Handle blocked content reporting
function handleBlockedContent(data) {
  // Store blocked content data for analysis
  chrome.storage.local.get(['blockedContent'], (result) => {
    const blockedContent = result.blockedContent || [];
    blockedContent.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 entries
    if (blockedContent.length > 100) {
      blockedContent.shift();
    }
    
    chrome.storage.local.set({ blockedContent });
  });
}

// Set up declarative net request rules for blocking known NSFW domains
chrome.runtime.onInstalled.addListener(() => {
  // Known NSFW domains to block (this is a small sample)
  const blockedDomains = [
    '*://*.pornhub.com/*',
    '*://*.xvideos.com/*',
    '*://*.xnxx.com/*',
    '*://*.redtube.com/*',
    '*://*.youporn.com/*',
    '*://*.porn.com/*',
    '*://*.xxx.com/*'
  ];
  
  const rules = blockedDomains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: '/blocked.html'
      }
    },
    condition: {
      urlFilter: domain,
      resourceTypes: ['main_frame']
    }
  }));
  
  // Note: In manifest v3, you would use declarativeNetRequest API
  // This is a simplified example
  console.log('Domain blocking rules configured');
});

// Badge management
function updateBadge(tabId, blockedCount) {
  if (blockedCount > 0) {
    chrome.action.setBadgeText({
      text: blockedCount.toString(),
      tabId: tabId
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#DC2626',
      tabId: tabId
    });
  } else {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Reset badge for new page load
    updateBadge(tabId, 0);
  }
});

// Periodic cleanup of old data
chrome.alarms.create('cleanup', { periodInMinutes: 60 * 24 }); // Daily

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    // Clean up old blocked content data
    chrome.storage.local.get(['blockedContent'], (result) => {
      const blockedContent = result.blockedContent || [];
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const filtered = blockedContent.filter(item => {
        return new Date(item.timestamp) > oneDayAgo;
      });
      
      chrome.storage.local.set({ blockedContent: filtered });
    });
  }
});

console.log('Background service worker initialized');
