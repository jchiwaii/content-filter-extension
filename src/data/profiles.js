// Filter Profiles Configuration
// Pre-built and custom filtering profiles

const FilterProfiles = {
  // Built-in profiles
  builtIn: {
    'child-safe': {
      id: 'child-safe',
      name: 'Full Protection',
      description: 'Text filtering, image filtering, adult site blocking, and safe search',
      icon: '01',
      settings: {
        filterText: true,
        filterImages: true,
        blockSites: true,
        safeSearch: true
      }
    },
    'teen-safe': {
      id: 'teen-safe',
      name: 'Web Guard',
      description: 'Adult site blocking, safe search, and image filtering with text left unchanged',
      icon: '02',
      settings: {
        filterText: false,
        filterImages: true,
        blockSites: true,
        safeSearch: true
      }
    },
    'work-safe': {
      id: 'work-safe',
      name: 'Page Clean',
      description: 'Text and image filtering without site redirects',
      icon: '03',
      settings: {
        filterText: true,
        filterImages: true,
        blockSites: false,
        safeSearch: false
      }
    },
    'minimal': {
      id: 'minimal',
      name: 'Minimal',
      description: 'Only adult site blocking and safe search',
      icon: '04',
      settings: {
        filterText: false,
        filterImages: false,
        blockSites: true,
        safeSearch: true
      }
    }
  },

  // Default custom profile template
  customTemplate: {
    id: 'custom',
    name: 'Custom',
    description: 'Your personalized filtering settings',
    icon: 'CU',
    settings: {
      filterText: true,
      filterImages: true,
      blockSites: true,
      safeSearch: true
    }
  },

  // Get all available profiles
  async getAllProfiles() {
    const result = await chrome.storage.sync.get(['customProfiles']);
    const customProfiles = result.customProfiles || {};

    return {
      ...this.builtIn,
      ...customProfiles
    };
  },

  // Get current active profile
  async getCurrentProfile() {
    const result = await chrome.storage.sync.get(['activeProfile', 'customProfiles']);
    const profileId = result.activeProfile || 'teen-safe';

    // Check built-in first
    if (this.builtIn[profileId]) {
      return this.builtIn[profileId];
    }

    // Check custom profiles
    const customProfiles = result.customProfiles || {};
    if (customProfiles[profileId]) {
      return customProfiles[profileId];
    }

    // Default to teen-safe
    return this.builtIn['teen-safe'];
  },

  // Set active profile
  async setActiveProfile(profileId) {
    await chrome.storage.sync.set({ activeProfile: profileId });

    // Get profile settings and apply them
    const profile = await this.getProfile(profileId);
    if (profile) {
      await this.applyProfileSettings(profile.settings);
    }

    return profile;
  },

  // Get specific profile
  async getProfile(profileId) {
    if (this.builtIn[profileId]) {
      return this.builtIn[profileId];
    }

    const result = await chrome.storage.sync.get(['customProfiles']);
    const customProfiles = result.customProfiles || {};
    return customProfiles[profileId] || null;
  },

  // Create custom profile
  async createCustomProfile(name, settings, icon = 'CU') {
    const id = `custom-${Date.now()}`;
    const profile = {
      id,
      name,
      description: 'Custom profile',
      icon,
      settings: { ...this.customTemplate.settings, ...settings },
      createdAt: Date.now()
    };

    const result = await chrome.storage.sync.get(['customProfiles']);
    const customProfiles = result.customProfiles || {};
    customProfiles[id] = profile;

    await chrome.storage.sync.set({ customProfiles });
    return profile;
  },

  // Update custom profile
  async updateCustomProfile(profileId, updates) {
    const result = await chrome.storage.sync.get(['customProfiles']);
    const customProfiles = result.customProfiles || {};

    if (!customProfiles[profileId]) {
      throw new Error('Profile not found');
    }

    customProfiles[profileId] = {
      ...customProfiles[profileId],
      ...updates,
      updatedAt: Date.now()
    };

    await chrome.storage.sync.set({ customProfiles });
    return customProfiles[profileId];
  },

  // Delete custom profile
  async deleteCustomProfile(profileId) {
    const result = await chrome.storage.sync.get(['customProfiles', 'activeProfile']);
    const customProfiles = result.customProfiles || {};

    if (!customProfiles[profileId]) {
      throw new Error('Profile not found');
    }

    delete customProfiles[profileId];
    await chrome.storage.sync.set({ customProfiles });

    // If deleted profile was active, switch to default
    if (result.activeProfile === profileId) {
      await this.setActiveProfile('teen-safe');
    }

    return true;
  },

  // Apply profile settings to config
  async applyProfileSettings(settings) {
    const result = await chrome.storage.sync.get(['config']);
    const config = result.config || {};

    const updatedConfig = {
      ...config,
      filterText: settings.filterText,
      filterImages: settings.filterImages,
      blockSites: settings.blockSites,
      safeSearch: settings.safeSearch,
      blockCategories: ['adult']
    };

    await chrome.storage.sync.set({ config: updatedConfig });

    // Also update related configs
    await chrome.storage.sync.set({
      safeSearchConfig: {
        enabled: settings.safeSearch,
        blockTerms: true
      },
      imageDetectorConfig: {
        enabled: settings.filterImages
      }
    });

    return updatedConfig;
  },

  // Export profile as JSON
  exportProfile(profile) {
    return JSON.stringify({
      type: 'content-filter-profile',
      version: 1,
      profile: {
        name: profile.name,
        description: profile.description,
        icon: profile.icon,
        settings: profile.settings
      },
      exportedAt: Date.now()
    }, null, 2);
  },

  // Import profile from JSON
  async importProfile(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (data.type !== 'content-filter-profile') {
        throw new Error('Invalid profile format');
      }

      const profile = await this.createCustomProfile(
        data.profile.name,
        data.profile.settings,
        data.profile.icon
      );

      return profile;
    } catch (error) {
      throw new Error(`Failed to import profile: ${error.message}`);
    }
  },

  // Get profile recommendations based on usage
  async getRecommendedProfile() {
    // Simple recommendation based on current settings
    const result = await chrome.storage.sync.get(['config']);
    const config = result.config || {};

    if (config.filterText && config.filterImages && config.blockSites && config.safeSearch) {
      return 'child-safe';
    } else if (!config.filterText && config.filterImages && config.blockSites && config.safeSearch) {
      return 'teen-safe';
    } else if (config.filterText && config.filterImages && !config.blockSites) {
      return 'work-safe';
    }

    return 'minimal';
  }
};

// Export
if (typeof window !== 'undefined') {
  window.FilterProfiles = FilterProfiles;
}
if (typeof module !== 'undefined') {
  module.exports = FilterProfiles;
}
