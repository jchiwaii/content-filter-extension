// Password Protection Module
// Provides secure settings lock functionality

const PasswordManager = {
  // Hash password using SHA-256 (browser-native)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Verify password against stored hash
  async verifyPassword(password, storedHash) {
    const hash = await this.hashPassword(password);
    return hash === storedHash;
  },

  // Set new password
  async setPassword(password) {
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }
    const hash = await this.hashPassword(password);
    await chrome.storage.local.set({
      passwordHash: hash,
      passwordEnabled: true,
      passwordSetAt: Date.now()
    });
    return true;
  },

  // Remove password
  async removePassword(currentPassword) {
    const isValid = await this.checkPassword(currentPassword);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    await chrome.storage.local.remove(['passwordHash', 'passwordEnabled', 'passwordSetAt']);
    return true;
  },

  // Check if password is enabled
  async isPasswordEnabled() {
    const result = await chrome.storage.local.get(['passwordEnabled']);
    return result.passwordEnabled === true;
  },

  // Check password
  async checkPassword(password) {
    const result = await chrome.storage.local.get(['passwordHash']);
    if (!result.passwordHash) return true; // No password set
    return await this.verifyPassword(password, result.passwordHash);
  },

  // Create temporary unlock session (5 minutes)
  async createSession() {
    const sessionToken = crypto.randomUUID();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
    await chrome.storage.session.set({
      unlockSession: { token: sessionToken, expiresAt }
    });
    return sessionToken;
  },

  // Check if session is valid
  async isSessionValid() {
    const result = await chrome.storage.session.get(['unlockSession']);
    if (!result.unlockSession) return false;
    return result.unlockSession.expiresAt > Date.now();
  },

  // Clear session
  async clearSession() {
    await chrome.storage.session.remove(['unlockSession']);
  },

  // Check if access is allowed (no password or valid session)
  async isAccessAllowed() {
    const passwordEnabled = await this.isPasswordEnabled();
    if (!passwordEnabled) return true;
    return await this.isSessionValid();
  },

  // Unlock with password
  async unlock(password) {
    const isValid = await this.checkPassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    await this.createSession();
    return true;
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const isValid = await this.checkPassword(currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    return await this.setPassword(newPassword);
  },

  // Get password status
  async getStatus() {
    const [passwordResult, sessionValid] = await Promise.all([
      chrome.storage.local.get(['passwordEnabled', 'passwordSetAt']),
      this.isSessionValid()
    ]);

    return {
      enabled: passwordResult.passwordEnabled === true,
      setAt: passwordResult.passwordSetAt || null,
      sessionValid
    };
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PasswordManager = PasswordManager;
}
if (typeof module !== 'undefined') {
  module.exports = PasswordManager;
}
