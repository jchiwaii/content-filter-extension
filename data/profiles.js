// Filter Profiles Configuration
// Pre-built and custom filtering profiles

const FilterProfiles = {
  // Built-in profiles
  builtIn: {
    'child-safe': {
      id: 'child-safe',
      name: 'Child Safe',
      description: 'Maximum protection - blocks all profanity, adult content, and violence',
      icon: '🧒',
      settings: {
        filterText: true,
        filterImages: true,
        blockSites: true,
        safeSearch: true,
        strictMode: true,
        filterLevel: 'all',
        blockCategories: ['adult', 'violence', 'drugs', 'gambling', 'weapons', 'hate'],
        blockMildProfanity: true,
        blockSocialMedia: false,
        blockGaming: false,
        hideComments: false
      }
    },
    'teen-safe': {
      id: 'teen-safe',
      name: 'Teen Safe',
      description: 'Moderate protection - blocks adult content, allows mild language',
      icon: '👦',
      settings: {
        filterText: true,
        filterImages: true,
        blockSites: true,
        safeSearch: true,
        strictMode: false,
        filterLevel: 'moderate',
        blockCategories: ['adult', 'drugs', 'gambling', 'weapons'],
        blockMildProfanity: false,
        blockSocialMedia: false,
        blockGaming: false,
        hideComments: false
      }
    },
    'work-safe': {
      id: 'work-safe',
      name: 'Work Safe',
      description: 'Professional environment - blocks NSFW content and slurs',
      icon: '💼',
      settings: {
        filterText: true,
        filterImages: true,
        blockSites: true,
        safeSearch: true,
        strictMode: false,
        filterLevel: 'strong',
        blockCategories: ['adult', 'gambling'],
        blockMildProfanity: false,
        blockSocialMedia: false,
        blockGaming: false,
        hideComments: false
      }
    },
    'minimal': {
      id: 'minimal',
      name: 'Minimal',
      description: 'Light filtering - blocks only explicit adult content',
      icon: '🔓',
      settings: {
        filterText: false,
        filterImages: true,
        blockSites: true,
        safeSearch: true,
        strictMode: false,
        filterLevel: 'nsfw',
        blockCategories: ['adult'],
        blockMildProfanity: false,
        blockSocialMedia: false,
        blockGaming: false,
        hideComments: false
      }
    }
  },

  // Default custom profile template
  customTemplate: {
    id: 'custom',
    name: 'Custom',
    description: 'Your personalized filtering settings',
    icon: '⚙️',
    settings: {
      filterText: true,
      filterImages: true,
      blockSites: true,
      safeSearch: true,
      strictMode: true,
      filterLevel: 'moderate',
      blockCategories: ['adult'],
      blockMildProfanity: false,
      blockSocialMedia: false,
      blockGaming: false,
      hideComments: false
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
  async createCustomProfile(name, settings, icon = '⚙️') {
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
      strictMode: settings.strictMode,
      filterLevel: settings.filterLevel,
      blockCategories: settings.blockCategories,
      blockMildProfanity: settings.blockMildProfanity
    };

    await chrome.storage.sync.set({ config: updatedConfig });

    // Also update related configs
    await chrome.storage.sync.set({
      safeSearchConfig: {
        enabled: settings.safeSearch,
        blockTerms: true,
        enforceStrict: settings.strictMode
      },
      imageFilterConfig: {
        enabled: settings.filterImages
      },
      siteBlockConfig: {
        enabled: settings.blockSites,
        categories: settings.blockCategories
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

    if (config.strictMode && config.filterText) {
      return 'child-safe';
    } else if (config.filterText && !config.strictMode) {
      return 'teen-safe';
    } else if (config.filterImages && !config.filterText) {
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
