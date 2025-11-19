// Keyword-based Content Detector
// Provides client-side image filtering based on metadata (src, alt, title)
// Replaces ML detection due to Manifest V3 CSP restrictions

class MLContentDetector {
  constructor() {
    this.modelLoaded = true; // Always "ready" for keyword detection
    this.pendingImages = [];
    
    // Configuration
    this.config = {
      threshold: 0.5,
      strictThreshold: 0.3
    };
  }

  // Initialize - No-op for keyword detection
  async initializeModel() {
    this.modelLoaded = true;
    this.processPendingImages();
  }

  // Classify an image element using keywords
  async classifyImage(imgElement) {
    try {
      // Basic checks
      if (!imgElement) return { safe: true, reason: 'Invalid element' };

      const src = imgElement.src || '';
      const alt = imgElement.alt || '';
      const title = imgElement.title || '';
      const combined = `${src} ${alt} ${title}`.toLowerCase();

      // Check for NSFW keywords
      const nsfwKeywords = [
        'porn', 'xxx', 'nude', 'naked', 'nsfw', 'adult', 'sex',
        'explicit', 'hentai', 'r34', 'erotic', 'lingerie', 'bikini',
        'fuck', 'pussy', 'cock', 'dick', 'boobs', 'tits'
      ];

      for (const keyword of nsfwKeywords) {
        if (combined.includes(keyword)) {
          return {
            safe: false,
            reason: `NSFW keyword detected: ${keyword}`,
            method: 'keyword',
            keyword
          };
        }
      }

      return {
        safe: true,
        reason: 'No keywords detected',
        method: 'keyword'
      };

    } catch (error) {
      console.warn('[ML Detector] Error checking image:', error);
      return { safe: true, reason: 'Error', method: 'keyword' };
    }
  }

  // Process any pending images
  async processPendingImages() {
    const images = [...this.pendingImages];
    this.pendingImages = [];
    for (const { element, resolve } of images) {
      const result = await this.classifyImage(element);
      resolve(result);
    }
  }

  // Batch classify
  async classifyBatch(imgElements) {
    return Promise.all(imgElements.map(img => this.classifyImage(img)));
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  isReady() {
    return true;
  }

  getStatus() {
    return {
      tfReady: false,
      nsfwjsReady: false,
      modelLoaded: true,
      modelLoading: false,
      pendingImages: 0,
      mode: 'keyword-only'
    };
  }
}

// Create singleton instance
window.mlDetector = new MLContentDetector();

// Export for testing
window.MLContentDetector = MLContentDetector;
