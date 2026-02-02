// Notification System Module
// Handles toast notifications, badge updates, and alerts

const NotificationManager = {
  // Configuration
  config: {
    enabled: true,
    showToasts: true,
    playSound: false,
    badgeEnabled: true,
    dailySummary: false,
    summaryTime: '20:00'
  },

  // Notification queue for batching
  queue: [],
  batchTimeout: null,

  // Initialize notification system
  async init() {
    const result = await chrome.storage.sync.get(['notificationConfig']);
    if (result.notificationConfig) {
      this.config = { ...this.config, ...result.notificationConfig };
    }
    await this.updateBadge();
  },

  // Save configuration
  async saveConfig(config) {
    this.config = { ...this.config, ...config };
    await chrome.storage.sync.set({ notificationConfig: this.config });
  },

  // Get configuration
  async getConfig() {
    const result = await chrome.storage.sync.get(['notificationConfig']);
    return result.notificationConfig || this.config;
  },

  // Update badge with today's block count
  async updateBadge() {
    if (!this.config.badgeEnabled) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const result = await chrome.storage.local.get(['dailyStats']);
    const today = new Date().toDateString();
    const stats = result.dailyStats || {};

    let count = 0;
    if (stats.date === today) {
      count = (stats.wordsFiltered || 0) + (stats.sitesBlocked || 0);
    }

    if (count > 0) {
      const text = count > 999 ? '999+' : count.toString();
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#222823' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  },

  // Clear badge
  async clearBadge() {
    chrome.action.setBadgeText({ text: '' });
  },

  // Show browser notification
  async showNotification(title, message, options = {}) {
    if (!this.config.enabled) return;

    const notificationId = `cf-${Date.now()}`;

    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: title,
      message: message,
      priority: options.priority || 0,
      ...options
    });

    // Auto-clear after 5 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 5000);

    return notificationId;
  },

  // Queue notification for batching (avoid spam)
  queueNotification(type, data) {
    this.queue.push({ type, data, timestamp: Date.now() });

    // Batch notifications - wait 2 seconds before showing
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatchedNotifications();
    }, 2000);
  },

  // Process batched notifications
  async processBatchedNotifications() {
    if (this.queue.length === 0) return;

    const notifications = [...this.queue];
    this.queue = [];

    // Group by type
    const grouped = {};
    for (const n of notifications) {
      grouped[n.type] = grouped[n.type] || [];
      grouped[n.type].push(n.data);
    }

    // Show summary notifications
    for (const [type, items] of Object.entries(grouped)) {
      if (type === 'wordFiltered') {
        const count = items.length;
        if (count >= 5) {
          await this.showNotification(
            'Content Filtered',
            `${count} words filtered on this page`
          );
        }
      } else if (type === 'siteBlocked') {
        await this.showNotification(
          'Site Blocked',
          items[0].url ? `Blocked: ${items[0].url}` : 'A site was blocked'
        );
      } else if (type === 'imageBlocked') {
        const count = items.length;
        await this.showNotification(
          'Images Blocked',
          `${count} image(s) blocked on this page`
        );
      }
    }

    await this.updateBadge();
  },

  // Log activity
  async logActivity(type, data) {
    const result = await chrome.storage.local.get(['activityLog']);
    const log = result.activityLog || [];

    // Keep last 1000 entries
    if (log.length >= 1000) {
      log.shift();
    }

    log.push({
      type,
      data,
      timestamp: Date.now(),
      url: data.url || null
    });

    await chrome.storage.local.set({ activityLog: log });
  },

  // Get activity log
  async getActivityLog(limit = 100) {
    const result = await chrome.storage.local.get(['activityLog']);
    const log = result.activityLog || [];
    return log.slice(-limit).reverse();
  },

  // Clear activity log
  async clearActivityLog() {
    await chrome.storage.local.set({ activityLog: [] });
  },

  // Update daily stats
  async updateDailyStats(type, increment = 1) {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get(['dailyStats']);
    let stats = result.dailyStats || {};

    // Reset if new day
    if (stats.date !== today) {
      stats = {
        date: today,
        wordsFiltered: 0,
        sitesBlocked: 0,
        imagesBlocked: 0,
        searchesFiltered: 0
      };
    }

    stats[type] = (stats[type] || 0) + increment;
    await chrome.storage.local.set({ dailyStats: stats });
    await this.updateBadge();

    return stats;
  },

  // Get daily stats
  async getDailyStats() {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get(['dailyStats']);
    const stats = result.dailyStats || {};

    if (stats.date !== today) {
      return {
        date: today,
        wordsFiltered: 0,
        sitesBlocked: 0,
        imagesBlocked: 0,
        searchesFiltered: 0
      };
    }

    return stats;
  },

  // Generate daily summary
  async generateDailySummary() {
    const stats = await this.getDailyStats();
    const total = stats.wordsFiltered + stats.sitesBlocked + stats.imagesBlocked;

    if (total > 0 && this.config.dailySummary) {
      await this.showNotification(
        'Daily Protection Summary',
        `Today: ${stats.wordsFiltered} words filtered, ${stats.sitesBlocked} sites blocked, ${stats.imagesBlocked} images blocked`
      );
    }
  },

  // Set up alarms for daily summary
  async setupAlarms() {
    if (!this.config.dailySummary) return;

    const [hours, minutes] = this.config.summaryTime.split(':').map(Number);
    const now = new Date();
    const summaryTime = new Date(now);
    summaryTime.setHours(hours, minutes, 0, 0);

    if (summaryTime <= now) {
      summaryTime.setDate(summaryTime.getDate() + 1);
    }

    const msUntilSummary = summaryTime - now;

    chrome.alarms.create('dailySummary', {
      when: Date.now() + msUntilSummary,
      periodInMinutes: 24 * 60
    });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
}
if (typeof module !== 'undefined') {
  module.exports = NotificationManager;
}
