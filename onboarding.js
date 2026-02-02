// Onboarding Script
let currentStep = 1;
const totalSteps = 5;
let selectedProfile = 'teen-safe';

function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('progressFill').style.width = `${progress}%`;
}

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const stepEl = document.getElementById(`step${step}`);
  if (stepEl) {
    stepEl.classList.add('active');
  }
  updateProgress();
}

function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function selectProfile(card) {
  document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedProfile = card.dataset.profile;
}

async function completeSetup() {
  const config = {
    enabled: true,
    filterText: true,
    filterImages: true,
    blockSites: true,
    safeSearch: document.getElementById('enableSafeSearch').checked,
    strictMode: selectedProfile === 'child-safe',
    filterLevel: selectedProfile === 'minimal' ? 'nsfw' : 'moderate'
  };

  const notificationConfig = {
    enabled: document.getElementById('enableNotifications').checked,
    showBadge: document.getElementById('enableBadge').checked
  };

  await chrome.storage.sync.set({
    config,
    activeProfile: selectedProfile,
    notificationConfig
  });

  await chrome.storage.local.set({
    onboardingComplete: true,
    installTime: Date.now()
  });

  currentStep = 5;
  showStep(currentStep);
}

function openDashboard() {
  chrome.tabs.create({ url: 'dashboard.html' });
}

function closeOnboarding() {
  window.close();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  updateProgress();

  // Get Started button
  document.getElementById('getStartedBtn').addEventListener('click', nextStep);

  // Profile cards
  document.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('click', () => selectProfile(card));
  });

  // Navigation buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      switch(action) {
        case 'next': nextStep(); break;
        case 'prev': prevStep(); break;
        case 'complete': completeSetup(); break;
        case 'dashboard': openDashboard(); break;
        case 'close': closeOnboarding(); break;
      }
    });
  });
});
