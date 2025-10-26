# ML Dependencies - Local Bundle

This directory contains locally bundled machine learning libraries for the Safe Browse extension.

## Files

### `tf.min.js` (1.4 MB)
- **Library**: TensorFlow.js v4.11.0
- **Purpose**: JavaScript machine learning library for browser-based ML inference
- **Source**: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js
- **License**: Apache 2.0
- **Downloaded**: October 26, 2024

### `nsfwjs.min.js` (2.6 MB)
- **Library**: NSFWJS v2.4.2
- **Purpose**: NSFW (Not Safe For Work) image classification library
- **Source**: https://cdn.jsdelivr.net/npm/nsfwjs@2.4.2/dist/nsfwjs.min.js
- **License**: MIT
- **Downloaded**: October 26, 2024
- **Model**: Loads MobileNetV2Mid from CDN (cached by browser)

## Why Local Bundling?

### Benefits:
1. **Reliability**: Extension works even if CDN has issues
2. **Performance**: No network requests needed for library code
3. **Privacy**: Libraries loaded locally, not from external CDN
4. **Offline First**: Extension can initialize without internet (model still needs CDN on first load)

### Model Loading Strategy:
We use a **hybrid approach**:
- ✅ **Libraries bundled locally** (these files)
- ✅ **Models loaded from CDN** (NSFWJS default)

This is optimal because:
- Extension package stays small (~5MB vs ~30MB with models)
- Chrome Web Store prefers extensions <10MB
- Browser automatically caches model files after first download
- NSFWJS CDN is reliable and has global coverage

## Loading Mechanism

These libraries are loaded via `manifest.json`:

```json
"content_scripts": [
  {
    "js": ["lib/tf.min.js", "lib/nsfwjs.min.js", ...]
  }
]
```

This means:
- Libraries are injected into every page automatically
- No dynamic script loading needed
- Available immediately when `ml-detector.js` runs
- Proper CSP (Content Security Policy) compliance

## Updating Dependencies

To update these libraries:

```bash
cd lib/

# Update TensorFlow.js
curl -L -o tf.min.js "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@[VERSION]/dist/tf.min.js"

# Update NSFWJS
curl -L -o nsfwjs.min.js "https://cdn.jsdelivr.net/npm/nsfwjs@[VERSION]/dist/nsfwjs.min.js"
```

**Important**: Test thoroughly after updating, as API changes may break compatibility.

## File Sizes

- `tf.min.js`: ~1.4 MB (minified)
- `nsfwjs.min.js`: ~2.6 MB (minified, includes model loading code)
- **Total**: ~4 MB

This is acceptable for Chrome Web Store (limit is typically 100MB for hosted apps, extensions prefer <10MB).

## Model Files

Model weight files (`.bin` files) are **NOT** bundled locally. They are:
- Loaded from NSFWJS CDN on first use
- Cached by browser's HTTP cache
- Approximately 5-10MB depending on model variant
- Shared across browser sessions (persistent cache)

### Model Variants Available:

1. **MobileNetV2Mid** (default, balanced) - ~5MB
2. **MobileNetV2** (accurate, slower) - ~8MB
3. **InceptionV3** (most accurate, slowest) - ~10MB

Current configuration uses **MobileNetV2Mid** for optimal speed/accuracy balance.

## Offline Capability

**Current Status**: Partial
- ✅ Extension UI works offline
- ✅ Text filtering works offline
- ✅ Libraries available offline
- ❌ Image classification needs internet on first load (then cached)

**Future Enhancement**: To achieve full offline capability, bundle model files:
1. Download model.json and all .bin files
2. Store in `lib/models/` directory
3. Update `ml-detector.js` to load from `chrome.runtime.getURL('lib/models/model.json')`
4. Extension size increases to ~10-15MB

## Security

These files are:
- Minified official releases from npm
- Served via jsDelivr CDN (backed by npm registry)
- No modifications made
- Integrity can be verified against npm packages

### Verification (optional):

```bash
# Verify TensorFlow.js
curl -L "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js" | shasum -a 256

# Compare with local file
shasum -a 256 tf.min.js
```

## Troubleshooting

### Libraries not loading

**Symptom**: Console shows "TensorFlow.js not loaded" or "NSFWJS not loaded"

**Solutions**:
1. Check manifest.json has correct paths
2. Verify files exist in `lib/` directory
3. Check browser console for loading errors
4. Reload extension in chrome://extensions

### Model fails to load

**Symptom**: "Error loading model" in console

**Solutions**:
1. Check internet connection (needed for model download)
2. Wait for CDN cache to refresh (try in 5 minutes)
3. Clear browser cache and reload
4. Check NSFWJS CDN status: https://www.jsdelivr.com/

### Performance issues

**Symptom**: Slow page loading, high memory usage

**Solutions**:
1. TensorFlow.js uses ~150-200MB RAM for model
2. This is normal for ML inference
3. Close unused tabs to free memory
4. Consider using "Strict Mode" for better performance

## License Information

### TensorFlow.js
- **License**: Apache License 2.0
- **Copyright**: Google LLC
- **Source**: https://github.com/tensorflow/tfjs
- **Notice**: TensorFlow, the TensorFlow logo and any related marks are trademarks of Google Inc.

### NSFWJS
- **License**: MIT License
- **Copyright**: Infinite Red, Inc.
- **Source**: https://github.com/infinitered/nsfwjs
- **Attribution**: Required (see LICENSE file)

## Credits

- TensorFlow.js team at Google
- NSFWJS by Infinite Red
- MobileNetV2 model architecture by Google Research
- Community contributors

---

**Last Updated**: October 26, 2024
**Bundle Version**: 1.0
**TensorFlow.js Version**: 4.11.0
**NSFWJS Version**: 2.4.2
