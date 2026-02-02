// Time-Based Parental Controls Scheduler
// Handles scheduled filtering, time limits, and access controls

const Scheduler = {
  // Default schedule configuration
  defaultSchedule: {
    enabled: false,
    // Weekly schedule - each day has active hours
    weeklySchedule: {
      monday: { enabled: true, start: '08:00', end: '22:00' },
      tuesday: { enabled: true, start: '08:00', end: '22:00' },
      wednesday: { enabled: true, start: '08:00', end: '22:00' },
      thursday: { enabled: true, start: '08:00', end: '22:00' },
      friday: { enabled: true, start: '08:00', end: '23:00' },
      saturday: { enabled: true, start: '09:00', end: '23:00' },
      sunday: { enabled: true, start: '09:00', end: '22:00' }
    },
    // Time-based profile switching
    profileSchedule: [
      // { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], start: '08:00', end: '15:00', profile: 'child-safe' },
      // { days: ['saturday', 'sunday'], start: '00:00', end: '23:59', profile: 'teen-safe' }
    ],
    // Daily time limits per category (in minutes)
    dailyLimits: {
      socialMedia: 120,  // 2 hours
      gaming: 60,        // 1 hour
      streaming: 180,    // 3 hours
      unrestricted: 0    // 0 = no limit
    },
    // Bedtime mode
    bedtimeMode: {
      enabled: false,
      start: '22:00',
      end: '07:00',
      blockCategories: ['socialMedia', 'gaming', 'streaming']
    }
  },

  // Get current schedule from storage
  async getSchedule() {
    const result = await chrome.storage.sync.get(['schedule']);
    return result.schedule || this.defaultSchedule;
  },

  // Save schedule to storage
  async saveSchedule(schedule) {
    await chrome.storage.sync.set({ schedule });
  },

  // Check if filtering is currently active based on schedule
  async isFilteringActive() {
    const schedule = await this.getSchedule();
    if (!schedule.enabled) return true; // If scheduling disabled, always filter

    const now = new Date();
    const dayName = this.getDayName(now.getDay());
    const currentTime = this.formatTime(now);

    const daySchedule = schedule.weeklySchedule[dayName];
    if (!daySchedule || !daySchedule.enabled) return false;

    return this.isTimeInRange(currentTime, daySchedule.start, daySchedule.end);
  },

  // Get current active profile based on schedule
  async getCurrentProfile() {
    const schedule = await this.getSchedule();
    if (!schedule.profileSchedule || schedule.profileSchedule.length === 0) {
      return null; // Use default profile
    }

    const now = new Date();
    const dayName = this.getDayName(now.getDay());
    const currentTime = this.formatTime(now);

    for (const rule of schedule.profileSchedule) {
      if (rule.days.includes(dayName) &&
          this.isTimeInRange(currentTime, rule.start, rule.end)) {
        return rule.profile;
      }
    }

    return null; // Default profile
  },

  // Check if bedtime mode is active
  async isBedtimeModeActive() {
    const schedule = await this.getSchedule();
    if (!schedule.bedtimeMode || !schedule.bedtimeMode.enabled) return false;

    const now = new Date();
    const currentTime = this.formatTime(now);
    const { start, end } = schedule.bedtimeMode;

    // Handle overnight bedtime (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    return this.isTimeInRange(currentTime, start, end);
  },

  // Get blocked categories during bedtime
  async getBedtimeBlockedCategories() {
    const schedule = await this.getSchedule();
    if (!schedule.bedtimeMode || !schedule.bedtimeMode.enabled) return [];

    const isActive = await this.isBedtimeModeActive();
    if (!isActive) return [];

    return schedule.bedtimeMode.blockCategories || [];
  },

  // Track and check daily time limits
  async trackUsage(category, minutes = 1) {
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get(['dailyUsage']);
    const usage = result.dailyUsage || {};

    // Reset if new day
    if (usage.date !== today) {
      usage.date = today;
      usage.categories = {};
    }

    usage.categories[category] = (usage.categories[category] || 0) + minutes;
    await chrome.storage.local.set({ dailyUsage: usage });

    return usage.categories[category];
  },

  // Check if category time limit exceeded
  async isTimeLimitExceeded(category) {
    const schedule = await this.getSchedule();
    const limit = schedule.dailyLimits[category];

    if (!limit || limit === 0) return false; // No limit set

    const result = await chrome.storage.local.get(['dailyUsage']);
    const usage = result.dailyUsage || {};
    const today = new Date().toDateString();

    if (usage.date !== today) return false; // New day, no usage yet

    const used = usage.categories[category] || 0;
    return used >= limit;
  },

  // Get remaining time for category
  async getRemainingTime(category) {
    const schedule = await this.getSchedule();
    const limit = schedule.dailyLimits[category];

    if (!limit || limit === 0) return Infinity;

    const result = await chrome.storage.local.get(['dailyUsage']);
    const usage = result.dailyUsage || {};
    const today = new Date().toDateString();

    if (usage.date !== today) return limit;

    const used = usage.categories[category] || 0;
    return Math.max(0, limit - used);
  },

  // Get usage summary
  async getUsageSummary() {
    const schedule = await this.getSchedule();
    const result = await chrome.storage.local.get(['dailyUsage']);
    const usage = result.dailyUsage || {};
    const today = new Date().toDateString();

    const summary = {};
    for (const [category, limit] of Object.entries(schedule.dailyLimits)) {
      const used = (usage.date === today && usage.categories)
        ? (usage.categories[category] || 0)
        : 0;
      summary[category] = {
        used,
        limit: limit || Infinity,
        remaining: limit ? Math.max(0, limit - used) : Infinity,
        percentUsed: limit ? Math.min(100, (used / limit) * 100) : 0
      };
    }

    return summary;
  },

  // Helper: Get day name from day number
  getDayName(dayNum) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayNum];
  },

  // Helper: Format time as HH:MM
  formatTime(date) {
    return date.toTimeString().slice(0, 5);
  },

  // Helper: Check if time is in range
  isTimeInRange(time, start, end) {
    return time >= start && time <= end;
  },

  // Helper: Parse time string to minutes since midnight
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // Set up alarm for schedule checks
  async setupAlarms() {
    // Check schedule every minute
    chrome.alarms.create('scheduleCheck', { periodInMinutes: 1 });

    // Daily reset at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;

    chrome.alarms.create('dailyReset', {
      when: Date.now() + msUntilMidnight,
      periodInMinutes: 24 * 60
    });
  },

  // Handle alarm
  async handleAlarm(alarmName) {
    if (alarmName === 'dailyReset') {
      // Reset daily usage
      await chrome.storage.local.set({
        dailyUsage: { date: new Date().toDateString(), categories: {} }
      });
    }
  }
};

// Export
if (typeof window !== 'undefined') {
  window.Scheduler = Scheduler;
}
if (typeof module !== 'undefined') {
  module.exports = Scheduler;
}
