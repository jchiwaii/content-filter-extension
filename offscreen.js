// Offscreen Document for ML Image Processing
// This runs in a separate context where TensorFlow can execute

let nsfwModel = null;
let isModelLoading = false;
let modelLoadPromise = null;

// NSFW classification thresholds
const THRESHOLDS = {
  Porn: 0.6,
  Sexy: 0.7,
  Hentai: 0.6,
  // Drawing and Neutral are safe
};

// Initialize NSFWJS model
async function loadModel() {
  if (nsfwModel) return nsfwModel;
  if (modelLoadPromise) return modelLoadPromise;

  isModelLoading = true;
  console.log('[ML Offscreen] Loading NSFWJS model...');

  modelLoadPromise = (async () => {
    try {
      // Use MobileNetV2 model (smaller, faster)
      // Options: 'MobileNetV2', 'MobileNetV2Mid', 'InceptionV3'
      nsfwModel = await nsfwjs.load('MobileNetV2Mid', { size: 299 });
      console.log('[ML Offscreen] NSFWJS model loaded successfully');
      isModelLoading = false;
      return nsfwModel;
    } catch (error) {
      console.error('[ML Offscreen] Failed to load model:', error);
      isModelLoading = false;
      modelLoadPromise = null;
      throw error;
    }
  })();

  return modelLoadPromise;
}

// Classify an image from URL
async function classifyImageFromUrl(imageUrl) {
  try {
    const model = await loadModel();

    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load image'));
      // Add timeout
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
      img.src = imageUrl;
    });

    // Run classification
    const predictions = await model.classify(img);
    console.log('[ML Offscreen] Predictions for', imageUrl.substring(0, 50), ':', predictions);

    return processResults(predictions);
  } catch (error) {
    console.error('[ML Offscreen] Classification error:', error.message);
    return { safe: true, error: error.message, predictions: [] };
  }
}

// Classify an image from base64 data
async function classifyImageFromBase64(base64Data) {
  try {
    const model = await loadModel();

    // Create image element from base64
    const img = new Image();

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load base64 image'));
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
      img.src = base64Data;
    });

    // Run classification
    const predictions = await model.classify(img);
    console.log('[ML Offscreen] Base64 predictions:', predictions);

    return processResults(predictions);
  } catch (error) {
    console.error('[ML Offscreen] Base64 classification error:', error.message);
    return { safe: true, error: error.message, predictions: [] };
  }
}

// Process NSFWJS results
function processResults(predictions) {
  const result = {
    safe: true,
    predictions: predictions,
    flaggedCategories: [],
    highestUnsafe: null,
    confidence: 0
  };

  for (const pred of predictions) {
    const threshold = THRESHOLDS[pred.className];

    if (threshold && pred.probability >= threshold) {
      result.safe = false;
      result.flaggedCategories.push({
        category: pred.className,
        probability: pred.probability
      });

      if (!result.highestUnsafe || pred.probability > result.confidence) {
        result.highestUnsafe = pred.className;
        result.confidence = pred.probability;
      }
    }
  }

  return result;
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  (async () => {
    switch (message.action) {
      case 'classifyImage':
        const result = await classifyImageFromUrl(message.imageUrl);
        sendResponse(result);
        break;

      case 'classifyBase64':
        const base64Result = await classifyImageFromBase64(message.base64Data);
        sendResponse(base64Result);
        break;

      case 'getStatus':
        sendResponse({
          modelLoaded: nsfwModel !== null,
          isLoading: isModelLoading
        });
        break;

      case 'preloadModel':
        try {
          await loadModel();
          sendResponse({ success: true });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
        break;

      default:
        sendResponse({ error: 'Unknown action' });
    }
  })();

  return true; // Keep channel open for async response
});

// Preload model on startup
loadModel().catch(console.error);

console.log('[ML Offscreen] Offscreen document initialized');
