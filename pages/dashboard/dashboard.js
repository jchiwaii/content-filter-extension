// Statistics Dashboard JavaScript

// Chart instances
let activityChart = null;
let typeChart = null;

const extensionApi = typeof chrome !== 'undefined' ? chrome : null;
const storage = {
  local: extensionApi?.storage?.local || createMemoryStorageArea({ installTime: Date.now() }),
  sync: extensionApi?.storage?.sync || createMemoryStorageArea({ config: {} })
};

const chartColors = {
  bg: '#f8f7f4',
  text: '#1a1918',
  muted: '#8a8784',
  line: 'rgba(0, 0, 0, 0.12)',
  green: '#2B6E44',
  blue: '#90ddf0',
  yellow: '#C05C1D',
  danger: '#d96c75'
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadStatistics();
  loadActivityLog();
  setupEventListeners();
  initCharts();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('clearLogBtn').addEventListener('click', clearActivityLog);
}

// Load statistics
async function loadStatistics() {
  const [localResult] = await Promise.all([
    storage.local.get(['statistics', 'dailyStats', 'installTime', 'siteStats']),
    storage.sync.get(['config'])
  ]);

  const stats = localResult.statistics || {};
  const dailyStats = localResult.dailyStats || {};
  const today = new Date().toDateString();

  // Total stats
  document.getElementById('totalWordsFiltered').textContent = formatNumber(stats.wordsFiltered || 0);
  document.getElementById('totalSitesBlocked').textContent = formatNumber(stats.sitesBlocked || 0);
  document.getElementById('totalImagesBlocked').textContent = formatNumber(stats.imagesBlocked || 0);

  // Hours protected
  const installTime = localResult.installTime || Date.now();
  const hoursProtected = Math.floor((Date.now() - installTime) / (1000 * 60 * 60));
  document.getElementById('hoursProtected').textContent = formatNumber(hoursProtected);

  // Today's stats
  if (dailyStats.date === today) {
    document.getElementById('todayWords').textContent = formatNumber(dailyStats.wordsFiltered || 0);
    document.getElementById('todaySites').textContent = formatNumber(dailyStats.sitesBlocked || 0);
    document.getElementById('todayImages').textContent = formatNumber(dailyStats.imagesBlocked || 0);
    document.getElementById('todaySearches').textContent = formatNumber(dailyStats.searchesFiltered || 0);
  }

  // Top sites
  loadTopSites(localResult.siteStats || {});
}

// Load top filtered sites
function loadTopSites(siteStats) {
  const container = document.getElementById('topSitesList');

  const sites = Object.entries(siteStats)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (sites.length === 0) {
    container.innerHTML = '<div class="empty-state">No data yet</div>';
    return;
  }

  container.innerHTML = sites.map(site => `
    <div class="site-item">
      <span class="site-name">${escapeHtml(site.domain)}</span>
      <span class="site-count">${formatNumber(site.count)} filtered</span>
    </div>
  `).join('');
}

// Load activity log
async function loadActivityLog() {
  const result = await storage.local.get(['activityLog']);
  const log = result.activityLog || [];
  const container = document.getElementById('activityLog');

  if (log.length === 0) {
    container.innerHTML = '<div class="empty-state">No activity recorded</div>';
    return;
  }

  // Show last 50 entries, newest first
  const recentLog = log.slice(-50).reverse();

  container.innerHTML = recentLog.map(entry => {
    const icon = getLogIcon(entry.type);
    const time = formatTime(entry.timestamp);

    return `
      <div class="log-item">
        <span class="log-icon">${icon}</span>
        <div class="log-content">
          <span class="log-type">${getLogTypeName(entry.type)}</span>
          <span class="log-detail">${escapeHtml(entry.data?.detail || entry.data?.url || '')}</span>
        </div>
        <span class="log-time">${time}</span>
      </div>
    `;
  }).join('');
}

// Initialize charts
async function initCharts() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }

  const result = await storage.local.get(['weeklyStats']);
  const weeklyStats = result.weeklyStats || generateEmptyWeekStats();
  const chartFont = {
    family: '"Urbanist", "Avenir Next", "Inter", "SF Pro Text", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    size: 11
  };
  const legend = {
    position: 'bottom',
    labels: {
      color: chartColors.muted,
      boxWidth: 12,
      boxHeight: 12,
      padding: 18,
      font: chartFont
    }
  };

  // Activity chart (line)
  const activityCtx = document.getElementById('activityChart').getContext('2d');
  activityChart = new Chart(activityCtx, {
    type: 'line',
    data: {
      labels: weeklyStats.labels,
      datasets: [{
        label: 'Words Filtered',
        data: weeklyStats.words,
        borderColor: chartColors.green,
        backgroundColor: 'rgba(43, 110, 68, 0.12)',
        fill: true,
        pointBackgroundColor: chartColors.green,
        pointBorderColor: chartColors.bg,
        pointRadius: 4,
        tension: 0.4
      }, {
        label: 'Sites Blocked',
        data: weeklyStats.sites,
        borderColor: chartColors.blue,
        backgroundColor: 'rgba(144, 221, 240, 0.2)',
        fill: true,
        pointBackgroundColor: chartColors.blue,
        pointBorderColor: chartColors.bg,
        pointRadius: 4,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend
      },
      scales: {
        x: {
          ticks: {
            color: chartColors.muted,
            font: chartFont
          },
          grid: {
            color: chartColors.line
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: chartColors.muted,
            font: chartFont
          },
          grid: {
            color: chartColors.line
          }
        }
      }
    }
  });

  // Type chart (doughnut)
  const typeCtx = document.getElementById('typeChart').getContext('2d');
  typeChart = new Chart(typeCtx, {
    type: 'doughnut',
    data: {
      labels: ['Text', 'Images', 'Sites', 'Searches'],
      datasets: [{
        data: weeklyStats.types,
        backgroundColor: [
          chartColors.green,
          chartColors.blue,
          chartColors.yellow,
          chartColors.danger
        ],
        borderColor: chartColors.bg,
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend
      }
    }
  });
}

// Generate empty week stats
function generateEmptyWeekStats() {
  const labels = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
  }

  return {
    labels,
    words: [0, 0, 0, 0, 0, 0, 0],
    sites: [0, 0, 0, 0, 0, 0, 0],
    types: [0, 0, 0, 0]
  };
}

// Export data
async function exportData() {
  const [localData, syncData] = await Promise.all([
    storage.local.get(null),
    storage.sync.get(null)
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    statistics: localData.statistics || {},
    dailyStats: localData.dailyStats || {},
    weeklyStats: localData.weeklyStats || {},
    siteStats: localData.siteStats || {},
    activityLog: localData.activityLog || [],
    config: syncData.config || {}
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `safebrowse-stats-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Clear activity log
async function clearActivityLog() {
  if (confirm('Are you sure you want to clear the activity log?')) {
    await storage.local.set({ activityLog: [] });
    loadActivityLog();
  }
}

// Helper functions
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString();
}

function getLogIcon(type) {
  const icons = {
    wordFiltered: 'Tx',
    siteBlocked: 'Web',
    imageBlocked: 'Img',
    searchFiltered: 'Src',
    configChanged: 'Cfg',
    profileChanged: 'Pro'
  };
  return icons[type] || 'Log';
}

function getLogTypeName(type) {
  const names = {
    wordFiltered: 'Word Filtered',
    siteBlocked: 'Site Blocked',
    imageBlocked: 'Image Blocked',
    searchFiltered: 'Search Filtered',
    configChanged: 'Settings Changed',
    profileChanged: 'Profile Changed'
  };
  return names[type] || type;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createMemoryStorageArea(initialData = {}) {
  let data = { ...initialData };

  return {
    async get(keys) {
      if (keys === null || typeof keys === 'undefined') {
        return { ...data };
      }

      if (Array.isArray(keys)) {
        return keys.reduce((result, key) => {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            result[key] = data[key];
          }

          return result;
        }, {});
      }

      if (typeof keys === 'string') {
        return Object.prototype.hasOwnProperty.call(data, keys) ? { [keys]: data[keys] } : {};
      }

      return Object.entries(keys).reduce((result, [key, fallback]) => {
        result[key] = Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback;
        return result;
      }, {});
    },

    async set(values) {
      data = { ...data, ...values };
    }
  };
}

// Auto-refresh every 30 seconds
setInterval(() => {
  loadStatistics();
}, 30000);
