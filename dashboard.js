// Statistics Dashboard JavaScript

// Chart instances
let activityChart = null;
let typeChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadStatistics();
  loadActivityLog();
  loadUsageSummary();
  setupEventListeners();
  initCharts();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage?.() || window.open('settings.html');
  });
  document.getElementById('clearLogBtn').addEventListener('click', clearActivityLog);
}

// Load statistics
async function loadStatistics() {
  const [localResult, syncResult] = await Promise.all([
    chrome.storage.local.get(['statistics', 'dailyStats', 'installTime', 'siteStats']),
    chrome.storage.sync.get(['config'])
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
  const result = await chrome.storage.local.get(['activityLog']);
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

// Load usage summary
async function loadUsageSummary() {
  const result = await chrome.storage.local.get(['dailyUsage']);
  const today = new Date().toDateString();
  const usage = result.dailyUsage || {};

  if (usage.date !== today) return;

  const categories = usage.categories || {};

  // Update usage bars
  updateUsageBar('socialMedia', categories.socialMedia || 0, 120);
  updateUsageBar('gaming', categories.gaming || 0, 60);
  updateUsageBar('streaming', categories.streaming || 0, 180);
}

// Update a single usage bar
function updateUsageBar(category, used, limit) {
  const percent = Math.min(100, (used / limit) * 100);
  const fill = document.getElementById(`${category}Usage`);
  const time = document.getElementById(`${category}Time`);

  if (fill) {
    fill.style.width = `${percent}%`;

    // Add warning/danger classes
    fill.classList.remove('warning', 'danger');
    if (percent >= 90) {
      fill.classList.add('danger');
    } else if (percent >= 70) {
      fill.classList.add('warning');
    }
  }

  if (time) {
    time.textContent = `${used} / ${limit} min`;
  }
}

// Initialize charts
async function initCharts() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }

  const result = await chrome.storage.local.get(['weeklyStats']);
  const weeklyStats = result.weeklyStats || generateEmptyWeekStats();

  // Activity chart (line)
  const activityCtx = document.getElementById('activityChart').getContext('2d');
  activityChart = new Chart(activityCtx, {
    type: 'line',
    data: {
      labels: weeklyStats.labels,
      datasets: [{
        label: 'Words Filtered',
        data: weeklyStats.words,
        borderColor: '#222823',
        backgroundColor: 'rgba(34, 40, 35, 0.1)',
        fill: true,
        tension: 0.4
      }, {
        label: 'Sites Blocked',
        data: weeklyStats.sites,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
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
          '#222823',
          '#ef4444',
          '#f59e0b',
          '#10b981'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
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
    chrome.storage.local.get(null),
    chrome.storage.sync.get(null)
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
  a.download = `safe-browse-stats-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Clear activity log
async function clearActivityLog() {
  if (confirm('Are you sure you want to clear the activity log?')) {
    await chrome.storage.local.set({ activityLog: [] });
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
    wordFiltered: '🔤',
    siteBlocked: '🚫',
    imageBlocked: '🖼️',
    searchFiltered: '🔍',
    configChanged: '⚙️',
    profileChanged: '👤'
  };
  return icons[type] || '📝';
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

// Auto-refresh every 30 seconds
setInterval(() => {
  loadStatistics();
  loadUsageSummary();
}, 30000);
