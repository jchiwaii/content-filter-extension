// ML-based Content Detector using NSFWJS
// Provides client-side image classification with no API calls
// Uses TensorFlow.js and NSFWJS for privacy-preserving content filtering

class MLContentDetector {
  constructor() {
    this.model = null;
    this.modelLoading = false;
    this.modelLoaded = false;
    this.pendingImages = [];
    this.tfReady = false;
    this.nsfwjsReady = false;

    // Configuration
    this.config = {
      threshold: 0.5, // Confidence threshold for NSFW detection (0-1)
      strictThreshold: 0.3, // Stricter threshold for certain categories
      categories: {
        porn: 0.5,      // Hardcore pornography
        hentai: 0.5,    // Animated/drawn pornography
        sexy: 0.4,      // Soft nudity, provocative poses
        drawing: 0.95,  // Most drawings are safe unless they're hentai
        neutral: 0.95   // Safe content
      }
    };

    this.initializeModel();
  }

  // Initialize the ML model
  async initializeModel() {
    if (this.modelLoading || this.modelLoaded) return;

    this.modelLoading = true;
    console.log('[ML Detector] Initializing NSFWJS model...');

    try {
      // Check if TensorFlow.js and NSFWJS are loaded (they should be loaded via manifest)
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js not loaded');
      }
      if (typeof nsfwjs === 'undefined') {
        throw new Error('NSFWJS not loaded');
      }

      this.tfReady = true;
      this.nsfwjsReady = true;
      console.log('[ML Detector] Libraries loaded from local bundle');

      // Wait for TensorFlow to be ready
      await tf.ready();
      console.log('[ML Detector] TensorFlow.js ready');

      // Load the NSFW model from CDN (cached by browser)
      // Using the 'MobileNetV2Mid' model for balanced speed/accuracy
      // Alternative: 'MobileNetV2' (slower, more accurate) or 'InceptionV3' (slowest, most accurate)
      this.model = await nsfwjs.load('MobileNetV2Mid', {
        size: 299 // Image size for classification
      });

      this.modelLoaded = true;
      this.modelLoading = false;
      console.log('[ML Detector] NSFWJS model loaded successfully (MobileNetV2Mid)');

      // Process any pending images
      this.processPendingImages();

    } catch (error) {
      console.error('[ML Detector] Error loading model:', error);
      this.modelLoading = false;
      this.modelLoaded = false;

      // Retry after 3 seconds
      console.log('[ML Detector] Retrying in 3 seconds...');
      setTimeout(() => {
        this.modelLoading = false;
        this.initializeModel();
      }, 3000);
    }
  }

  // Classify an image element
  async classifyImage(imgElement) {
    // If model not ready, queue the image
    if (!this.modelLoaded) {
      return new Promise((resolve) => {
        this.pendingImages.push({ element: imgElement, resolve });
      });
    }

    try {
      // Check if image is loaded
      if (!imgElement.complete || imgElement.naturalHeight === 0) {
        return { safe: true, reason: 'Image not loaded' };
      }

      // Check if image is too small (likely icon or logo)
      if (imgElement.naturalWidth < 100 || imgElement.naturalHeight < 100) {
        return { safe: true, reason: 'Image too small', dimensions: `${imgElement.naturalWidth}x${imgElement.naturalHeight}` };
      }

      // Classify the image
      const predictions = await this.model.classify(imgElement, 5);

      // Analyze predictions
      const result = this.analyzePredictions(predictions);

      console.log('[ML Detector] Classification result:', {
        src: imgElement.src.substring(0, 100),
        predictions,
        result
      });

      return result;

    } catch (error) {
      // Handle CORS errors or other issues
      console.warn('[ML Detector] Error classifying image:', error.message);

      // Fallback to URL-based detection
      return this.fallbackDetection(imgElement);
    }
  }

  // Analyze predictions from NSFWJS
  analyzePredictions(predictions) {
    // NSFWJS returns predictions like:
    // { className: 'Porn', probability: 0.8 }
    // { className: 'Sexy', probability: 0.15 }
    // { className: 'Hentai', probability: 0.03 }
    // { className: 'Drawing', probability: 0.01 }
    // { className: 'Neutral', probability: 0.01 }

    const scores = {};
    predictions.forEach(pred => {
      scores[pred.className.toLowerCase()] = pred.probability;
    });

    // Check for explicit content
    if (scores.porn > this.config.categories.porn) {
      return {
        safe: false,
        reason: 'Pornographic content detected',
        confidence: scores.porn,
        category: 'porn',
        predictions
      };
    }

    if (scores.hentai > this.config.categories.hentai) {
      return {
        safe: false,
        reason: 'Hentai content detected',
        confidence: scores.hentai,
        category: 'hentai',
        predictions
      };
    }

    if (scores.sexy > this.config.categories.sexy) {
      return {
        safe: false,
        reason: 'Sexually suggestive content detected',
        confidence: scores.sexy,
        category: 'sexy',
        predictions
      };
    }

    // Content is safe
    return {
      safe: true,
      reason: 'Content appears safe',
      confidence: scores.neutral || 0,
      predictions
    };
  }

  // Fallback detection for CORS-blocked images
  fallbackDetection(imgElement) {
    const src = imgElement.src || '';
    const alt = imgElement.alt || '';
    const title = imgElement.title || '';
    const combined = `${src} ${alt} ${title}`.toLowerCase();

    // Check for NSFW keywords
    const nsfwKeywords = [
      'porn', 'xxx', 'nude', 'naked', 'nsfw', 'adult', 'sex',
      'explicit', 'hentai', 'r34', 'erotic', 'lingerie', 'bikini'
    ];

    for (const keyword of nsfwKeywords) {
      if (combined.includes(keyword)) {
        return {
          safe: false,
          reason: `NSFW keyword detected: ${keyword}`,
          method: 'fallback',
          keyword
        };
      }
    }

    return {
      safe: true,
      reason: 'Fallback detection - no NSFW keywords',
      method: 'fallback'
    };
  }

  // Process pending images
  async processPendingImages() {
    console.log(`[ML Detector] Processing ${this.pendingImages.length} pending images`);

    const images = [...this.pendingImages];
    this.pendingImages = [];

    for (const { element, resolve } of images) {
      const result = await this.classifyImage(element);
      resolve(result);
    }
  }

  // Batch classify multiple images
  async classifyBatch(imgElements) {
    const results = await Promise.all(
      imgElements.map(img => this.classifyImage(img))
    );
    return results;
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[ML Detector] Configuration updated:', this.config);
  }

  // Check if model is ready
  isReady() {
    return this.modelLoaded;
  }

  // Get model status
  getStatus() {
    return {
      tfReady: this.tfReady,
      nsfwjsReady: this.nsfwjsReady,
      modelLoaded: this.modelLoaded,
      modelLoading: this.modelLoading,
      pendingImages: this.pendingImages.length
    };
  }
}

// Create singleton instance
window.mlDetector = new MLContentDetector();

// Export for testing
window.MLContentDetector = MLContentDetector;

console.log('[ML Detector] ML Content Detector initialized');
