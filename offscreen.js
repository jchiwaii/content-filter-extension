// Offscreen Document for ML Image Processing
// Communicates with sandboxed iframe where TensorFlow can run

let sandboxFrame = null;
let sandboxReady = false;
let pendingRequests = new Map();
let requestId = 0;

// Wait for sandbox iframe to be ready
function initSandbox() {
  return new Promise((resolve) => {
    sandboxFrame = document.getElementById('ml-sandbox');

    if (!sandboxFrame) {
      console.error('[ML Offscreen] Sandbox iframe not found');
      resolve(false);
      return;
    }

    // Listen for messages from sandbox
    window.addEventListener('message', (event) => {
      const { id, response } = event.data;

      if (id && pendingRequests.has(id)) {
        const { resolve } = pendingRequests.get(id);
        pendingRequests.delete(id);
        resolve(response);
      }
    });

    // Wait for iframe to load
    sandboxFrame.addEventListener('load', () => {
      console.log('[ML Offscreen] Sandbox iframe loaded');
      sandboxReady = true;
      resolve(true);
    });

    // If already loaded
    if (sandboxFrame.contentWindow) {
      setTimeout(() => {
        sandboxReady = true;
        resolve(true);
      }, 500);
    }
  });
}

// Send message to sandbox and wait for response
function sendToSandbox(action, data = {}) {
  return new Promise((resolve, reject) => {
    if (!sandboxReady || !sandboxFrame?.contentWindow) {
      reject(new Error('Sandbox not ready'));
      return;
    }

    const id = ++requestId;
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('Sandbox request timeout'));
    }, 15000);

    pendingRequests.set(id, {
      resolve: (response) => {
        clearTimeout(timeout);
        resolve(response);
      }
    });

    sandboxFrame.contentWindow.postMessage({
      id,
      action,
      ...data
    }, '*');
  });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  (async () => {
    try {
      if (!sandboxReady) {
        await initSandbox();
      }

      let result;

      switch (message.action) {
        case 'classifyImage':
          result = await sendToSandbox('classifyImage', { imageUrl: message.imageUrl });
          break;

        case 'classifyBase64':
          result = await sendToSandbox('classifyBase64', { base64Data: message.base64Data });
          break;

        case 'getStatus':
          result = await sendToSandbox('getStatus');
          break;

        case 'preloadModel':
          result = await sendToSandbox('preloadModel');
          break;

        default:
          result = { error: 'Unknown action' };
      }

      sendResponse(result);
    } catch (error) {
      console.error('[ML Offscreen] Error:', error);
      sendResponse({ safe: true, error: error.message });
    }
  })();

  return true;
});

// Initialize
initSandbox().then((ready) => {
  if (ready) {
    console.log('[ML Offscreen] Offscreen document ready with sandbox');
    // Preload the model
    sendToSandbox('preloadModel').catch(console.error);
  }
});
