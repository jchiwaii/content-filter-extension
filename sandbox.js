// Sandbox Script for ML Image Processing
// Runs in isolated sandbox with unsafe-eval allowed for TensorFlow.js

let nsfwModel = null;
let isModelLoading = false;
let modelLoadPromise = null;

// NSFW classification thresholds
const THRESHOLDS = {
  Porn: 0.6,
  Sexy: 0.7,
  Hentai: 0.6
};

// Load NSFWJS model
async function loadModel() {
  if (nsfwModel) return nsfwModel;
  if (modelLoadPromise) return modelLoadPromise;

  isModelLoading = true;
  console.log('[ML Sandbox] Loading NSFWJS model...');

  modelLoadPromise = (async () => {
    try {
      nsfwModel = await nsfwjs.load('MobileNetV2Mid', { size: 299 });
      console.log('[ML Sandbox] NSFWJS model loaded successfully');
      isModelLoading = false;
      return nsfwModel;
    } catch (error) {
      console.error('[ML Sandbox] Failed to load model:', error);
      isModelLoading = false;
      modelLoadPromise = null;
      throw error;
    }
  })();

  return modelLoadPromise;
}

// Classify image from URL
async function classifyImageFromUrl(imageUrl) {
  try {
    const model = await loadModel();

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load image'));
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
      img.src = imageUrl;
    });

    const predictions = await model.classify(img);
    return processResults(predictions);
  } catch (error) {
    console.error('[ML Sandbox] Classification error:', error.message);
    return { safe: true, error: error.message, predictions: [] };
  }
}

// Classify image from base64
async function classifyImageFromBase64(base64Data) {
  try {
    const model = await loadModel();

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load base64 image'));
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
      img.src = base64Data;
    });

    const predictions = await model.classify(img);
    return processResults(predictions);
  } catch (error) {
    console.error('[ML Sandbox] Base64 classification error:', error.message);
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

// Handle messages from parent
window.addEventListener('message', async (event) => {
  const { id, action, imageUrl, base64Data } = event.data;

  if (!id || !action) return;

  let response;

  try {
    switch (action) {
      case 'classifyImage':
        response = await classifyImageFromUrl(imageUrl);
        break;

      case 'classifyBase64':
        response = await classifyImageFromBase64(base64Data);
        break;

      case 'getStatus':
        response = {
          modelLoaded: nsfwModel !== null,
          isLoading: isModelLoading
        };
        break;

      case 'preloadModel':
        await loadModel();
        response = { success: true };
        break;

      default:
        response = { error: 'Unknown action' };
    }
  } catch (error) {
    response = { safe: true, error: error.message };
  }

  // Send response back to parent
  event.source.postMessage({ id, response }, event.origin);
});

// Preload model
loadModel().catch(console.error);

console.log('[ML Sandbox] Sandbox initialized');
